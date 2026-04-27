import type { Express } from "express";
import { createServer, type Server } from "node:http";
import pg from "pg";
import authService from "../services/auth";
import messagesService from "../services/messages";

const badgePool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/signup", async (req, res) => {
    console.log(`[ROUTE /api/auth/signup] === Request received ===`);
    console.log(`[ROUTE /api/auth/signup] Body:`, JSON.stringify(req.body));
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log(
          `[ROUTE /api/auth/signup] REJECTED: Missing email or password`,
        );
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      console.log(
        `[ROUTE /api/auth/signup] Calling authService.signUp(${email}, ***)`,
      );
      const result = await authService.signUp(email, password);
      console.log(`[ROUTE /api/auth/signup] Result:`, JSON.stringify(result));
      return res.json(result);
    } catch (error: any) {
      console.error(
        `[ROUTE /api/auth/signup] UNCAUGHT ERROR:`,
        error.message,
        error.stack,
      );
      return res
        .status(500)
        .json({ success: false, message: "Server error: " + error.message });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    console.log(`[ROUTE /api/auth/signin] === Request received ===`);
    console.log(
      `[ROUTE /api/auth/signin] Body:`,
      JSON.stringify({ email: req.body?.email, password: "***" }),
    );
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        console.log(
          `[ROUTE /api/auth/signin] REJECTED: Missing email or password`,
        );
        return res
          .status(400)
          .json({ success: false, message: "Email and password are required" });
      }

      console.log(
        `[ROUTE /api/auth/signin] Calling authService.signIn(${email}, ***)`,
      );
      const result = await authService.signIn(email, password);
      console.log(`[ROUTE /api/auth/signin] Result:`, JSON.stringify(result));
      return res.json(result);
    } catch (error: any) {
      console.error(
        `[ROUTE /api/auth/signin] UNCAUGHT ERROR:`,
        error.message,
        error.stack,
      );
      return res
        .status(500)
        .json({ success: false, message: "Server error: " + error.message });
    }
  });

  app.post("/api/auth/send-verification", async (req, res) => {
    console.log(
      `[ROUTE /api/auth/send-verification] Request for uid: ${req.body?.uid}`,
    );
    try {
      const { uid } = req.body;

      if (!uid) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const result = await authService.sendVerificationEmail(uid);
      console.log(
        `[ROUTE /api/auth/send-verification] Result:`,
        JSON.stringify(result),
      );
      return res.json(result);
    } catch (error: any) {
      console.error("Send verification error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { uid, token } = req.body;

      if (!uid || !token) {
        return res
          .status(400)
          .json({ success: false, message: "User ID and token are required" });
      }

      const result = await authService.verifyEmail(uid, token);
      return res.json(result);
    } catch (error: any) {
      console.error("Verify email error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/auth/check-verification/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await authService.checkEmailVerification(uid);
      return res.json(result);
    } catch (error: any) {
      console.error("Check verification error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/submit-selfie", async (req, res) => {
    try {
      const { uid, selfieData } = req.body;

      if (!uid) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const result = await authService.submitSelfie(
        uid,
        selfieData || "selfie_submitted",
      );
      return res.json(result);
    } catch (error: any) {
      console.error("Submit selfie error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/auth/user-status/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await authService.getUserStatus(uid);
      return res.json(result);
    } catch (error: any) {
      console.error("User status error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/update-profile", async (req, res) => {
    console.log(
      `[ROUTE /api/auth/update-profile] Request:`,
      JSON.stringify(req.body),
    );
    try {
      const { uid, ...profile } = req.body;

      if (!uid) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const result = await authService.createOrUpdateUserProfile(uid, profile);
      console.log(
        `[ROUTE /api/auth/update-profile] Result:`,
        JSON.stringify(result),
      );
      return res.json(result);
    } catch (error: any) {
      console.error("Update profile error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/auth/profile/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const profile = await authService.getUserProfile(uid);

      if (!profile) {
        return res
          .status(404)
          .json({ success: false, message: "Profile not found" });
      }

      return res.json({ success: true, profile });
    } catch (error: any) {
      console.error("Get profile error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/generate-invite", async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res
          .status(400)
          .json({ success: false, message: "User ID is required" });
      }

      const result = await authService.generateInviteCode(uid);
      return res.json(result);
    } catch (error: any) {
      console.error("Generate invite error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/auth/validate-invite", async (req, res) => {
    try {
      const { code } = req.body;

      if (!code) {
        return res
          .status(400)
          .json({ valid: false, message: "Invite code is required" });
      }

      const result = await authService.validateInviteCode(code);
      return res.json(result);
    } catch (error: any) {
      console.error("Validate invite error:", error);
      return res.status(500).json({ valid: false, message: "Server error" });
    }
  });

  app.post("/api/auth/use-invite", async (req, res) => {
    try {
      const { code, uid } = req.body;

      if (!code || !uid) {
        return res
          .status(400)
          .json({ success: false, message: "Code and user ID are required" });
      }

      const result = await authService.useInviteCode(code, uid);
      return res.json(result);
    } catch (error: any) {
      console.error("Use invite error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/badges/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        return res
          .status(400)
          .json({ success: false, message: "Firebase UID required" });
      }

      const badgesResult = await badgePool.query(
        "SELECT badge_id FROM user_badges WHERE firebase_uid = $1",
        [firebaseUid],
      );
      const earnedBadgeIds = badgesResult.rows.map((r: any) => r.badge_id);

      const countResult = await badgePool.query("SELECT COUNT(*) FROM users");
      const totalUsers = parseInt(countResult.rows[0].count, 10);

      const genesisAvailable = totalUsers <= 100;

      return res.json({
        success: true,
        earnedBadgeIds,
        genesisAvailable,
        totalUsers,
      });
    } catch (error: any) {
      console.error("Badge fetch error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.post("/api/messages/send", async (req, res) => {
    try {
      const {
        senderUid,
        receiverUid,
        content,
        messageType,
        senderName,
        receiverName,
        senderAvatar,
        receiverAvatar,
      } = req.body;

      if (!senderUid || !receiverUid || !content) {
        return res.status(400).json({
          success: false,
          message: "senderUid, receiverUid, and content are required",
        });
      }

      const message = await messagesService.sendMessage({
        senderUid,
        receiverUid,
        content,
        messageType,
        senderName,
        receiverName,
        senderAvatar,
        receiverAvatar,
      });

      return res.json({ success: true, message });
    } catch (error: any) {
      console.error("Send message error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/messages/conversations/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      if (!uid) {
        return res
          .status(400)
          .json({ success: false, message: "User UID is required" });
      }

      const conversations = await messagesService.listConversationsForUser(uid);
      return res.json({ success: true, conversations });
    } catch (error: any) {
      console.error("List conversations error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  app.get("/api/messages/thread/:userUid/:otherUid", async (req, res) => {
    try {
      const { userUid, otherUid } = req.params;
      if (!userUid || !otherUid) {
        return res
          .status(400)
          .json({ success: false, message: "Both user UIDs are required" });
      }

      const messages = await messagesService.getConversationThread(
        userUid,
        otherUid,
      );
      return res.json({ success: true, messages });
    } catch (error: any) {
      console.error("Get thread error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
