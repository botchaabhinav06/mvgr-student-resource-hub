# Phase 9.0 — Project Overview: MVGR Student Resource Hub

This document defines the documentation foundation, architectural map, and technical stack details of the **MVGR Student Resource Hub** application, serving as the core reference for institutional evaluations and project handovers.

---

## 1. Project Meta-Information

*   **Project Title**: MVGR Student Resource Hub
*   **Deployment Platform**: Vercel
*   **Live Production URL**: [https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app)
*   **Target Institution**: Maharaj Vijayaram Gajapathi Raj (MVGR) College of Engineering

---

## 2. Problem Statement & Objective

### The Problem
In modern academic campuses, students often struggle with scattered learning resources, unorganized syllabus copies, unstructured reference materials, and outdated question banks. Unregulated distribution channels like chat groups lead to broken links, verification issues, and malware risks. At the same time, faculty members lack a direct, closed-loop mechanism to upload verified study material, monitor download telemetry, and track student-reported document issues in real-time.

### Project Objective
The key objective of the **MVGR Student Resource Hub** is to build a highly secure, centralized, and role-restricted academic resource sharing platform. The system permits verified faculty members to seed educational resources directly to cloud repositories, tracks micro-level download milestones, and enables student consumers to search, view, download, or file problem reports through a modern, beautiful, and distraction-free interface.

---

## 3. Targeted Users & Roles

The platform strictly partitions functionality into two primary roles managed via Firebase Authentication claims and Firestore user profiles:

1.  **Student Users**:
    *   Authenticated access only (accounts pre-provisioned or managed by system administrators).
    *   Search and filter curriculum materials by department, subject, year, or section.
    *   Direct preview "Open in New Tab" and disk download capabilities.
    *   Submit issue/defect reports for specific study items (e.g., "Page 15 missing", "Incorrect formula on slide 4").
2.  **Faculty / Administrator Users**:
    *   Authorized dashboard with high-level system analytics (total items uploaded, total downloads, unresolved issue tickets).
    *   Drag-and-drop secure file uploading targeting named cloud storage buckets.
    *   Catalog management (modify metadata or delete items, which dynamically purges both Firestore records and the associated storage binary).
    *   Unresolved issue queues to dismiss or resolve reports filed by students.

---

## 4. Technology Stack & Integrations

The system leverages a highly modern, full-stack decoupled serverless architecture:

*   **Frontend**: React 19 single-page application (SPA) bundled and optimized via **Vite**.
*   **Design Framework**: **Tailwind CSS (v4)** adopting a custom high-contrast, premium, dark **Cyber-Slate** theme for enhanced readability and eye comfort during long study sessions.
*   **Interactive Graphics**: **Motion** (custom entry transitions and micro-interactions) and Vector-based iconography.
*   **Client Core Storage Synchronizer**: **Google Cloud Firestore** (retained to map users profile schemas, curriculum files metadata, and reports metadata).
*   **Authentication & Session Management**: **Firebase Authentication** (securing local JSON Web Tokens and user roles).
*   **Media Storage Endpoint**: **Supabase Storage** (hosting large PDF binaries, linked with client metadata inside Firestore).

---

## 5. System Architecture & Information Flow

Below represents the data flow pipeline of the application:

```
                  +-----------------------------------+
                  |        Vercel Hosting CDN        |
                  |  (React 19 SPA + Tailwind v4)     |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
+-----------v-----------+                       +-----------v-----------+
| Firebase Auth Service |                       | Firebase Firestore DB |
| (Auth Status Tokens)  |                       | (Users & Materials)   |
+-----------------------+                       +-----------+-----------+
                                                            |
                                                +-----------v-----------+
                                                | Supabase Storage API  |
                                                | (Large PDF Binaries)  |
                                                +-----------------------+
```

### Key Technical Flows:
1.  **Faculty Resource Upload**: PDF binary is pushed directly to the Supabase bucket `materials-pdfs`. Upon successful storage confirmation, a payload consisting of the secure `storagePath`, `previewUrl`, `fileSize`, `fileName`, and associated administrative indices is written as a new document into the Firestore `materials` collection.
2.  **Telemetry-Driven Student Downloads**: The student clicks "Download Document". The client retrieves the binary stream from the Supabase API, executes a browser-side stream compilation, and triggers a localized write event. Upon completion, a server-rule-guarded Firestore atomic transaction increments the document’s field `downloadsCount` by `1`.
3.  **Real-Time Collaborative Reporting**: Students write a text flag and submit. It maps to the `reports` collection. The change in state instantly propagates to the active Faculty Dashboard view, updating counting blocks and list cards dynamically.

---

## 6. Current MVP Config & Verification Policy Warning

> [!WARNING]
> To permit rapid testing, sandbox verification, and cross-platform institutional demo scenarios, the **Supabase Storage bucket (`materials-pdfs`) matches public policies** while using a client-side publishable low-privileged anonymous api key (`VITE_SUPABASE_ANON_KEY`).
>
> **Access Warning**: Users possessing the exact URL can access study material directly in a browser. This model fits non-confidential public learning materials perfectly. On production rollouts containing copyrighted coursework or personal papers, adopt our hardening blueprints below.

### Production Hardening Guidelines
1.  **Toggle Storage Visibility to Private**: Revoke the current public folder access policies on the Supabase console.
2.  **Generate Signed Temporary URLs**: Leverage a backend gateway (such as a secure Firebase Cloud Function or Supabase Edge Function) to query administrative clients and yield cryptographically crypt-signed download pathways with small time-to-live values (e.g., 60 seconds).
3.  **Authenticate Every Session**: Pass the bearer Firebase ID Token inside edge function headers to verify student profile ownership.

---

## 7. Future Capability Expansion Plan

*   **Intelligent PDF Processing & Classification**: Connect a server-side Gemini API pipeline to automatically categorize added materials, parse content for key summaries, and formulate practice mock exams based on course slides.
*   **Custom Departmental Quotas**: Limit storage structures per course code to prevent rapid storage overflow.
*   **Push Alert Mechanisms**: Send push updates using web-sockets when a professor updates exam-specific preparation material.
