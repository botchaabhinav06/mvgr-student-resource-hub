import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { loadUserProfile } from '../middleware/loadUserProfile.js';
import { aiConfig } from '../ai/aiConfig.js';
import { runGeminiTextPrompt } from '../ai/geminiProvider.js';
import { validateMaterialAccess } from '../ai/materialAccessHelper.js';
import { fetchR2ObjectAsBuffer } from '../ai/r2InternalFetcher.js';
import { extractTextFromPdfBuffer } from '../ai/pdfTextExtractor.js';

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

export default router;
