import { Router } from "express";
import { getLeaderboard, getAvailableMonths } from "../data/leaderboard.js";

const router = Router();

// GET /api/leaderboard?month=YYYY-MM
router.get("/", (req, res) => {
  const month = req.query.month || "";
  const entries = getLeaderboard(month);
  res.json({ month, entries });
});

// GET /api/leaderboard/months
router.get("/months", (_req, res) => {
  res.json({ months: getAvailableMonths() });
});

export default router;
