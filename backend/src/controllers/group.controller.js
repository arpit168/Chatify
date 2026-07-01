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
      adminIds: [adminId],
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
      .populate("members", "-password")
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

    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const messages = await Message.find({ groupId })
      .populate("replyTo", "text image senderId")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── SEND GROUP MESSAGE ────────────────────────────────────
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const { id: groupId } = req.params;
    const senderId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const isAdmin = group.adminId?.toString() === senderId.toString() || group.adminIds?.some(id => id.toString() === senderId.toString());
    if (group.isChannel && !isAdmin) {
      return res.status(403).json({ message: "Only admin can send messages in a channel" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let fileData = null;
    if (file) {
      if (file.data && file.data.startsWith("data:")) {
        const uploadResponse = await cloudinary.uploader.upload(file.data, { resource_type: "auto" });
        fileData = {
          url: uploadResponse.secure_url,
          name: file.name || "Attachment",
          size: file.size || 0,
          type: file.type || "file",
        };
      } else {
        fileData = file;
      }
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
      file: fileData,
    });

    await newMessage.save();

    group.lastMessage = newMessage._id;
    await group.save();

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

// ─── UPDATE GROUP (RENAME, DESC, AVATAR) ───────────────────
export const updateGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { name, description, avatar } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminId?.toString() === userId.toString() || group.adminIds?.some(id => id.toString() === userId.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only group admins can update group settings" });

    if (name) group.name = name;
    if (description !== undefined) group.description = description;

    if (avatar) {
      if (avatar.startsWith("data:image")) {
        const uploadResponse = await cloudinary.uploader.upload(avatar);
        group.avatar = uploadResponse.secure_url;
      } else {
        group.avatar = avatar;
      }
    }

    await group.save();
    const populated = await Group.findById(groupId).populate("members", "-password");

    const memberSockets = getGroupSocketIds(group.members);
    if (memberSockets.length > 0) {
      io.to(memberSockets).emit("groupUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in updateGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── ADD MEMBERS ───────────────────────────────────────────
export const addMembers = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminId?.toString() === userId.toString() || group.adminIds?.some(id => id.toString() === userId.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only group admins can add members" });

    group.members = [...new Set([...group.members.map(m => m.toString()), ...memberIds])];
    await group.save();

    const populated = await Group.findById(groupId).populate("members", "-password");

    const memberSockets = getGroupSocketIds(group.members);
    if (memberSockets.length > 0) {
      io.to(memberSockets).emit("groupUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in addMembers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── REMOVE / LEAVE MEMBER ─────────────────────────────────
export const removeMember = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.adminId?.toString() === userId.toString() || group.adminIds?.some(id => id.toString() === userId.toString());
    const isSelfLeave = userId.toString() === memberId;

    if (!isAdmin && !isSelfLeave) {
      return res.status(403).json({ message: "Unauthorized to remove member" });
    }

    group.members = group.members.filter(m => m.toString() !== memberId);
    group.adminIds = group.adminIds?.filter(m => m.toString() !== memberId) || [];

    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "Group deleted" });
    }

    if (group.adminId?.toString() === memberId) {
      group.adminId = group.adminIds.length > 0 ? group.adminIds[0] : group.members[0];
      if (!group.adminIds.some(id => id.toString() === group.adminId.toString())) {
        group.adminIds.push(group.adminId);
      }
    }

    await group.save();
    const populated = await Group.findById(groupId).populate("members", "-password");

    const memberSockets = getGroupSocketIds([...group.members, memberId]);
    if (memberSockets.length > 0) {
      io.to(memberSockets).emit("groupUpdated", populated);
    }

    res.status(200).json(populated);
  } catch (error) {
    console.error("Error in removeMember:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
