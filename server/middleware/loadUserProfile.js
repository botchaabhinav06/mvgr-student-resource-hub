import { adminDb } from '../firebaseAdmin.js';

export async function loadUserProfile(req, res, next) {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthenticated status. Missing user ID.',
    });
  }

  if (!adminDb) {
    console.error('[loadUserProfile] Firebase Admin Database is not configured.');
    return res.status(403).json({
      ok: false,
      message: 'User profile not found',
    });
  }

  try {
    const uid = req.user.uid;
    const userDocRef = adminDb.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(403).json({
        ok: false,
        message: 'User profile not found',
      });
    }

    req.userProfile = { ...userDoc.data(), uid: req.uid };
    next();
  } catch (error) {
    console.error('[loadUserProfile] Error retrieving user document: ', error.message);
    return res.status(403).json({
      ok: false,
      message: 'User profile not found',
    });
  }
}
