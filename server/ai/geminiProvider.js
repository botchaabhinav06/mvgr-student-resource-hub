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
  const msg = error.message ? error.message.toLowerCase() : "";
  
  if (msg.includes("api key") && (msg.includes("missing") || msg.includes("not found"))) {
    return "MISSING_API_KEY";
  }
  if (msg.includes("key") && (msg.includes("invalid") || msg.includes("not valid") || msg.includes("expired") || msg.includes("unauthorized") || msg.includes("permission") || msg.includes("api_key"))) {
    return "INVALID_API_KEY_OR_PERMISSION";
  }
  if (msg.includes("model") && (msg.includes("not found") || msg.includes("not available") || msg.includes("not support") || msg.includes("invalid model") || msg.includes("unsupported"))) {
    return "MODEL_NOT_AVAILABLE";
  }
  if (msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests")) {
    return "PROVIDER_RATE_LIMIT";
  }
  if (msg.includes("quota") || msg.includes("exhausted") || msg.includes("limit exceeded")) {
    return "PROVIDER_QUOTA_EXCEEDED";
  }
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
      return "The selected Gemini model ID is not supported or was not found.";
    case "PROVIDER_RATE_LIMIT":
      return "Gemini API rate limits have been reached. Please throttle requests.";
    case "PROVIDER_QUOTA_EXCEEDED":
      return "Gemini API daily usage quota has been fully exhausted.";
    case "PROVIDER_RESPONSE_PARSE_FAILED":
      return "AI generated a response but the payload structure could not be parsed safely.";
    case "PROVIDER_REQUEST_FAILED":
    default:
      return rawMessage || "Gemini AI provider encountered a runtime error.";
  }
}

/**
 * Runs a protected, size-limited text prompt via the Gemini client with a fallback model try-catch loop.
 * Sanitizes outputs and safely traps runtime provider exceptions.
 */
export async function runGeminiTextPrompt({ prompt }) {
  if (!prompt || typeof prompt !== 'string') {
    return {
      ok: false,
      message: 'Invalid prompt input.'
    };
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length > aiConfig.maxPromptChars) {
    return {
      ok: false,
      message: `Prompt length exceeds maximum allowed character count of ${aiConfig.maxPromptChars}.`
    };
  }

  const client = getGeminiClient();
  if (!client) {
    return {
      ok: false,
      message: 'Gemini API key is not configured on the backend.',
      errorType: 'MISSING_API_KEY'
    };
  }

  // Construct our unique ordered list of models to try (default model, then other fallbacks)
  const modelsToTry = [aiConfig.defaultModel];
  for (const model of aiConfig.fallbackModels) {
    if (!modelsToTry.includes(model)) {
      modelsToTry.push(model);
    }
  }

  let lastError = null;
  let successfulModel = null;

  for (const modelId of modelsToTry) {
    try {
      console.log(`[Gemini Provider] Attempting generation with model: ${modelId}`);
      const response = await client.models.generateContent({
        model: modelId,
        contents: trimmedPrompt,
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
      console.warn(`[Gemini Provider Warn] Model ${modelId} failed:`, error.message);
      lastError = error;
      const errorType = mapErrorToCategory(error);
      // If error indicates key credentials issue, break early instead of spinning fallbacks
      if (errorType === "MISSING_API_KEY" || errorType === "INVALID_API_KEY_OR_PERMISSION") {
        break;
      }
    }
  }

  // If we get here, all model attempts failed
  const errorType = mapErrorToCategory(lastError);
  console.error('[Gemini Provider Error] All attempted models failed. Last error:', lastError?.message);

  return {
    ok: false,
    message: getFriendlyErrorMessage(errorType, lastError?.message),
    errorType
  };
}
