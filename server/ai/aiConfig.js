// AI Configuration Module
// Safeguards model name selection, daily roles quotas, and smoke test input limits.

const hasGeminiKey = !!process.env.GEMINI_API_KEY;

export const aiConfig = {
  hasGeminiKey,
  provider: "gemini",
  // Allow GEMINI_MODEL override, default to gemini-3.1-flash-lite as the modern recommended standard
  defaultModel: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
  fallbackModels: ["gemini-3.5-flash"],
  
  // Specific student daily limits for academic AI actions
  studentDailyLimits: {
    pdf_summary: 10,
    important_questions: 10
  },
  
  facultyDailyLimit: 10,
  adminDailyLimit: 20,
  adminDiagnosticsLimit: null, // unlimited
  
  // Safety crop limits for smoke-test input size to prevent denial of service or abuse.
  maxPromptChars: 200,

  // Feature roadmap configuration tracking
  plannedFeatures: [
    { id: "summary", name: "PDF Summary", phase: "Phase 13.2" },
    { id: "questions", name: "Important Questions Generator", phase: "Phase 13.2" },
    { id: "notes", name: "Short Notes Generator", phase: "Phase 13.4" },
    { id: "terms", name: "Key Terms / Definitions Extractor", phase: "Phase 13.4" },
    { id: "chatbot", name: "Material Q&A Chatbot", phase: "Phase 14.0" },
    { id: "paper_helper", name: "Question Paper Helper", phase: "Phase 14.0" },
    { id: "mini_chat", name: "Mini Study Assistant", phase: "Phase 14.1" }
  ]
};
