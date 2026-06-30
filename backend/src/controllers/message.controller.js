import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.js";
import User from "../models/User.js";

// ─── GET ALL CONTACTS ───────────────────────────────────────
export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-password")
      .sort({ fullName: 1 });

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET CHAT PARTNERS (with last message) ──────────────────
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Get distinct partner IDs from messages
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
      deletedForEveryone: { $ne: true },
    }).sort({ createdAt: -1 });

    const partnerMap = new Map();

    for (const msg of messages) {
      const partnerId =
        msg.senderId.toString() === loggedInUserId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          partnerId,
          lastMessage: msg.text || (msg.image ? "📷 Photo" : (msg.file ? "📎 File" : "")),
          lastMessageTime: msg.createdAt,
          lastMessageSenderId: msg.senderId.toString(),
          unreadCount: 0,
        });
      }

      // Count unread messages from this partner
      if (
        msg.senderId.toString() !== loggedInUserId.toString() &&
        msg.status !== "seen" &&
        !msg.deletedBy?.includes(loggedInUserId)
      ) {
        const entry = partnerMap.get(partnerId);
        entry.unreadCount++;
      }
    }

    const partnerIds = Array.from(partnerMap.keys());
    const chatPartners = await User.find({ _id: { $in: partnerIds } }).select("-password");

    // Enrich partners with last message data
    const enrichedPartners = chatPartners.map((partner) => {
      const meta = partnerMap.get(partner._id.toString());
      return {
        ...partner.toObject(),
        lastMessage: meta?.lastMessage || "",
        lastMessageTime: meta?.lastMessageTime || partner.updatedAt,
        lastMessageSenderId: meta?.lastMessageSenderId || "",
        unreadCount: meta?.unreadCount || 0,
      };
    });

    // Sort by last message time
    enrichedPartners.sort(
      (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
    );

    res.status(200).json(enrichedPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── GET MESSAGES BY USER ID (paginated) ────────────────────
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedBy: { $ne: myId },
    };

    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .populate("replyTo", "text image senderId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Return in chronological order for display
    messages.reverse();

    // Mark messages as seen
    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        status: { $ne: "seen" },
      },
      { $set: { status: "seen", seenAt: new Date() } }
    );

    // Notify sender that messages have been seen
    const senderSocketId = getReceiverSocketId(userToChatId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { by: myId.toString() });
    }

    res.status(200).json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── SEND MESSAGE ───────────────────────────────────────────
export const sendMessage = async (req, res) => {
  try {
    const { text, image, replyTo } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      replyTo: replyTo || null,
      status: "sent",
    });

    await newMessage.save();

    // Populate reply data if exists
    let populatedMessage = newMessage.toObject();
    if (replyTo) {
      const replyMsg = await Message.findById(replyTo)
        .select("text image senderId")
        .lean();
      populatedMessage.replyTo = replyMsg;
    }

    // Mark as delivered if receiver is online
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      populatedMessage.status = "delivered";
      await Message.findByIdAndUpdate(newMessage._id, { status: "delivered" });
      io.to(receiverSocketId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── EDIT MESSAGE ───────────────────────────────────────────
export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });
    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }

    message.text = text;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Notify receiver
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEditedUpdate", {
        messageId,
        newText: text,
        editedAt: message.editedAt,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in editMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── DELETE MESSAGE ─────────────────────────────────────────
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (deleteForEveryone) {
      if (message.senderId.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Only sender can delete for everyone" });
      }
      message.deletedForEveryone = true;
      message.text = "";
      message.image = "";
      await message.save();

      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeletedUpdate", { messageId });
      }
    } else {
      // Delete for me only
      if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
      }
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.log("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── REACT TO MESSAGE ───────────────────────────────────────
export const reactToMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Toggle reaction: remove if same emoji exists, otherwise add/update
    const existingIdx = message.reactions.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingIdx > -1) {
      if (message.reactions[existingIdx].emoji === emoji) {
        message.reactions.splice(existingIdx, 1); // Remove reaction
      } else {
        message.reactions[existingIdx].emoji = emoji; // Update emoji
      }
    } else {
      message.reactions.push({ userId, emoji });
    }

    await message.save();

    // Notify both parties
    const otherUserId =
      message.senderId.toString() === userId.toString()
        ? message.receiverId
        : message.senderId;

    const otherSocketId = getReceiverSocketId(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("messageReactionUpdate", {
        messageId,
        reactions: message.reactions,
      });
    }

    res.status(200).json({ reactions: message.reactions });
  } catch (error) {
    console.log("Error in reactToMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── SEARCH MESSAGES ────────────────────────────────────────
export const searchMessages = async (req, res) => {
  try {
    const { q, userId: chatUserId } = req.query;
    const myId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const filter = {
      $or: [
        { senderId: myId, receiverId: chatUserId },
        { senderId: chatUserId, receiverId: myId },
      ],
      text: { $regex: q, $options: "i" },
      deletedForEveryone: { $ne: true },
      deletedBy: { $ne: myId },
    };

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in searchMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── SEARCH USERS ───────────────────────────────────────────
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const myId = req.user._id;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await User.find({
      _id: { $ne: myId },
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);

    res.status(200).json(users);
  } catch (error) {
    console.log("Error in searchUsers:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── STAR MESSAGE ───────────────────────────────────────────
export const starMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const myId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const hasStarred = message.starredBy.includes(myId);

    if (hasStarred) {
      message.starredBy.pull(myId);
    } else {
      message.starredBy.push(myId);
    }

    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in starMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── PIN MESSAGE ───────────────────────────────────────────
export const pinMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Toggle pin status
    message.isPinned = !message.isPinned;
    await message.save();

    // Broadcast the pin event to the receiver
    const receiverSocketId = getReceiverSocketId(
      message.senderId.toString() === req.user._id.toString()
        ? message.receiverId
        : message.senderId
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messagePinnedUpdate", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("Error in pinMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─── FORWARD MESSAGE ────────────────────────────────────────
export const forwardMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { receiverId } = req.body;
    const myId = req.user._id;

    const originalMessage = await Message.findById(messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }

    const newMessage = new Message({
      senderId: myId,
      receiverId,
      text: originalMessage.text,
      image: originalMessage.image,
      file: originalMessage.file,
      isForwarded: true,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in forwardMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};