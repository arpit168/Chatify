import express from "express";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage
} from "../controllers/group.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.post("/create", createGroup);
router.get("/all", getMyGroups);
router.get("/:id", getGroupMessages);
router.post("/send/:id", sendGroupMessage);

export default router;
