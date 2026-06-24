import { GoogleGenAI } from "@google/genai";
import { aiConfig } from "./aiConfig.js";

let aiInstance = null;

/**
 * Lazy initializer for Google GenAI client
 * Prevents throwing errors on module load if key is missing,
 * and sets the custom User-Agent header for telemetry.
 */
export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

/**
 * Maps raw provider errors into safe categories to ensure no internal info leak.
 */
export function mapErrorToCategory(error) {
  if (!error) return "PROVIDER_REQUEST_FAILED";
  
  const msg = error.message ? String(error.message).toLowerCase() : "";
  const statusVal = error.status ? String(error.status).toUpperCase() : "";
  const codeVal = error.code ? String(error.code) : "";
  const statusCodeVal = error.statusCode ? String(error.statusCode) : "";

  // 1. PROVIDER_HIGH_DEMAND
  if (
    statusVal === "UNAVAILABLE" ||
    codeVal === "503" ||
    statusCodeVal === "503" ||
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("unavailable") ||
    msg.includes("try again later") ||
    msg.includes("service unavailable")
  ) {
    return "PROVIDER_HIGH_DEMAND";
  }

  // 2. PROVIDER_RATE_LIMIT
  if (
    statusVal === "RESOURCE_EXHAUSTED" && msg.includes("rate limit") ||
    codeVal === "429" ||
    statusCodeVal === "429" ||
    msg.includes("429") ||
    msg.includes("rate limit") ||
    msg.includes("too many requests") ||
    msg.includes("resource exhausted")
  ) {
    return "PROVIDER_RATE_LIMIT";
  }

  // 3. PROVIDER_QUOTA_EXCEEDED
  if (
    msg.includes("quota") ||
    msg.includes("exhausted") ||
    msg.includes("limit exceeded") ||
    msg.includes("billing")
  ) {
    return "PROVIDER_QUOTA_EXCEEDED";
  }

  // 4. INVALID_API_KEY_OR_PERMISSION
  if (
    codeVal === "401" || codeVal === "403" ||
    statusCodeVal === "401" || statusCodeVal === "403" ||
    msg.includes("401") || msg.includes("403") ||
    msg.includes("api key") || msg.includes("invalid key") ||
    msg.includes("unauthorized") || msg.includes("permission") || msg.includes("api_key")
  ) {
    return "INVALID_API_KEY_OR_PERMISSION";
  }

  // 5. MISSING_API_KEY
  if (msg.includes("api key") && (msg.includes("missing") || msg.includes("not found"))) {
    return "MISSING_API_KEY";
  }

  // 6. MODEL_NOT_AVAILABLE
  if (
    msg.includes("model") && (
      msg.includes("not found") ||
      msg.includes("not available") ||
      msg.includes("not support") ||
      msg.includes("invalid model") ||
      msg.includes("unsupported") ||
      msg.includes("not enabled")
    )
  ) {
    return "MODEL_NOT_AVAILABLE";
  }

  // 7. PROVIDER_RESPONSE_PARSE_FAILED
  if (msg.includes("parse") || msg.includes("json") || msg.includes("empty text")) {
    return "PROVIDER_RESPONSE_PARSE_FAILED";
  }

  return "PROVIDER_REQUEST_FAILED";
}

/**
 * Returns user-facing safe explanations without revealing raw stacks.
 */
export function getFriendlyErrorMessage(category, rawMessage) {
  switch (category) {
    case "MISSING_API_KEY":
      return "Gemini API key is not configured on the backend. Please declare GEMINI_API_KEY.";
    case "INVALID_API_KEY_OR_PERMISSION":
      return "The backend Gemini API key is invalid, inactive, or lacks the required credentials.";
    case "MODEL_NOT_AVAILABLE":
      return "The requested AI model is temporarily unavailable or unsupported.";
    case "PROVIDER_HIGH_DEMAND":
      return "The AI provider is temporarily busy. Please try again in a few minutes.";
    case "PROVIDER_RATE_LIMIT":
      return "The AI provider is limiting requests right now. Please try again later.";
    case "PROVIDER_QUOTA_EXCEEDED":
      return "The backend AI quota has been reached. Try again later.";
    case "PROVIDER_RESPONSE_PARSE_FAILED":
      return "AI generated a response but the payload structure could not be parsed safely.";
    case "PROVIDER_REQUEST_FAILED":
    default:
      return rawMessage || "Gemini AI provider encountered a runtime error.";
  }
}

/**
 * Discover and list available Gemini models using the configured API key.
 * Only returns safe metadata to prevent exposing secrets.
 */
export async function discoverGeminiModels() {
  const client = getGeminiClient();
  if (!client) {
    return {
      supported: true,
      ok: false,
      message: "Gemini API key is not configured.",
      models: []
    };
  }

  try {
    const pager = await client.models.list();
    const modelsList = [];
    
    // Safely iterate through the pager or list
    if (pager && typeof pager[Symbol.asyncIterator] === "function") {
      for await (const m of pager) {
        modelsList.push(m);
      }
    } else if (pager && Array.isArray(pager.page)) {
      modelsList.push(...pager.page);
    } else if (pager && Array.isArray(pager)) {
      modelsList.push(...pager);
    }

    // Map to safe metadata
    const mapped = modelsList.map(m => {
      // Clean up the name by removing 'models/' prefix if present
      const cleanName = m.name ? m.name.replace(/^models\//, '') : '';
      return {
        name: cleanName,
        fullName: m.name || '',
        displayName: m.displayName || '',
        description: m.description || '',
        supportedActions: m.supportedActions || [],
        inputTokenLimit: m.inputTokenLimit || null,
        outputTokenLimit: m.outputTokenLimit || null
      };
    });

    return {
      supported: true,
      ok: true,
      models: mapped
    };
  } catch (error) {
    console.warn("[Gemini Model Discovery Warn] Failed to list models:", error.message);
    return {
      supported: true,
      ok: false,
      message: error.message || "Failed to retrieve model list from provider.",
      models: []
    };
  }
}

/**
 * Filter discovered models that support text/generateContent.
 */
export function filterTextGenerationModels(models) {
  if (!Array.isArray(models) || models.length === 0) {
    return [];
  }
  
  return models.filter(m => {
    const id = (m.name || "").toLowerCase();
    
    // Skip embedding, aqa, and image-only/deprecated models
    if (
      id.includes("embed") || 
      id.includes("aqa") || 
      id.includes("bidi") || 
      id.includes("imagen")
    ) {
      return false;
    }

    // Check if supportedActions exists and has generateContent
    if (m.supportedActions && m.supportedActions.length > 0) {
      const hasGenerate = m.supportedActions.some(action => 
        action.toLowerCase().includes("generatecontent")
      );
      if (!hasGenerate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Resolves the absolute best Gemini model ID to use dynamically.
 */
export async function selectWorkingGeminiModel({ purpose } = {}) {
  const envModel = process.env.GEMINI_MODEL ? String(process.env.GEMINI_MODEL).trim() : null;
  
  // Run discovery
  const discovery = await discoverGeminiModels();
  
  const fallbackList = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
  ];

  if (!discovery.ok || !discovery.models || discovery.models.length === 0) {
    // Discovery failed or is unavailable - use envModel first if present, otherwise conservative fallback
    if (envModel) {
      return {
        modelId: envModel,
        discoverySupported: discovery.supported,
        discoveryOk: false,
        availableTextModels: [envModel, ...fallbackList],
        source: "env_override_fallback"
      };
    }
    return {
      modelId: "gemini-3.1-flash-lite",
      discoverySupported: discovery.supported,
      discoveryOk: false,
      availableTextModels: fallbackList,
      source: "hardcoded_default"
    };
  }

  // Filter text-generation models
  const textModels = filterTextGenerationModels(discovery.models);
  const textModelIds = textModels.map(m => m.name);

  // If envModel is provided and valid in discovered text models, use it!
  if (envModel && textModelIds.includes(envModel)) {
    return {
      modelId: envModel,
      discoverySupported: true,
      discoveryOk: true,
      availableTextModels: textModelIds,
      source: "env_override_verified"
    };
  }

  // Otherwise, select the best discovered Flash/Flash-Lite or Pro model
  const preferredDiscoveryPatterns = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash"
  ];

  for (const pattern of preferredDiscoveryPatterns) {
    if (textModelIds.includes(pattern)) {
      return {
        modelId: pattern,
        discoverySupported: true,
        discoveryOk: true,
        availableTextModels: textModelIds,
        source: "discovered_preferred"
      };
    }
  }

  // Fallback to any discovered text-capable model containing 'flash' or 'lite'
  const flashModel = textModelIds.find(id => id.includes("flash") || id.includes("lite"));
  if (flashModel) {
    return {
      modelId: flashModel,
      discoverySupported: true,
      discoveryOk: true,
      availableTextModels: textModelIds,
      source: "discovered_any_flash"
    };
  }

  const anyTextModel = textModelIds[0];
  if (anyTextModel) {
    return {
      modelId: anyTextModel,
      discoverySupported: true,
      discoveryOk: true,
      availableTextModels: textModelIds,
      source: "discovered_any_text"
    };
  }

  // Last resort fallback
  return {
    modelId: envModel || "gemini-3.1-flash-lite",
    discoverySupported: true,
    discoveryOk: true,
    availableTextModels: textModelIds,
    source: "last_resort_fallback"
  };
}

/**
 * Runs a protected, size-limited text prompt via the Gemini client with a fallback model try-catch loop.
 * Designed for short interactive inputs, smoke tests, and academic summary/questions generation.
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} [params.purpose]
 * @param {number} [params.maxOutputTokens]
 * @returns {Promise<Object>} Object with ok, text, and modelUsed.
 */
export async function generateGeminiText({ prompt, purpose, maxOutputTokens, maxPromptChars }) {
  if (!prompt || typeof prompt !== 'string') {
    const err = new Error('Invalid prompt input.');
    err.code = "CLIENT_ERROR";
    err.stage = "provider_generation";
    err.retryable = false;
    throw err;
  }

  const trimmedPrompt = prompt.trim();
  
  // Purpose-based prompt limits
  let maxLimit = 12000; // Default
  if (purpose === "model_diagnostic") maxLimit = 200;
  if (purpose === "pdf_summary" || purpose === "important_questions") maxLimit = 30000;
  
  // Allow manual override
  if (typeof maxPromptChars === 'number') maxLimit = maxPromptChars;

  if (trimmedPrompt.length > maxLimit) {
    const errorCode = purpose === "pdf_summary" || purpose === "important_questions" 
      ? "ACADEMIC_PROMPT_TOO_LONG" 
      : "CLIENT_PROMPT_TOO_LONG";
    
    const err = new Error(purpose === "pdf_summary" || purpose === "important_questions"
      ? "This document is too large for one AI generation request. Please use a smaller PDF or split the material."
      : `Prompt length exceeds maximum allowed character count of ${maxLimit}.`);
    
    err.code = errorCode;
    err.stage = "prompt_preparation";
    err.retryable = false;
    throw err;
  }

  const client = getGeminiClient();
  if (!client) {
    const err = new Error("AI is not configured on the backend yet.");
    err.code = "GEMINI_API_KEY_MISSING";
    err.stage = "provider_configuration";
    err.retryable = false;
    throw err;
  }

  // Get selected working model and available candidates
  const selection = await selectWorkingGeminiModel({ purpose });
  const selectedModelId = selection.modelId;
  const availableModels = selection.availableTextModels || [];

  // Compile list of models to try
  const modelsToTry = [];
  
  // 1. GEMINI_MODEL override from environment
  const envModel = process.env.GEMINI_MODEL ? String(process.env.GEMINI_MODEL).trim() : null;
  if (envModel) {
    modelsToTry.push(envModel);
  }

  // 2. Preferred primary: gemini-3.1-flash-lite
  if (!modelsToTry.includes("gemini-3.1-flash-lite")) {
    modelsToTry.push("gemini-3.1-flash-lite");
  }

  // 3. Preferred fallback: gemini-3.5-flash
  if (!modelsToTry.includes("gemini-3.5-flash")) {
    modelsToTry.push("gemini-3.5-flash");
  }

  // 4. Dynamic selected model if not already added
  if (selectedModelId && !modelsToTry.includes(selectedModelId)) {
    modelsToTry.push(selectedModelId);
  }

  // 5. Append other safe text models from discovery (skipping old 2.0/1.5/2.5 defaults)
  for (const m of availableModels) {
    if (m && !modelsToTry.includes(m)) {
      const lower = m.toLowerCase();
      if (!lower.includes("1.5-flash") && !lower.includes("2.0-flash") && !lower.includes("2.5-flash")) {
        modelsToTry.push(m);
      }
    }
  }

  let lastError = null;
  const modelsAttempted = [];

  for (const modelId of modelsToTry) {
    try {
      console.log(`[Gemini Provider Shared] Attempting generation with model: ${modelId} for purpose: ${purpose || 'general'}`);
      modelsAttempted.push(modelId);

      const configObj = {};
      if (maxOutputTokens) configObj.maxOutputTokens = maxOutputTokens;
      configObj.temperature = purpose === "smoke-test" ? 0.2 : 0.3;

      const response = await client.models.generateContent({
        model: modelId,
        contents: trimmedPrompt,
        config: configObj
      });

      if (response && response.text) {
        return {
          ok: true,
          text: response.text,
          modelUsed: modelId,
          modelsAttempted
        };
      }
      throw new Error("Empty text response from Gemini provider.");
    } catch (error) {
      console.warn(`[Gemini Provider Shared Warn] Model ${modelId} failed:`, error.message);
      lastError = error;
      const errorType = mapErrorToCategory(error);

      // Stop immediately for credentials or quota issues
      if (
        errorType === "MISSING_API_KEY" ||
        errorType === "INVALID_API_KEY_OR_PERMISSION" ||
        errorType === "PROVIDER_QUOTA_EXCEEDED"
      ) {
        const friendlyMessage = getFriendlyErrorMessage(errorType, error.message);
        const err = new Error(friendlyMessage);
        err.code = errorType;
        err.stage = "provider_generation";
        err.retryable = false;
        err.modelsAttempted = modelsAttempted;
        throw err;
      }
    }
  }

  // All attempted models failed
  const finalErrorType = "MODEL_NOT_AVAILABLE";
  const err = new Error("AI text generation is temporarily unavailable. Please try again later.");
  err.code = finalErrorType;
  err.stage = "provider_generation";
  err.retryable = true;
  err.modelsAttempted = modelsAttempted;
  throw err;
}

/**
 * Runs a protected, size-limited text prompt via the Gemini client with a fallback model try-catch loop.
 * Sanitizes outputs and safely traps runtime provider exceptions. This serves as a compatibility wrapper.
 */
export async function runGeminiTextPrompt({ prompt }) {
  try {
    const res = await generateGeminiText({ prompt, purpose: "smoke-test" });
    return {
      ok: true,
      text: res.text,
      modelUsed: res.modelUsed
    };
  } catch (err) {
    return {
      ok: false,
      message: err.message,
      errorType: err.code || "PROVIDER_REQUEST_FAILED"
    };
  }
}
