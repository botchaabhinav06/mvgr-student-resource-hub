# MVGR Student Resource Hub
A secure, high-yield full-stack academic resource hub for students, faculty, and admins with Firebase Auth, Firestore, Cloudflare R2 private PDF storage, backend-proxied signed URLs, and native, cost-controlled Google Gemini AI academic assistance.

---

## 📌 Project Overview
The MVGR Student Resource Hub is a secure, role-authorized web platform designed to streamline the academic resource lifecycle. It replaces disorganized file sharing with a single source of truth for study materials.

### Problem Statement
Students faced disorganized, fragmented file sharing across various messaging platforms, leading to confusion, outdated materials, and unauthorized access to course documents.

### Solution Summary
A centralized, production-grade web portal where materials are organized by department, year, and semester. The system ensures data integrity and security through Firebase-backed role authorization, backend-proxy signed URLs for file storage, and private, quota-controlled, cache-first Gemini AI revision tools.

---

## 🎯 Key Features & Role-Based Access

### Student
* **Personalized Dashboard**: View relevant materials based on department and current semester.
* **Question Papers**: Organized access to previous question papers.
* **Profile Management**: Update academic details to filter relevant resources.
* **AI Assistant Workspace**: Generate high-yield study aids on authorized, department-locked materials:
  * **PDF Summary**: Grounded, structured summaries focusing on key takeaways.
  * **Important Questions**: Syllabus-aligned practice worksheets (2M, 5M, 10M).
  * **Short Notes**: Concise, highly scannable revision study outlines.
  * **Key Terms & Definitions**: Extract glossaries, formula sheets, and core concepts.
* **AI Output History**: Access a secure, quota-free personal archive of previously generated outputs.
* **Daily Quota Panel**: Monitor per-feature consumption in real-time.

### Faculty
* **Material Upload**: Streamlined cataloging of study materials and question papers.
* **Catalog Management**: Edit metadata, preview PDFs, and delete outdated content.
* **Reports Queue**: Manage and resolve student-reported discrepancies.

### Admin
* **User Governance**: Manage user profiles, active status, and rosters.
* **Database Normalization**: Integrity checks and data cleansing tools.
* **AI Control Dashboard**:
  * **AI Health Check**: Verify backend connectivity and environment validation.
  * **Gemini Smoke Test**: Run a metadata-level end-to-end integration check.
  * **Model Diagnostics**: Query available backend models and latency stats.
  * **Active Services Grid**: View active student AI aids status.

---

## 🛠️ Technology Stack & Architecture
* **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, motion (for elegant micro-animations).
* **Backend**: Express.js (Node.js REST API with Firebase Admin SDK).
* **Database & Auth**: Firebase Auth, Cloud Firestore (with hardened production security rules).
* **Private Storage**: Cloudflare R2 private object bucket.
* **AI Model Pipeline**: `@google/genai` Node.js SDK.
  * *Primary Model*: `gemini-3.1-flash-lite` (latency-optimized and highly cost-efficient).
  * *Fallback Model*: `gemini-3.5-flash` (robust reasoning fallback).

### Security & Privacy Controls
* **Backend Mediation**: All storage access and AI calls run backend-only. The frontend never accesses private URLs or calls Gemini directly.
* **Zero Client Leakage**: Sensitive storage paths, R2 bucket configurations, raw prompts, extracted PDF text, and the `GEMINI_API_KEY` are strictly isolated on the backend.
* **Zero-Knowledge Password Reset**: Obscured user-existence checks prevent email enumeration.
* **Zero-Trust Firestore Rules**: Direct client access to `/aiOutputs`, `/aiUsage`, and `/aiUsageDaily` is fully denied. All modifications are handled via server transactions.

---

## 🚀 Live Deployments (Placeholders)
* **Frontend Site**: [https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app)
* **Backend API API**: [https://mvgr-resource-hub-api.onrender.com](https://mvgr-resource-hub-api.onrender.com)

---

## 💻 Local Development Setup

### 1. Prerequisite Configuration
Create a `.env` file in the root directory based on `.env.example`:

```env
# Frontend
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Backend Server Secrets
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_service_account_json
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name

# AI Integration Secrets (Backend Only)
GEMINI_API_KEY=your_google_gemini_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
```

### 2. Dependency Installation
Install backend and frontend dependencies:
```bash
npm install
```

### 3. Running the Server
Launch the full-stack development workspace on port 3000:
```bash
npm run dev
```

---

## 📦 Production Deployment Notes

### Frontend (Vercel)
1. Configure Environment variables starting with `VITE_` in your Vercel Project Settings.
2. Ensure Vercel's Build Command is set to `npm run build` and output directory is `dist`.

### Backend (Render / Cloud Run)
1. Deploy the Node.js backend with your private secrets (`GEMINI_API_KEY`, R2 credentials, base64 Firebase Admin JSON).
2. Configure your CORS settings or env variables to trust your Vercel frontend URL.

### Firestore Rules Deployment
Publish the validated `firestore.rules` file to your Firebase console project using the Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 🏗️ Project Status
- **Status**: Stable Production-Ready MVP. All security audits, AI caching algorithms, daily quotas, password recovery paths, and department locks are fully implemented and verified.

