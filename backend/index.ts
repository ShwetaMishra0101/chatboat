import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB } from "./src/db";
import { aiConfigured } from "./src/Services/ai.service";

const PORT = process.env.PORT || 5050;

// Warn on startup if optional integrations are still using placeholders.
const googleReady = !!process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID.startsWith("your-");
const githubReady = !!process.env.GITHUB_CLIENT_ID && !process.env.GITHUB_CLIENT_ID.startsWith("your-");
if (!googleReady) console.warn("⚠️  Google login DISABLED — set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env");
if (!githubReady) console.warn("⚠️  GitHub login DISABLED — set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET in .env");
if (!aiConfigured()) console.warn("⚠️  AI replies DISABLED — set GEMINI_API_KEY in .env (free key: https://aistudio.google.com/apikey)");

// Local dev: connect once, then start a long-running server.
connectDB()
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
  });
