# MVGR Student Resource Hub

A secure, centralized academic resource sharing platform for the **Maharaj Vijayaram Gajapathi Raj (MVGR) College of Engineering**.

---

## 🚀 Live Production
- **Platform**: [https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app)
- **Status**: Live deployed and production-ready.

---

## 📌 Project Overview
The MVGR Student Resource Hub is a secure, role-authorized web platform designed to streamline the academic resource lifecycle. It replaces disorganized file sharing with a single source of truth for study materials.

---

## 🎯 Key Features
* **Role-Based Access**: Specialized views and capabilities for Students, Faculty, and Admins.
* **Streamlined Material Management**: Efficient uploading, cataloging, and deletion processes for faculty.
* **Safe Resource Access**: Backend-mediated secure access to PDF materials via Cloudflare R2 signed URLs.
* **Interactive Browsing**: Department-filtered browsing, year/semester scoping, and inline PDF/download capability.
* **Academic Integrity**: Department locking for students to prevent unauthorized cross-department access.
* **Admin Controls**: Safe user management, profile normalization, and diagnostic tools.

---

## 🛠️ Tech Stack & System Architecture
* **Frontend/Backend Web**: React 19 + TypeScript (Vite/Vercel)
* **Storage Layer**: Cloudflare R2
* **Auth/Database**: Google Firebase (Auth & Firestore)
* **Infrastructure**: Multi-region CDN deployment.

For detailed folder structure, workflows, and security, see `SECURITY.md`, `DEPLOYMENT.md`, and `USER_GUIDE.md`.

---

## 🔮 Project Status & Roadmap
The project is currently in a stable production state (Phase 11.4).
- **Completed**: Auth, Material Management, Admin Tools, R2 integration, Security Hardening.
- **Future Scope**: AI-Powered Reading Assistant, Smart Quiz generator, Analytics, and Advanced Reporting.

See `ROADMAP.md` for full details.
