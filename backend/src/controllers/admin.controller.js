import User from "../models/User.js";
import Message from "../models/message.js";
import Group from "../models/group.js";

// ─── GET ADMIN STATS ────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMessages = await Message.countDocuments();
    const totalGroups = await Group.countDocuments();

    // Get 5 most recently created users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    // Get basic engagement metrics
    const onlineUsersCount = await User.countDocuments({ isOnline: true });

    res.status(200).json({
      totalUsers,
      totalMessages,
      totalGroups,
      onlineUsersCount,
      recentUsers,
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
