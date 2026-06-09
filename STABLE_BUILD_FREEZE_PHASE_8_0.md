# Phase 8.0 — Stable Build Freeze

This document marks the stable build freeze of the **MVGR Student Resource Hub** application. The codebase has met all functional constraints, verified compilation checks, and visual style audits. It is locked in its current state as a deployment candidate.

---

## 1. Current Architecture Summary

The MVGR Student Resource Hub operates on a secure, modern full-stack web paradigm incorporating real-time database indexing and secure media retrieval pipelines:
- **Frontend Layer**: Client-side SPA built with **React (v18+)**, structured with **Vite** and styled using high-contrast, professional modern cyber-themed **Tailwind CSS** classes. Icons are exclusively sourced from `lucide-react`.
- **Primary Database**: **Google Cloud Firestore** handles transactional document operations, tracking resource metadata (`materials` collection), user profiles and roles (`users` collection), textbook defect alerts (`reports` collection), and dynamic material usage statistics.
- **Secure File Storage**: **Supabase Storage** operates as the primary hosting repository for material PDFs under the dedicated bucket namespace `materials-pdfs`.
- **Identity & Authentication Engine**: **Firebase Authentication** drives role-based student and faculty registration/login hooks, establishing strict role limits.

---

## 2. Locked Features List

The following features have been verified, optimized, and are now strictly **LOCKED** for production:
- **Secure Authentication**: Traditional credential entry for Student and Faculty portals.
- **Role-Based Workflows**: Automatic server and client-side view restrictions based on validated token payloads.
- **Faculty Contribution Management**:
  - Secure uploading of textbooks directly to `materials-pdfs` in Supabase Storage.
  - Storage mapping and catalog insertion into Firestore synchronously.
  - Catalog removal operations that cleanly delete both the Supabase storage file and Firestore metadata documents.
- **PDF Viewing Mechanics**:
  - **Open in New Tab**: Directly handles target-blank viewport loads for the CDN endpoint.
  - **Direct Download Behavior**: Fully optimized to pull files directly through Supabase's `storage.from().download()` API or secure fetch streams as blobs, avoiding browser preview capture and forcing localized system-disk saves.
- **Support & Analytics**:
  - Accurate incrementing of `downloadsCount` inside Firestore exclusively matching successful file streams.
  - Defect reporting workspace for student catalogs that integrates into the faculty reports command board.
  - Detailed dashboard graphs aggregating institutional downloads and report tallies.

---

## 3. Security Warning & Recommendations

> [!WARNING]
> This app is configured with **Supabase Public Bucket** access policies and **client-side anonymous keys** for optimal MVP testing, swift validation, and streamlined sandbox performance in target containers.

### Future Production Upgrades
For full-scale enterprise production releases inside highly sensitive institutional networks, the following transitions are strongly recommended:
1. **Private Buckets**: Transition the `materials-pdfs` bucket permissions to private visibility to prevent scraping.
2. **Signed URLs**: Re-architect file retrieval via short-lived, cryptographically signed URL handshakes generated dynamically on server-side modules.
3. **Restrictive CORS Policies**: Limit accessible HTTP origins explicitly to the primary production institutional host domain names inside the Supabase Storage console.

---

## 4. Anti-Mutation Directives (Deployment Safeguards)

To preserve the complete functional integrity during CI/CD steps or local build setups, the following settings and components **MUST NOT** be modified:
- **Storage Bucket Name**: Keep configuration target precisely string-matched to `materials-pdfs`.
- **Database schemas & counts**: Ensure `downloadsCount`, `reportsCount`, `storageProvider` are initialized accurately and handled safely across document mutations.
- **Environment Context**: Standardize configuration variables inside `.env.example` to ensure local environments align gracefully with target production pipelines.
- **Visual Palette Integrity**: Maintain the modern dark cyber-slate style accent and high-contrast color values. Do not inject unrequested light mode options or auxiliary theme widgets.

---

## 5. Manual Test Checklist

- [ ] **Faculty Catalog Contribution**: Verify that uploading a PDF pushes the document onto Supabase, updates Firestore, and immediately populates the Browse view dashboard.
- [ ] **Dual-Button PDF Logic**:
  - Open in New Tab launches a new browser page.
  - Download triggers localized browser streams, initiates disk-save prompts, and updates the Firestore `downloadsCount` dynamic badge by `+1` on completion.
- [ ] **Defect Transmission**: Filing alerts on a specific material catalog item appears immediately in the Faculty reports drawer layout on real-time stream.
- [ ] **Purging Catalog Items**: Clicking delete as a faculty member wipes the database row and successfully expunges the Supabase bucket key pointer.
- [ ] **Role Boundary Guards**: Confirm attempting direct student navigation to admin views routes the client gracefully back to permitted portals.
