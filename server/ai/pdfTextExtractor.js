import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

// PDF Extraction Configuration Limits
const DEFAULT_MAX_CHARS = 20000;

/**
 * Extracts and normalizes text from a binary PDF buffer.
 * Limits returned text size and extracts page metadata securely.
 * 
 * @param {Buffer} buffer - The PDF binary data buffer.
 * @param {Object} options - Custom extraction configurations.
 * @returns {Promise<Object>} The extraction report and limited preview/full text.
 */
export async function extractTextFromPdfBuffer(buffer, options = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid input: Expected a non-empty binary Buffer object.');
  }

  const maxChars = options.maxPdfChars || DEFAULT_MAX_CHARS;

  try {
    // pdf-parse extracts the text and parses basic PDF metadata
    const parsedData = await pdf(buffer);

    const pageCount = parsedData.numpages || null;
    let text = parsedData.text || '';

    // Normalize whitespace (condense multiple sequential spaces/tabs/newlines)
    text = text.replace(/[ \t]+/g, ' ').trim();
    // Keep single or double line breaks for structure, but remove excessive ones
    text = text.replace(/\n{3,}/g, '\n\n');

    const originalCharCount = text.length;
    
    // Check if PDF contains actual text (not purely scanned images)
    const alphanumericMatch = text.match(/[a-zA-Z0-9]/);
    const hasText = !!alphanumericMatch && originalCharCount > 5;

    let truncated = false;
    let extractedText = text;

    if (originalCharCount > maxChars) {
      extractedText = text.substring(0, maxChars);
      truncated = true;
    }

    return {
      ok: true,
      pageCount,
      extractedChars: originalCharCount,
      returnedChars: extractedText.length,
      truncated,
      hasText,
      text: extractedText
    };
  } catch (error) {
    console.error('[PDF Extraction Error] Failed parsing binary buffer safely:', error.message);
    throw new Error(`PDF parsing execution failed: ${error.message}`);
  }
}
