import express from "express";
import {
  getAllContacts,
  getMessagesByUserId,
  sendMessage,
  getChatPartners,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// this middleware execute in order - so requests get rate-limited first, then authenticated, this is actually more efficient since unauthentacited requests get blocked by rate limiting before hiotting the auth middleware.

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", protectRoute, getChatPartners);
router.get("/:id", getMessagesByUserId);
router.get("/send/:id", sendMessage);

export default router;
