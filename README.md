# MVGR Student Resource Hub
A secure full-stack academic resource hub for students, faculty, and admins with Firebase Auth, Firestore, Cloudflare R2 private PDF storage, and role-based access.

---

## 📸 Screenshots
<!-- Add screenshot: Student Dashboard -->
<!-- Add screenshot: Current Semester Materials -->
<!-- Add screenshot: All Materials -->
<!-- Add screenshot: Faculty Manage Materials -->
<!-- Add screenshot: Admin User Management -->

---

## 📌 Project Overview
The MVGR Student Resource Hub is a secure, role-authorized web platform designed to streamline the academic resource lifecycle. It replaces disorganized file sharing with a single source of truth for study materials.

### Problem Statement
Students faced disorganized, fragmented file sharing across various messaging platforms, leading to confusion, outdated materials, and unauthorized access to course documents.

### Solution Summary
A centralized, production-grade web portal where materials are organized by department, year, and semester. The system ensures data integrity and security through Firebase-backed role authorization and backend-proxy signed URLs for file storage.

---

## 🚀 Live Demo
- **Platform**: [https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app)

---

## 🎯 Key Features & Role-Based Access
### Student
* **Personalized Dashboard**: View relevant materials based on department and current semester.
* **Question Papers**: Organized access to previous question papers.
* **Profile Management**: Update academic details to filter relevant resources.

### Faculty
* **Material Upload**: Streamlined cataloging of study materials and question papers.
* **Catalog Management**: Edit metadata, preview PDFs, and delete outdated content.
* **Discrepancy Reporting**: Handle student-reported issues via an incident queue.

### Admin
* **User Governance**: Oversee user rosters and academic profiles.
* **Normalization Tools**: Diagnostic tools to maintain database integrity.

---

## 🛠️ Architecture & Security
### Technology Stack
* **Frontend/Backend**: React 19, TypeScript, Express.js.
* **Auth/Database**: Firebase Auth, Firestore.
* **Storage**: Private Cloudflare R2 bucket.
* **Deployment**: Vercel (FE), Render (BE).

### Security Architecture
* **Signed URLs**: Backend-proxied signed URLs protect R2 storage, preventing unauthorized access.
* **Role-Based Access (RBAC)**: Secure Firebase Auth/Firestore implementation.
* **Department Locking**: Students strictly limited to relevant materials.
* **Backend-Only Secrets**: No secrets exposed in the frontend.

---

## 📄 Documentation & Demo
- [Security Audit](./SECURITY.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [User Guide](./USER_GUIDE.md)
- [Demo Script](./DEMO_SCRIPT.md)
- [Demo Checklist](./DEMO_CHECKLIST.md)

---

## 🔮 Future Roadmap (AI Integration)
* **PDF Summarizer**: AI-powered quick summaries.
* **Smart Quiz Generator**: Generate practice questions from materials.
* **Chatbot Assistant**: Natural language Q&A for course materials.

---

## 📝 GitHub Repository Description Suggestion
"A secure full-stack academic resource hub for students, faculty, and admins with Firebase Auth, Firestore, Cloudflare R2 private PDF storage, and role-based access."

---

## 🏗️ Project Status
- **Status**: Stable Production.
- **AI Features**: Future Scope.
