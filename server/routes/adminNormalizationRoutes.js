
import express from 'express';
import { adminDb } from '../firebaseAdmin.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { loadUserProfile } from '../middleware/loadUserProfile.js';
import { normalizeDepartment, normalizeYear, normalizeSemester, parseR2StoragePath } from '../utils/normalization.js';

const router = express.Router();

router.get('/dry-run', verifyFirebaseToken, loadUserProfile, async (req, res) => {
    try {
        if (!req.userProfile || req.userProfile.role !== 'admin') {
            return res.status(403).json({
                ok: false,
                message: "Only active admin users can run normalization dry-run"
            });
        }

        const [usersSnapshot, materialsSnapshot] = await Promise.all([
            adminDb.collection('users').get(),
            adminDb.collection('materials').get()
        ]);

        const usersReport = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            const norm_department = normalizeDepartment(data.department);
            const norm_year = normalizeYear(data.year);
            const norm_semester = normalizeSemester(data.semester);
            
            return {
                collection: "users",
                id: doc.id,
                role: data.role,
                status: data.status,
                current: { department: data.department, year: data.year, semester: data.semester },
                normalized: { norm_department, norm_year, norm_semester },
                canNormalize: !!(norm_department || norm_year || norm_semester),
                warnings: []
            };
        });

        const materialsReport = materialsSnapshot.docs.map(doc => {
            const data = doc.data();
            const norm_department = normalizeDepartment(data.department);
            const norm_year = normalizeYear(data.year);
            const norm_semester = normalizeSemester(data.semester);
            
            let pathDerived = { department: "", year: "", semester: "" };
            if (data.storageProvider === "cloudflare-r2" && data.storagePath) {
                pathDerived = parseR2StoragePath(data.storagePath);
            }
            
            return {
                collection: "materials",
                id: doc.id,
                title: data.title,
                storageProvider: data.storageProvider,
                status: data.status,
                current: { department: data.department, year: data.year, semester: data.semester, storagePath: data.storagePath },
                normalized: { norm_department, norm_year, norm_semester },
                pathDerived,
                canNormalize: !!(norm_department || norm_year || norm_semester),
                warnings: []
            };
        });

        return res.json({
            ok: true,
            mode: "dry-run",
            changedNothing: true,
            summary: {
                usersScanned: usersSnapshot.size,
                usersCanNormalize: usersReport.filter(u => u.canNormalize).length,
                usersNeedReview: usersReport.filter(u => !u.canNormalize).length,
                materialsScanned: materialsSnapshot.size,
                materialsCanNormalize: materialsReport.filter(m => m.canNormalize).length,
                materialsNeedReview: materialsReport.filter(m => !m.canNormalize).length
            },
            users: usersReport,
            materials: materialsReport,
            message: "Dry-run complete. No Firestore documents were modified."
        });

    } catch (error) {
        console.error('Normalization dry-run failed:', error);
        return res.status(500).json({ ok: false, message: error.message });
    }
});

export default router;
