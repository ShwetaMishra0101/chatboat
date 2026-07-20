import type { Request, Response } from "express";
import { User, type AuthProvider } from "../Models/user.model";
import { generateToken } from "../Utils/generateToken";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

interface OAuthProfile {
  provider: AuthProvider;
  providerId: string;
  name: string;
  email: string;
  avatar?: string;
}

// Find an existing user by email (linking accounts) or create a new one,
// then redirect to the frontend with our own JWT.
async function completeOAuth(res: Response, profile: OAuthProfile) {
  let user = await User.findOne({ email: profile.email });

  if (!user) {
    user = await User.create({
      name: profile.name,
      email: profile.email,
      provider: profile.provider,
      providerId: profile.providerId,
      avatar: profile.avatar,
    });
  } else if (user.provider === "local" && !user.providerId) {
    // Link this OAuth identity to the existing local account.
    user.providerId = profile.providerId;
    user.avatar = user.avatar || profile.avatar;
    await user.save();
  }

  const token = generateToken(String(user._id));
  res.redirect(`${CLIENT_URL}/oauth?token=${token}`);
}

function fail(res: Response, message: string) {
  res.redirect(`${CLIENT_URL}/oauth?error=${encodeURIComponent(message)}`);
}

// A credential is "configured" only if it's set and isn't the .env placeholder.
function isConfigured(value: string | undefined): boolean {
  return !!value && !value.startsWith("your-");
}

/* ------------------------------------------------------------------ */
/*  Google                                                            */
/* ------------------------------------------------------------------ */

export const googleAuth = (_req: Request, res: Response) => {
  if (!isConfigured(process.env.GOOGLE_CLIENT_ID) || !isConfigured(process.env.GOOGLE_CLIENT_SECRET)) {
    return fail(res, "Google login is not configured. Add GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET to backend/.env");
  }
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || "",
    redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

export const googleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return fail(res, "Missing authorization code");

  try {
    // 1. Exchange the code for an access token.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
        grant_type: "authorization_code",
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return fail(res, "Google token exchange failed");

    // 2. Fetch the user's profile.
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };
    if (!profile.email) return fail(res, "Could not read Google profile");

    await completeOAuth(res, {
      provider: "google",
      providerId: profile.sub,
      name: profile.name || profile.email.split("@")[0],
      email: profile.email,
      avatar: profile.picture,
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    fail(res, "Google login failed");
  }
};

/* ------------------------------------------------------------------ */
/*  GitHub                                                            */
/* ------------------------------------------------------------------ */

export const githubAuth = (_req: Request, res: Response) => {
  if (!isConfigured(process.env.GITHUB_CLIENT_ID) || !isConfigured(process.env.GITHUB_CLIENT_SECRET)) {
    return fail(res, "GitHub login is not configured. Add GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET to backend/.env");
  }
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID || "",
    redirect_uri: process.env.GITHUB_CALLBACK_URL || "",
    scope: "read:user user:email",
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const githubCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  if (!code) return fail(res, "Missing authorization code");

  try {
    // 1. Exchange the code for an access token.
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
      }),
    });
    const tokenData = (await tokenRes.json()) as { access_token?: string };
    if (!tokenData.access_token) return fail(res, "GitHub token exchange failed");

    const headers = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "chatboat-app",
    };

    // 2. Fetch profile + emails (GitHub may hide the email on the profile).
    const profileRes = await fetch("https://api.github.com/user", { headers });
    const profile = (await profileRes.json()) as {
      id: number;
      login: string;
      name?: string;
      avatar_url?: string;
      email?: string | null;
    };

    let email = profile.email;
    if (!email) {
      const emailRes = await fetch("https://api.github.com/user/emails", { headers });
      const emails = (await emailRes.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
      email = emails.find((e) => e.primary && e.verified)?.email || emails.find((e) => e.verified)?.email || null;
    }
    if (!email) return fail(res, "Could not read a verified GitHub email");

    await completeOAuth(res, {
      provider: "github",
      providerId: String(profile.id),
      name: profile.name || profile.login,
      email,
      avatar: profile.avatar_url,
    });
  } catch (err) {
    console.error("GitHub OAuth error:", err);
    fail(res, "GitHub login failed");
  }
};
