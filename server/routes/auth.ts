import { Router } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { log } from "../utils/logger";

const router = Router();

// Space Child Auth configuration
const SPACE_CHILD_AUTH_URL = process.env.SPACE_CHILD_AUTH_URL || "https://dream.spacechild.love";
const APP_URL = process.env.APP_URL || "http://localhost:5000";

// Get current user
router.get("/me", async (req, res) => {
  try {
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
        subscriptionTier: users.subscriptionTier,
        monthlyCredits: users.monthlyCredits,
        usedCredits: users.usedCredits,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// SSO initiate
router.get("/sso/initiate", (req, res) => {
  const redirectUrl = `${SPACE_CHILD_AUTH_URL}/api/space-child-auth/sso/authorize`;
  const params = new URLSearchParams({
    app: "spacechilddev",
    callback: `${APP_URL}/sso/callback`,
  });
  
  res.json({ redirectUrl: `${redirectUrl}?${params}` });
});

// SSO callback (verify token from Space Child Auth)
router.post("/sso/verify", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    // Verify token with Space Child Auth
    const verifyResponse = await fetch(
      `${SPACE_CHILD_AUTH_URL}/api/space-child-auth/sso/verify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }
    );

    if (!verifyResponse.ok) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { user: authUser } = await verifyResponse.json();

    // Find or create user
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, authUser.email));

    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          email: authUser.email,
          username: authUser.username || authUser.email.split("@")[0],
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          profileImageUrl: authUser.profileImageUrl,
          subscriptionTier: "free",
          monthlyCredits: 100,
          usedCredits: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      log(`New user created via SSO: ${user.email}`);
    }

    // Set session
    req.session.userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        subscriptionTier: user.subscriptionTier,
      },
    });
  } catch (error) {
    log(`SSO verify error: ${error}`);
    res.status(500).json({ error: "SSO verification failed" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to logout" });
    }
    res.json({ success: true });
  });
});

// Check auth status
router.get("/status", (req, res) => {
  res.json({
    authenticated: !!req.session?.userId,
    userId: req.session?.userId || null,
  });
});

export default router;
