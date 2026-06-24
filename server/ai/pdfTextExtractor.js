import { PDFParse } from 'pdf-parse';
import { createRequire } from "module";
const require = createRequire(import.meta.url);

let pdfModule;
try {
  pdfModule = require("pdf-parse");
} catch (err) {
  console.warn("[PDF Parser] Failed to require pdf-parse via createRequire:", err.message);
}

// Resolved parser metadata
let parserStrategy = null;

function getParserStrategy() {
  if (parserStrategy) return parserStrategy;

  if (typeof PDFParse === 'function') {
    parserStrategy = { type: 'class', target: PDFParse, name: 'PDFParse Class (Native ESM)' };
    return parserStrategy;
  }

  if (pdfModule) {
    if (typeof pdfModule.PDFParse === 'function') {
      parserStrategy = { type: 'class', target: pdfModule.PDFParse, name: 'PDFParse Class (CJS)' };
      return parserStrategy;
    }
    if (pdfModule.default && typeof pdfModule.default.PDFParse === 'function') {
      parserStrategy = { type: 'class', target: pdfModule.default.PDFParse, name: 'PDFParse Class (CJS Default)' };
      return parserStrategy;
    }
    if (typeof pdfModule === 'function') {
      parserStrategy = { type: 'function', target: pdfModule, name: 'pdf-parse direct function' };
      return parserStrategy;
    }
    if (pdfModule.default && typeof pdfModule.default === 'function') {
      parserStrategy = { type: 'function', target: pdfModule.default, name: 'pdf-parse default function' };
      return parserStrategy;
    }
    if (typeof pdfModule.pdf === 'function') {
      parserStrategy = { type: 'function', target: pdfModule.pdf, name: 'pdf-parse.pdf function' };
      return parserStrategy;
    }
    if (typeof pdfModule.parse === 'function') {
      parserStrategy = { type: 'function', target: pdfModule.parse, name: 'pdf-parse.parse function' };
      return parserStrategy;
    }
  }

  throw new Error("PDF_PARSE_EXPORT_UNSUPPORTED");
}

/**
 * Normalizes parsing of the PDF buffer using the resolved strategy.
 */
async function parsePdf(buffer) {
  const strategy = getParserStrategy();
  console.log(`[PDF Extraction] Using strategy: ${strategy.name}`);

  if (strategy.type === 'class') {
    const PDFClass = strategy.target;
    const parser = new PDFClass({ data: buffer });
    try {
      const result = await parser.getText();
      const pageCount = result.pages ? result.pages.length : (result.total || null);
      return {
        text: result.text || '',
        pageCount: pageCount
      };
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy().catch(err => console.warn('[PDF Parser] Failed to destroy parser instance:', err.message));
      }
    }
  } else if (strategy.type === 'function') {
    const parseFn = strategy.target;
    const parsedData = await parseFn(buffer);
    return {
      text: parsedData.text || '',
      pageCount: parsedData.numpages || null
    };
  }

  throw new Error("PDF_PARSE_EXPORT_UNSUPPORTED");
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

  const maxChars = options.maxPdfChars || DEFAULT_MAX_CHARS;

  try {
    const parsedData = await parsePdf(buffer);

    const pageCount = parsedData.pageCount;
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
