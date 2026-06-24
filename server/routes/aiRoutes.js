import express from 'express';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { loadUserProfile } from '../middleware/loadUserProfile.js';
import { aiConfig } from '../ai/aiConfig.js';
import { runGeminiTextPrompt } from '../ai/geminiProvider.js';

const router = express.Router();

// Helper to check if the user is an active administrator
function isAdmin(userProfile) {
  return userProfile && userProfile.role === 'admin' && (userProfile.status === 'active' || !userProfile.status);
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
