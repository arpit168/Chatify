import Group from "../models/group.js";
import Message from "../models/message.js";
import { getReceiverSocketId, io, getGroupSocketIds } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

// ─── CREATE GROUP ──────────────────────────────────────────
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds, isChannel } = req.body;
    const adminId = req.user._id;

    if (!name || !memberIds || !Array.isArray(memberIds)) {
      return res.status(400).json({ message: "Invalid group data" });
    }

    // Include the admin in the members list if not already there
    const members = [...new Set([...memberIds, adminId.toString()])];

    const newGroup = new Group({
      name,
      description,
      adminId,
      members,
      isChannel: isChannel || false,
    });

    await newGroup.save();

    // Broadcast group creation to all members
    const memberSockets = getGroupSocketIds(members);
    if (memberSockets.length > 0) {
      io.to(memberSockets).emit("newGroupCreated", newGroup);
    }

    res.status(201).json(newGroup);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET USER'S GROUPS ─────────────────────────────────────
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    const groups = await Group.find({ members: userId })
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    console.error("Error in getMyGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── GET GROUP MESSAGES ────────────────────────────────────
export const getGroupMessages = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    // Only members can read messages
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .sort({ createdAt: 1 }); // Oldest to newest for chat UI

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── SEND GROUP MESSAGE ────────────────────────────────────
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    if (group.isChannel && group.adminId.toString() !== senderId.toString()) {
      return res.status(403).json({ message: "Only admin can send messages in a channel" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Update group's last message
    group.lastMessage = newMessage._id;
    await group.save();

    // Broadcast to group members
    const otherMembers = group.members.filter((id) => id.toString() !== senderId.toString());
    const otherSockets = getGroupSocketIds(otherMembers);
    
    if (otherSockets.length > 0) {
      io.to(otherSockets).emit("newGroupMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
