import { adminDb } from '../firebaseAdmin.js';
import { normalizeDepartment as utilsNormalizeDepartment } from '../utils/normalization.js';

// Helper to resolve normalized department of a profile or material
export function getEffectiveDepartment(record) {
  if (!record) return null;
  if (record.norm_department && typeof record.norm_department === 'string' && record.norm_department.trim() !== '') {
    return record.norm_department.toLowerCase().trim();
  }
  return utilsNormalizeDepartment(record.department);
}

/**
 * Validates if an authenticated user profile has permissions to access and perform AI operations
 * (such as text extraction) on a specific material ID.
 * 
 * @param {Object} userProfile - The user profile fetched by loadUserProfile middleware
 * @param {string} materialId - The Firestore material document ID
 * @returns {Promise<Object>} An object detailing authorization status and material record
 */
export async function validateMaterialAccess(userProfile, materialId) {
  if (!userProfile) {
    return { authorized: false, code: 'UNAUTHENTICATED', message: 'User profile not found or unauthenticated.' };
  }

  const userRole = userProfile.role;
  const userStatus = userProfile.status || userProfile.accountStatus || 'active';

  if (userStatus !== 'active') {
    return { authorized: false, code: 'INACTIVE_USER', message: 'Your account is currently inactive.' };
  }

  if (!materialId || typeof materialId !== 'string') {
    return { authorized: false, code: 'INVALID_MATERIAL_ID', message: 'Material ID is required.' };
  }

  if (!adminDb) {
    return { authorized: false, code: 'DATABASE_UNCONFIGURED', message: 'Firestore database integration is not configured.' };
  }

  // Load material from Firestore
  const materialDoc = await adminDb.collection('materials').doc(materialId).get();
  if (!materialDoc.exists) {
    return { authorized: false, code: 'MATERIAL_NOT_FOUND', message: 'The requested material does not exist.' };
  }

  const material = materialDoc.data();

  // Validate material status
  if (material.status !== 'active') {
    return { authorized: false, code: 'MATERIAL_NOT_ACTIVE', message: 'The requested material is currently inactive.' };
  }

  // Validate storage provider
  if (material.storageProvider !== 'cloudflare-r2') {
    return { authorized: false, code: 'STORAGE_PROVIDER_UNSUPPORTED', message: 'Requested material is not stored in Cloudflare R2.' };
  }

  // Validate storage path presence
  const storagePath = material.storagePath;
  if (!storagePath || typeof storagePath !== 'string') {
    return { authorized: false, code: 'STORAGE_PATH_INVALID', message: 'Requested material has no valid storage location.' };
  }

  // Path traversal safety checks
  if (storagePath.includes('../') || storagePath.includes('..\\')) {
    return { authorized: false, code: 'PATH_TRAVERSAL_DETECTED', message: 'Unsafe path traversal detected in storage location.' };
  }

  // Allowed segment prefix checks
  if (!storagePath.startsWith('materials/') && !storagePath.startsWith('test-uploads/')) {
    return { authorized: false, code: 'PATH_UNAUTHORIZED_SEGMENT', message: 'Unsafe storage path prefix detected.' };
  }

  // Role Access Policy check
  if (userRole === 'admin' || userRole === 'faculty') {
    // Admins and faculty can access any active R2 materials
    return { authorized: true, material, storagePath };
  } else if (userRole === 'student') {
    const studentDept = getEffectiveDepartment(userProfile);
    const materialDept = getEffectiveDepartment(material);

    const sameDept = Boolean(studentDept) && Boolean(materialDept) && studentDept === materialDept;
    if (sameDept) {
      return { authorized: true, material, storagePath };
    } else {
      return { authorized: false, code: 'DEPARTMENT_MISMATCH', message: 'Students can only access study materials belonging to their own department.' };
    }
  }

  return { authorized: false, code: 'ACCESS_DENIED', message: 'Your user role is not authorized to access academic materials.' };
}
