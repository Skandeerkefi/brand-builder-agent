import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import User from "../models/User.js";

const router = Router();

// GET /api/me  (protected)
router.get("/", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({ user: { id: user._id, email: user.email, createdAt: user.createdAt } });
  } catch (err) {
    console.error("me error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
