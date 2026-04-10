import express from "express";
import cors from "cors";

const app = express();

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// TODO: auth + CRUD routes are added by subsequent agent commands.

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
