import express from 'express';
import multer from 'multer';
import path from 'path';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, bucketName, validateR2Env } from '../r2Client.js';

const router = express.Router();

// Multer memory storage with 25MB limits
const uploadInstance = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB
  }
}).single('file'); // field name must be exactly 'file'

function sanitizeFileName(fileName) {
  if (!fileName) return "unnamed-file.pdf";
  // Remove path traversal and restrict characters to alphanumeric, hyphens, underscores, dots
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext);
  const safeBase = base
    .replace(/[^a-zA-Z0-9_-]/g, '-') // Replace unsafe characters with hyphen
    .replace(/-+/g, '-')             // Collapse consecutive hyphens
    .replace(/^-|-$/g, '');          // Trim hyphens from ends
  
  return `${safeBase || "file"}.pdf`;
}

// 1. GET /api/r2/health
router.get('/health', (req, res) => {
  try {
    validateR2Env();
    res.json({
      ok: true,
      provider: "cloudflare-r2",
      bucket: bucketName,
      message: "R2 backend is configured"
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      provider: "cloudflare-r2",
      bucket: bucketName,
      message: "R2 backend is not fully configured: " + error.message
    });
  }
});

// 2. POST /api/r2/test-upload
router.post('/test-upload', (req, res, next) => {
  console.log('[DEBUG R2-TEST-UPLOAD] Hit /api/r2/test-upload endpoint. Content-Type:', req.headers['content-type']);
  
  try {
    uploadInstance(req, res, async (err) => {
      console.log('[DEBUG R2-TEST-UPLOAD] Multer callback invoked. errStatus:', err ? err.message : 'none', 'File received:', !!req.file);
      try {
        // Validate env variables first
        validateR2Env();

        // Check multer error (e.g. limit size)
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              ok: false,
              error: 'File too large. Maximum allowed size is 25 MB.'
            });
          }
          return res.status(400).json({
            ok: false,
            error: `Upload parsing failure: ${err.message}`
          });
        }

        // Validate file exists
        if (!req.file) {
          return res.status(400).json({
            ok: false,
            error: 'Missing file. Please upload a file with field name "file" using multipart/form-data.'
          });
        }

        // Validate mimetype is exactly application/pdf
        if (req.file.mimetype !== 'application/pdf') {
          return res.status(400).json({
            ok: false,
            error: `Invalid file type: ${req.file.mimetype}. Only application/pdf files are accepted.`
          });
        }

        // Sanitize filename
        const originalName = req.file.originalname;
        const sanitized = sanitizeFileName(originalName);
        const timestamp = Date.now();
        const storagePath = `test-uploads/${timestamp}-${sanitized}`;

        // Upload to R2 Bucket
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: storagePath,
          Body: req.file.buffer,
          ContentType: 'application/pdf',
        });

        await s3Client.send(command);

        return res.json({
          ok: true,
          storageProvider: "cloudflare-r2",
          storagePath: storagePath,
          fileName: sanitized,
          fileSize: req.file.size,
          contentType: "application/pdf"
        });

      } catch (error) {
        console.error('R2 upload route handled error:', error);
        return res.status(500).json({
          ok: false,
          error: error.message || 'An error occurred during Cloudflare R2 upload'
        });
      }
    });
  } catch (outerError) {
    console.error('R2 test-upload outer sync error:', outerError);
    return res.status(500).json({
      ok: false,
      error: outerError.message || 'Synchronous error during test upload execution'
    });
  }
});

// 3. POST /api/r2/material-upload
router.post('/material-upload', (req, res, next) => {
  console.log('[DEBUG R2-UPLOAD] Hit /api/r2/material-upload endpoint. Content-Type:', req.headers['content-type']);
  
  try {
    uploadInstance(req, res, async (err) => {
      console.log('[DEBUG R2-UPLOAD] Multer callback invoked. errStatus:', err ? err.message : 'none', 'File received:', !!req.file, 'Body fields:', Object.keys(req.body || {}));
      try {
        // Validate env variables first
        validateR2Env();

        // Check multer error (e.g. limit size)
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              ok: false,
              error: 'File too large. Maximum allowed size is 25 MB.'
            });
          }
          return res.status(400).json({
            ok: false,
            error: `Upload parsing failure: ${err.message}`
          });
        }

        // Validate file exists
        if (!req.file) {
          return res.status(400).json({
            ok: false,
            error: 'Missing file. Please upload a file with field name "file" using multipart/form-data.'
          });
        }

        // Validate mimetype is exactly application/pdf
        if (req.file.mimetype !== 'application/pdf') {
          return res.status(400).json({
            ok: false,
            error: `Invalid file type: ${req.file.mimetype}. Only application/pdf files are accepted.`
          });
        }

        // Read metadata from body
        const { department, year, semester, category, title, subject, materialId } = req.body;

        if (!department || !year || !semester || !category || !title) {
          return res.status(400).json({
            ok: false,
            error: 'Missing required metadata. Required fields: department, year, semester, category, title.'
          });
        }

        const cleanSegment = (str) => {
          if (!str) return "General";
          return String(str)
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        };

        const dept = cleanSegment(department);
        const yr = cleanSegment(year);
        const sem = cleanSegment(semester);
        const sub = subject ? cleanSegment(subject) : null;
        const matId = cleanSegment(materialId || `MAT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`);
        const sanitizedName = sanitizeFileName(req.file.originalname);

        let storagePath = "";
        if (sub && sub !== "General" && sub !== "") {
          storagePath = `materials/${dept}/${yr}/${sem}/${sub}/${matId}/${sanitizedName}`;
        } else {
          storagePath = `materials/${dept}/${yr}/${sem}/${matId}/${sanitizedName}`;
        }

        // Upload to R2 Bucket
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: storagePath,
          Body: req.file.buffer,
          ContentType: 'application/pdf',
        });

        await s3Client.send(command);

        return res.json({
          ok: true,
          storageProvider: "cloudflare-r2",
          bucketName: bucketName,
          storagePath: storagePath,
          fileName: sanitizedName,
          fileSize: req.file.size,
          contentType: "application/pdf"
        });

      } catch (error) {
        console.error('R2 material-upload route error:', error);
        return res.status(500).json({
          ok: false,
          error: error.message || 'An error occurred during Cloudflare R2 material upload'
        });
      }
    });
  } catch (outerError) {
    console.error('R2 material-upload outer sync error:', outerError);
    return res.status(500).json({
      ok: false,
      error: outerError.message || 'Synchronous error during material upload execution'
    });
  }
});

// 4. POST /api/r2/signed-url
router.post('/signed-url', async (req, res) => {
  try {
    validateR2Env();

    const { storagePath, action, fileName } = req.body;

    console.log('[DEBUG SIGNED-URL] Request payload verification:', {
      action,
      storagePath,
      fileName,
      bucketName,
      endpointConfigured: !!s3Client
    });

    // Validation
    if (!storagePath || typeof storagePath !== 'string') {
      console.warn('[DEBUG SIGNED-URL] Validation failed: missing or non-string storagePath');
      return res.status(400).json({
        ok: false,
        error: 'storagePath must be a non-empty string'
      });
    }

    if (!action || (action !== 'preview' && action !== 'download')) {
      console.warn('[DEBUG SIGNED-URL] Validation failed: missing or invalid action:', action);
      return res.status(400).json({
        ok: false,
        error: "action is required and must be either 'preview' or 'download'"
      });
    }

    // Path traversal safety checks
    if (storagePath.includes('../') || storagePath.includes('..\\')) {
      console.warn('[DEBUG SIGNED-URL] Security check failed: Path traversal attempt:', storagePath);
      return res.status(400).json({
        ok: false,
        error: 'Unsafe path traversal detected in storagePath'
      });
    }

    // Must start with materials/ or test-uploads/
    if (!storagePath.startsWith('materials/') && !storagePath.startsWith('test-uploads/')) {
      console.warn('[DEBUG SIGNED-URL] Security check failed: Path starts with unauthorized segment:', storagePath);
      return res.status(400).json({
        ok: false,
        error: `Access Denied: Path must begin with 'materials/' or 'test-uploads/'`
      });
    }

    // Prepare GetObject params
    const getParams = {
      Bucket: bucketName,
      Key: storagePath,
    };

    if (action === 'download') {
      const safeFileName = fileName 
        ? String(fileName).replace(/[^a-zA-Z0-9_.-]/g, '_')
        : path.basename(storagePath);
      getParams.ResponseContentDisposition = `attachment; filename="${safeFileName}"`;
    } else {
      getParams.ResponseContentDisposition = 'inline';
      getParams.ResponseContentType = 'application/pdf';
    }

    // Create command
    const command = new GetObjectCommand(getParams);

    // Generate short-lived signed URL
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    console.log('[DEBUG SIGNED-URL] Successfully generated pre-signed URL for:', {
      action,
      storagePath,
      expiresIn: 300
    });

    /* TODO for Phase 10 access hardening:
       - Verify Firebase ID token on backend (req.headers.authorization)
       - Verify student department/year/semester access before signing URL
       - Verify faculty/admin permissions
     */

    return res.json({
      ok: true,
      storageProvider: 'cloudflare-r2',
      signedUrl: signedUrl,
      expiresIn: 300,
      action: action
    });

  } catch (error) {
    console.error('[DEBUG SIGNED-URL] Routing execution failure:', error);
    return res.status(500).json({
      ok: false,
      error: error.message || 'An error occurred during Cloudflare R2 signed URL generation'
    });
  }
});

// 3. POST /api/r2/delete-object
router.post('/delete-object', async (req, res) => {
  try {
    validateR2Env();

    const { storagePath } = req.body;

    console.log('[DEBUG R2-DELETE] Delete request received:', {
      storagePath,
      bucketName,
      endpointConfigured: !!s3Client
    });

    // Validation
    if (!storagePath || typeof storagePath !== 'string') {
      console.warn('[DEBUG R2-DELETE] Validation failed: missing or non-string storagePath');
      return res.status(400).json({
        ok: false,
        message: 'storagePath must be a non-empty string'
      });
    }

    // Path traversal safety checks
    if (storagePath.includes('../') || storagePath.includes('..\\')) {
      console.warn('[DEBUG R2-DELETE] Security check failed: Path traversal attempt:', storagePath);
      return res.status(400).json({
        ok: false,
        message: 'Unsafe path traversal detected in storagePath'
      });
    }

    // Must not start with / or backslash
    if (storagePath.startsWith('/') || storagePath.startsWith('\\')) {
      console.warn('[DEBUG R2-DELETE] Security check failed: Path starts with slash or backslash');
      return res.status(400).json({
        ok: false,
        message: 'Access Denied: Path must not start with a slash'
      });
    }

    // Must start with materials/ or test-uploads/
    if (!storagePath.startsWith('materials/') && !storagePath.startsWith('test-uploads/')) {
      console.warn('[DEBUG R2-DELETE] Security check failed: Path starts with unauthorized segment:', storagePath);
      return res.status(400).json({
        ok: false,
        message: "Access Denied: Path must begin with 'materials/' or 'test-uploads/'"
      });
    }

    // Prepare DeleteObject params
    const deleteParams = {
      Bucket: bucketName,
      Key: storagePath,
    };

    const command = new DeleteObjectCommand(deleteParams);

    // Call S3 SDK delete
    await s3Client.send(command);

    console.log('[DEBUG R2-DELETE] Successfully deleted R2 Object:', {
      storagePath,
      bucketName
    });

    return res.json({
      ok: true,
      storageProvider: 'cloudflare-r2',
      deleted: true,
      storagePath: storagePath,
      message: 'R2 object deleted successfully'
    });

  } catch (error) {
    console.error('[DEBUG R2-DELETE] Routing execution failure:', error);
    return res.status(500).json({
      ok: false,
      message: error.message || 'An error occurred during Cloudflare R2 object deletion'
    });
  }
});

export default router;
