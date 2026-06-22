
import express from 'express';
import { adminDb, admin } from '../firebaseAdmin.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { loadUserProfile } from '../middleware/loadUserProfile.js';
import { normalizeDepartment, normalizeYear, normalizeSemester, parseR2StoragePath } from '../utils/normalization.js';

const router = express.Router();

// Helper to check admin
function isAdmin(userProfile) {
    return userProfile && userProfile.role === 'admin' && (userProfile.status === 'active' || !userProfile.status);
}

router.get('/dry-run', verifyFirebaseToken, loadUserProfile, async (req, res) => {
    try {
        if (!isAdmin(req.userProfile)) {
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

router.post('/apply', verifyFirebaseToken, loadUserProfile, async (req, res) => {
    try {
        if (!isAdmin(req.userProfile)) {
            return res.status(403).json({ ok: false, message: "Only active admin users can apply normalization migration" });
        }
        if (!req.body.confirm) {
            return res.status(400).json({ ok: false, message: "Normalization apply requires confirm: true" });
        }

        const [usersSnapshot, materialsSnapshot] = await Promise.all([
            adminDb.collection('users').get(),
            adminDb.collection('materials').get()
        ]);

        // Same scan logic as dry-run
        const usersToUpdate = usersSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
            .filter(doc => (normalizeDepartment(doc.data.department) || normalizeYear(doc.data.year) || normalizeSemester(doc.data.semester)));
        const materialsToUpdate = materialsSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
            .filter(doc => (normalizeDepartment(doc.data.department) || normalizeYear(doc.data.year) || normalizeSemester(doc.data.semester)));

        // Actually the prompt says block if ANY document cannot normalize safely.
        // Re-scanning to check review status:
        const usersReport = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                canNormalize: !!(normalizeDepartment(data.department) || normalizeYear(data.year) || normalizeSemester(data.semester))
            };
        });
        const materialsReport = materialsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                canNormalize: !!(normalizeDepartment(data.department) || normalizeYear(data.year) || normalizeSemester(data.semester))
            };
        });

        if (usersReport.some(u => !u.canNormalize) || materialsReport.some(m => !m.canNormalize)) {
             return res.status(409).json({ ok: false, message: "Normalization failed scan check: some documents need review" });
        }

        const batch = adminDb.batch();
        let ops = 0;

        for (const doc of usersToUpdate) {
            const data = doc.data;
            const update = {
                norm_department: normalizeDepartment(data.department),
                norm_year: normalizeYear(data.year),
                norm_semester: normalizeSemester(data.semester),
                normalizationStatus: "normalized",
                normalizedAt: admin.firestore.FieldValue.serverTimestamp(),
                normalizationVersion: "10.5C"
            };
            if (!data.original_department) update.original_department = data.department;
            if (!data.original_year) update.original_year = data.year;
            if (!data.original_semester) update.original_semester = data.semester;
            
            batch.update(adminDb.collection('users').doc(doc.id), update);
            ops++;
            if (ops >= 450) { await batch.commit(); ops = 0; }
        }

        for (const doc of materialsToUpdate) {
            const data = doc.data;
            const update = {
                norm_department: normalizeDepartment(data.department),
                norm_year: normalizeYear(data.year),
                norm_semester: normalizeSemester(data.semester),
                normalizationStatus: "normalized",
                normalizedAt: admin.firestore.FieldValue.serverTimestamp(),
                normalizationVersion: "10.5C"
            };
            if (!data.original_department) update.original_department = data.department;
            if (!data.original_year) update.original_year = data.year;
            if (!data.original_semester) update.original_semester = data.semester;
            
            batch.update(adminDb.collection('materials').doc(doc.id), update);
            ops++;
            if (ops >= 450) { await batch.commit(); ops = 0; }
        }

        await batch.commit();

        return res.json({
            ok: true,
            mode: "apply",
            changedDocuments: true,
            summary: {
                usersScanned: usersSnapshot.size,
                usersUpdated: usersToUpdate.length,
                materialsScanned: materialsSnapshot.size,
                materialsUpdated: materialsToUpdate.length
            },
            message: "Normalization apply complete. Only additive normalized fields were written."
        });

    } catch (error) {
        console.error('Normalization apply failed:', error);
        return res.status(500).json({ ok: false, message: error.message });
    }
});

export default router;

