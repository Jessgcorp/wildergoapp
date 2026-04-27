import { getAuth, getFirestore } from "./firebase";
import * as crypto from "crypto";
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
}

function verifyPassword(password: string, salt: string, hash: string): boolean {
  const checkHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(checkHash));
}

export async function signUp(
  email: string,
  password: string,
): Promise<{ success: boolean; uid?: string; message?: string }> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[AUTH SIGNUP] === Starting signup for: ${normalizedEmail} ===`);

  try {
    if (password.length < 6) {
      console.log(
        `[AUTH SIGNUP] REJECTED: Password too short (${password.length} chars)`,
      );
      return {
        success: false,
        message: "Password must be at least 6 characters.",
      };
    }

    const auth = getAuth();
    console.log(`[AUTH SIGNUP] Firebase Auth instance obtained successfully`);

    let existingUser = null;
    try {
      existingUser = await auth.getUserByEmail(normalizedEmail);
    } catch (lookupError: any) {
      if (lookupError.code === "auth/user-not-found") {
        console.log(
          `[AUTH SIGNUP] No existing user found - proceeding with creation`,
        );
      } else {
        console.error(
          `[AUTH SIGNUP] Error checking existing user:`,
          lookupError.code,
          lookupError.message,
        );
        throw lookupError;
      }
    }

    if (existingUser) {
      console.log(
        `[AUTH SIGNUP] REJECTED: User already exists with uid: ${existingUser.uid}`,
      );
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    console.log(`[AUTH SIGNUP] Calling Firebase auth.createUser()...`);
    const firebaseUser = await auth.createUser({
      email: normalizedEmail,
      password: password,
      emailVerified: false,
    });

    console.log(
      `[AUTH SIGNUP] SUCCESS: Firebase user created with uid: ${firebaseUser.uid}`,
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
          [normalizedEmail, firebaseUser.uid, hash, salt],
        );
        console.log(`[AUTH SIGNUP] Password hash stored in PostgreSQL`);

        if (userCount < 100) {
          await client.query(
            `INSERT INTO user_badges (firebase_uid, badge_id) VALUES ($1, $2) ON CONFLICT (firebase_uid, badge_id) DO NOTHING`,
            [firebaseUser.uid, "10"],
          );
          console.log(
            `[AUTH SIGNUP] Genesis badge (Apex Pioneer) awarded - user #${userCount + 1}`,
          );
        } else {
          console.log(
            `[AUTH SIGNUP] Genesis badge NOT awarded - user #${userCount + 1} exceeds 100`,
          );
        }

        await client.query("COMMIT");
      } catch (txError) {
        await client.query("ROLLBACK");
        throw txError;
      } finally {
        client.release();
      }
    } catch (dbError: any) {
      console.warn(
        `[AUTH SIGNUP] PostgreSQL write failed (non-critical): ${dbError.message}`,
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
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH SIGNUP] Firestore write failed (non-critical): ${firestoreError.message}`,
      );
    }

    return { success: true, uid: firebaseUser.uid };
  } catch (error: any) {
    console.error(`[AUTH SIGNUP] FIREBASE ERROR:`);
    console.error(`[AUTH SIGNUP]   code: ${error.code}`);
    console.error(`[AUTH SIGNUP]   message: ${error.message}`);
    console.error(
      `[AUTH SIGNUP]   full error:`,
      JSON.stringify(error, null, 2),
    );

    let userMessage = "Failed to create account.";
    if (error.code === "auth/email-already-exists") {
      userMessage = "An account with this email already exists.";
    } else if (error.code === "auth/invalid-email") {
      userMessage = "Invalid email address format.";
    } else if (error.code === "auth/weak-password") {
      userMessage = "Password is too weak. Use at least 6 characters.";
    } else if (error.code === "auth/operation-not-allowed") {
      userMessage =
        "Email/password accounts are not enabled. Please enable them in Firebase Console.";
    } else if (error.message) {
      userMessage = error.message;
    }

    return { success: false, message: userMessage };
  }
}

export async function signIn(
  email: string,
  password: string,
): Promise<{
  success: boolean;
  uid?: string;
  emailVerified?: boolean;
  selfieVerified?: boolean;
  invitedBy?: string;
  onboardingComplete?: boolean;
  message?: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  console.log(`[AUTH SIGNIN] === Starting signin for: ${normalizedEmail} ===`);

  try {
    const auth = getAuth();

    let firebaseUser;
    try {
      firebaseUser = await auth.getUserByEmail(normalizedEmail);
      console.log(`[AUTH SIGNIN] Found Firebase user: uid=${firebaseUser.uid}`);
    } catch (lookupError: any) {
      if (lookupError.code === "auth/user-not-found") {
        return { success: false, message: "No account found with this email." };
      }
      throw lookupError;
    }

    try {
      const dbResult = await pool.query(
        `SELECT password_hash, password_salt FROM users WHERE email = $1`,
        [normalizedEmail],
      );
      if (
        dbResult.rows.length > 0 &&
        dbResult.rows[0].password_hash &&
        dbResult.rows[0].password_salt
      ) {
        const { password_hash, password_salt } = dbResult.rows[0];
        if (!verifyPassword(password, password_salt, password_hash)) {
          console.log(
            `[AUTH SIGNIN] Password verification failed for: ${normalizedEmail}`,
          );
          return {
            success: false,
            message: "Incorrect password. Please try again.",
          };
        }
        console.log(`[AUTH SIGNIN] Password verified successfully`);
      } else {
        console.log(
          `[AUTH SIGNIN] No stored password hash found - storing one now`,
        );
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = hashPassword(password, salt);
        await pool.query(
          `INSERT INTO users (email, firebase_uid, password_hash, password_salt) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO UPDATE SET password_hash = $3, password_salt = $4, firebase_uid = $2`,
          [normalizedEmail, firebaseUser.uid, hash, salt],
        );
      }
    } catch (dbError: any) {
      console.warn(
        `[AUTH SIGNIN] Password verification via DB failed (non-critical): ${dbError.message}`,
      );
    }

    let firestoreData: any = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(firebaseUser.uid).get();
      if (userDoc.exists) {
        firestoreData = userDoc.data() || {};
      }
      await db
        .collection("users")
        .doc(firebaseUser.uid)
        .update({
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .catch(() => {});
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH SIGNIN] Firestore unavailable (non-critical): ${firestoreError.message}`,
      );
    }

    const result = {
      success: true,
      uid: firebaseUser.uid,
      emailVerified:
        firebaseUser.emailVerified || firestoreData.emailVerified || false,
      selfieVerified: firestoreData.selfieVerified || false,
      invitedBy: firestoreData.invitedBy,
      onboardingComplete: firestoreData.onboardingComplete || false,
    };
    console.log(`[AUTH SIGNIN] Success for uid: ${firebaseUser.uid}`);
    return result;
  } catch (error: any) {
    console.error(
      `[AUTH SIGNIN] UNEXPECTED ERROR: ${error.code} - ${error.message}`,
    );
    return { success: false, message: error.message || "Failed to sign in" };
  }
}

export async function sendVerificationEmail(
  uid: string,
): Promise<{ success: boolean; message: string }> {
  console.log(`[AUTH] sendVerificationEmail called for uid: ${uid}`);
  try {
    const auth = getAuth();
    const user = await auth.getUser(uid);
    console.log(
      `[AUTH] User found: ${user.email}, emailVerified: ${user.emailVerified}`,
    );

    const verificationLink = await auth.generateEmailVerificationLink(
      user.email!,
    );
    console.log(`[AUTH] Verification link generated for ${user.email}`);

    return {
      success: true,
      message: "Verification email sent. Check your inbox.",
    };
  } catch (error: any) {
    console.error(
      `[AUTH] sendVerificationEmail error:`,
      error.code,
      error.message,
    );
    return {
      success: false,
      message: error.message || "Failed to send verification email",
    };
  }
}

export async function verifyEmail(
  uid: string,
  token: string,
): Promise<{ success: boolean; message?: string }> {
  console.log(`[AUTH] verifyEmail called for uid: ${uid}`);
  try {
    const auth = getAuth();
    await auth.updateUser(uid, { emailVerified: true });

    const db = getFirestore();
    await db.collection("users").doc(uid).update({
      emailVerified: true,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[AUTH] Email verified for uid: ${uid}`);
    return { success: true };
  } catch (error: any) {
    console.error(`[AUTH] verifyEmail error:`, error.code, error.message);
    return { success: false, message: error.message || "Verification failed" };
  }
}

export async function checkEmailVerification(
  uid: string,
): Promise<{ success: boolean; emailVerified: boolean; message?: string }> {
  try {
    const auth = getAuth();
    const user = await auth.getUser(uid);
    console.log(
      `[AUTH] checkEmailVerification uid: ${uid}, verified: ${user.emailVerified}`,
    );

    if (user.emailVerified) {
      const db = getFirestore();
      await db
        .collection("users")
        .doc(uid)
        .update({
          emailVerified: true,
          updatedAt: new Date().toISOString(),
        })
        .catch(() => {});
    }

    return { success: true, emailVerified: user.emailVerified };
  } catch (error: any) {
    console.error(
      `[AUTH] checkEmailVerification error:`,
      error.code,
      error.message,
    );
    return { success: false, emailVerified: false, message: error.message };
  }
}

export async function submitSelfie(
  uid: string,
  selfieData: string,
): Promise<{ success: boolean; message?: string }> {
  console.log(`[AUTH] submitSelfie called for uid: ${uid}`);
  try {
    try {
      const db = getFirestore();
      await db.collection("users").doc(uid).set(
        {
          selfieSubmitted: true,
          selfieSubmittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH] submitSelfie Firestore write failed (non-critical): ${firestoreError.message}`,
      );
    }

    console.log(`[AUTH] Selfie submitted for uid: ${uid}`);
    return { success: true, message: "Selfie submitted for verification." };
  } catch (error: any) {
    console.error(`[AUTH] submitSelfie error:`, error.code, error.message);
    return {
      success: false,
      message: error.message || "Failed to submit selfie",
    };
  }
}

export async function getUserStatus(uid: string): Promise<{
  success: boolean;
  emailVerified?: boolean;
  selfieVerified?: boolean;
  selfieSubmitted?: boolean;
  message?: string;
}> {
  try {
    const auth = getAuth();
    const firebaseUser = await auth.getUser(uid);

    let userData: any = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(uid).get();
      userData = userDoc.exists ? userDoc.data() : {};
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH] getUserStatus Firestore read failed (non-critical): ${firestoreError.message}`,
      );
    }

    return {
      success: true,
      emailVerified: firebaseUser.emailVerified,
      selfieVerified: userData?.selfieVerified || false,
      selfieSubmitted: userData?.selfieSubmitted || false,
    };
  } catch (error: any) {
    console.error(`[AUTH] getUserStatus error:`, error.code, error.message);
    return { success: false, message: error.message };
  }
}

export async function generateInviteCode(
  uid: string,
): Promise<{ success: boolean; inviteCode?: string; message?: string }> {
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
        message: "Only verified users can generate invite codes.",
      };
    }

    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    await db.collection("inviteCodes").doc(code).set({
      createdBy: uid,
      createdAt: new Date().toISOString(),
    });

    console.log(`[AUTH] Invite code generated by uid ${uid}: ${code}`);
    return { success: true, inviteCode: code };
  } catch (error: any) {
    console.error(`[AUTH] generateInviteCode error:`, error.message);
    return { success: false, message: error.message };
  }
}

export async function validateInviteCode(
  code: string,
): Promise<{ valid: boolean; inviterUid?: string; message?: string }> {
  try {
    const db = getFirestore();
    const inviteDoc = await db
      .collection("inviteCodes")
      .doc(code.toUpperCase())
      .get();

    if (!inviteDoc.exists) {
      return { valid: false, message: "Invalid invite code." };
    }

    const inviteData = inviteDoc.data();
    if (inviteData?.usedBy) {
      return {
        valid: false,
        message: "This invite code has already been used.",
      };
    }

    return { valid: true, inviterUid: inviteData?.createdBy };
  } catch (error: any) {
    return { valid: false, message: error.message };
  }
}

export async function useInviteCode(
  code: string,
  usedByUid: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const db = getFirestore();
    const inviteRef = db.collection("inviteCodes").doc(code.toUpperCase());
    const inviteDoc = await inviteRef.get();

    if (!inviteDoc.exists || inviteDoc.data()?.usedBy) {
      return {
        success: false,
        message: "Invalid or already used invite code.",
      };
    }

    await inviteRef.update({ usedBy: usedByUid });

    const inviteData = inviteDoc.data();
    await db.collection("users").doc(usedByUid).update({
      invitedBy: inviteData?.createdBy,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[AUTH] Invite code ${code} used by ${usedByUid}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function createOrUpdateUserProfile(
  uid: string,
  profile: {
    displayName?: string;
    vehicle?: string;
    nomadStyle?: string;
    photoURL?: string;
    inviteCode?: string;
    onboardingComplete?: boolean;
  },
): Promise<{ success: boolean; message?: string }> {
  console.log(
    `[AUTH] createOrUpdateUserProfile for uid: ${uid}`,
    JSON.stringify(profile),
  );
  try {
    if (profile.displayName) {
      const auth = getAuth();
      await auth
        .updateUser(uid, { displayName: profile.displayName })
        .catch((e: any) => {
          console.warn(`[AUTH] Firebase Auth updateUser failed: ${e.message}`);
        });
    }

    try {
      const db = getFirestore();
      await db
        .collection("users")
        .doc(uid)
        .set(
          { ...profile, updatedAt: new Date().toISOString() },
          { merge: true },
        );
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH] createOrUpdateUserProfile Firestore write failed (non-critical): ${firestoreError.message}`,
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error(`[AUTH] createOrUpdateUserProfile error:`, error.message);
    return { success: false, message: error.message };
  }
}

export async function getUserProfile(uid: string): Promise<any> {
  try {
    const auth = getAuth();
    const firebaseUser = await auth.getUser(uid);

    let userData: any = {};
    try {
      const db = getFirestore();
      const userDoc = await db.collection("users").doc(uid).get();
      userData = userDoc.exists ? userDoc.data() : {};
    } catch (firestoreError: any) {
      console.warn(
        `[AUTH] getUserProfile Firestore read failed (non-critical): ${firestoreError.message}`,
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
      onboardingComplete: userData?.onboardingComplete || false,
    };
  } catch (error: any) {
    console.error(`[AUTH] getUserProfile error:`, error.code, error.message);
    return null;
  }
}

export default {
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
  getUserProfile,
};
