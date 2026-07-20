import express from "express";
import cors from "cors";
import authRoutes from "./Routes/auth.routes";
import chatRoutes from "./Routes/chat.routes";
import { connectDB } from "./db";

const app = express();

// Allow the frontend origin(s). Set CLIENT_URL (comma-separated for multiple)
// in production; defaults to reflecting any origin (fine for Bearer-token auth).
const origins = process.env.CLIENT_URL?.split(",").map((s) => s.trim());
app.use(cors({ origin: origins && origins.length ? origins : true }));
app.use(express.json());

// Health check — works even if the DB is down, so it confirms the function runs.
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: process.env.MONGODB_URI ? "configured" : "MISSING" });
});

// Ensure the database is connected before handling data requests.
// (Serverless-safe: connectDB() caches the connection.)
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database unavailable — check MONGODB_URI and Atlas network access" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Root and unknown paths → simple JSON instead of a crash.
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
