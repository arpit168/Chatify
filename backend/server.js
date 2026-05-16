import express from "express";

import path from "path";
import cors from "cors";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import { connectDB } from "./src/lib/db.js";
import { ENV } from "./src/lib/env.js";
import cookieParser from "cookie-parser";

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 5000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  console.log("Server is running on port :", PORT);
  connectDB();
});
