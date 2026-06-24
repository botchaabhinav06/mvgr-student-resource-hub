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
 * Runs a protected, size-limited text prompt via the Gemini client with a fallback model try-catch loop.
 * Designed for short interactive inputs, smoke tests, and academic summary/questions generation.
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} [params.purpose]
 * @param {number} [params.maxOutputTokens]
 * @returns {Promise<Object>} Object with ok, text, and modelUsed.
 */
export async function generateGeminiText({ prompt, purpose, maxOutputTokens }) {
  if (!prompt || typeof prompt !== 'string') {
    const err = new Error('Invalid prompt input.');
    err.code = "CLIENT_ERROR";
    err.stage = "provider_generation";
    err.retryable = false;
    throw err;
  }

  const trimmedPrompt = prompt.trim();
  const maxLimit = aiConfig.maxPromptChars || 25000;
  if (trimmedPrompt.length > maxLimit) {
    const err = new Error(`Prompt length exceeds maximum allowed character count of ${maxLimit}.`);
    err.code = "CLIENT_ERROR";
    err.stage = "provider_generation";
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

  // Construct conservative fallback model list
  const modelsToTry = [];
  if (process.env.GEMINI_MODEL) {
    const envModel = String(process.env.GEMINI_MODEL).trim();
    if (envModel) {
      modelsToTry.push(envModel);
    }
  }
  const standardFallbacks = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];
  for (const m of standardFallbacks) {
    if (m && !modelsToTry.includes(m)) {
      modelsToTry.push(m);
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
          modelUsed: modelId
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

  // All fallback models failed
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
