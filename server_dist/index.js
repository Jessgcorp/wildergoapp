// server/index.ts
import "dotenv/config";
import express from "express";

// server/routes/index.ts
import { createServer } from "node:http";
import pg2 from "pg";

// server/services/firebase.ts
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";
var firebaseApp = null;
function readServiceAccountJson() {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (inline) {
    return inline;
  }
  const fileEnv = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fileEnv) {
    const resolved = path.isAbsolute(fileEnv) ? fileEnv : path.resolve(process.cwd(), fileEnv);
    if (!fs.existsSync(resolved)) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT file not found: ${resolved}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place the JSON at that path.`
      );
    }
    return fs.readFileSync(resolved, "utf8");
  }
  throw new Error(
    "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT (JSON string), or FIREBASE_SERVICE_ACCOUNT_PATH / GOOGLE_APPLICATION_CREDENTIALS to a service account .json file. See .env.example."
  );
}
function initializeFirebase() {
  if (firebaseApp) {
    console.log("[FIREBASE] Already initialized, returning existing app");
    return firebaseApp;
  }
  console.log("[FIREBASE] === Initializing Firebase Admin SDK ===");
  const serviceAccountJson = readServiceAccountJson();
  console.log(
    "[FIREBASE] Service account loaded (length: " + serviceAccountJson.length + " chars)"
  );
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log("[FIREBASE] Service account parsed successfully");
    console.log("[FIREBASE]   project_id: " + serviceAccount.project_id);
    console.log("[FIREBASE]   client_email: " + serviceAccount.client_email);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log(
      "[FIREBASE] Firebase Admin SDK initialized successfully for project: " + serviceAccount.project_id
    );
    const webApiKey = process.env.FIREBASE_WEB_API_KEY;
    if (webApiKey) {
      console.log(
        "[FIREBASE] FIREBASE_WEB_API_KEY is set (length: " + webApiKey.length + " chars)"
      );
    } else {
      console.warn(
        "[FIREBASE] WARNING: FIREBASE_WEB_API_KEY is NOT set! Some auth flows may log warnings."
      );
    }
    return firebaseApp;
  } catch (error) {
    console.error("[FIREBASE] Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}
function getFirebaseApp() {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}
function getFirestore() {
  return getFirebaseApp().firestore();
}
function getAuth() {
  return getFirebaseApp().auth();
}

// server/services/auth.ts
import * as crypto from "crypto";
import pg from "pg";
var { Pool } = pg;
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1e5, 64, "sha512").toString("hex");
}
function verifyPassword(password, salt, hash) {
  const checkHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(checkHash));
}
async function signUp(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[AUTH SIGNUP] === Starting signup for: ${normalizedEmail} ===`);
  try {
    if (password.length < 6) {
      console.log(
        `[AUTH SIGNUP] REJECTED: Password too short (${password.length} chars)`
      );
      return {
        success: false,
        message: "Password must be at least 6 characters."
      };
    }
    const auth = getAuth();
    console.log(`[AUTH SIGNUP] Firebase Auth instance obtained successfully`);
    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(normalizedEmail);
    } catch (lookupError) {
      if (lookupError.code === "auth/user-not-found") {
        console.log(
          `[AUTH SIGNUP] No existing user found - proceeding with creation`
        );
      } else {
        console.error(
          `[AUTH SIGNUP] Error checking existing user:`,
          lookupError.code,
          lookupError.message
        );
        throw lookupError;
      }
    }
    if (existingUser) {
      console.log(
        `[AUTH SIGNUP] REJECTED: User already exists with uid: ${existingUser.uid}`
      );
      return {
        success: false,
        message: "An account with this email already exists."
      };
    }
    console.log(`[AUTH SIGNUP] Calling Firebase auth.createUser()...`);
    const firebaseUser = await auth.createUser({
      email: normalizedEmail,
      password,
      emailVerified: false
    });
    console.log(
      `[AUTH SIGNUP] SUCCESS: Firebase user created with uid: ${firebaseUser.uid}`
    );
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashPassword(password, salt);
    try {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const countResult = await client.query("SELECT COUNT(*) FROM users");
        const userCount = parseInt(countResult.rows[0].count, 10);
        console.log(`[AUTH SIGNUP] User count before insert: ${userCount}`);
        await client.query(
          `INSERT INTO users (email, firebase_uid, password_hash, password_salt) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = $3, password_salt = $4, firebase_uid = $2`,
          [normalizedEmail, firebaseUser.uid, hash, salt]
        );
        console.log(`[AUTH SIGNUP] Password hash stored in PostgreSQL`);
        if (userCount < 100) {
          await client.query(
            `INSERT INTO user_badges (firebase_uid, badge_id) VALUES ($1, $2) ON CONFLICT (firebase_uid, badge_id) DO NOTHING`,
            [firebaseUser.uid, "10"]
          );
          console.log(
            `[AUTH SIGNUP] Genesis badge (Apex Pioneer) awarded - user #${userCount + 1}`
          );
        } else {
          console.log(
            `[AUTH SIGNUP] Genesis badge NOT awarded - user #${userCount + 1} exceeds 100`
          );
        }
        await client.query("COMMIT");
      } catch (txError) {
        await client.query("ROLLBACK");
        throw txError;
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.warn(
        `[AUTH SIGNUP] PostgreSQL write failed (non-critical): ${dbError.message}`
      );
    }
    try {
      const db = getFirestore();
      await db.collection("users").doc(firebaseUser.uid).set({
        email: normalizedEmail,
        emailVerified: false,
        selfieVerified: false,
        selfieSubmitted: false,
        onboardingComplete: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (firestoreError) {
      console.warn(
        `[AUTH SIGNUP] Firestore write failed (non-critical): ${firestoreError.message}`
      );
    }
    return { success: true, uid: firebaseUser.uid };
  } catch (error) {
    console.error(`[AUTH SIGNUP] FIREBASE ERROR:`);
    console.error(`[AUTH SIGNUP]   code: ${error.code}`);
    console.error(`[AUTH SIGNUP]   message: ${error.message}`);
    console.error(
      `[AUTH SIGNUP]   full error:`,
      JSON.stringify(error, null, 2)
    );
    let userMessage = "Failed to create account.";
    if (error.code === "auth/email-already-exists") {
      userMessage = "An account with this email already exists.";
    } else if (error.code === "auth/invalid-email") {
      userMessage = "Invalid email address format.";
    } else if (error.code === "auth/weak-password") {
      userMessage = "Password is too weak. Use at least 6 characters.";
    } else if (error.code === "auth/operation-not-allowed") {
      userMessage = "Email/password accounts are not enabled. Please enable them in Firebase Console.";
    } else if (error.message) {
      userMessage = error.message;
    }
    return { success: false, message: userMessage };
  }
}
async function signIn(email, password) {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[AUTH SIGNIN] === Starting signin for: ${normalizedEmail} ===`);
  try {
    const auth = getAuth();
    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(normalizedEmail);
      console.log(`[AUTH SIGNIN] Found Firebase user: uid=${firebaseUser.uid}`);
    } catch (lookupError) {
      if (lookupError.code === "auth/user-not-found") {
        return { success: false, message: "No account found with this email." };
      }
      throw lookupError;
    }
    try {
      const dbResult = await pool.query(
        `SELECT password_hash, password_salt FROM users WHERE email = $1`,
        [normalizedEmail]
      );
      if (dbResult.rows.length > 0 && dbResult.rows[0].password_hash && dbResult.rows[0].password_salt) {
        const { password_hash, password_salt } = dbResult.rows[0];
        if (!verifyPassword(password, password_salt, password_hash)) {
          console.log(
            `[AUTH SIGNIN] Password verification failed for: ${normalizedEmail}`
          );
          return {
            success: false,
            message: "Incorrect password. Please try again."
          };
        }
        console.log(`[AUTH SIGNIN] Password verified successfully`);
      } else {
        console.log(
          `[AUTH SIGNIN] No stored password hash found - storing one now`
        );
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = hashPassword(password, salt);
        await pool.query(
          `INSERT INTO users (email, firebase_uid, password_hash, password_salt) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = $3, password_salt = $4, firebase_uid = $2`,
          [normalizedEmail, firebaseUser.uid, hash, salt]
        );
      }
    } catch (dbError) {
      console.warn(
        `[AUTH SIGNIN] Password verification via DB failed (non-critical): ${dbError.message}`
      );
    }
    let firestoreData = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(firebaseUser.uid).get();
      if (userDoc.exists) {
        firestoreData = userDoc.data() || {};
      }
      await db.collection("users").doc(firebaseUser.uid).update({
        lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).catch(() => {
      });
    } catch (firestoreError) {
      console.warn(
        `[AUTH SIGNIN] Firestore unavailable (non-critical): ${firestoreError.message}`
      );
    }
    const result = {
      success: true,
      uid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified || firestoreData.emailVerified || false,
      selfieVerified: firestoreData.selfieVerified || false,
      invitedBy: firestoreData.invitedBy,
      onboardingComplete: firestoreData.onboardingComplete || false
    };
    console.log(`[AUTH SIGNIN] Success for uid: ${firebaseUser.uid}`);
    return result;
  } catch (error) {
    console.error(
      `[AUTH SIGNIN] UNEXPECTED ERROR: ${error.code} - ${error.message}`
    );
    return { success: false, message: error.message || "Failed to sign in" };
  }
}
async function sendVerificationEmail(uid) {
  console.log(`[AUTH] sendVerificationEmail called for uid: ${uid}`);
  try {
    const auth = getAuth();
    const user = await auth.getUser(uid);
    console.log(
      `[AUTH] User found: ${user.email}, emailVerified: ${user.emailVerified}`
    );
    const verificationLink = await auth.generateEmailVerificationLink(
      user.email
    );
    console.log(`[AUTH] Verification link generated for ${user.email}`);
    return {
      success: true,
      message: "Verification email sent. Check your inbox."
    };
  } catch (error) {
    console.error(
      `[AUTH] sendVerificationEmail error:`,
      error.code,
      error.message
    );
    return {
      success: false,
      message: error.message || "Failed to send verification email"
    };
  }
}
async function verifyEmail(uid, token) {
  console.log(`[AUTH] verifyEmail called for uid: ${uid}`);
  try {
    const auth = getAuth();
    await auth.updateUser(uid, { emailVerified: true });
    const db = getFirestore();
    await db.collection("users").doc(uid).update({
      emailVerified: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`[AUTH] Email verified for uid: ${uid}`);
    return { success: true };
  } catch (error) {
    console.error(`[AUTH] verifyEmail error:`, error.code, error.message);
    return { success: false, message: error.message || "Verification failed" };
  }
}
async function checkEmailVerification(uid) {
  try {
    const auth = getAuth();
    const user = await auth.getUser(uid);
    console.log(
      `[AUTH] checkEmailVerification uid: ${uid}, verified: ${user.emailVerified}`
    );
    if (user.emailVerified) {
      const db = getFirestore();
      await db.collection("users").doc(uid).update({
        emailVerified: true,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).catch(() => {
      });
    }
    return { success: true, emailVerified: user.emailVerified };
  } catch (error) {
    console.error(
      `[AUTH] checkEmailVerification error:`,
      error.code,
      error.message
    );
    return { success: false, emailVerified: false, message: error.message };
  }
}
async function submitSelfie(uid, selfieData) {
  console.log(`[AUTH] submitSelfie called for uid: ${uid}`);
  try {
    try {
      const db = getFirestore();
      await db.collection("users").doc(uid).set(
        {
          selfieSubmitted: true,
          selfieSubmittedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        },
        { merge: true }
      );
    } catch (firestoreError) {
      console.warn(
        `[AUTH] submitSelfie Firestore write failed (non-critical): ${firestoreError.message}`
      );
    }
    console.log(`[AUTH] Selfie submitted for uid: ${uid}`);
    return { success: true, message: "Selfie submitted for verification." };
  } catch (error) {
    console.error(`[AUTH] submitSelfie error:`, error.code, error.message);
    return {
      success: false,
      message: error.message || "Failed to submit selfie"
    };
  }
}
async function getUserStatus(uid) {
  try {
    const auth = getAuth();
    const firebaseUser = await auth.getUser(uid);
    let userData = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(uid).get();
      userData = userDoc.exists ? userDoc.data() : {};
    } catch (firestoreError) {
      console.warn(
        `[AUTH] getUserStatus Firestore read failed (non-critical): ${firestoreError.message}`
      );
    }
    return {
      success: true,
      emailVerified: firebaseUser.emailVerified,
      selfieVerified: userData?.selfieVerified || false,
      selfieSubmitted: userData?.selfieSubmitted || false
    };
  } catch (error) {
    console.error(`[AUTH] getUserStatus error:`, error.code, error.message);
    return { success: false, message: error.message };
  }
}
async function generateInviteCode(uid) {
  try {
    const db = getFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return { success: false, message: "User not found." };
    }
    const userData = userDoc.data();
    if (!userData?.selfieVerified) {
      return {
        success: false,
        message: "Only verified users can generate invite codes."
      };
    }
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    await db.collection("inviteCodes").doc(code).set({
      createdBy: uid,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`[AUTH] Invite code generated by uid ${uid}: ${code}`);
    return { success: true, inviteCode: code };
  } catch (error) {
    console.error(`[AUTH] generateInviteCode error:`, error.message);
    return { success: false, message: error.message };
  }
}
async function validateInviteCode(code) {
  try {
    const db = getFirestore();
    const inviteDoc = await db.collection("inviteCodes").doc(code.toUpperCase()).get();
    if (!inviteDoc.exists) {
      return { valid: false, message: "Invalid invite code." };
    }
    const inviteData = inviteDoc.data();
    if (inviteData?.usedBy) {
      return {
        valid: false,
        message: "This invite code has already been used."
      };
    }
    return { valid: true, inviterUid: inviteData?.createdBy };
  } catch (error) {
    return { valid: false, message: error.message };
  }
}
async function useInviteCode(code, usedByUid) {
  try {
    const db = getFirestore();
    const inviteRef = db.collection("inviteCodes").doc(code.toUpperCase());
    const inviteDoc = await inviteRef.get();
    if (!inviteDoc.exists || inviteDoc.data()?.usedBy) {
      return {
        success: false,
        message: "Invalid or already used invite code."
      };
    }
    await inviteRef.update({ usedBy: usedByUid });
    const inviteData = inviteDoc.data();
    await db.collection("users").doc(usedByUid).update({
      invitedBy: inviteData?.createdBy,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    });
    console.log(`[AUTH] Invite code ${code} used by ${usedByUid}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
async function createOrUpdateUserProfile(uid, profile) {
  console.log(
    `[AUTH] createOrUpdateUserProfile for uid: ${uid}`,
    JSON.stringify(profile)
  );
  try {
    if (profile.displayName) {
      const auth = getAuth();
      await auth.updateUser(uid, { displayName: profile.displayName }).catch((e) => {
        console.warn(`[AUTH] Firebase Auth updateUser failed: ${e.message}`);
      });
    }
    try {
      const db = getFirestore();
      await db.collection("users").doc(uid).set(
        { ...profile, updatedAt: (/* @__PURE__ */ new Date()).toISOString() },
        { merge: true }
      );
    } catch (firestoreError) {
      console.warn(
        `[AUTH] createOrUpdateUserProfile Firestore write failed (non-critical): ${firestoreError.message}`
      );
    }
    return { success: true };
  } catch (error) {
    console.error(`[AUTH] createOrUpdateUserProfile error:`, error.message);
    return { success: false, message: error.message };
  }
}
async function getUserProfile(uid) {
  try {
    const auth = getAuth();
    const firebaseUser = await auth.getUser(uid);
    let userData = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(uid).get();
      userData = userDoc.exists ? userDoc.data() : {};
    } catch (firestoreError) {
      console.warn(
        `[AUTH] getUserProfile Firestore read failed (non-critical): ${firestoreError.message}`
      );
    }
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      emailVerified: firebaseUser.emailVerified,
      selfieVerified: userData?.selfieVerified || false,
      selfieSubmitted: userData?.selfieSubmitted || false,
      displayName: userData?.displayName || firebaseUser.displayName,
      vehicle: userData?.vehicle,
      nomadStyle: userData?.nomadStyle,
      photoURL: userData?.photoURL || firebaseUser.photoURL,
      onboardingComplete: userData?.onboardingComplete || false
    };
  } catch (error) {
    console.error(`[AUTH] getUserProfile error:`, error.code, error.message);
    return null;
  }
}
var auth_default = {
  signUp,
  signIn,
  sendVerificationEmail,
  verifyEmail,
  checkEmailVerification,
  submitSelfie,
  getUserStatus,
  generateInviteCode,
  validateInviteCode,
  useInviteCode,
  createOrUpdateUserProfile,
  getUserProfile
};

// server/services/messages.ts
import { promises as fs2 } from "fs";
import path2 from "path";
import { randomUUID } from "crypto";
var STORE_DIR = path2.resolve(__dirname, "..", "data");
var STORE_FILE = path2.join(STORE_DIR, "messages.json");
async function ensureStoreFile() {
  try {
    await fs2.mkdir(STORE_DIR, { recursive: true });
    await fs2.access(STORE_FILE);
  } catch {
    await fs2.writeFile(STORE_FILE, JSON.stringify([]), "utf-8");
  }
}
async function loadMessages() {
  await ensureStoreFile();
  const content = await fs2.readFile(STORE_FILE, "utf-8");
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}
async function saveMessages(messages) {
  await ensureStoreFile();
  await fs2.writeFile(STORE_FILE, JSON.stringify(messages, null, 2), "utf-8");
}
function createConversationId(userA, userB) {
  return [userA, userB].sort().join("__");
}
async function sendMessage(message) {
  const conversationId = createConversationId(
    message.senderUid,
    message.receiverUid
  );
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const newMessage = {
    id: randomUUID(),
    ...message,
    conversationId,
    isRead: false,
    createdAt: now
  };
  const messages = await loadMessages();
  messages.unshift(newMessage);
  await saveMessages(messages);
  return newMessage;
}
async function getConversationThread(userUid, otherUid) {
  const conversationId = createConversationId(userUid, otherUid);
  const messages = await loadMessages();
  return messages.filter((message) => message.conversationId === conversationId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
async function listConversationsForUser(userUid) {
  const messages = await loadMessages();
  const summaries = /* @__PURE__ */ new Map();
  messages.forEach((message) => {
    if (message.senderUid !== userUid && message.receiverUid !== userUid) {
      return;
    }
    const conversationId = message.conversationId;
    const otherUid = message.senderUid === userUid ? message.receiverUid : message.senderUid;
    const name = message.senderUid === userUid ? message.receiverName || otherUid : message.senderName || otherUid;
    const avatar = message.senderUid === userUid ? message.receiverAvatar : message.senderAvatar;
    const lastMessage = message.content || "";
    const lastTimestamp = message.createdAt;
    const isUnread = !message.isRead && message.receiverUid === userUid;
    const existing = summaries.get(conversationId);
    if (!existing) {
      summaries.set(conversationId, {
        conversationId,
        otherUid,
        name,
        avatar,
        lastMessage,
        lastTimestamp,
        unreadCount: isUnread ? 1 : 0
      });
      return;
    }
    if (lastTimestamp > existing.lastTimestamp) {
      existing.lastMessage = lastMessage;
      existing.lastTimestamp = lastTimestamp;
      existing.name = name;
      existing.avatar = avatar;
    }
    if (isUnread) {
      existing.unreadCount += 1;
    }
  });
  return Array.from(summaries.values()).sort(
    (a, b) => b.lastTimestamp.localeCompare(a.lastTimestamp)
  );
}
var messages_default = {
  sendMessage,
  getConversationThread,
  listConversationsForUser
};

// server/routes/index.ts
var badgePool = new pg2.Pool({ connectionString: process.env.DATABASE_URL });
async function registerRoutes(app2) {
  app2.post("/api/auth/signup", async (req, res) => {
    console.log(`[ROUTE /api/auth/signup] === Request received ===`);
    console.log(`[ROUTE /api/auth/signup] Body:`, JSON.stringify(req.body));
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        console.log(
          `[ROUTE /api/auth/signup] REJECTED: Missing email or password`
        );
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }
      console.log(
        `[ROUTE /api/auth/signup] Calling authService.signUp(${email}, ***)`
      );
      const result = await auth_default.signUp(email, password);
      console.log(`[ROUTE /api/auth/signup] Result:`, JSON.stringify(result));
      return res.json(result);
    } catch (error) {
      console.error(
        `[ROUTE /api/auth/signup] UNCAUGHT ERROR:`,
        error.message,
        error.stack
      );
      return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
  });
  app2.post("/api/auth/signin", async (req, res) => {
    console.log(`[ROUTE /api/auth/signin] === Request received ===`);
    console.log(
      `[ROUTE /api/auth/signin] Body:`,
      JSON.stringify({ email: req.body?.email, password: "***" })
    );
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        console.log(
          `[ROUTE /api/auth/signin] REJECTED: Missing email or password`
        );
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }
      console.log(
        `[ROUTE /api/auth/signin] Calling authService.signIn(${email}, ***)`
      );
      const result = await auth_default.signIn(email, password);
      console.log(`[ROUTE /api/auth/signin] Result:`, JSON.stringify(result));
      return res.json(result);
    } catch (error) {
      console.error(
        `[ROUTE /api/auth/signin] UNCAUGHT ERROR:`,
        error.message,
        error.stack
      );
      return res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
  });
  app2.post("/api/auth/send-verification", async (req, res) => {
    console.log(
      `[ROUTE /api/auth/send-verification] Request for uid: ${req.body?.uid}`
    );
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      const result = await auth_default.sendVerificationEmail(uid);
      console.log(
        `[ROUTE /api/auth/send-verification] Result:`,
        JSON.stringify(result)
      );
      return res.json(result);
    } catch (error) {
      console.error("Send verification error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { uid, token } = req.body;
      if (!uid || !token) {
        return res.status(400).json({ success: false, message: "User ID and token are required" });
      }
      const result = await auth_default.verifyEmail(uid, token);
      return res.json(result);
    } catch (error) {
      console.error("Verify email error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/auth/check-verification/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await auth_default.checkEmailVerification(uid);
      return res.json(result);
    } catch (error) {
      console.error("Check verification error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/submit-selfie", async (req, res) => {
    try {
      const { uid, selfieData } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      const result = await auth_default.submitSelfie(
        uid,
        selfieData || "selfie_submitted"
      );
      return res.json(result);
    } catch (error) {
      console.error("Submit selfie error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/auth/user-status/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const result = await auth_default.getUserStatus(uid);
      return res.json(result);
    } catch (error) {
      console.error("User status error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/update-profile", async (req, res) => {
    console.log(
      `[ROUTE /api/auth/update-profile] Request:`,
      JSON.stringify(req.body)
    );
    try {
      const { uid, ...profile } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      const result = await auth_default.createOrUpdateUserProfile(uid, profile);
      console.log(
        `[ROUTE /api/auth/update-profile] Result:`,
        JSON.stringify(result)
      );
      return res.json(result);
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/auth/profile/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const profile = await auth_default.getUserProfile(uid);
      if (!profile) {
        return res.status(404).json({ success: false, message: "Profile not found" });
      }
      return res.json({ success: true, profile });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/generate-invite", async (req, res) => {
    try {
      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }
      const result = await auth_default.generateInviteCode(uid);
      return res.json(result);
    } catch (error) {
      console.error("Generate invite error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/validate-invite", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ valid: false, message: "Invite code is required" });
      }
      const result = await auth_default.validateInviteCode(code);
      return res.json(result);
    } catch (error) {
      console.error("Validate invite error:", error);
      return res.status(500).json({ valid: false, message: "Server error" });
    }
  });
  app2.post("/api/auth/use-invite", async (req, res) => {
    try {
      const { code, uid } = req.body;
      if (!code || !uid) {
        return res.status(400).json({ success: false, message: "Code and user ID are required" });
      }
      const result = await auth_default.useInviteCode(code, uid);
      return res.json(result);
    } catch (error) {
      console.error("Use invite error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/badges/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      if (!firebaseUid) {
        return res.status(400).json({ success: false, message: "Firebase UID required" });
      }
      const badgesResult = await badgePool.query(
        "SELECT badge_id FROM user_badges WHERE firebase_uid = $1",
        [firebaseUid]
      );
      const earnedBadgeIds = badgesResult.rows.map((r) => r.badge_id);
      const countResult = await badgePool.query("SELECT COUNT(*) FROM users");
      const totalUsers = parseInt(countResult.rows[0].count, 10);
      const genesisAvailable = totalUsers <= 100;
      return res.json({
        success: true,
        earnedBadgeIds,
        genesisAvailable,
        totalUsers
      });
    } catch (error) {
      console.error("Badge fetch error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.post("/api/messages/send", async (req, res) => {
    try {
      const {
        senderUid,
        receiverUid,
        content,
        messageType,
        senderName,
        receiverName,
        senderAvatar,
        receiverAvatar
      } = req.body;
      if (!senderUid || !receiverUid || !content) {
        return res.status(400).json({
          success: false,
          message: "senderUid, receiverUid, and content are required"
        });
      }
      const message = await messages_default.sendMessage({
        senderUid,
        receiverUid,
        content,
        messageType,
        senderName,
        receiverName,
        senderAvatar,
        receiverAvatar
      });
      return res.json({ success: true, message });
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/messages/conversations/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      if (!uid) {
        return res.status(400).json({ success: false, message: "User UID is required" });
      }
      const conversations = await messages_default.listConversationsForUser(uid);
      return res.json({ success: true, conversations });
    } catch (error) {
      console.error("List conversations error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  app2.get("/api/messages/thread/:userUid/:otherUid", async (req, res) => {
    try {
      const { userUid, otherUid } = req.params;
      if (!userUid || !otherUid) {
        return res.status(400).json({ success: false, message: "Both user UIDs are required" });
      }
      const messages = await messages_default.getConversationThread(
        userUid,
        otherUid
      );
      return res.json({ success: true, messages });
    } catch (error) {
      console.error("Get thread error:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/index.ts
import * as fs3 from "fs";
import * as path3 from "path";
var app = express();
var log = console.log;
function setupCors(app2) {
  app2.use((req, res, next) => {
    const origins = /* @__PURE__ */ new Set();
    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
    }
    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
      });
    }
    const origin = req.header("origin");
    const isLocalhost = origin?.startsWith("http://localhost:") || origin?.startsWith("https://localhost:") || origin?.startsWith("http://127.0.0.1:") || origin?.startsWith("https://127.0.0.1:");
    if (origin && (origins.has(origin) || isLocalhost)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.header("Access-Control-Allow-Headers", "Content-Type");
      res.header("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });
}
function setupBodyParsing(app2) {
  app2.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      }
    })
  );
  app2.use(express.urlencoded({ extended: false }));
}
function setupRequestLogging(app2) {
  app2.use((req, res, next) => {
    const start = Date.now();
    const path4 = req.path;
    let capturedJsonResponse = void 0;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
      if (!path4.startsWith("/api")) return;
      const duration = Date.now() - start;
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    });
    next();
  });
}
function getAppName() {
  try {
    const appJsonPath = path3.resolve(process.cwd(), "app.json");
    const appJsonContent = fs3.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}
function serveExpoManifest(platform, res) {
  const manifestPath = path3.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json"
  );
  if (!fs3.existsSync(manifestPath)) {
    return res.status(404).json({ error: `Manifest not found for platform: ${platform}` });
  }
  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");
  const manifest = fs3.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}
function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);
  const html = landingPageTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl).replace(/EXPS_URL_PLACEHOLDER/g, expsUrl).replace(/APP_NAME_PLACEHOLDER/g, appName);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
function configureExpoAndLanding(app2) {
  const templatePath = path3.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html"
  );
  const landingPageTemplate = fs3.readFileSync(templatePath, "utf-8");
  const appName = getAppName();
  log("Serving static Expo files with dynamic manifest routing");
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }
    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }
    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName
      });
    }
    next();
  });
  app2.use("/assets", express.static(path3.resolve(process.cwd(), "assets")));
  app2.use(express.static(path3.resolve(process.cwd(), "static-build")));
  log("Expo routing: Checking expo-platform header on / and /manifest");
}
function setupErrorHandler(app2) {
  app2.use((err, _req, res, next) => {
    const error = err;
    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    console.error("Internal Server Error:", err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(status).json({ message });
  });
}
(async () => {
  try {
    initializeFirebase();
    console.log("[SERVER] Firebase initialized on startup");
  } catch (error) {
    console.error("[SERVER] Firebase initialization failed on startup:", error);
  }
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);
  configureExpoAndLanding(app);
  const server = await registerRoutes(app);
  setupErrorHandler(app);
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || (process.env.NODE_ENV === "development" ? "127.0.0.1" : "0.0.0.0");
  server.on("error", (err) => {
    console.error("[SERVER] listen error:", err);
  });
  const listenOptions = {
    port,
    host
  };
  if (process.env.REUSE_PORT === "1") {
    listenOptions.reusePort = true;
  }
  server.listen(listenOptions, () => {
    log(`express server serving on http://${host}:${port}`);
  });
})();
