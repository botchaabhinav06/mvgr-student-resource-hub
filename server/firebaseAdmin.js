import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

let isConfigured = false;
let appInstance = null;

if (projectId && clientEmail && privateKey) {
  try {
    // Clean up wrapping quotes and replace escaped newlines
    let cleanedKey = privateKey.trim();
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) {
      cleanedKey = cleanedKey.slice(1, -1);
    }
    if (cleanedKey.startsWith("'") && cleanedKey.endsWith("'")) {
      cleanedKey = cleanedKey.slice(1, -1);
    }
    const formattedPrivateKey = cleanedKey.replace(/\\n/g, '\n');

    // Avoid duplicate initialization
    const apps = getApps();
    if (apps.length === 0) {
      appInstance = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
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
