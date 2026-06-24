/**
 * Heuristic-based Text Quality Analyzer for Extracted PDF Content.
 * Evaluates whether the extracted text is rich enough for reliable downstream AI tasks
 * (such as summarization and important questions generation) or if it's likely a scanned,
 * image-only, or page-marker-only PDF.
 * 
 * @param {string} text - Normalized extracted text.
 * @param {number|null} pageCount - Total page count from PDF metadata.
 * @returns {Object} The quality analysis report.
 */
export function analyzeTextQuality(text, pageCount = null) {
  const normText = (text || '').trim();
  const extractedChars = normText.length;

  if (extractedChars === 0) {
    return {
      qualityStatus: "empty",
      qualityScore: 0,
      meaningfulChars: 0,
      wordCount: 0,
      uniqueWordCount: 0,
      alphanumericRatio: 0,
      averageWordLength: 0,
      repeatedMarkerRatio: 0,
      pageMarkerOnlyDetected: false,
      likelyScannedOrImagePdf: true,
      warnings: ["PDF_TEXT_EMPTY"],
      aiUsable: false
    };
  }

  // Tokenize words
  const words = normText.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Compute Unique Words (length >= 2)
  const uniqueWordsSet = new Set(words.map(w => w.toLowerCase()).filter(w => w.length >= 2));
  const uniqueWordCount = uniqueWordsSet.size;

  // Compute Alphanumeric character count
  const alphanumericCount = (normText.match(/[a-zA-Z0-9]/g) || []).length;
  const alphanumericRatio = extractedChars > 0 ? alphanumericCount / extractedChars : 0;

  // Compute number density (to detect tables or page lists or scanned noise)
  const digitCount = (normText.match(/[0-9]/g) || []).length;
  const digitRatio = extractedChars > 0 ? digitCount / extractedChars : 0;

  // Average word length
  const totalWordChars = words.reduce((acc, w) => acc + w.length, 0);
  const averageWordLength = wordCount > 0 ? totalWordChars / wordCount : 0;

  // Identify common page marker expressions
  // e.g. "Page X of Y", "-- 23 of 45 --", "35 / 40", "Page X"
  const pageMarkerRegex = /(?:page\s*\d+\s*(?:of|off|\/)?\s*\d*)|(?:\b\d+\s+of\s+\d+\b)|(?:--\s*\d+\s*(?:of)?\s*\d*\s*--)/gi;
  const pageMarkerMatches = normText.match(pageMarkerRegex) || [];
  const pageMarkerMatchLen = pageMarkerMatches.reduce((acc, m) => acc + m.length, 0);
  const repeatedMarkerRatio = extractedChars > 0 ? pageMarkerMatchLen / extractedChars : 0;

  // Detect warnings
  const warnings = [];
  let isPoor = false;
  let isWeak = false;

  // Scanned / Image PDF detection heuristics
  let likelyScannedOrImagePdf = false;
  
  if (extractedChars < 200) {
    likelyScannedOrImagePdf = true;
    warnings.push("POSSIBLE_SCANNED_PDF");
  } else if (pageCount && pageCount > 1 && (extractedChars / pageCount) < 150) {
    // Extremely low character-to-page density (less than 150 characters per page average)
    likelyScannedOrImagePdf = true;
    warnings.push("LOW_TEXT_DENSITY");
  }

  // Page marker only detection
  // If a huge portion of the text is just page numbers/markers and there's very little actual prose
  let pageMarkerOnlyDetected = false;
  if (repeatedMarkerRatio > 0.40 && extractedChars < 2000) {
    pageMarkerOnlyDetected = true;
    warnings.push("PAGE_MARKER_ONLY_TEXT");
  }

  // Too few words warning
  if (wordCount < 50) {
    warnings.push("TOO_FEW_WORDS");
  }

  // Low vocabulary size warning (repeated keywords or corrupted encoding)
  const uniqueRatio = wordCount > 0 ? uniqueWordCount / wordCount : 0;
  if (wordCount >= 50 && uniqueRatio < 0.25) {
    warnings.push("LOW_VOCABULARY_DIVERSITY");
  }

  // Poor text layer / encoding problems
  if (wordCount > 0 && averageWordLength > 15) {
    // Words are too long (e.g. spaces are missing, or garbled text like "asdasdasdasdasdasd")
    warnings.push("WEAK_TEXT_LAYER");
  }

  // Compute a Quality Score from 0 to 100
  let score = 100;

  // Deduct based on low char count
  if (extractedChars < 500) {
    score -= 40;
  } else if (extractedChars < 1500) {
    score -= 20;
  }

  // Deduct based on low word count
  if (wordCount < 100) {
    score -= 30;
  } else if (wordCount < 300) {
    score -= 15;
  }

  // Deduct based on page density
  if (pageCount && pageCount > 1) {
    const charsPerPage = extractedChars / pageCount;
    if (charsPerPage < 100) {
      score -= 40;
    } else if (charsPerPage < 300) {
      score -= 20;
    }
  }

  // Deduct based on high noise/page markers
  if (repeatedMarkerRatio > 0.15) {
    score -= Math.min(40, Math.floor(repeatedMarkerRatio * 100));
  }

  // Deduct for too high digit density (probably index or table of contents or numbers only)
  if (digitRatio > 0.45) {
    score -= 20;
    warnings.push("HIGH_NUMERIC_DENSITY");
  }

  // Ensure score stays in [0, 100] bounds
  score = Math.max(0, Math.min(100, score));

  // Determine overall status
  let qualityStatus = "good";
  if (likelyScannedOrImagePdf || pageMarkerOnlyDetected || score < 30) {
    qualityStatus = "poor";
    isPoor = true;
    warnings.push("AI_NOT_RECOMMENDED");
  } else if (score < 65 || warnings.length > 0) {
    qualityStatus = "weak";
    isWeak = true;
  }

  // Check if it is AI usable
  // Good or Weak with minor warnings is usable. Poor is never usable.
  const aiUsable = qualityStatus !== "poor";

  return {
    qualityStatus,
    qualityScore: score,
    meaningfulChars: Math.max(0, extractedChars - pageMarkerMatchLen),
    wordCount,
    uniqueWordCount,
    alphanumericRatio: parseFloat(alphanumericRatio.toFixed(3)),
    averageWordLength: parseFloat(averageWordLength.toFixed(1)),
    repeatedMarkerRatio: parseFloat(repeatedMarkerRatio.toFixed(3)),
    pageMarkerOnlyDetected,
    likelyScannedOrImagePdf,
    warnings,
    aiUsable
  };
}
