import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middlewares/socket.auth.middleware.js";
import User from "../models/User.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
  pingTimeout: 60000,
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

// this is for storing online users
const userSocketMap = {}; // {userId:socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

export function getGroupSocketIds(userIds) {
  return userIds
    .map(id => userSocketMap[id.toString()])
    .filter(socketId => socketId);
}

io.on("connection", async (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  // Update user online status in DB
  try {
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
  } catch (e) {
    console.error("Failed to update online status:", e.message);
  }

  // Broadcast online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ─── TYPING INDICATORS ────────────────────────────────────
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", { userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userStoppedTyping", { userId });
    }
  });

  // ─── READ RECEIPTS / MESSAGE SEEN ─────────────────────────
  socket.on("markMessagesSeen", ({ senderId }) => {
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", { by: userId });
    }
  });

  // ─── MESSAGE REACTIONS ────────────────────────────────────
  socket.on("messageReaction", ({ messageId, emoji, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReactionUpdate", { messageId, emoji, userId });
    }
  });

  // ─── MESSAGE EDIT ─────────────────────────────────────────
  socket.on("messageEdited", ({ messageId, newText, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEditedUpdate", { messageId, newText });
    }
  });

  // ─── MESSAGE DELETE ───────────────────────────────────────
  socket.on("messageDeleted", ({ messageId, receiverId, deleteForEveryone }) => {
    if (deleteForEveryone) {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeletedUpdate", { messageId });
      }
    }
  });

  // ─── WEBRTC AUDIO/VIDEO CALLING SIGNALING ─────────────────
  socket.on("callUser", ({ userToCall, signalData, from, name, profilePic, callType }) => {
    const receiverSocketId = userSocketMap[userToCall];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("callUser", {
        signal: signalData,
        from,
        name,
        profilePic,
        callType,
      });
    }
  });

  socket.on("answerCall", ({ to, signal }) => {
    const callerSocketId = userSocketMap[to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callAccepted", signal);
    }
  });

  socket.on("endCall", ({ to }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("callEnded");
    }
  });

  socket.on("rejectCall", ({ to }) => {
    const callerSocketId = userSocketMap[to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  socket.on("iceCandidate", ({ to, candidate }) => {
    const targetSocketId = userSocketMap[to];
    if (targetSocketId) {
      io.to(targetSocketId).emit("iceCandidate", candidate);
    }
  });

  // ─── DISCONNECT ───────────────────────────────────────────
  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];

    // Update user offline status
    try {
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
    } catch (e) {
      console.error("Failed to update offline status:", e.message);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };