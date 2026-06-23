# MVGR Resource Hub - Final Demo Script

This document provides a structured 5-8 minute demo for the MVGR Student Resource Hub.

---

## 🚀 Introduction (1 min)
"Welcome to the MVGR Student Resource Hub. Our project solves the problem of scattered academic material sharing across student groups. We’ve built a centralized, role-based platform where materials are strictly categorized by department and academic year, ensuring students only access relevant data. The system enforces security via backend-signed R2 storage URLs, meaning no files are public. Let's see the application in action."

---

## 🛠️ Demo Flow (5-8 Mins)

### 1. The Student Experience (2-3 mins)
*   **Login**: Log in as a student using the demo student account.
*   **Dashboard**: Highlight the clean interface.
*   **Current Semester**: Select "Current Semester Material" and show filtered view based on user profile.
*   **All Materials**: Show full department library.
*   **Question Papers**: Access catalog.
*   **Profile**: Demonstrate editing the student year/semester (which immediately updates what materials they can see globally).

### 2. The Faculty Experience (2-3 mins)
*   **Login**: Logout & Log in as faculty.
*   **Upload**: Demonstrate the "Upload Material" flow.
*   **Preview**: Show built-in PDF preview of a newly uploaded material.
*   **Manage**: Show managing existing materials (Edit metadata, Delete material).
*   **Reports Queue**: Check the "Incident Reports" tab to see if students reported broken links. Resolve an item.

### 3. The Admin Experience (1-2 mins)
*   **Login**: Logout & Log in as admin.
*   **User Management**: Show the user directory. Edit a student's academic profile (department/year).
*   **Normalization Tool**: Open the "Data Normalization" tool. Run a dry-run check to verify the integrity of the data.

---

## 🛡️ Security Talking Points
*   **Firebase Auth**: Secure login mechanism.
*   **Firestore Profiles**: Role separation (Student/Faculty/Admin).
*   **Department Locking**: Students strictly cannot view materials from other departments ("Architectural Integrity").
*   **Cloudflare R2**: Private bucket usage.
*   **Signed URLs**: Backend proxying hides raw R2 bucket URLs entirely.
*   **Backend Security**: All sensitive API calls (PDF signed URL generation, user edits) happen in the secured backend.

---

## 💼 Resume/Portfolio Highlights
*   **Full-Stack Development**: Built a complete academic resource portal.
*   **Cloud Architecture**: Designed secure backend signed-URL proxying for private file storage.
*   **Role-Based Access Control**: Implemented complex state-based authorization for multi-user hierarchies.
*   **Admin Utilities**: Developed automated database normalization tools to manage schema drift.
*   **Scalability**: Deployed on Vercel/Render with Firebase caching architectures.
*   **Production QA**: Audited and secured against unauthorized file access.

---

## 🔐 Demo Accounts
*Note: Use placeholders. Never store real passwords.*

* **Student:** `[student-demo@example.com](mailto:student-demo@example.com)`
* **Faculty:** `[faculty-demo@example.com](mailto:faculty-demo@example.com)`
* **Admin:** `[admin-demo@example.com](mailto:admin-demo@example.com)`

*Do not commit real/test passwords here. Store securely.*

---

## 🔧 Troubleshooting Guide
*   **Backend Cold Start**: If the dashboard takes >10s to load the first time, allow the Render backend to wake up.
*   **PDF Preview Fails**: Cloudflare signed URL might have expired. Refresh the page or check the browser network console.
*   **No Materials Visible**: Ensure the student profile year/semester matches the uploaded material metadata.
*   **Login/Profile Missing**: Refresh the Firebase session.
*   **Vercel Errors**: Check Vercel deployment status in the Vercel dashboard.
