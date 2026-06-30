import express from "express";
import { getAdminStats } from "../controllers/admin.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Admin access denied" });
  }
};

router.use(arcjetProtection, protectRoute, requireAdmin);

router.get("/stats", getAdminStats);

export default router;
