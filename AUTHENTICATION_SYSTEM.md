# MVGR Student Resource Hub
## Phase 3 — Authentication & User System Architecture Blueprint

This document freezes the complete authentication architecture, data schemas, access matrices, session management models, and security workflows for the **MVGR Student Resource Hub**. 

To maintain high visual standards and absolute security, this system acts as a **"Premium Secure Academic Operating System"** where authorization checks are performed strictly on the backend, using client-side tokens solely as visual flags.

---

### 1. THE CLOSED-ACCOUT PORTAL MODEL

To prevent self-created identity profiles, malicious user registrations, and cluttered document queues, the Resource Hub **prohibits public user registration**. 

* **The Provisioning Policy**: 
  - All accounts (both Students and Faculty) must be **pre-seeded or manually created** inside the platform database.
  - Student rosters are registered using institutional student files provided by the academic registrar.
  - Faculty records are assigned by system administrators.
  - Users enter the system **strictly by logging in** using predetermined institutional credentials.

```
                  NO PUBLIC REGISTRATION DECK
┌─────────────────────────────────────────────────────────────┐
│                       [ DATABASE SCREEN ]                   │
│  ┌────────────────────────┐      ┌────────────────────────┐ │
│  │ Student Institutional  │      │  Faculty Staff         │ │
│  │ Roster Seed Files      │      │  Authorizations        │ │
│  └───────────┬────────────┘      └───────────┬────────────┘ │
│              │                               │              │
│              ▼                               ▼              │
│         [ Account Base Row ]            [ Account Base Row ]│
└──────────────────────┬───────────────────────┬──────────────┘
                       ▼                       ▼
          [ Auth Gate /login ] ───> Checks Active status
```

---

### 2. CORE ACCOUNT SCHEMAS (STRUCTURES)

These structured schemas represent the complete fields mapped for each user type, ensuring scalability for future departmental upgrades.

#### A. Student Account Schema
* **Purpose**: Tracks identity credentials, academic standing, and manages dynamic material filtering.
* **Fields & Specifications**:
  1. `id` (Alphanumeric | Primary Key): System-generated unique identifier.
  2. `fullName` (String): Full academic name (e.g., `"M. Sai Kumar"`).
  3. `registerNumber` (String | Unique Index): Capitalized unique academic roll number (e.g., `"19331A1201"`).
  4. `email` (String | Unique Index): Official college email address (e.g., `"19331a1201@mvgr.edu"`).
  5. `passwordHash` (String): Securely hashed passcode value (strictly non-readable by client views).
  6. `department` (StringEnum): Strictly restricted to frozen academic abbreviations (e.g., `"IT"`, `"CSE"`, `"ECE"`).
  7. `currentYear` (IntegerEnum): Allowed values: `1`, `2`, `3`, `4`.
  8. `currentSemester` (IntegerEnum): Allowed values: `1` or `2`.
  9. `role` (String | Constant): Static value `"student"`.
  10. `profilePhotoUrl` (String | Nullable): File system link or default generic neon avatar placeholder.
  11. `accountStatus` (StringEnum): Active tracking state: `"active"` or `"inactive"`.
  12. `createdAt` (Timestamp): Record creation timestamp.

* **Personalization Engine (Auto-Filtering)**:
  - When a student authenticates, the system reads their `department`, `currentYear`, and `currentSemester`.
  - The Student Dashboard instantly auto-promotes textbook lists matching their immediate path, removing irrelevant files.

#### B. Faculty/Admin Account Schema
* **Purpose**: Holds credentials, controls, designations, and tracks upload records.
* **Fields & Specifications**:
  1. `id` (Alphanumeric | Primary Key): Unique alphanumeric identifier.
  2. `facultyName` (String): Institutional display title (e.g., `"Dr. R. Prasada Rao"`).
  3. `facultyId` (String | Unique Index): Assigned employee identifier (e.g., `"MVGR-FAC-IT-312"`).
  4. `email` (String | Unique Index): Mapped institution email (e.g., `"rprasada.it@mvgr.edu"`).
  5. `passwordHash` (String): Secure hashed credentials record.
  6. `department` (StringEnum): Staff's main academic department (e.g., `"IT"`).
  7. `designation` (String): Display title label (e.g., `"Senior Professor"`, `"Head of Department"`).
  8. `role` (StringEnum): Access privilege boundaries: `"faculty"` or `"admin"`.
  9. `profilePhotoUrl` (String | Nullable): Avatar placeholder.
  10. `accountStatus` (StringEnum): Active tracking state: `"active"` or `"inactive"`.
  11. `createdAt` (Timestamp): Creation datetime tracking.

---

### 3. THE UNIFIED LOGIN PATHWAY

```
[ START: Role Select (/) ] ──── Select Student ───> Set Context State: student
                          ──── Select Faculty ───> Set Context State: faculty
                                   │
                                   ▼
                       [ Render Gateway Screen ]
                       ├── Input: Username / Email
                       └── Input: Password
                                   │
                                   ▼
                       [ POST /api/auth/login ]
                                   │
                    ┌──────────────┴──────────────┐
             (Is email/ID registered?)            │
             ┌──────┴──────┐                      │
         No  ▼             ▼ Yes                  ▼
       Show Bad User   (Is account status 'active'?)
                       ┌──────┴──────┐
                   No  ▼             ▼ Yes
                 Show Inactive   Compare Hashed Passwords
                                 ┌──────┴──────┐
                             No  ▼             ▼ Yes
                           Wrong Pass     Issue Token JWT
                                          Save Local Session State
                                          [ Redirect Dashboard ]
```

#### Verification Steps & Boundary Actions:
1. **Context Initialization**: Clicking any choice on `/` pre-configures input variables. For example, Student View exposes roll number fields, while Faculty View presents employees input frames.
2. **Dynamic Error Intercepts**:
   - **Invalid ID/Email**: Server queries match details. If unmatched, returns `401 Unauthorized` causing front-end toast: `ACCESS RESTRICTED // IDENTIFIER UNREGISTERED`.
   - **Inactive Blockade**: If `accountStatus === "inactive"`, server rejects transaction completely and outputs: `PROFILE SUSPENDED // CONTACT OFFICE ADMINISTRATOR`.
   - **Mismatched Credentials**: Incorrect security input outputs: `DECRYPT FAULT // PASSWORD CHECKS MISMATCH`.

---

### 4. SESSION MANAGEMENT SYSTEM

To keep user environments robust and light, sessions utilize a secure client-token communication framework.

* **Technology Choice**: **JSON Web Tokens (JWT) / Server Session Tokens**
  - Keeps sessions stateless, allowing rapid, lag-free API queries.
* **Storage Mechanisms**:
  - Upon success, the client saves the response payload containing `{ token, userDetails }` directly into `sessionStorage` (for quick automatic closing when tabs close) or `localStorage` (if "Remember Me" is selected, persisting for 7 days).
* **Session Lifecycle Events**:
  - **Expiry (Heartbeat Check)**: Tokens are signed with an active 24-hour expiration window. If an expired token makes a request, the server responds with `401 Unauthorized`. The routing engine catches this, purges cached local memory variables, and switches the user context back to `/login` displaying a warning toast: `SESSION EXPIRED // SYSTEM RE-AUTHORIZED`.
  - **Termination (Logout)**: Clicking Logout deletes active keys from local memory immediately-without waiting for server response timeouts-guaranteeing instant local security.

---

### 5. ROUTE PROTECTION SYSTEM

We isolate Student and Faculty views behind secure, modular Route Guards.

```
Incoming Navigation Route Request (e.g., /faculty/upload)
                 │
      [ Is User Authenticated? ]
         ┌───────┴───────┐
      No ▼               ▼ Yes
 Redirect to /login   [ Matches target role allowance? ]
                         ┌───────┴───────┐
                      No ▼               ▼ Yes
               Redirect /student/dash   ALLOW Render View
               Show 403 Forbidden Toast
```

#### Functional Boundary Enforcement:
1. **The Client Guard (visual isolation)**: Wraps all path entries within `<ProtectedRoute allowedRoles={["faculty", "admin"]} />`. It prevents users from tampering with local state arrays to force layout renders.
2. **The Server Guard (absolute isolation)**: API calls (e.g., `POST /api/materials`) are validated with a separate middleware check. Any role mismatch throws an instant HTTP `403 Forbidden` response.

---

### 6. ROLE-BASED ACCESS CONTROL (RBAC) MATRIX

This strict, non-negotiable matrix details exactly which activities are mapped safely to specific user claims across client page boundaries:

| High-Focus Feature Activity | Student Role Claim | Faculty Role Claim | Admin Role Claim |
| :--- | :---: | :---: | :---: |
| **View Catalog / Filters** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Open & Read PDFs Inline** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Download PDF Document** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Report Document Issues** | ✅ Yes | ❌ No | ❌ No |
| **File Upload (Dropzone)** | ❌ No | ✅ Yes | ✅ Yes |
| **Modify Metadata / Edit Details**| ❌ No | ✅ Yes | ✅ Yes |
| **Hard/Soft Delete Inventory** | ❌ No | ❌ No | ✅ Yes |
| **Resolve Outstanding Complaints**| ❌ No | ✅ Yes | ✅ Yes |
| **Access Audit Activity Logger**| ❌ No | ❌ No | ✅ Yes |

---

### 7. PASSWORDS & SECURITY RECOVERY STRATEGY

For a realistic, simple, yet secure B.Tech framework, we intentionally bypass complicated SMTP-host setups or costly SMS third-party gateway configurations. Instead, we use a secure "Coordinator Reset Platform".

#### A. Secure Password Storage
- Plaintext inputs are converted during administrative data seeds using cryptographic hashing algorithms on the server (e.g., `bcrypt` or secure built-in hashing APIs).
- The raw text password "password123" is never stored in readable text formats on databases or log files.

#### B. The Administrative Recovery Workflow
1. **Forget Password Event**: A student clicks forgot password on the system gate page.
2. **Support Protocol Window**: The portal presents clear, institutional action steps:
   - *"Security Protocol: Reset keys are managed directly by your class coordinator. Please submit requests detailing Name, Roll Number, and target Department to the IT Computer Wing (Room 304) or mail your coordinator for instant code updates."*
3. **Admin Trigger Reset**: Mapped Faculty or System Admins open the target student's profile inside the management system and trigger *"Issue Default Reset Password"* which sets credentials back to temporary values (e.g., `"Mvgr@RollNo"`). This temporary state forces a password change upon the student's next login.

---

### 8. PROFILE WORKSPACE BEHAVIOR

The Profile Screen allows users to manage and view their personal and academic parameters, strictly dividing editable and non-editable parameters to prevent student identity spoofing or grade-evasion attempts.

#### A. Student Profile Workspace Configuration
* **Non-Editable Parameters (Permanently Locked)**: Name, Register Number, College Department. Changing these values requires contacting the main registrar.
* **Editable Fields (Open to Changes)**: Profile photo loading, current Academic Year, current Semester (updates automatically on class shifts), and User Password resetting.

#### B. Faculty Profile Workspace Configuration
* **Non-Editable Fields**: Employee ID Number, Assigned Department, Designation Label.
* **Editable Fields**: Photo, Password, and Dynamic Upload statistics.

---

### 9. DETAILED SECURITY EVENT ERROR DICTIONARY

To maintain a professional, clean user experience, the system utilizes short, standard error feedback responses:

| Security Breach/Fault Scenario | Backend HTTP Status | Local Toast Visual Alert Output |
| :--- | :---: | :--- |
| **Wrong Username Pattern** | `401 Unauthorized` | `IDENTIFIER UNKNOWN // RE-VERIFY LOGIN CREDENTIALS` |
| **Incorrect Passcode Text** | `401 Unauthorized` | `DECRYPT FAULT // SPECIFIED PASSWORD INCORRECT` |
| **Unauthorized Action Code** | `403 Forbidden` | `ACCESS DENIED // ACTION RESTRICTED TO SYSTEM ADMINS` |
| **Accessing Expired Session** | `401 Unauthorized` | `SESSION INTERRUPTED // SECURITY CLEARANCE REVOKED` |
| **Suspended Student Profile** | `403 Forbidden` | `ACCOUNT INACTIVE // CONTACT DEPARTMENT HUBS` |

---

### 10. REALISTIC SEED-MOCK AUTH PREPARATION

To facilitate fast frontend development and testing prior to setting up the production database, the application will pre-seed with the following mock credentials:

```json
[
  {
    "identityContext": "STUDENT TEST PROFILE",
    "email": "student@mvgr.edu",
    "password": "password123",
    "role": "student",
    "registerNo": "19331A1201",
    "department": "IT",
    "year": 3,
    "semester": 2,
    "name": "Botcha Abhinav"
  },
  {
    "identityContext": "FACULTY / ADMIN TEST GATEWAY",
    "email": "faculty.it@mvgr.edu",
    "password": "password123",
    "role": "faculty",
    "facultyId": "MVGR-FAC-IT-01",
    "department": "IT",
    "name": "Dr. Prasada Rao"
  }
]
```
