# Phase 9.4 — Viva Questions & Answers: MVGR Student Resource Hub

This guide is curated to help you confidently navigate your project viva, external examinations, and technical reviews for the **MVGR Student Resource Hub**. It covers basic, administrative, architectural, database, storage, deployment, and security-centric sections.

---

## 📋 Table of Contents
1. [Basic Project Questions](#1-basic-project-questions)
2. [Student Module Questions](#2-student-module-questions)
3. [Faculty/Admin Module Questions](#3-facultyadmin-module-questions)
4. [Authentication and Authorization Questions](#4-authentication-and-authorization-questions)
5. [Firestore Questions](#5-firestore-questions)
6. [Supabase Storage Questions](#6-supabase-storage-questions)
7. [Deployment Questions](#7-deployment-questions)
8. [Architecture Questions](#8-architecture-architecture)
9. [Security Questions](#9-security-questions)
10. [Technical Stack Questions](#10-technical-stack-questions)
11. [Testing Questions](#11-testing-questions)
12. [Future Enhancement Questions](#12-future-enhancement-questions)
13. [Short One-Line Answers (Rapid Revision)](#13-short-one-line-answers-rapid-revision)

---

## 1. Basic Project Questions

### Q1. What is the MVGR Student Resource Hub?
**Answer**: It is a secure, role-based cloud resource sharing application tailored for MVGR College of Engineering. It serves as a unified system where faculty members upload and moderate verified learning materials (PDFs), while students can instantly search, preview, download, and flag issues on these materials.

### Q2. Why did you build this project? What problem does it solve?
**Answer**: In physical campuses, learning materials are scattered across individual WhatsApp groups, personal emails, or flash drives. This leads to version mismatches, security risks, lost files, and a lack of centralized oversight. This project solves these issues by creating a single, authoritative, and structured source of verified study materials.

### Q3. Who are the target users?
**Answer**: 
1. **Students**: Who search, browse, preview, download, and report defects.
2. **Faculty / Course Coordinators**: Who publish, manage catalog inventories, monitor download telemetry, and resolve student-submitted problem reports.

---

## 2. Student Module Questions

### Q4. What can a student do in this system?
**Answer**: A student can log in securely, view the materials catalog, search by keywords, filter by department, open a PDF in a new window for preview, download a local copy of a PDF, and report document defects (like missing pages or corrupt content).

### Q5. How does a student search or filter for materials?
**Answer**: The UI provides a dynamic text input search bar and department category filters. The matching process is processed client-side with zero page state latency, ensuring high responsive catalog interaction.

### Q6. How does PDF open/download work?
**Answer**: 
* **Open in New Tab**: Directly streams the public URL file in browser views.
* **Direct Download**: Converts the PDF stream into an offline file blob and triggers browser writing, while incrementing download counts at the Firestore layer.

### Q7. How does the report issue feature work?
**Answer**: Students can click 'Report Issue' on a card to fill a small form explaining the defect. This data is logged inside the Firestore `reports` collection and instantly rendered on faculty dashboards.

### Q8. Can students upload or delete materials? Why not?
**Answer**: No. Students are restricted from carrying out CRUD operations on learning catalogs to maintain academic integrity and prevent spam. Access to upload/delete functions is restricted via frontend routing checks and Firestore security rules.

---

## 3. Faculty/Admin Module Questions

### Q9. What can faculty members do in this system?
**Answer**: Faculty can view dashboard telemetry (total uploads, downloads, unresolved issues), upload new study materials, delete existing resources, and view as well as resolve/dismiss student issue logs.

### Q10. How does faculty upload study material?
**Answer**: Faculty drag and drop or manually select a PDF, input meta-descriptors (Title, Course Code, Target Year, and Department), and submit. The file is written dynamically to Supabase Storage, and its metadata mapping is stored in Firestore.

### Q11. How does faculty manage or delete material?
**Answer**: Within the Manage Materials directory, faculty can view all active uploads. Clicking 'Delete' triggers a dual cleanup process: the database metadata document is purged, and the actual PDF in the Supabase Storage bucket is deleted.

### Q12. What is the value of the analytics and download tracker?
**Answer**: Whenever a student initiates a download, a Firestore counter tracks the event. These aggregate tallies help faculty identify which syllabus units, question banks, or reference guides are most referenced by students.

---

## 4. Authentication and Authorization Questions

### Q13. Why did you use Firebase Auth?
**Answer**: Firebase Auth handles secure user onboarding, encrypted session persistence, password management, and JWT claim configurations out-of-the-box, saving development overhead.

### Q14. How are student and faculty roles separated?
**Answer**: Users possess designated profile roles ('student' or 'faculty') mapped in Firestore. Upon successful login, the application evaluates the role parameter and dynamically opens the corresponding dashboard layout.

### Q15. How do you prevent students from accessing faculty pages?
**Answer**: 
1. **Frontend Route Guards**: Any navigation path containing faculty sub-folders is protected. The application checks the active user's credentials against permission sets and redirects unauthorized students back to the search portal.
2. **Backend Security Rules**: Firestore security rules block student clients from executing write, edit, or delete operations on target collections.

### Q16. Are users allowed to register publicly?
**Answer**: The application supports managed registration for staging. In an institutional setup, accounts are batch-provisioned by college administrators using official registrar registries to prevent unauthorized external access.

---

## 5. Firestore Questions

### Q17. Why did you use Google Cloud Firestore?
**Answer**: It is a powerful, low-latency Document-based NoSQL Cloud Database. It updates system states dynamically with real-time sync listeners, making it perfect for rapid chat streams, telemetry counts, and instant status updates.

### Q18. What schemas or collections are used?
**Answer**: 
* `/users`: Profiles including role strings ('student', 'faculty'), email, and department mapping.
* `/materials`: Documents referencing academic meta elements (title, year, department, previewUrl, storagePath).
* `/reports`: Issue records filed by students detailing specific material IDs, user emails, flags, and status ('unresolved', 'resolved').

### Q19. Why do you store metadata in Firestore but not the actual PDF file bytes?
**Answer**: Document databases are designed for small structured JSON data. Storing large binary blobs (PDFs) inside document databases is highly inefficient, expensive, and leads to severe performance degradation. We store actual PDF files in a dedicated asset repository (Supabase Storage) and store only lightweight metadata pointers (like URLs and storage paths) in Firestore.

---

## 6. Supabase Storage Questions

### Q20. What is Supabase Storage and why did you use it?
**Answer**: Supabase Storage is a cloud object storage service built on top of AWS S3. It is designed to handle big binary payloads (such as 10MB textbook PDFs), providing rapid file upload pipelines and structured storage namespaces.

### Q21. What is the active bucket name?
**Answer**: `materials-pdfs`

### Q22. What is the current security architecture of your storage bucket?
**Answer**: For rapid staging and review, the bucket utilizes a **Public policy** alongside client-side write permissions via an anonymous client API key (`VITE_SUPABASE_ANON_KEY`).

### Q23. What is the limitation of this public setup?
**Answer**: Anyone who captures the exact direct link of a PDF (e.g., via browser console inspection) can view the document publicly without logging into the platform.

### Q24. How would you secure this storage bucket for institutional production rollout?
**Answer**: 
1. Modify the `materials-pdfs` bucket policy status from **Public** to **Private** inside the Supabase Console.
2. Block direct public asset links.
3. Establish a backend API route that decodes the user's **Firebase ID Token** to verify student status, and returns a short-lived **Signed URL** (valid for 60 seconds) to preview or download the material.

---

## 7. Deployment Questions

### Q25. Why did you use Vercel for hosting?
**Answer**: Vercel offers an optimized edge serverless architecture, rapid automated deployments, and custom routing configurations perfect for React SPAs.

### Q26. How do you prevent 404 navigation errors when users refresh deep pages (e.g., `/student/browse`) in React?
**Answer**: Custom rewrite routing rules are defined in `/vercel.json`. This instructs the Vercel hosting CDN to route all deep page entry inquiries back to our primary root `index.html` file, letting the client React router handle internal page routing seamlessly.

### Q27. What environment variables are used in Vercel?
**Answer**: 
* `VITE_SUPABASE_URL` (Supabase instance endpoint)
* `VITE_SUPABASE_ANON_KEY` (Public client access key)

---

## 8. Architecture Questions

### Q28. Explain the general System Architecture.
**Answer**: 
* **Frontend**: React 19 + Tailwind v4 hosted on Vercel's global CDN.
* **Authentication**: Firebase Authentication.
* **Metadata Database**: Firebase Firestore (NoSQL).
* **Binary File Storage**: Supabase Storage Buckets.

### Q29. Explain the Faculty Upload data flow step-by-step.
**Answer**:
1. Faculty selects the PDF and inputs meta descriptors.
2. Client sends the PDF binary stream straight to the Supabase `materials-pdfs` bucket.
3. Supabase saves the file and returns metadata including the file path and file preview URL.
4. Client logs these values within Firestore `/materials` schema index as a lightweight record.

### Q30. Explain the Student Download data flow step-by-step.
**Answer**:
1. Student clicks Download.
2. Client fetches the PDF binary stream from Supabase.
3. Browser compiles the payload and triggers a download save dialogue.
4. Client runs a transaction query updating the matching Firestore document's `downloadsCount` value by `+1`.

---

## 9. Security Questions

### Q31. How is your system secured?
**Answer**:
* **Frontend Guards**: Intercepts illegal routing actions.
* **Encrypted Sessions**: Managed using Firebase Auth tokens.
* **Clean Code Environment**: No deployment files, configuration files, or build systems contain hardcoded secret API codes or database `service_role` administrator keys, keeping files repository-safe.

### Q32. What is the difference between an anonymous client key (`anon`) and an administrative database secret (`service_role`)?
**Answer**: 
* **Anon Key**: Low-privileged public client-safe key designed for frontend use. It respects security rules and restrict interactions to basic operations.
* **Service Role Key**: A high-privileged master secret that bypasses all security rules entirely. It must **never** be exposed in the frontend; exposing it allows anyone to compromise the entire database.

---

## 10. Technical Stack Questions

### Q33. Why React 19 and Vite?
**Answer**: React 19 offers exceptional rendering performance and component modularity. Vite replaces sluggish bundlers, compiling local asset arrays rapidly with near-instant hot reloads during development.

### Q34. Why TypeScript over standard JavaScript?
**Answer**: TypeScript is strongly typed. It catches spelling errors, type mismatches, and structural API mismatches during compilation, preventing critical runtime errors before the application is deployed.

### Q35. Why did you use Tailwind CSS (v4)?
**Answer**: Tailwind v4 uses modern utility classes directly in the markup. It eliminates hefty CSS stylesheet maintenance, reduces overall file sizes, and makes designing responsive layouts simple.

---

## 11. Testing Questions

### Q36. How was this application tested?
**Answer**: We conducted end-to-end integration testing addressing key student and faculty journeys:
1. User logs in.
2. Faculty uploads coursework.
3. Student searches catalog.
4. Student downloads and confirms download statistics update.
5. Student files problem reports.
6. Faculty reviews and clears reports.
7. Faculty deletes catalog item.

---

## 12. Future Enhancement Questions

### Q37. What are the key future enhancements planned for the platform?
**Answer**:
* **AI Textbook Assistant**: Build an server-side Gemini AI pipeline to automatically summarize uploaded PDFs and generate sample questionnaire sheets.
* **Enforced Private Storages**: Migrate bucket files to private access paired with temporary signed URL gateways.
* **Service Notifications**: Deliver push updates to browsers when course professors publish exam guides.

---

## 13. Short One-Line Answers (Rapid Revision)

* **What is Firestore storing?** Metadata parameters (IDs, User profiles, File URL paths, Issue report texts).
* **What is Supabase storing?** Actual raw PDF file bytes.
* **How are PDF files linked?** Via a unique metadata record in Firestore containing the Supabase CDN path.
* **How is the frontend hosted?** Globally on Vercel.
* **Are there TypeScript compiler errors?** No, the project builds with strict type-safety.
* **What style theme is used?** Cyber-Slate Modern Dark Theme (optimizing eye comfort for study hours).
* **What prevents students from opening faculty panels?** Hardcoded route permission checks.
* **Is there any secret leak?** No, all cloud variables are stored securely within Vercel Environment configurations.
* **How to harden object storage?** Swap Supabase storage visible state to 'Private' and serve files using server-side generated Signed URLs.
