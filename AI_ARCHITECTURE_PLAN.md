# AI Architecture & Planning - MVGR Student Resource Hub

This document defines the architecture, endpoints, security guidelines, data schemas, cost-control models, and implementation roadmap for integrating AI features into the MVGR Student Resource Hub. 

---

## 1. AI Vision & Product Scope

The AI features within the MVGR Student Resource Hub are strictly divided into two distinct logical services, emphasizing academic relevance, student cost-control, and structural boundaries.

### A. Core Academic Material AI Agent (Prioritized)
An agent operating strictly context-grounded on course materials, lecture notes, syllabus logs, and past exam question papers. Its primary purpose is to help students resolve specific questions on selected study materials.

### B. Mini Study Assistant (Secondary / Future Scope)
A general, rate-limited conversational bot helping students clarify fundamental academic concepts, design study plans, or explore learning methodologies. It operates with strict cost limits and lower priority than material-focused features.

---

## 2. Role-Wise Feature Matrix

The AI capabilities are segmented based on distinct user roles to prevent abuse and align workflows:

| Role | Interface Location | Scope & Feature Set | Cost Control & Access Limits |
| :--- | :--- | :--- | :--- |
| **Student** | `AI Assistant` Tab / Page | 1. PDF Summarizer<br>2. Important Questions Generator<br>3. Short Notes Generator<br>4. Key Terms/Definitions Extractor<br>5. Question Paper Helper<br>6. Material Q&A Chatbot | **Max 5 requests/day**<br>No Guest access.<br>Department-locked material processing only. |
| **Faculty** | `AI Tools` Section on Materials | 1. Generate Material Descriptions<br>2. Generate Topic Tags<br>3. Summary Generation before Publishing<br>4. Important Question Sets from Uploads<br>5. Short Notes Creator for Students<br>6. Upload Announcement Drafts | **Max 10 requests/day**<br>Restricted to department/course upload boundaries. |
| **Admin** | `AI Control Center` in Admin Dashboard | 1. Global On/Off Feature Toggle switches<br>2. Usage Rate Limit Controls<br>3. Failed AI requests debugger logs<br>4. High-demand material engagement tracker<br>*(No raw chatbot interaction)* | **Max 20 requests/day** (monitoring purposes only). |

---

## 3. The Safest First AI MVP

To minimize risk and optimize compute credits, the platform will initially release two core features:
1. **PDF Summary**
2. **Important Questions Generator**

### Why these two first?
* **High Predictability**: Summaries and questions are highly structured outputs that don't suffer from conversational drift or multi-turn context leakage.
* **Aggressive Caching**: Unlike real-time Q&A chats, summaries and questions are generated **once per PDF**. The resulting output is saved in Firestore (`aiOutputs`) and served instantly to any subsequent student, reducing AI provider compute to nearly zero over time.
* **Simplified Content Filtering**: Text parsing and content length bounds are highly controllable during static analysis.

---

## 4. AI Provider Strategy

The primary, secondary, and fallback providers are structured to ensure high availability, compliance, and strict secret privacy.

1. **Primary Provider: Google Gemini API** (`gemini-2.5-flash` or `gemini-1.5-flash`)
   * *Justification*: Unmatched context window, direct native support for PDF structured document processing, highly cost-effective, and fully aligned with the Google AI Studio ecosystem.
2. **Alternative Fallbacks**: Groq (for blazing-fast text-only Llama-3/Gemma-2 completion), OpenRouter, or OpenAI API.
3. **Secret Safety Protocol**:
   * **Backend-Only Execution**: The Gemini API key resides solely on the Render production environment (`GEMINI_API_KEY`).
   * **Zero Client-Side Visibility**: The React client-side application **never** references, imports, or proxies Gemini secrets.
   * **No Public Credentials**: All keys are omitted from repository configuration and `.env.example`.

---

## 5. Safe AI Request Flow

To preserve intellectual property, user privacy, and prevent endpoint abuse, the request flow strictly follows backend mediation:

```
[React Client] 
   |
   |-- 1. Sends: { Firebase JWT Token, materialId, action } (NO file/signed URLs sent)
   v
[Express Backend]
   |-- 2. Decodes Firebase JWT Token and verifies active user status
   |-- 3. Checks User Role (Student/Faculty/Admin) and department matching rules
   |-- 4. Checks Daily Usage Counter in Firestore (`aiUsage`) -> Deny if over-quota
   |-- 5. Checks Cache (`aiOutputs` for this materialId & action) -> Return immediately if hit
   |-- 6. [CACHE MISS] Fetch PDF file internally from private Cloudflare R2 bucket (Storage SDK)
   |-- 7. Parse & extract plain text safely. Limit payload (e.g., first 50k characters or 10 pages)
   |-- 8. Package payload into safe, sanitized, role-specific system prompt
   |-- 9. Invoke Google Gemini API with system guidelines
   |-- 10. Store raw AI response into Firestore (`aiOutputs` with materialId & action metadata)
   |-- 11. Log successful token usage metadata in `aiUsage` tracking
   |
   +--> 12. Returns sanitized, styled MD string to React Client
```

*Crucial Protections*: No Cloudflare R2 URLs, storage paths, user names, emails, or student credentials are leaked to the LLM.

---

## 6. Backend API Endpoint Plan

All AI requests utilize the secure `/api/ai/*` namespace and are locked behind Firebase Auth middleware.

### `POST /api/ai/material-summary`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string" }`
* **Validations**: Material exists, matches student's department, status is active.
* **Behavior**: Checks `aiOutputs` for cached summary. If missing, extracts text from R2, summarizes via Gemini, saves, and returns.

### `POST /api/ai/important-questions`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string" }`
* **Behavior**: Generates structured practice questions, matching standard MVGR semester schema. Reuses cache where available.

### `POST /api/ai/short-notes`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string" }`
* **Behavior**: Generates clean, structured key lecture notes.

### `POST /api/ai/key-terms`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string" }`
* **Behavior**: Extracts definitions, equations, and critical glossary items.

### `POST /api/ai/material-chat`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string", "message": "string", "history": [] }`
* **Validations**: Contextual message validation. Prevents jailbreak triggers.

### `POST /api/ai/question-paper-helper`
* **Allowed Roles**: `student`, `faculty`
* **Request Body**: `{ "materialId": "string", "questionText": "string" }`
* **Behavior**: Grounded syllabus guidelines on how to tackle specific types of examination questions.

### `GET /api/ai/usage/today`
* **Allowed Roles**: `student`, `faculty`
* **Behavior**: Returns today's logged AI query usage count (e.g., `3 / 5 requests used`).

### `GET /api/admin/ai/usage`
* **Allowed Roles**: `admin`
* **Behavior**: Returns aggregated daily token stats, system error frequencies, and features ranking.

### `PATCH /api/admin/ai/settings`
* **Allowed Roles**: `admin`
* **Request Body**: `{ "studentDailyLimit": number, "facultyDailyLimit": number, "enabledFeatures": [] }`

---

## 7. Frontend UI Integration Plan

The user interface will be expanded symmetrically through our sidebar navigation:

1. **Student Workspace**:
   * Adds `AI Assistant` in sidebar layout.
   * Features a clean dropdown to select a relevant course material from the student's department catalog.
   * Action grid layout for core tools: `Generate Summary`, `Predict Exam Questions`, `Extract Key Terms`, and `Grounded PDF Chat`.
   * Clear disclaimers stating "AI responses are generated as helpers and should be cross-verified with official course textbooks."

2. **Faculty Suite**:
   * Incorporates an `AI Helper` drawer on the Faculty Material Library list.
   * Includes one-click buttons to instantly generate SEO-style tagging and brief catalog descriptions for student convenience.

3. **Admin Panel**:
   * Adds an `AI Administration` section containing global feature toggles, daily user throttling knobs, and system error audit metrics.

---

## 8. Firestore Schema Layout

To facilitate strict role monitoring and robust caching, three collections will be provisioned:

### Collection: `aiOutputs`
Cache database to eliminate repeated identical LLM calls.
```json
{
  "id": "materialId_action",
  "materialId": "string",
  "materialDepartment": "string",
  "action": "summary | questions | notes | terms",
  "output": "string (Markdown content)",
  "generatedBy": "string (uid)",
  "generatedRole": "student | faculty",
  "generatedAt": "timestamp (ISO String)",
  "model": "gemini-2.5-flash",
  "sourceHash": "string (PDF content or size/date metadata fingerprint)"
}
```

### Collection: `aiUsage`
To log and monitor requests for daily user limitations.
```json
{
  "id": "uid_dateKey_actionId",
  "uid": "string",
  "role": "student | faculty | admin",
  "action": "string (e.g., summary)",
  "materialId": "string",
  "dateKey": "YYYY-MM-DD",
  "createdAt": "timestamp (ISO String)",
  "tokensEstimate": "number",
  "status": "success | failed",
  "errorCode": "string | null"
}
```

### Collection: `aiSettings`
System configurations adjustable via the Admin command dashboard.
```json
{
  "id": "global",
  "enabled": true,
  "enabledFeatures": ["summary", "questions", "notes", "terms", "chat"],
  "studentDailyLimit": 5,
  "facultyDailyLimit": 10,
  "adminDailyLimit": 20,
  "maxPdfChars": 150000,
  "maxPdfPages": 15,
  "provider": "google-gemini",
  "model": "gemini-2.5-flash",
  "updatedAt": "timestamp (ISO String)",
  "updatedBy": "string (uid)"
}
```

---

## 9. Comprehensive Cost Control Strategy

1. **Role-Based Throttle Controls**:
   * **Students**: Up to 5 requests per day.
   * **Faculty**: Up to 10 requests per day.
   * **Admins**: Up to 20 requests per day.
   * **Guests**: 0 (AI locked behind login).
2. **Aggressive Cache First**: Every summary, important question set, glossary list, and key terms card is stored in `aiOutputs` permanently. If Student B clicks "Generate Summary" on a PDF already summarized for Student A, the database answers in **0.01 seconds** with **$0.00 provider cost**.
3. **Payload Clamping**: The backend limits text extraction. Any PDF over 15 pages or 150,000 characters is cropped to keep API prompt tokens low.
4. **Immediate Shut-Off**: Admin dashboard can disable any specific AI feature instantly if a critical usage surge is detected.

---

## 10. PDF Text Extraction Flow

Rather than using complex external third-party services, the Node/Express backend will handle extraction safely:
* **Storage-to-Memory Transfer**: Fetch PDF contents from R2 directly via standard AWS SDK inside backend memory buffers (no local disk files created).
* **Text Extraction**: Process PDF buffers via standard node libraries (e.g., `pdf-parse`).
* **Scanned Image Recovery**: If extracted plain text is empty (scanned image PDFs), return a friendly error: "This study resource is image-only. AI text summary is currently limited to electronic text PDFs." (No expensive OCR operations to keep system resource usage lightweight).

---

## 11. AI Safety & Guardrails

1. **Conspicuous AI Disclaimer**: All output containers will prominently show: *"This academic aid is AI-generated. Always cross-reference with official campus syllabus blueprints."*
2. **Context Grounding Rules**: The prompt directives for material-chats strictly instruct the model: *"You must only answer questions using the provided study material. If the answer cannot be found, state 'I am sorry, this information is not covered in the document' and do not hallucinate."*
3. **Prompt Injection Defense**: Inputs are systematically stripped of system command prompts and wrapped in strict JSON delimiters.

---

## 12. Implementation Roadmap

```
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 12: AI Planning & Architecture Freeze (Current)  │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 12.1: Student/Faculty AI Assistant UI Skeleton    │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 13: Express Backend Gemini Foundation Setup       │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 13.1: Internal PDF Text Extraction from R2        │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 13.2: Cache-First Summary & Questions MVP         │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 13.3: AI Cost Settings & Usage Daily Throttle     │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 13.4: Short Notes & Glossary Term Extractor       │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 14: Grounded Document Q&A Chatbot                 │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 14.1: General Mini Study Assistant                 │
   └────────────────────────────┬────────────────────────────┘
                                │
                                v
   ┌─────────────────────────────────────────────────────────┐
   │ Phase 15: Comprehensive Security, Costs & Privacy Audit │
   └─────────────────────────────────────────────────────────┘
```

Each phase will run comprehensive regression audits to ensure student access scopes and storage policies are kept in perfect working order.
