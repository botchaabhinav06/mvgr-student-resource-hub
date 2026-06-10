# Phase 9.5 — Screenshots Checklist: MVGR Student Resource Hub

This guide provides a structured blueprint and checkbox registry for capturing, naming, and organizing high-resolution screenshots for the standard college project project, PowerPoint slides, and backup viva references.

---

## 🔒 1. Privacy, Credentials, and Asset Rules
When capturing visual assets, maintain standard professional presentation standards. Observe these rules:

*   **No Raw Secret Keys**: Never capture, print, or expose actual configuration codes, absolute private database tokens, or Firebase developer secrets.
*   **No Real Passwords**: When showing login input screens, type placeholder symbols (like `••••••••`) or leave fields unsubmitted for the frame capture.
*   **Use Clean Testing Accounts**: Log in strictly using pre-created demonstration profiles such as `student@mvgr.edu` and `faculty@mvgr.edu`.
*   **Sample Course Material**: Do not use real, copyright-protected, confidential academic publications for image assets. Prepare lightweight, clean sample notes files such as `Engineering_Physics_Unit_1_Handout.pdf`.
*   **Clean Browser Windows**: Capture screens in Incognito/Private window modes or clean browser profiles to hide distracting personal extensions, bookmarks, history, or active search bars.

---

## 📂 2. Suggested Screenshot Naming Convention
A neat directory containing numbered, semantic names keeps things simple for PPT authors and project compilers:

| Index | Recommended File Name | Category | Primary Focus of Visual Proof |
| :--- | :--- | :--- | :--- |
| **01** | `01-landing-login.png` | Client UI | Secure input fields, Cyber-Slate Theme layout |
| **02** | `02-student-dashboard.png` | Student View | Materials directory, navigation bars |
| **03** | `03-search-filters.png` | Student View | Dynamic query searches and department dropdown categories |
| **04** | `04-report-issue-modal.png` | Student View | Interactive defect complaints input form modal |
| **05** | `05-pdf-new-tab.png` | Student View | PDF inline preview rendered inside the browser frame |
| **06** | `06-download-success.png` | Student View | File-saved pop-up confirmation and incremented download counter |
| **07** | `07-faculty-dashboard.png` | Faculty View | Analytical stat metrics widgets showing live values |
| **08** | `08-faculty-uploader.png` | Faculty View | Course meta-input form panel alongside drag-and-drop zone |
| **09** | `09-faculty-reports.png` | Faculty View | Unresolved reports inbox list, resolve buttons |
| **10** | `10-supabase-bucket.png` | Backend Proof | Cloud Console bucket view showinguploaded coursework PDF bytes |
| **11** | `11-firestore-materials.png` | Backend Proof | Firebase console query showing metadata pointers on document |
| **12** | `12-vercel-deployment.png` | Hosting Proof | Complete Vercel platform dashboard displaying active deployment URLs |

---

## 📝 3. Comprehensive Verification Checklists

### Section A: Project Report Submission (Formal Records)
These captures represent the technical pipeline required in printed project report papers:

- [ ] **Secure Portal Entry**: Capture `01-landing-login.png` showing the responsive login gate styled with our modern typography on the dark theme background.
- [ ] **Authorized Student Directory**: Capture `02-student-dashboard.png` displaying available books, files, and navigation tabs.
- [ ] **Search Engine Operation**: Capture `03-search-filters.png` with search terms entered and department filters set, showing responsive matching output.
- [ ] **PDF Preview Handler**: Capture `05-pdf-new-tab.png` showing a sample document streaming cleanly in a standard browser viewer.
- [ ] **Bug Tracking Form**: Capture `04-report-issue-modal.png` with a sample complaint typed and the modal overlay centered.
- [ ] **Faculty Control Console**: Capture `07-faculty-dashboard.png` with metric trackers displaying live data (Documents count, Aggregate downloads).
- [ ] **Resource Publisher**: Capture `08-faculty-uploader.png` with filled fields (Course Code: CSE-305, Subject: Operating Systems) to show data entry controls.
- [ ] **Issues Central Desk**: Capture `09-faculty-reports.png` with student reports laid out sequentially with Action buttons.

---

### Section B: Technical Slides Presentation (PowerPoint Slides)
For a 10-slide PowerPoint project presentation, use compile-optimized high contrast assets:

- [ ] **Slide 1: User Interface Experience**: Insert the Login page (`01-landing-login.png`) next to the Student Dashboard view to illustrate our modern **Cyber-Slate Dark Theme** concept.
- [ ] **Slide 2: Materials Finder**: Embed `03-search-filters.png` to demonstrate responsive client-side sorting and catalog structure.
- [ ] **Slide 3: Faculty Operations**: Overlay the Uploader panel (`08-faculty-uploader.png`) and the Reports dashboard (`09-faculty-reports.png`) to explain institutional coordination rights.
- [ ] **Slide 4: System Integration proof**: Display the Supabase Bucket Console (`10-supabase-bucket.png`) next to the Firestore record structure to demonstrate our cost-effective NoSQL+Blob storage system.
- [ ] **Slide 5: Live URL Verification**: Place a small cropped card of the Vercel live screen (`12-vercel-deployment.png`) displaying the green "Vercel Deployed" certificate.

---

### Section C: Backend Proof and Cloud Consoles (Viva Backbone)
If an evaluator asks, *"Prove that this actually writes to real databases and storage systems, show me the backend data,"* have these images ready:

- [ ] **Supabase Storage Record**: Capture `10-supabase-bucket.png` showing your test PDF residing securely within the `materials-pdfs` namespace.
- [ ] **Firestore Metadata Document**: Capture `11-firestore-materials.png` showcasing database parameters of the uploaded PDF (`previewUrl`, `storagePath`, `fileSize`, `courseCode`) to demonstrate correct database mapping.
- [ ] **Firestore Issue Nodes**: Capture a sub-view in Firestore under the `/reports` collection, showing the document ticket pointing back to the resource record.
- [ ] **Vercel Routing Rewrites**: Capture the deployment dashboard illustrating the active SSL status, connected domains, and the live deployment address.

---

## 🛟 4. High-Value Backup Assets (The Offline Survival Pack)
Always prepare for internet outages during a live demo. Save these backup captures to a dedicated desktop folder named `Project_Demo_Offline_Backups`:

*   **Offline Asset 1**: A short screen-recording (approx. 45 seconds, format `.mp4`) demonstrating typing login credentials and entering student catalogs.
*   **Offline Asset 2**: Live file upload simulation screenshot (including a successful upload pop-up toast).
*   **Offline Asset 3**: Issues resolution simulation screenshot, showing the list count decrementing after resolving a ticket.

---

## 🚀 5. Quick Verification Check
Double-check your compiled visual catalog matching our target design:

- [ ] All screenshot images cropped to remove personal Windows/macOS taskbars, browser bookmark bars, and open private chat windows.
- [ ] Image text is highly legible; browser window is zoomed to clean readability level (recommend 100% or 110%).
- [ ] All files converted and exported directly into standard web formats (`.png` or `.jpg`).
- [ ] No placeholder dummy text or loose developmental printouts exist inside layout regions.
- [ ] Visual indicators match the customized MVGR branding colors cleanly.
