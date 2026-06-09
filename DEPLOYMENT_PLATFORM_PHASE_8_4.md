# Phase 8.4 — Deployment Platform Setup Report

This document records the deployment preparation and step-by-step platform setup architecture for the **MVGR Student Resource Hub** application, targeting **Vercel** as the cloud-hosting platform.

---

## 1. Selected Deployment Platform

*   **Platform**: **Vercel**
*   **Aesthetic & Architectural Logic**: The MVGR Student Resource Hub is built as a single-page application (SPA) using React 19 and Vite. Vercel is selected as the primary host because of its native support for modern React frameworks, instant globally-distributed Edge CDN, robust automatic previews, and native optimization for client-side routing fallback structures.

---

## 2. Compile-Time & Hosting Specifications

| Configuration Parameter | Target Value | Description |
| :--- | :--- | :--- |
| **Framework Preset** | `Vite` | Native Vite compiler architecture mapping. |
| **Build Command** | `npm run build` | Transpiles components and assets using Vite. |
| **Output Directory** | `dist` | Destination folder hosting the minified production bundles. |
| **Install Command** | `npm install` | Restores essential packages declared in `package.json`. |

*Note: The project includes a customized `/vercel.json` rewrite strategy ensuring that secondary path refreshes are safely caught and rewritten to `/index.html` preventing immediate client-side 404 errors.*

---

## 3. Required Environment Variables for Vercel

The following parameters must be declared inside your Vercel project's **Environment Variables** panel. Under no circumstances should these be hardcoded or written to public version repositories.

*   `VITE_SUPABASE_URL`: The production API root URL of the active Supabase project (e.g., `https://[project-id].supabase.co`).
*   `VITE_SUPABASE_ANON_KEY`: The publishable client-side low-privileged anonymous API key for storage access.

*(Under Client-side environments, standard Firebase API configuration keys are already safely packaged within the production bundle as public identifiers. If the project's Firebase initialization relies on environment variables rather than direct keys, standard `VITE_FIREBASE_*` variables must also be declared accordingly.)*

---

## 4. Firebase Authorized Domain Integration

Once Vercel has compiled the build, it will assign your deployment a primary canonical domain name (e.g., `mvgr-resource-hub.vercel.app`). Firebase Authentication will drop authorization payloads unless this domain is explicitly whitelisted.

### Configuration Protocol
1.  Navigate to the [Firebase Console](https://console.firebase.google.com/).
2.  Open your **MVGR Student Resource Hub** Firebase project.
3.  On the left navigation pane, click **Authentication** and then choose the **Settings** tab.
4.  Select **Authorized domains** under the Settings panel.
5.  Click **Add domain** and register your canonical Vercel deployment URL (e.g., `mvgr-resource-hub.vercel.app`).
6.  Click **Save**. Authentication requests (such as Sign In or password validations) will now operate smoothly on the web.

---

## 5. Supabase Storage Gateway Notification

> [!WARNING]
> For the initial MVP validation phase, the `materials-pdfs` bucket has public policies enabled so that the client-side download stream executes smoothly. 
>
> When preparing for enterprise-wide institutional rollouts with sensitive documents, edit the Supabase Storage policies to restrict access and implement signed secure URLs natively to ensure security.

---

## 6. Comprehensive Deployment Checklist

- [ ] **Environments Configuration**: Register `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` inside Vercel Dashboard Settings.
- [ ] **Vercel Initial Build**: Execute your first push to trigger an automated production build and document the host target url.
- [ ] **Authorized Domains Sync**: Register the newly assigned Vercel URL within Firebase Authentication's permitted domain whitelist.
- [ ] **Interactive Validation**:
  - [ ] Log in using the standard Student credentials.
  - [ ] Log in using Faculty credentials.
  - [ ] Perform a test upload, and verify that the target PDF uploads successfully to the `materials-pdfs` bucket.
  - [ ] Open the newly uploaded resource in a separate tab.
  - [ ] Download the resource to your local disk and confirm that the catalog’s download count updates accurately.
