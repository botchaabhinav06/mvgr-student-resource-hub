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
 * Runs a protected, size-limited text prompt via the Gemini client.
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
      message: 'Gemini API key is not configured on the backend.'
    };
  }

  try {
    const response = await client.models.generateContent({
      model: aiConfig.defaultModel,
      contents: trimmedPrompt,
    });

    return {
      ok: true,
      text: response.text,
    };
  } catch (error) {
    console.error('[Gemini Provider Error] Execution failed safely:', error.message);
    return {
      ok: false,
      message: 'AI Provider failed to generate a response.'
    };
  }
}
