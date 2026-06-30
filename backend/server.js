import express from "express";
import { app, server } from "./src/lib/socket.js";
import path from "path";
import cors from "cors";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import groupRoutes from "./src/routes/group.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import { connectDB } from "./src/lib/db.js";
import { ENV } from "./src/lib/env.js";
import cookieParser from "cookie-parser";
import { errorHandler, notFoundHandler } from "./src/middlewares/error.middleware.js";

const __dirname = path.resolve();
const PORT = ENV.PORT || 5000;

app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: ENV.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/admin", adminRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log("Server and Socket.IO are running on port :", PORT);
  connectDB();
});

