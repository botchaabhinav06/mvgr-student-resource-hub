import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");

/**
 * Safely resolves the exact callable function from the imported pdf-parse module.
 * Node ESM and CJS packaging sometimes nest default exports differently.
 */
function resolvePdfParseModule(moduleValue) {
  if (typeof moduleValue === "function") {
    console.log('[PDF Parser Resolution] Strategy resolved: direct function');
    return moduleValue;
  }
  if (moduleValue && typeof moduleValue.default === "function") {
    console.log('[PDF Parser Resolution] Strategy resolved: default property');
    return moduleValue.default;
  }
  if (moduleValue && typeof moduleValue.pdf === "function") {
    console.log('[PDF Parser Resolution] Strategy resolved: pdf property');
    return moduleValue.pdf;
  }
  if (moduleValue && typeof moduleValue.parse === "function") {
    console.log('[PDF Parser Resolution] Strategy resolved: parse property');
    return moduleValue.parse;
  }
  throw new Error("PDF_PARSE_EXPORT_UNSUPPORTED");
}

let pdfParseFn;
try {
  pdfParseFn = resolvePdfParseModule(pdfModule);
} catch (err) {
  console.error('[PDF Parser Resolution] Critical: Failed to resolve pdf-parse module callable function.');
}

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

  if (!pdfParseFn) {
    throw new Error('PDF_PARSE_EXPORT_UNSUPPORTED');
  }

  const maxChars = options.maxPdfChars || DEFAULT_MAX_CHARS;

  try {
    // pdf-parse extracts the text and parses basic PDF metadata
    const parsedData = await pdfParseFn(buffer);

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
