import { adminAuth } from '../firebaseAdmin.js';

export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      ok: false,
      message: 'Missing authentication token',
    });
  }

  const token = authHeader.split('Bearer ')[1];

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: 'Missing authentication token',
    });
  }

  if (!adminAuth) {
    console.error('[verifyFirebaseToken] Firebase Admin Auth is not configured on backend.');
    return res.status(401).json({
      ok: false,
      message: 'Invalid or expired authentication token',
    });
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('[verifyFirebaseToken] Verification failed: ', error.message);
    return res.status(401).json({
      ok: false,
      message: 'Invalid or expired authentication token',
    });
  }
}
