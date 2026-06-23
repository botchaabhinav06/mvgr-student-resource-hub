# Portfolio Project Writeup: MVGR Student Resource Hub

## Short Summary
A secure, full-stack academic resource management platform tailored for MVGR College of Engineering, designed to centralize and protect course materials while enforcing strict role-based access control.

## Problem Statement
Students faced disorganized, fragmented file sharing across various messaging platforms, leading to confusion, outdated materials, and unauthorized access to course documents.

## Solution Summary
We developed a centralized, production-grade web portal where materials are organized by department, year, and semester. The system ensures data integrity and security through Firebase-backed role authorization and backend-proxy signed URLs for file storage.

## Key Features
* **Role-Based Access Control (RBAC)**: Distinct dashboards for Students, Faculty, and Admins.
* **Secure File Management**: Private storage in Cloudflare R2, accessed only via secure backend-generated signed URLs.
* **Academic Scoping**: Automatic department and semester-based filtering of materials for students.
* **Admin Governance**: Comprehensive tools for user management and database normalization.
* **Incident Reporting**: Real-time discrepancy reporting for faculty review.

## Security Highlights
* **Firebase Authentication**: Ensures verified identities.
* **Firestore Data Protection**: Secure profile storage and role enforcement.
* **Private R2 Storage**: Files are never public.
* **Backend-Proxied Signed URLs**: Hides R2 access keys, prevents unauthorized file downloads.
* **Departmental Isolation**: Students are strictly prohibited from viewing materials outside their department.

## Tech Stack
* **Frontend**: React + TypeScript (Vite + Tailwind CSS).
* **Backend**: Node.js + Express.
* **Database**: Firebase Firestore.
* **Storage**: Cloudflare R2.
* **Auth**: Firebase Auth.
* **Deployment**: Vercel (Frontend), Render (Backend).

## Impact
The platform establishes a structured, secure, and reliable academic ecosystem, significantly reducing material lookup time and improving access control for over 1,000+ potential users.

## Future Scope
* **AI-Powered Insights**: Material summarization and smart quiz generation.
* **Analytics Dashboard**: Engagement tracking for faculty.
* **Enhanced Reporting**: Automated material accessibility audits.
