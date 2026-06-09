# Phase 8.1 — Environment Variables & Secrets Audit

This document summarizes the environment variables, configuration parameters, and secret handling audit for the **MVGR Student Resource Hub** application, ensuring safety prior to production deployment.

---

## 1. Required Variables List & Usage Analysis

The application leverages standard client-side environment properties and decentralized configuration formats to maintain a healthy integration state.

### A. Firebase Configuration
The Firebase client parameters are centralized inside `src/firebase/firebaseConfig.ts`.
*   **Firebase API Key**: Checked. Enabled for standard client-side authentication requests.
*   **Firebase Auth Domain**: Checked. Standard project domain mapping.
*   **Firebase Project ID**: Checked. Correctly identifies the underlying Firestore instance.
*   **Firebase App ID**: Checked. Web client identifier mapped safely.
*   **Firestore Initialization**: Centralized initialization using `getFirestore(app)` and correctly exported.
*   **Firebase Auth Initialization**: Centralized initialization using `getAuth(app)` and correctly exported.

*Security Note*: In line with Google Firebase security specifications, the values provided in `firebaseConfig.ts` are public client identifiers. They do not represent administrative backend credentials. Access privileges are strictly governed by active Firestore security rules (`firestore.rules`).

### B. Supabase Configuration
The Supabase client handles real-time PDF interactions on `src/lib/supabaseClient.ts`.
*   **`VITE_SUPABASE_URL`**: Verified. Points solely to the root endpoint (`https://zsmyweuwpvtnpvzreglr.supabase.co`). It cleanly excludes `/rest/v1/` to remain compatible with standard Supabase client libraries.
*   **`VITE_SUPABASE_ANON_KEY`**: Verified. Leverages the client-safe, public, low-privileged `anon` key, containing standard student read/write claims.

---

## 2. Environment Usage and centralization Audit

*   **centralization**: Firebase configurations are entirely consolidated in a single module (`src/firebase/firebaseConfig.ts`). Keys and endpoints are not scattered or copied into other screens, modals, or page views.
*   **Vite Native Parsing**: The Supabase Client is engineered to prioritize container environments:
    ```typescript
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "FALLBACK_CDN";
    const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "FALLBACK_ANON";
    ```
*   **Console Logging Safety**: Codebases searched. No outputs like `console.log()` print active keys, user passwords, or tokens.
*   **UI Integrity**: The interface is designed exclusively around academic features. No debug menus, developer settings, input forms, or diagnostic console widgets expose environmental variables to end-users.

---

## 3. Secret Leak Audit Results

A full recursive search was executed across the source directory `src/` to identify potential leakage vectors. 

| Parameter Type | Audit Result | Severity | Status |
| :--- | :---: | :---: | :---: |
| **Supabase `service_role` Key** | **NOT FOUND** | Critical | **SAFE** |
| **Supabase Secret Key / Private Tokens** | **NOT FOUND** | Critical | **SAFE** |
| **JWT Secrets / Keys** | **NOT FOUND** | High | **SAFE** |
| **Database Passwords / Root Credentials** | **NOT FOUND** | High | **SAFE** |
| **GCP Private Keys / Firebase Admin Creds** | **NOT FOUND** | Critical | **SAFE** |
| **Hardcoded Administrative Credentials** | **NOT FOUND** | High | **SAFE** |

*All high-privileged administrative actions are restricted and barred from inclusion in client-side modules.*

---

## 4. Deployment Environment Variable Checklist

When preparing active production containers (e.g., Google Cloud Run, Vercel, Netlify), declare the following keys inside your service dashboard to overwrite local fallbacks:

*   [ ] `VITE_SUPABASE_URL`: The production root URL of your active Supabase project.
*   [ ] `VITE_SUPABASE_ANON_KEY`: The publishable, client-safe anonymous API key of your production Supabase project.
*   [ ] `GEMINI_API_KEY`: If backend capabilities or analytical expansions are introduced in high-privileged workflows.

---

## 5. Security Warnings & Best Practices

> [!CAUTION]
> **NEVER COMMIT HIGH-PRIVILEGED SECRET KEYS**
> Never save `service_role` or other high-privileged management keys inside your GitHub repositories, code branches, or `.env.example` templates.

> [!WARNING]
> **NO SERVICE ROLE IN FRONTEND**
> The Supabase `service_role` key bypasses all Row Level Security (RLS) constraints. It has full database rights. Keeping it in the client bundle allows malicious actors to read, update, or completely delete student databases and documents. Only use the client `anon` key inside public applications.
