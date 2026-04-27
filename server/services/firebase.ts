import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

let firebaseApp: admin.app.App | null = null;

function readServiceAccountJson(): string {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (inline) {
    return inline;
  }

  const fileEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (fileEnv) {
    const resolved = path.isAbsolute(fileEnv)
      ? fileEnv
      : path.resolve(process.cwd(), fileEnv);
    if (!fs.existsSync(resolved)) {
      throw new Error(
        `FIREBASE_SERVICE_ACCOUNT file not found: ${resolved}. Set FIREBASE_SERVICE_ACCOUNT_PATH or place the JSON at that path.`,
      );
    }
    return fs.readFileSync(resolved, "utf8");
  }

  throw new Error(
    "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT (JSON string), or FIREBASE_SERVICE_ACCOUNT_PATH / GOOGLE_APPLICATION_CREDENTIALS to a service account .json file. See .env.example.",
  );
}

export function initializeFirebase(): admin.app.App {
  if (firebaseApp) {
    console.log("[FIREBASE] Already initialized, returning existing app");
    return firebaseApp;
  }

  console.log("[FIREBASE] === Initializing Firebase Admin SDK ===");

  const serviceAccountJson = readServiceAccountJson();

  console.log(
    "[FIREBASE] Service account loaded (length: " +
      serviceAccountJson.length +
      " chars)",
  );

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log("[FIREBASE] Service account parsed successfully");
    console.log("[FIREBASE]   project_id: " + serviceAccount.project_id);
    console.log("[FIREBASE]   client_email: " + serviceAccount.client_email);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log(
      "[FIREBASE] Firebase Admin SDK initialized successfully for project: " +
        serviceAccount.project_id,
    );

    const webApiKey = process.env.FIREBASE_WEB_API_KEY;
    if (webApiKey) {
      console.log(
        "[FIREBASE] FIREBASE_WEB_API_KEY is set (length: " +
          webApiKey.length +
          " chars)",
      );
    } else {
      console.warn(
        "[FIREBASE] WARNING: FIREBASE_WEB_API_KEY is NOT set! Some auth flows may log warnings.",
      );
    }

    return firebaseApp;
  } catch (error) {
    console.error("[FIREBASE] Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
}

export function getFirestore(): admin.firestore.Firestore {
  return getFirebaseApp().firestore();
}

export function getAuth(): admin.auth.Auth {
  return getFirebaseApp().auth();
}

export function getMessaging(): admin.messaging.Messaging {
  return getFirebaseApp().messaging();
}

export function getStorage(): admin.storage.Storage {
  return getFirebaseApp().storage();
}

export async function verifyIdToken(
  idToken: string,
): Promise<admin.auth.DecodedIdToken> {
  return getAuth().verifyIdToken(idToken);
}

export async function createCustomToken(
  uid: string,
  claims?: object,
): Promise<string> {
  return getAuth().createCustomToken(uid, claims);
}

export async function sendPushNotification(
  token: string,
  notification: { title: string; body: string },
  data?: Record<string, string>,
): Promise<string> {
  const message: admin.messaging.Message = {
    token,
    notification,
    data,
  };
  return getMessaging().send(message);
}

export async function sendMulticastNotification(
  tokens: string[],
  notification: { title: string; body: string },
  data?: Record<string, string>,
): Promise<admin.messaging.BatchResponse> {
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification,
    data,
  };
  return getMessaging().sendEachForMulticast(message);
}

export default {
  initializeFirebase,
  getFirebaseApp,
  getFirestore,
  getAuth,
  getMessaging,
  getStorage,
  verifyIdToken,
  createCustomToken,
  sendPushNotification,
  sendMulticastNotification,
};
