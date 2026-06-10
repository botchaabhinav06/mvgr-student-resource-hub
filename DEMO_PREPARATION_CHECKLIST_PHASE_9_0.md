# Phase 9.0 — Demo Preparation Checklist: MVGR Student Resource Hub

This document is designed to guide student presenters, internal evaluators, and project coordinators through a flawless live test, demonstration, and validation sequence of the deployed platform.

---

## 1. System Access & Environment Verification

Before running a live demonstration, ensure that all critical cloud resources and variables are online and matching expected properties:

- [ ] **Live System Probe**: Open [https://mvgr-student-resource-hub.vercel.app](https://mvgr-student-resource-hub.vercel.app) and confirm that the login layout renders immediately.
- [ ] **Internet Connection Check**: Ensure stable connectivity; the systems make active socket connections to Firebase and Supabase.
- [ ] **Local Storage Clean Slate (Optional)**: If you had previous sessions active, clear browser cookies or open the page in an Incognito/Private window for a clean-slate user demo.

---

## 2. Pre-Created Testing Credentials

Store and write down these predefined accounts in your presenter index cards beforehand. Since registration is locked to pre-seeded users in college platforms, use valid mock student and faculty parameters:

| Account Type | Mock Email Login | Mock Password | Expected Dashboard Layout |
| :--- | :--- | :--- | :--- |
| **Student** | `student@mvgr.edu` | *(Standard Core Password)* | Student portal with Browse Materials, My Downloads, and File Reports |
| **Faculty Coordinator**| `faculty@mvgr.edu` | *(Standard Core Password)* | Faculty dashboard with stats cards, Upload panel, Materials management, and Reports inbox |

---

## 3. Step-by-Step Live Demo Narrative

A structured demo flow prevents confusion, displays every aspect of the technology stack, and focuses the jury's attention on your engineering excellence. Follow this timeline:

### A. Core Authentication & Security
1.  **Student Sign-In**: Enter `student@mvgr.edu` credentials, submit, and display the smooth entrance transition.
2.  **Verify Gate Barriers**: Try to manually navigate your browser URL path to `/faculty` or `/faculty/upload`. Show that the application's React Router guards instantly intercept the breach and redirect you back safely.

### B. Student Catalog Discovery & Interface
1.  **Browse Interface**: Emphasize the beautiful **Cyber-Slate Dark Theme**, highlighting the comfortable, eye-friendly layout.
2.  **Searching & Department Filter**: Use the Search field to find a specific keyword (e.g., "Physics"). Show how the materials list filters instantly. Change the department dropdown (e.g., "CSE") and confirm responsive state updates.

### C. Live Document Viewing & Testing
1.  **Open in New Tab**: Locate a sample PDF material. Hover and click the **Open in New Tab** button. Point out that the custom link streams directly to the browser view.
2.  **Direct Download Stream + Telemetry**: Click the **Download** button. Notice that the system downloads the file directly to your computer.
3.  **Telemetry Lock Check**: Look back at the material card. Show that the **Downloads Metric Counter** has successfully incremented by `+1` (proving reactive sync is functioning).

### D. Writing a Defect Issue Report onward to Firestore
1.  **Create Custom Report**: On the same document card, click the **Report Issue** flag.
2.  **Form Validation**: Type a specific message (e.g., "Incorrect practice formulas on Section B, Page 4"). Click submit and observe the success notification.

### E. Faculty Oversight & Management Dashboard
1.  **Swap Credentials**: Log out of the Student panel, and sign back in using `faculty@mvgr.edu`.
2.  **Analytical Telemetry**: Point out the Faculty Dashboard widgets. Note the updated count of overall system materials, aggregate downloads, and unresolved complaints.
3.  **Review Student Complaints**: Head to the **Faculty Reports** panel. Observe that the exact report submitted by the Student in step D is present in the list.
4.  **Resolve Flag**: Click **Resolve** or **Dismiss**. Show that the item disappears from the feed on state update.

### F. Uploading New verified Course Assets
1.  **Upload Portal**: Navigate to **Faculty Upload**.
2.  **File Selection**: Drag and drop a valid, clean sample PDF file or select it using the browser file finder.
3.  **Parameters Entry**: Fill in the required metadata fields: Title, Course Code, Department Category, and Year.
4.  **Publish**: Click the primary submit button. Emphasize that the system concurrently:
    *   Uploads the file binary smoothly to Supabase Storage `materials-pdfs`.
    *   Generates a safe pointer index map inside Firestore.
5.  **Verify Result**: Navigate to **Manage Materials** directory and verify that the uploaded entry is registered.

### G. Complete Deletion Safeguards (Destructive Actions)
1.  **Delete Flow**: On the **Manage Materials** page, find the test resource you just uploaded. Click the **Delete** button.
2.  **Backend Cleanup Verification**: Explain that the deletion cleanly purges the Firestore metadata document and simultaneously deletes the corresponding binary inside the Supabase Storage bucket, ensuring zero cloud storage waste.

---

## 4. Troubleshooting & Fallback Guide

If an issue arises during a physical evaluation or live presentation, do not panic! Follow these standard fixes:

*   **Error: "Missing and insufficient permissions" (Firebase)**: Ensure you are logged in with the correct account. If necessary, log out and log back in to refresh token synchronization.
*   **Failed to Download PDF**: Check browser ad-blockers or security extensions; some aggressive configurations block external cross-origin media redirects. Run the page inside clean Guest profile windows to resolve.
*   **Vercel refresh fallback safety**: Refreshing a non-root page (like `/student/browse`) works flawlessly due to the routing fallback rewrite policy defined inside `/vercel.json`.
