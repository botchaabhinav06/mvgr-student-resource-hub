import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

function getPrivateKey() {
  if (process.env.FIREBASE_PRIVATE_KEY_BASE64) {
    return Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, "base64").toString("utf8");
  }

  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!rawKey) return undefined;

  return rawKey
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = getPrivateKey();

let isConfigured = false;
let appInstance = null;

if (projectId && clientEmail && privateKey) {
  try {
    // Avoid duplicate initialization
    const apps = getApps();
    if (apps.length === 0) {
      appInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      appInstance = apps[0];
    }
    isConfigured = true;
  } catch (error) {
    console.error('[Firebase Admin] Error initializing: ', error);
  }
} else {
  console.warn('[Firebase Admin] Environment parameters missing. Admin SDK unconfigured.');
}

export const adminAuth = isConfigured ? getAuth(appInstance) : null;
export const adminDb = isConfigured ? getFirestore(appInstance) : null;
export { admin, isConfigured };
