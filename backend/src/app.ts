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

// Ensure the database is connected before any request is handled.
// (Serverless-safe: connectDB() caches the connection.)
app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ message: "Database unavailable" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

export default app;
