import express from 'express';
import { adminDb } from '../firebaseAdmin.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { loadUserProfile } from '../middleware/loadUserProfile.js';
import { aiConfig } from '../ai/aiConfig.js';
import { runGeminiTextPrompt, generateGeminiText } from '../ai/geminiProvider.js';
import { validateMaterialAccess } from '../ai/materialAccessHelper.js';
import { fetchR2ObjectAsBuffer } from '../ai/r2InternalFetcher.js';
import { extractTextFromPdfBuffer } from '../ai/pdfTextExtractor.js';
import { generateAcademicAiOutput } from '../ai/academicAiService.js';

const router = express.Router();

// Helper to check if the user is an active administrator
function isAdmin(userProfile) {
  return userProfile && userProfile.role === 'admin' && (userProfile.status === 'active' || !userProfile.status);
}

// Helper to check if the user is an active faculty or admin
function isFacultyOrAdmin(userProfile) {
  const role = userProfile && userProfile.role;
  const status = userProfile && (userProfile.status || userProfile.accountStatus || 'active');
  return (role === 'admin' || role === 'faculty') && status === 'active';
}

/**
 * GET /api/ai/health
 * Checks that the backend AI foundation is registered and active.
 * Auth-protected for higher security control.
 */
router.get('/health', verifyFirebaseToken, loadUserProfile, (req, res) => {
  res.json({
    ok: true,
    aiModule: "enabled",
    provider: aiConfig.provider,
    hasProviderKey: aiConfig.hasGeminiKey,
    features: aiConfig.plannedFeatures,
    message: "AI backend foundation is ready. Academic AI features are planned."
  });
});

/**
 * POST /api/ai/extract-pdf-text-test
 * Secure, internal backend-only PDF text extraction test.
 * Restricted to active administrators and faculty members only.
 */
router.post('/extract-pdf-text-test', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    if (!isFacultyOrAdmin(req.userProfile)) {
      return res.status(403).json({
        ok: false,
        message: "Only active faculty members and administrators can execute the PDF text extraction test."
      });
    }

    const { materialId } = req.body || {};
    if (!materialId) {
      return res.status(400).json({
        ok: false,
        message: "Missing required parameter 'materialId' in request body."
      });
    }

    // Step 1: Validate material access permissions
    const accessResult = await validateMaterialAccess(req.userProfile, materialId);
    if (!accessResult.authorized) {
      console.warn(`[AI Extraction Access Denied] User: ${req.user.uid}, Material: ${materialId}, Code: ${accessResult.code}`);
      return res.status(403).json({
        ok: false,
        code: accessResult.code,
        message: accessResult.message || "Access denied."
      });
    }

    const { material, storagePath } = accessResult;

    // Step 2: Retrieve binary from private Cloudflare R2
    let pdfBuffer;
    try {
      pdfBuffer = await fetchR2ObjectAsBuffer(storagePath);
    } catch (fetchErr) {
      console.error(`[AI Extraction Fetch Fail] Material: ${materialId}`, fetchErr.message);
      return res.status(502).json({
        ok: false,
        code: "R2_OBJECT_NOT_FOUND",
        message: `Failed to retrieve PDF from private R2 storage. Ensure storagePath is valid: ${fetchErr.message}`
      });
    }

    // Step 3: Perform PDF text extraction
    try {
      const extraction = await extractTextFromPdfBuffer(pdfBuffer, {
        maxPdfChars: 20000 // Limit extraction buffer size for testing
      });

      if (!extraction.hasText) {
        return res.status(422).json({
          ok: false,
          code: "PDF_TEXT_EMPTY",
          message: "No indexable/parsable text was found inside this PDF. It may be scanned or image-only."
        });
      }

      // Generate a limited preview of the extracted text (max 1000 characters)
      const previewText = extraction.text.substring(0, 1000);

      console.log(`[AI Extraction Success] Material: ${materialId}, Chars Extracted: ${extraction.extractedChars}, Pages: ${extraction.pageCount}`);

      let message = "PDF text extraction successful.";
      if (extraction.quality && !extraction.quality.aiUsable) {
        message = "PDF decoded, but extracted text quality is too low for reliable AI use.";
      }

      return res.json({
        ok: true,
        materialId,
        title: material.title || "Untitled Study Material",
        pageCount: extraction.pageCount,
        extractedChars: extraction.extractedChars,
        truncated: extraction.truncated,
        previewText,
        quality: extraction.quality,
        message
      });
    } catch (parseErr) {
      console.error(`[AI Extraction Parse Fail] Material: ${materialId}`, parseErr.message);
      return res.status(502).json({
        ok: false,
        code: "PDF_PARSE_FAILED",
        message: `PDF text parser failed to compile or decode binary pages: ${parseErr.message}`
      });
    }

  } catch (error) {
    console.error('[AI Extraction Route Error]:', error);
    return res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred during PDF text extraction."
    });
  }
});

/**
 * POST /api/ai/material-quality
 * Retrieves text extraction quality metrics for the requested material.
 * Accessible to any authenticated student, faculty, or admin who has access to the material.
 */
router.post('/material-quality', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    const { materialId } = req.body || {};
    if (!materialId) {
      return res.status(400).json({
        ok: false,
        code: "MISSING_MATERIAL_ID",
        message: "Missing required parameter 'materialId' in request body.",
        stage: "material_lookup"
      });
    }

    // Step 1: Validate material access permissions
    const accessResult = await validateMaterialAccess(req.userProfile, materialId);
    if (!accessResult.authorized) {
      let status = 403;
      if (accessResult.code === 'MATERIAL_NOT_FOUND') {
        status = 404;
      } else if (accessResult.code === 'MATERIAL_NOT_ACTIVE') {
        status = 400; // or 409
      } else if (accessResult.code === 'STORAGE_PROVIDER_UNSUPPORTED') {
        status = 400;
      }
      return res.status(status).json({
        ok: false,
        code: accessResult.code,
        message: accessResult.message || "Access denied.",
        stage: "access_validation"
      });
    }

    const { material, storagePath } = accessResult;

    // Step 2: Check database caches first
    if (adminDb) {
      try {
        const summaryCache = await adminDb.collection('aiOutputs').doc(`${materialId}_pdf_summary`).get();
        if (summaryCache.exists) {
          const cacheData = summaryCache.data();
          if (cacheData && cacheData.quality) {
            const isPoorQuality = cacheData.quality && !cacheData.quality.aiUsable;
            return res.json({
              ok: true,
              materialId,
              title: material.title || cacheData.materialTitle || "Untitled",
              pageCount: cacheData.pageCount || null,
              extractedChars: cacheData.extractedChars || 0,
              truncated: !!cacheData.truncated,
              quality: cacheData.quality,
              message: isPoorQuality 
                ? "PDF decoded, but extracted text quality is too low for reliable AI use."
                : "PDF quality check completed."
            });
          }
        }

        const questionsCache = await adminDb.collection('aiOutputs').doc(`${materialId}_important_questions`).get();
        if (questionsCache.exists) {
          const cacheData = questionsCache.data();
          if (cacheData && cacheData.quality) {
            const isPoorQuality = cacheData.quality && !cacheData.quality.aiUsable;
            return res.json({
              ok: true,
              materialId,
              title: material.title || cacheData.materialTitle || "Untitled",
              pageCount: cacheData.pageCount || null,
              extractedChars: cacheData.extractedChars || 0,
              truncated: !!cacheData.truncated,
              quality: cacheData.quality,
              message: isPoorQuality 
                ? "PDF decoded, but extracted text quality is too low for reliable AI use."
                : "PDF quality check completed."
            });
          }
        }
      } catch (cacheErr) {
        console.warn('[AI Quality Route Cache Read Fail] Bypassing cache checks:', cacheErr.message);
      }
    }

    // Step 3: Fetch R2 PDF & run text quality checks
    let pdfBuffer;
    try {
      pdfBuffer = await fetchR2ObjectAsBuffer(storagePath);
    } catch (fetchErr) {
      console.error(`[AI Quality Route Fetch Fail] Material: ${materialId}`, fetchErr);
      return res.status(404).json({
        ok: false,
        code: "R2_OBJECT_NOT_FOUND",
        message: `Failed to fetch PDF resource from Cloudflare R2: ${fetchErr.message}`,
        stage: "r2_fetch"
      });
    }

    let extraction;
    try {
      extraction = await extractTextFromPdfBuffer(pdfBuffer, {
        maxPdfChars: 20000
      });
    } catch (parseErr) {
      console.error(`[AI Quality Route Parser Fail] Material: ${materialId}`, parseErr);
      return res.status(422).json({
        ok: false,
        code: "PDF_PARSE_FAILED",
        message: `Failed to parse PDF binary content: ${parseErr.message}`,
        stage: "pdf_extract"
      });
    }

    if (!extraction.hasText) {
      return res.status(422).json({
        ok: false,
        code: "PDF_TEXT_EMPTY",
        message: "The PDF contains no indexable text layer. It might be an un-scanned image.",
        stage: "pdf_extract"
      });
    }

    const isPoorQuality = extraction.quality && !extraction.quality.aiUsable;
    const msg = isPoorQuality 
      ? "PDF decoded, but extracted text quality is too low for reliable AI use."
      : "PDF quality check completed.";

    return res.json({
      ok: true,
      materialId,
      title: material.title || "Untitled",
      pageCount: extraction.pageCount || null,
      extractedChars: extraction.extractedChars || 0,
      truncated: !!extraction.truncated,
      quality: extraction.quality,
      message: msg
    });

  } catch (error) {
    console.error('[AI Quality Route Error]:', error);
    return res.status(500).json({
      ok: false,
      code: "INTERNAL_ERROR",
      message: "An internal server error occurred while retrieving PDF quality statistics.",
      stage: "quality_analysis"
    });
  }
});

/**
 * POST /api/ai/material-summary
 * Generates an academic summary for the requested material.
 * Accessible to any authenticated student, faculty, or admin who has access to the material.
 */
router.post('/material-summary', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    const { materialId } = req.body || {};
    if (!materialId) {
      return res.status(400).json({
        ok: false,
        code: "MISSING_MATERIAL_ID",
        message: "Missing required parameter 'materialId' in request body."
      });
    }

    const result = await generateAcademicAiOutput(req.userProfile, materialId, 'pdf_summary');
    return res.json(result);
  } catch (err) {
    console.error(`[AI Summary Route Error] Material ${req.body?.materialId}:`, err);
    
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An internal error occurred during summary generation.",
      retryable: err.retryable !== undefined ? err.retryable : false,
      stage: err.stage || "provider_generation",
      quality: err.quality || null,
      modelsAttempted: err.modelsAttempted || null
    });
  }
});

/**
 * POST /api/ai/important-questions
 * Generates academic study questions for the requested material.
 * Accessible to any authenticated student, faculty, or admin who has access to the material.
 */
router.post('/important-questions', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    const { materialId } = req.body || {};
    if (!materialId) {
      return res.status(400).json({
        ok: false,
        code: "MISSING_MATERIAL_ID",
        message: "Missing required parameter 'materialId' in request body."
      });
    }

    const result = await generateAcademicAiOutput(req.userProfile, materialId, 'important_questions');
    return res.json(result);
  } catch (err) {
    console.error(`[AI Important Questions Route Error] Material ${req.body?.materialId}:`, err);
    
    const status = err.status || 500;
    return res.status(status).json({
      ok: false,
      code: err.code || "INTERNAL_ERROR",
      message: err.message || "An internal error occurred during questions generation.",
      retryable: err.retryable !== undefined ? err.retryable : false,
      stage: err.stage || "provider_generation",
      quality: err.quality || null,
      modelsAttempted: err.modelsAttempted || null
    });
  }
});

/**
 * POST /api/ai/smoke-test
 * Performs a highly restricted connectivity check against Google Gemini.
 * Strictly restricted to active Administrators only.
 */
router.post('/smoke-test', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    if (!isAdmin(req.userProfile)) {
      return res.status(403).json({
        ok: false,
        message: "Only active administrators can execute the backend AI connectivity smoke test."
      });
    }

    if (!aiConfig.hasGeminiKey) {
      return res.status(200).json({
        ok: false,
        message: "Gemini API key is not configured on the backend."
      });
    }

    // Explicitly enforce static non-sensitive test prompt.
    // Disallow arbitrary, client-controlled payloads.
    const smokeTestPrompt = "Reply with exactly: AI backend configured.";

    const result = await runGeminiTextPrompt({ prompt: smokeTestPrompt });

    if (result.ok) {
      return res.json({
        ok: true,
        message: "AI smoke connectivity test successful.",
        response: result.text ? result.text.trim() : null,
        modelUsed: result.modelUsed
      });
    } else {
      return res.status(502).json({
        ok: false,
        message: result.message || "Failed to communicate with Gemini AI.",
        errorType: result.errorType
      });
    }
  } catch (error) {
    console.error('[AI Smoke Test Error]:', error);
    return res.status(500).json({
      ok: false,
      message: "An internal server error occurred during the AI smoke test."
    });
  }
});

/**
 * GET /api/ai/models-diagnostic
 * Returns configurations of default and fallback models.
 * Strictly restricted to active Administrators only.
 */
router.get('/models-diagnostic', verifyFirebaseToken, loadUserProfile, (req, res) => {
  try {
    if (!isAdmin(req.userProfile)) {
      return res.status(403).json({
        ok: false,
        message: "Only active administrators can access the AI models diagnostic information."
      });
    }

    res.json({
      ok: true,
      configuredModel: aiConfig.defaultModel,
      fallbackModels: aiConfig.fallbackModels,
      hasProviderKey: aiConfig.hasGeminiKey,
      smokeTestReady: aiConfig.hasGeminiKey
    });
  } catch (error) {
    console.error('[AI Diagnostic Route Error]:', error);
    res.status(500).json({
      ok: false,
      message: "An error occurred retrieving AI diagnostics info."
    });
  }
});

/**
 * POST /api/ai/model-generate-diagnostic
 * Runs the shared generateGeminiText function with a static prompt to verify models.
 * Strictly restricted to active Administrators only.
 */
router.post('/model-generate-diagnostic', verifyFirebaseToken, loadUserProfile, async (req, res) => {
  try {
    if (!isAdmin(req.userProfile)) {
      return res.status(403).json({
        ok: false,
        message: "Only active administrators can execute the model generate diagnostic."
      });
    }

    if (!aiConfig.hasGeminiKey) {
      return res.status(200).json({
        ok: false,
        message: "Gemini API key is not configured on the backend."
      });
    }

    const testPrompt = "Reply with exactly: model diagnostic ok.";

    const result = await generateGeminiText({
      prompt: testPrompt,
      purpose: "smoke-test",
      maxOutputTokens: 50
    });

    if (result.ok) {
      return res.json({
        ok: true,
        message: "AI model generate diagnostic successful.",
        response: result.text ? result.text.trim() : null,
        modelUsed: result.modelUsed
      });
    } else {
      return res.status(502).json({
        ok: false,
        message: "Failed to communicate with Gemini AI."
      });
    }
  } catch (error) {
    console.error('[AI Model Diagnostic Error]:', error);
    const code = error.code || "INTERNAL_ERROR";
    const status = (code === "PROVIDER_RATE_LIMIT" || code === "PROVIDER_QUOTA_EXCEEDED") ? 429 
                 : (code === "PROVIDER_HIGH_DEMAND" || code === "GEMINI_API_KEY_MISSING") ? 503 
                 : 502;
    return res.status(status).json({
      ok: false,
      code,
      message: error.message || "An internal server error occurred during the model generate diagnostic.",
      retryable: error.retryable !== undefined ? error.retryable : false,
      stage: error.stage || "provider_generation",
      modelsAttempted: error.modelsAttempted || []
    });
  }
});

export default router;
