import express from "express";
import {
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  sendMessage,
  editMessage,
  deleteMessage,
  reactToMessage,
  searchMessages,
  searchUsers,
  starMessage,
  pinMessage,
  forwardMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// the middlewares execute in order - so requests get rate-limited first, then authenticated.
router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.get("/search", searchMessages);
router.get("/search-users", searchUsers);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage);
router.put("/edit/:id", editMessage);
router.delete("/delete/:id", deleteMessage);
router.post("/react/:id", reactToMessage);
router.post("/star/:id", starMessage);
router.post("/pin/:id", pinMessage);
router.post("/forward/:id", forwardMessage);

export default router;