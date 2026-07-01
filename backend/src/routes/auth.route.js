import express from "express";
import { signup, login, logout, updateProfile, blockUser, unblockUser } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.put("/update-profile", protectRoute, updateProfile);
router.post("/block/:targetId", protectRoute, blockUser);
router.post("/unblock/:targetId", protectRoute, unblockUser);

router.get("/check", protectRoute, (req, res) => res.status(200).json(req.user));

export default router;