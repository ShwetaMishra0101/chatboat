import { Router } from "express";
import { login, register, getMe } from "../Controllers/auth.controller";
import {
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
} from "../Controllers/oauth.controller";
import { protect } from "../Middlewares/auth.middleware";

const router = Router();

// Email / password
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

// Google OAuth
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);

// GitHub OAuth
router.get("/github", githubAuth);
router.get("/github/callback", githubCallback);

export default router;
