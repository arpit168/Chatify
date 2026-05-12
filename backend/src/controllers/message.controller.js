import Message from "../models/message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// Get all users except logged in user
export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts controller:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Get messages between two users
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;

    // FIXED: params not Param
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          senderId: myId,
          receiverId: userToChatId,
        },
        {
          senderId: userToChatId,
          receiverId: myId,
        },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessagesByUserId controller:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;

    // FIXED: params not Param
    const { id: receiverId } = req.params;

    const senderId = req.user._id;

    let imageUrl = "";

    // Upload image only if image exists
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);

      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // TODO: socket.io realtime message feature

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // Find all messages where logged-in user is sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: loggedInUserId },
        { receiverId: loggedInUserId },
      ],
    });

    // Extract unique chat partner IDs
    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    // Get chat partner details
    const chatPartners = await User.find({
      _id: { $in: chatPartnerIds },
    }).select("-password");

    res.status(200).json(chatPartners);

  } catch (error) {
    console.error("Error in getChatPartners:", error.message);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
