import { adminDb } from '../firebaseAdmin.js';
import { validateMaterialAccess } from './materialAccessHelper.js';
import { fetchR2ObjectAsBuffer } from './r2InternalFetcher.js';
import { extractTextFromPdfBuffer } from './pdfTextExtractor.js';
import { getGeminiClient, mapErrorToCategory, getFriendlyErrorMessage, generateGeminiText } from './geminiProvider.js';
import { aiConfig } from './aiConfig.js';

/**
 * Returns YYYY-MM-DD in India timezone for quota tracking.
 */
export function getIndiaDateKey() {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' };
  const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA gives YYYY-MM-DD
  return formatter.format(new Date());
}

/**
 * Checks if user has quota remaining.
 */
async function checkQuota(uid, action, role) {
  if (role !== 'student') return { allowed: true };
  
  const dateKey = getIndiaDateKey();
  const docRef = adminDb.collection('aiUsageDaily').doc(`${uid}_${dateKey}`);
  const doc = await docRef.get();
  
  const limit = aiConfig.studentDailyLimits[action] || 10;
  let used = 0;
  
  if (doc.exists) {
    used = doc.data().used[action] || 0;
  }
  
  if (used >= limit) {
    return { 
      allowed: false, 
      quota: { action, limit, used, remaining: 0, dateKey } 
    };
  }
  
  return { 
    allowed: true, 
    quota: { action, limit, used, remaining: limit - used, dateKey } 
  };
}

/**
 * Atomically increments quota.
 */
async function incrementQuota(uid, action) {
  const dateKey = getIndiaDateKey();
  const docRef = adminDb.collection('aiUsageDaily').doc(`${uid}_${dateKey}`);
  
  return await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    let data;
    if (!doc.exists) {
      data = {
        uid,
        role: 'student',
        dateKey,
        timezone: 'Asia/Kolkata',
        limits: { ...aiConfig.studentDailyLimits },
        used: { pdf_summary: 0, important_questions: 0 },
        updatedAt: new Date()
      };
    } else {
      data = doc.data();
    }
    
    data.used[action] = (data.used[action] || 0) + 1;
    data.updatedAt = new Date();
    transaction.set(docRef, data, { merge: true });
    
    return { 
      action,
      limit: aiConfig.studentDailyLimits[action],
      used: data.used[action],
      remaining: aiConfig.studentDailyLimits[action] - data.used[action],
      dateKey 
    };
  });
}

/**
 * Executes a Gemini model query with custom fallback logic for academic generations.
 * Proxies to the shared generateGeminiText function to guarantee model alignment and fallback resilience.
 * 
 * @param {string} promptText - Bounded prompt text.
 * @param {string} purpose - Purpose of generation.
 * @returns {Promise<Object>} Object with response text and model used.
 */
async function runAcademicGeminiCall(promptText, purpose) {
  const result = await generateGeminiText({
    prompt: promptText,
    purpose: purpose,
    maxOutputTokens: 3000,
    maxPromptChars: 30000
  });
  return {
    text: result.text,
    modelUsed: result.modelUsed
  };
}

/**
 * Prepares extracted text for prompt with safety truncation based on action purpose.
 * 
 * @param {string} extractedText - Raw extracted text.
 * @param {string} action - 'pdf_summary' | 'important_questions'
 * @returns {Object} Preparation metadata and text.
 */
export function prepareAcademicTextForPrompt(extractedText, action) {
  const charLimits = {
    pdf_summary: 22000,
    important_questions: 24000,
  };
  
  const limit = charLimits[action] || 12000;
  
  if (extractedText.length <= limit) {
    return {
      textForPrompt: extractedText,
      wasTruncated: false,
      originalCharCount: extractedText.length,
      usedCharCount: extractedText.length
    };
  }
  
  return {
    textForPrompt: extractedText.substring(0, limit),
    wasTruncated: true,
    originalCharCount: extractedText.length,
    usedCharCount: limit
  };
}

/**
 * Logs usage of the AI assistant to the firestore collection `aiUsage`.
 */
async function logAiUsage({ uid, role, action, materialId, cached, model, qualityStatus, errorCode, status }) {
  if (!adminDb) return;
  try {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];

    await adminDb.collection('aiUsage').add({
      uid: uid || 'anonymous',
      role: role || 'unknown',
      action,
      materialId: materialId || null,
      dateKey,
      createdAt: now,
      status: status || 'success',
      cached: !!cached,
      model: model || null,
      qualityStatus: qualityStatus || null,
      errorCode: errorCode || null
    });
  } catch (err) {
    console.error('[AI Usage Log Failure] Could not write usage metrics:', err.message);
  }
}

/**
 * Core business logic for processing academic AI generation.
 * Handles access validation, PDF fetch, text extraction, quality guard,
 * caching (aiOutputs), and usage logging (aiUsage).
 * 
 * @param {Object} userProfile - The user's active database profile.
 * @param {string} materialId - The material document ID.
 * @param {string} action - 'pdf_summary' | 'important_questions'
 * @returns {Promise<Object>} Output response containing result metadata and textual body.
 */
export async function generateAcademicAiOutput(userProfile, materialId, action) {
  if (action !== 'pdf_summary' && action !== 'important_questions') {
    throw { status: 400, code: "INVALID_ACTION", message: "Unsupported AI action type requested." };
  }

  // 1. Validate Material Access
  const accessResult = await validateMaterialAccess(userProfile, materialId);
  if (!accessResult.authorized) {
    console.warn(`[Academic AI Service Access Denied] User: ${userProfile?.uid}, Material: ${materialId}, Code: ${accessResult.code}`);
    throw {
      status: 403,
      code: accessResult.code || "ACCESS_DENIED",
      message: accessResult.message || "You do not have permission to use AI on this material.",
      retryable: false,
      stage: "access_validation"
    };
  }

  const { material, storagePath } = accessResult;

  // Resolve material update timestamp as a stable string for cache comparison
  const materialUpdatedAtStr = material.updatedAt && typeof material.updatedAt.toDate === 'function'
    ? material.updatedAt.toDate().toISOString()
    : (material.updatedAt || '');

  // 2. Check Firestore Cache (Fresh cache checking)
  const cacheKey = `${materialId}_${action}`;
  if (adminDb) {
    try {
      const cacheRef = adminDb.collection('aiOutputs').doc(cacheKey);
      const cacheSnap = await cacheRef.get();
      if (cacheSnap.exists) {
        const cacheData = cacheSnap.data();
        
        // Cache Invalidation Check: compare storagePath and updatedAt
        const matchesStorage = cacheData.storagePath === storagePath;
        const matchesUpdate = cacheData.updatedAt === materialUpdatedAtStr;
        const isActive = cacheData.status === 'active';

        if (matchesStorage && matchesUpdate && isActive) {
          console.log(`[Academic AI Cache Hit] Found active cached ${action} for material ${materialId}`);
          
          // Log cached usage
          await logAiUsage({
            uid: userProfile.uid,
            role: userProfile.role,
            action,
            materialId,
            cached: true,
            model: cacheData.model,
            qualityStatus: cacheData.qualityStatus,
            status: 'success'
          });

          return {
            ok: true,
            action,
            materialId,
            title: material.title,
            output: cacheData.output,
            cached: true,
            cacheSource: "fresh-cache",
            modelUsed: cacheData.model || null,
            quality: cacheData.quality || { qualityStatus: cacheData.qualityStatus || "good", aiUsable: true },
            warnings: [],
            message: "AI output generated successfully."
          };
        }
      }
    } catch (cacheErr) {
      console.warn('[Academic AI Cache Read Fail] Bypassing cache checks:', cacheErr.message);
    }
  }

  // 3. Fetch PDF from Private Cloudflare R2
  let pdfBuffer;
  try {
    pdfBuffer = await fetchR2ObjectAsBuffer(storagePath);
  } catch (fetchErr) {
    console.error(`[Academic AI Service Fetch Fail] Material: ${materialId}`, fetchErr.message);
    const errPayload = {
      status: 502,
      code: "R2_OBJECT_NOT_FOUND",
      message: `Failed to fetch PDF resource from Cloudflare R2: ${fetchErr.message}`,
      retryable: false,
      stage: "access_validation"
    };
    
    await logAiUsage({
      uid: userProfile.uid,
      role: userProfile.role,
      action,
      materialId,
      cached: false,
      errorCode: "R2_OBJECT_NOT_FOUND",
      status: 'failed'
    });

    throw errPayload;
  }

  // 4. Extract Text and Quality Analyze
  let extraction;
  try {
    extraction = await extractTextFromPdfBuffer(pdfBuffer, {
      maxPdfChars: 25000 // Limit text layer sent to model
    });
  } catch (parseErr) {
    console.error(`[Academic AI Service Parser Fail] Material: ${materialId}`, parseErr.message);
    const errPayload = {
      status: 502,
      code: "PDF_PARSE_FAILED",
      message: `Failed to parse PDF binary content: ${parseErr.message}`,
      retryable: false,
      stage: "quality_guard"
    };
    
    await logAiUsage({
      uid: userProfile.uid,
      role: userProfile.role,
      action,
      materialId,
      cached: false,
      errorCode: "PDF_PARSE_FAILED",
      status: 'failed'
    });

    throw errPayload;
  }

  if (!extraction.hasText) {
    const errPayload = {
      status: 422,
      code: "PDF_TEXT_EMPTY",
      message: "The PDF contains no indexable text layer. It might be an un-scanned image.",
      retryable: false,
      stage: "quality_guard"
    };
    
    await logAiUsage({
      uid: userProfile.uid,
      role: userProfile.role,
      action,
      materialId,
      cached: false,
      errorCode: "PDF_TEXT_EMPTY",
      status: 'failed'
    });

    throw errPayload;
  }

  // 5. Strict Quality Guard check
  const quality = extraction.quality;
  if (quality && !quality.aiUsable) {
    const errPayload = {
      status: 422,
      code: "PDF_TEXT_NOT_AI_USABLE",
      message: "This PDF was decoded, but its extracted text quality is too low for reliable AI generation.",
      retryable: false,
      stage: "quality_guard",
      quality: {
        qualityStatus: quality.qualityStatus || "poor",
        aiUsable: false,
        score: quality.score || 0,
        unusableReason: quality.unusableReason || "Low structure"
      }
    };

    await logAiUsage({
      uid: userProfile.uid,
      role: userProfile.role,
      action,
      materialId,
      cached: false,
      qualityStatus: quality.qualityStatus,
      errorCode: "PDF_TEXT_NOT_AI_USABLE",
      status: 'failed'
    });

    throw errPayload;
  }

  // 6. Build Prompt & Call Gemini
  const prepared = prepareAcademicTextForPrompt(extraction.text, action);
  const textForPrompt = prepared.textForPrompt;
  
  // Check quota
  const quotaCheck = await checkQuota(userProfile.uid, action, userProfile.role);
  if (!quotaCheck.allowed) {
    throw {
      status: 429,
      code: "DAILY_AI_LIMIT_REACHED",
      message: "You have reached your daily AI generation limit for this feature. Please try again tomorrow.",
      retryable: false,
      stage: "quota_guard",
      quota: quotaCheck.quota
    };
  }

  let promptText = "";
  if (action === 'pdf_summary') {
    promptText = `
You are an expert academic tutor and summary generator. 
Construct a structured, professional, and concise academic summary of the study material provided below.

Strict Constraints:
1. Use ONLY the facts directly mentioned in the provided text. Do not invent details, syllabus topics, or outside content.
2. If the text does not contain enough information or is insufficient to summarize, state clearly that information is not available in the material.
3. Keep the language academic, highly objective, clear, and readable.

Format your output into the following clear Markdown sections:
### 1. Overview
Provide a concise 2-3 sentence overview/introduction of what this material covers.

### 2. Key Takeaways & Core Points
List the primary key takeaways or main points as neat bullet points.

### 3. Critical Concepts & Definitions
Identify and define the most important concepts, terms, or processes described in the text.

### 4. Student Revision Notes
Provide highly structured, practical study/revision bullets for exam preparation.

---
Source PDF Extracted Text:
${textForPrompt}
---
`;
  } else if (action === 'important_questions') {
    promptText = `
You are an elite academic examiner. 
Generate exam-focused revision and practice questions strictly from the study material provided below.

Strict Constraints:
1. Generate questions ONLY from the facts and topics explicitly covered in the provided source text. Do not create questions about external syllabus topics.
2. Do not guarantee that these exact questions will appear on the exam, but frame them as practical revision practice.
3. For every question, make sure it can be answered using ONLY the provided text. If the answer is not supported by the text, do not generate the question.

Format your output into the following clear Markdown sections:
### 1. Short Answer Questions (2 Marks)
Generate 5 exam-oriented short questions focusing on primary definitions, terms, or quick recalls.

### 2. Medium Answer Questions (5 Marks)
Generate 3 medium-length questions focused on explanations, comparisons, or core features.

### 3. Essay/Long Answer Questions (10 Marks)
Generate 2 detailed essay-type questions focused on extensive processes, architectures, or elaborate concepts.

### 4. Syllabus Topics Coverage Note
Add a brief list of which topics from the PDF were successfully covered by these questions.

---
Source PDF Extracted Text:
${textForPrompt}
---
`;
  }

  let aiResult;
  try {
    aiResult = await runAcademicGeminiCall(promptText, action);
  } catch (geminiErr) {
    console.error(`[Academic AI Service Gemini Call Fail] Material: ${materialId}`, geminiErr.message);
    const code = geminiErr.code || "PROVIDER_REQUEST_FAILED";

    // Stale Fallback Check for high demand or rate limit errors
    if (code === "PROVIDER_HIGH_DEMAND" || code === "PROVIDER_RATE_LIMIT") {
      if (adminDb) {
        try {
          console.log(`[Academic AI Service Stale Fallback Check] Checking stale cache for ${cacheKey}`);
          const cacheRef = adminDb.collection('aiOutputs').doc(cacheKey);
          const cacheSnap = await cacheRef.get();
          if (cacheSnap.exists) {
            const cacheData = cacheSnap.data();
            if (cacheData.status === 'active' && cacheData.output) {
              console.log(`[Academic AI Service Stale Cache Fallback Hit] Serving stale cache for ${materialId}`);
              
              await logAiUsage({
                uid: userProfile.uid,
                role: userProfile.role,
                action,
                materialId,
                cached: true,
                model: cacheData.model,
                qualityStatus: cacheData.qualityStatus,
                status: 'success'
              });

              return {
                ok: true,
                action,
                materialId,
                title: material.title,
                output: cacheData.output,
                cached: true,
                cacheSource: "stale-cache",
                modelUsed: null,
                quality: cacheData.quality || { qualityStatus: cacheData.qualityStatus || "good", aiUsable: true },
                warnings: ["PROVIDER_BUSY_USED_CACHED_OUTPUT"],
                message: "Showing a previously generated result because the AI provider is temporarily busy."
              };
            }
          }
        } catch (staleErr) {
          console.warn('[Academic AI Service Stale Fallback Error] Failed to fetch stale fallback:', staleErr.message);
        }
      }
    }

    const status = (code === "PROVIDER_RATE_LIMIT" || code === "PROVIDER_QUOTA_EXCEEDED") ? 429 
                 : (code === "PROVIDER_HIGH_DEMAND" || code === "GEMINI_API_KEY_MISSING") ? 503 
                 : 502;
    
    await logAiUsage({
      uid: userProfile.uid,
      role: userProfile.role,
      action,
      materialId,
      cached: false,
      qualityStatus: quality?.qualityStatus || null,
      errorCode: code,
      status: 'failed'
    });

    throw {
      status,
      code,
      message: getFriendlyErrorMessage(code, geminiErr.message),
      retryable: (code === "PROVIDER_HIGH_DEMAND" || code === "PROVIDER_RATE_LIMIT"),
      stage: "provider_generation"
    };
  }

  // 7. Write to Firestore Cache (aiOutputs)
  if (adminDb) {
    try {
      await adminDb.collection('aiOutputs').doc(cacheKey).set({
        materialId,
        materialTitle: material.title || "Untitled",
        materialDepartment: material.department || null,
        action,
        output: aiResult.text,
        model: aiResult.modelUsed,
        qualityStatus: quality?.qualityStatus || 'good',
        quality: quality || null,
        pageCount: extraction.pageCount || null,
        extractedChars: extraction.extractedChars || 0,
        truncated: extraction.truncated || false,
        storagePath,
        updatedAt: materialUpdatedAtStr,
        generatedBy: userProfile.uid,
        generatedRole: userProfile.role,
        generatedAt: new Date(),
        status: 'active'
      });
      console.log(`[Academic AI Service Cache Saved] Saved cached output for ${cacheKey}`);
    } catch (saveErr) {
      console.warn('[Academic AI Service Cache Save Fail] Failed to persist output to cache:', saveErr.message);
    }
  }

  // 8. Log successful usage
  await logAiUsage({
    uid: userProfile.uid,
    role: userProfile.role,
    action,
    materialId,
    cached: false,
    model: aiResult.modelUsed,
    qualityStatus: quality?.qualityStatus || 'good',
    status: 'success'
  });

  // Increment quota
  const quotaResult = await incrementQuota(userProfile.uid, action);

  return {
    ok: true,
    action,
    materialId,
    title: material.title,
    output: aiResult.text,
    cached: false,
    cacheSource: "live",
    modelUsed: aiResult.modelUsed || null,
    quality: quality || { qualityStatus: "good", aiUsable: true },
    warnings: [],
    message: "AI output generated successfully.",
    quota: quotaResult
  };
}
