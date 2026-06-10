# MVGR Student Resource Hub

A secure, centralized academic resource sharing platform tailored for the **Maharaj Vijayaram Gajapathi Raj (MVGR) College of Engineering** academic ecosystem.

---

## 🚀 Live Production URL
Explore the live deployed platform here:  
👉 **[https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app)**

---

## 📌 Problem Statement
Traditionally, university course resources are highly scattered across isolated chat groups, unorganized email threads, and localized thumb drives. This chaotic setup leads to several issues:
* **No Single Source of Truth**: Students rely on unverified, sometimes corrupted, study materials.
* **Lack of Direct Faculty Supervision**: Instructors cannot easily seed slide decks, update lecture notes, or audit downloads.
* **Silent Academic Defects**: There are no closed-loop systems for students to easily report missing pages, outdated curriculum contents, or incorrect formulas.
* **Malicious Link Hazards**: Students risk running malware files on external, unmoderated download portals.

---

## 🎯 Project Objective
The principal objective of the **MVGR Student Resource Hub** is to establish an intuitive, safe, and role-authorized web platform. Designed with a custom-engineered **Cyber-Slate Dark Theme** to optimize reader eye rest, the platform provides:
1. Faculty coordinators with direct, self-contained mechanisms to upload, manage, and catalog certified PDFs, and track their download statistics.
2. Students with centralized browsing, filtering, instant inline PDF previewing, offline disk saves, and defect-reporting pathways.

---

## 👥 Target Users & Client Roles

### 1. Students
* **Authentication**: Authorized access via student credentials.
* **Browse & Search**: Query textbook files instantly with course-code searches and department category filters.
* **Instant Inline Previews**: Use the "Open in New Tab" gateway to stream files in standard browser viewports.
* **System-Safe Downloads**: Save verified reference content directly to disks.
* **Defect Feedback**: Lodge an issue ticket directly on faulty publications ("Missing Section B", "Outdated copy", etc.).

### 2. Faculty / Administrative Coordinators
* **Upload Hub**: Upload course PDFs with structured fields (Title, Year, Semester, Course Code, Department).
* **Analytics Dashboard**: Real-time counter widgets tracking total files, cumulative downloads, and active reports.
* **Resource Manager**: Purge stale items. Deletion automatically cleanses metadata references in Firestore and frees block space in cold storage.
* **Live Issue Inbox**: Action student-reported documents, permitting administrators to resolve or dismiss entries.

---

## 🛠️ Technology Stack & API Ecosystem

* **Frontend Engine**: React 19 + TypeScript (strict types, zero compiler overrides).
* **Design & Layout**: Tailwind CSS (v4) with Fluid responsive mobile-first targets.
* **Interactive Layer**: Motion (for entry and modal page animations) + Lucide-react icons.
* **Authentication System**: Google Firebase Authentication (managing local session states).
* **Metadata Schema Database**: Google Cloud Firestore (structured tables for users, materials, reports, and analytics).
* **Asset Storage Endpoint**: Supabase Storage (storing actual PDF documents).
* **Production Hosting Cloud**: Vercel (integrated globally-distributed Edge CDN and client-path rewrites).

---

## 🗄️ System Architecture
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

---

## 📂 High-Level Project Directory Structure
```
├── public/                 # Static graphical assets & index metadata
├── src/
│   ├── components/         # High-fidelity dashboard widgets and UI modules
│   │   ├── student/        # Student-focused subviews
│   │   └── faculty/        # Faculty control panels, analytics, & uploaders
│   ├── config/             # Cloud connection wrappers (Firebase + Supabase initialization)
│   ├── types/              # Unified TypeScript interface and enumeration definitions
│   ├── App.tsx             # Main routing framework & gate managers
│   ├── main.tsx            # React application bootstrapper
│   └── index.css           # Global custom CSS and Tailwind classes
├── vercel.json             # Vercel SPA client path redirection config
├── index.html              # Main HTML entry point (SEO metadata integrated)
└── package.json            # Active libraries, compilation workflows, and scripts
```

---

## 🔑 Required Vercel Environment Variables
Below variables must be registered manually on Vercel Dashboard Settings to secure communication with other serverless cloud endpoints. Under no circumstances should real secret keys be logged or placed in version controllers.

* `VITE_SUPABASE_URL`: Preallocated endpoint referencing the parent Supabase instance.
* `VITE_SUPABASE_ANON_KEY`: Safe client public cryptographic key for read/write bucket streams.

---

## 🚀 Live Deployment Summary
* **Hosting Platform**: Vercel (Multi-region CDN deployment).
* **Domain Whitelisting**: Firebase Console -> Authentication -> Settings -> Authorized Domains updated with `mvgr-student-resource-hub.vercel.app` to prevent credential drops.
* **Edge Routing Safety**: Custom `vercel.json` rewrite guidelines implemented to safely route all deep direct browser link refetches to the client SPA engine.

---

## ⚠️ MVP Security Architecture & Hardening Guide
> [!WARNING]
> While optimized for rapid prototyping and validation, the **Supabase Storage bucket (`materials-pdfs`) is configured with public properties** and functions alongside low-privilege client-side publishable keys. 
> 
> *Exposure Risk*: Direct link capture allows public material file views.
> 
> **Institutional Production Upgrade Protocol:**
> 1. Toggle storage buckets from **Public** to **Private** inside the Supabase Console.
> 2. Implement an Edge script or a secure backend route to generate temporary, short-lived **Signed URLs** dynamically.
> 3. Enforce client verification parameters: query and validate client bearer **Firebase ID Tokens** at the api gateway before serving signed asset streams.

---

## 🔮 Future Capabilities Roadmap
* **Gemini-Powered Smart Reading Assistant**: Implement server-side LLM processing to auto-generate textbook summaries, key study points, and study quiz cards.
* **Institutional User Management**: Build structural admin panels to manage faculty invite tokens and bulk student registries.
* **Push Notifications Service**: Register service-worker web push alerts to notify students of exam-focused preparation changes.
* **Light / Dark Canvas Toggles**: Add accessible standard color themes for adaptable viewing preferences.
* **Localized PDF Markup**: Incorporate inline PDF annotation tools to take student digital notes on course slides natively.

---

## 📈 Project Status & Sign-off
* **Phase 8 (Live Deployment & Verification)**: **100% COMPLETE & LOCKED**
* **Phase 9 (Presentation & Deliverable Foundation)**: **IN PROGRESS**
* **Validation Build**: All strict build checks and compilers pass with **zero warnings/errors**.
