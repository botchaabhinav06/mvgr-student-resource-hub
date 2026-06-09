# MVGR Student Resource Hub
## Phase 2 — Project Structure, Routing & Navigation Architecture Blueprint

This document freezes the software navigation topology, structural shell layout patterns, reusable component hierarchy, and interface state definitions for the **MVGR Student Resource Hub**. 

As a Senior Software Architect and technical mentor, I have designed this skeleton system to make it easy for a B.Tech student to construct a highly professional, responsive, and secure routing engine. This architectural design decouples page structure from functional logic, ensuring zero confusion during development.

---

### 1. COMPLETE APPLICATION ROUTING MAP

We employ a unified, declarative, parent-child routing tree mapped by user credentials and roles. Standalone pages bypass dashboard decoration models to provide raw focus grids, while nested sub-pages draw within active grid templates.

```
/ (Root) — Standalone Page Role-Selection Launcher
│
├── /login — System Authentication Login (Context: Student or Faculty based on selection)
│
├──/student — [STUDENT DOMAIN ROOT PARENT PAGE]
│   │   (Requires role: "student")
│   │
│   ├── /student/dashboard — Main Telemetry Feed & Key Overview
│   ├── /student/browse — Master Search catalog & Interactive Filtering Grid
│   ├── /student/view/:materialId — Secure Embedded Screen Cinema PDF Reader
│   ├── /student/downloads — Secure tracker keeping dynamic records of downloaded documents
│   ├── /student/reports — Chronological submission checklist of submitted tickets
│   └── /student/profile — Registered identity profile screen & passcode overrides
│
└── /faculty — [FACULTY/ADMIN DOMAIN ROOT PARENT PAGE]
    │   (Requires role: "faculty" or "admin")
    │
    ├── /faculty/dashboard — Main Command metrics, Active flags count, & Logger feed
    ├── /faculty/upload — Drag-and-drop multipart PDF cataloging desk
    ├── /faculty/manage — Inventory management register table (Update metadata / Soft delete)
    ├── /faculty/reports — Ticket dispatcher workspace queue (Review, Resolve, Dismiss)
    ├── /faculty/analytics — Consolidated document download history charts
    └── /faculty/profile — Faculty authentication credentials configuration
```

---

### 2. SCREEN NAVIGATION FLOW

These maps guarantee that users follow unambiguous, unidirectional journeys through the application with minimal friction and rapid completion rates.

```
STUDENT ROUTING JOURNEY:
[Role Selection (/) ] ──(Click Student)──> [Login Gate (/login) ]
                                                   │
                                          (Validate System Claim)
                                                   │
                                                   ▼
                                        [Student Layout Shell]
                                        ├── /student/dashboard  <═══ (Default landing view)
                                        ├── /student/browse ─── Clicks Card ──> /student/view/:id
                                        ├── /student/downloads
                                        ├── /student/reports
                                        └── /student/profile (User overrides)
                                                   │
                                            (Click Logout)
                                                   │
                                                   ▼
                                         Purge State ──> Redirect /
```

```
FACULTY / ADMIN ROUTING JOURNEY:
[Role Selection (/) ] ──(Click Faculty)──> [Login Gate (/login) ]
                                                   │
                                          (Validate Admin Claim)
                                                   │
                                                   ▼
                                        [Faculty Layout Shell]
                                        ├── /faculty/dashboard  <═══ (Default landing view)
                                        ├── /faculty/upload  ─── On Success ──> /faculty/manage
                                        ├── /faculty/manage
                                        ├── /faculty/reports ─── Review Flags ──> Action Modal
                                        ├── /faculty/analytics
                                        └── /faculty/profile
                                                   │
                                            (Click Logout)
                                                   │
                                                   ▼
                                         Purge State ──> Redirect /
```

---

### 3. GLOBAL LAYOUT STRUCTURE

To maintain maximum code modularity and avoid duplicating layout scaffolding (such as repeating Sidebars or Navbar markings on every page view), the portal utilizes a nested, reusable layout wrapper model.

We divide screens into two architectural layout definitions:

#### A. Standalone Views (No layout wrappers)
* **Target Pages**: `/` (Role Selection Screen), `/login` (Access Gate Terminal).
* **Behavior**: Fills $100\%$ width and height of the window, features no global header or sidebar elements, and is styled as a clean standalone frame centered on the dark void background `#0D1117`.

#### B. Dashboard Layout Shell (Reusable Wrapper Model)
* **Target Pages**: All active child paths nesting under `/student/*` and `/faculty/*`.
* **Component Grid Assembly (CSS Grid/Flex)**:
```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP NAVBAR                                │
├────────────┬───────────────────────────────────────────────────────────┤
│            │                                                           │
│            │                       CONTENT AREA                        │
│            │                                                           │
│  SIDEBAR   │  (Active child views rendered dynamically)               │
│            │   e.g., /student/browse or /faculty/reports               │
│            │                                                           │
│            │                                                           │
└────────────┴───────────────────────────────────────────────────────────┘
```
1. **Desktop Blueprint**:
   - Sidebar: Fixed coordinate positioning on the left side (`w-64`, $260\text{px}$).
   - Right Main Area: Flex container scaling to cover the rest of the layout.
   - Top Header: Sticky row aligned to the top edge (`h-16`, $64\text{px}$).
   - Workspace Plate: Nested area with auto overflow-y controls, framing page modules inside a beautiful, readable scroll screen.

---

### 4. SIDEBAR NAVIGATION SYSTEM

The sidebar serves as the primary navigation anchor. It indicates status context, maintains structural boundaries, and collapses elegantly on small screens to prioritize content.

* **Interaction States**:
  - **Rest State**: Styled in transparent glass overlay, border-right set to `1px solid var(--color-border)`. Links display text in Dust Gray `#9CA3AF`.
  - **Hover Action**: Hovering on an option applies custom borders (`#00E5FF` for student, `#8B5CF6` for faculty/admin) and highlights text coordinates.
  - **Active State Track**: The selected active route is marked by a solid colored icon badge and soft back-flair indicators.

* **Visual Side-by-Side Reference Specs**:

| Visual Property | Student Sidebar State | Faculty/Admin Sidebar State |
| :--- | :--- | :--- |
| **Accent Theme** | Neon Cyan (`#00E5FF`) | Electric Velvet Violet (`#8B5CF6`) |
| **Top Logo Badge** | `MVGR CORE // STUDENT` | `MVGR CORE // ADMIN` |
| **Menu Items** | 1. **Dashboard**<br>2. **Browse Materials**<br>3. **Downloads**<br>4. **Reports**<br>5. **Profile** | 1. **Dashboard**<br>2. **Upload Material**<br>3. **Manage Materials**<br>4. **Reports**<br>5. **Analytics**<br>6. **Profile** |
| **Danger Section** | Red logout button base | Red logout button base |

#### A. Sidebar-Router Correspondence & Click Behavior

To eliminate any chance of broken navigation, route mismatches, or unsaved application states, the sidebar components adhere to a strict static mapping layout. Clicking any sidebar option immediately invokes client-side React Router transitions, changing views without resetting global memory queues.

* **Student Link Definitions**:
  - **Dashboard** ──(Click)──> Navigation: `/student/dashboard` (Landing workspace metrics & student logs)
  - **Browse Materials** ──(Click)──> Navigation: `/student/browse` (Academic catalog & multi-filter search system)
  - **Downloads** ──(Click)──> Navigation: `/student/downloads` (Dedicated screen recording student download history for quick offline-ready re-access)
  - **Reports** ──(Click)──> Navigation: `/student/reports` (Chronological checklist tracking reported complaints)
  - **Profile** ──(Click)──> Navigation: `/student/profile` (Student identity card, roll number registry alignment, passcodes)
  - **Logout** ──(Click)──> Triggers confirmation modal overlay. Confirming clears sessionStorage/localStorage state indicators and executes a hard redirect back to Role Launcher (`/`).

* **Faculty/Admin Link Definitions**:
  - **Dashboard** ──(Click)──> Navigation: `/faculty/dashboard` (Administrative main command metrics, unresolved ticket counts)
  - **Upload Material** ──(Click)──> Navigation: `/faculty/upload` (Drag-and-drop drag zone form mapping target academic fields)
  - **Manage Materials** ──(Click)──> Navigation: `/faculty/manage` (Master tables index catalog facilitating metadata updates/soft deletion)
  - **Reports** ──(Click)──> Navigation: `/faculty/reports` (Real-time dispatcher audit queue tracking pending complaints)
  - **Analytics** ──(Click)──> Navigation: `/faculty/analytics` (Consolidated analytics dashboard charting catalog material download spikes)
  - **Profile** ──(Click)──> Navigation: `/faculty/profile` (Faculty administrator credentials editor)
  - **Logout** ──(Click)──> Triggers confirmation modal and redirects to `/` on prompt approval.

* **Execution Mechanics**: Single-page application router transitions using React Router's internal client links prevent window reloads. On mobile, triggering any selection automatically slides the sidebar closed before launching the view. This design maintains strict alignment between the user's focus and current URL coordinates.

---

### 5. TOP NAVIGATION BAR

The Sticky Top Navbar sits anchored at $z\text{-index: 40}$ and displays system alerts, page coordinates, and quick profile controls.

* **Structure Blocks (Left to Right)**:
  - **Contextual Breadcrumb**: Renders current section location in clean monospace typography (e.g., `HUB / BROWSE / COMPUTER_NETWORKS`).
  - **Status Badge**: Glowing network dot alongside text: `SYS // STABLE`.
  - **Search Bar Shortcut**: Clickable glass plate displaying a search icon and keyboard placeholder `[ Q ]` to invoke global find commands.
  - **Action Hub**:
    - Notification bell showing a small amber circular indicator when reports are submitted.
    - Mini user avatar circle framed in active role colors. Clicking is designed to open a floating dropdown displaying immediate profile shortcuts and logout keys.

---

### 6. COMPONENT HIERARCHY

This modular overview catalogs the structural relationship between component components and their parent shell screens, maintaining absolute visual order.

```
• Layout Shell Wrapper 
  └── Sidebar Controller (Items, collapse states)
  └── Top Header Controller (Breadcrumbs, profile selectors)
  │
  ├── [VIEW] Student Dashboard
  │     ├── Greeting Banner (Roll number & current date stamp)
  │     ├── Stats Cards Array (Downloads count tracker, resolved reports counts)
  │     ├── Recent Material Scroller (Horizontal sliding cards)
  │     └── Announcements Card (Broadcast list from administration)
  │
  ├── [VIEW] Browse Materials Page
  │     ├── Master Search Input
  │     ├── Dropdown Select Bar (Department, Year, Semester, Category)
  │     ├── Material Card Grid (Rendered output cards)
  │     │     ├── Meta Indicators (Department title tag, category badge)
  │     │     └── Primary Action Button Group (Inline preview, download, report)
  │     └── Empty Slate Wrapper (Fallback when filter array yields zero items)
  │
  ├── [VIEW] PDF Viewer Cinema Panel
  │     ├── Back Navigation Anchor
  │     ├── Split-Layout Window
  │     │     ├── Left: PDF IFrame/Object Renderer Box
  │     │     └── Right: Context Actions Dashboard (Title card, uploader info, report toggle, download triggers)
  │     └── Report Overriding Dialogue Modal
  │
  ├── [VIEW] Faculty Console Command View
  │     ├── Overview Telemetry Cards
  │     ├── Live Event Audit Feed (Monospace scrolling system history logs)
  │     └── Unresolved Warning Card Queue (Immediate report counters)
  │
  ├── [VIEW] Drag-and-Drop Uploader Page
  │     ├── Active Input Form (Title inputs, mapping selectors)
  │     ├── Drag Drop Zone Box (Physical file validators)
  │     └── Buffer Progress Indicators
  │
  └── [VIEW] Ticket Resolver Portal
        ├── Status Selection Tab (Pending columns, audit list records)
        └── Ticket Card Component (Issue text details, reporter, resolve action keys)
```

---

### 7. MODAL FLOW STRUCTURE

The application reserves modals strictly for critical alert verification or high-focus parameter inputs (such as file reports). This prevents visual clutter.

```
   [ ACTIVE VISUAL PORTAL LAYOUT ]
                  │
        (Trigger Action Event)
                  │
                  ▼
   [ MOUNTS OVERLAY BACKPLATE ]  ──> (Lock background scrolling)
   ├── CSS: backdrop-filter: blur(8px)
   ├── z-index: 50 (Sits on top of Navbars)
   │
   ├── [ CONTENT DIALOG CARD PANEL ]
   │     ├── Clear Title Header
   │     ├── Form Action Area / Input Area
   │     └── Button Actions Footer: [ Cancel Ghost ]  [ Primary Neon-Cyan Confirm ]
   │
   └── (Click outside context OR press ESC) ──> Purge Modal State
```

#### Modal Definitions Directory:
1. **Student Discrepancy Form (`ReportModal`)**:
   - Opens when the student clicks "Report Issue" on any material card.
   - Requires clicking an explicit reason category (Wrong Mapping, Decayed PDF, etc.), types optional text, and clicks Submit.
2. **Double Confirmation Shield (`DeleteConfirmModal`)**:
   - Gated validation blocking accidental administrative deletions. Prompts the faculty member to write or click confirm before a database delete route is called.
3. **Session Interrupter (`LogoutModal`)**:
   - Prevents sudden session logging interruptions.

---

### 8. RESPONSIVE NAVIGATION PLAN

The user layout system dynamically reshapes based on responsive media breakpoints to support all devices.

```
DESKTOP (w > 1024px)
┌──────────────────────────────────────┐
│ Logo  │ Nav breadcrumbs      Profile │
├───────┼──────────────────────────────┤
│ Nav 1 │                              │
│ Nav 2 │ [ Content Area Frame Grid ]  │
│ Nav 3 │                              │
└───────┴──────────────────────────────┘

TABLET (768px <= w <= 1024px)
┌──────────────────────────────────────┐
│ Logo  │ Nav breadcrumbs      Profile │
├───────┼──────────────────────────────┤
│ [*] 1 │                              │
│ [*] 2 │ [ Content Area Frame Grid ]  │
│ [*] 3 │                              │
└───────┴──────────────────────────────┘

MOBILE (w < 768px)
┌──────────────────────────────────────┐
│ [≡] Hamburger  Logo          Profile │
├──────────────────────────────────────┤
│                                      │
│      [ Content Area Frame Grid ]     │
│       Stacked single-column grid     │
│                                      │
└──────────────────────────────────────┘
```

#### Breakpoint Interaction Specifications:
* **Desktop (`lg` - minimum $1024\text{px}$)**:
  - Sidebar: Permanent expanded configuration (`w-64`) giving direct access to index items.
  - Layout: Wide multilane grids and dashboard tables.
* **Tablet (`md` - between $768\text{px}$ and $1024\text{px}$)**:
  - Sidebar: Autoreduces to symbol ribbon dimensions (`w-20`). Text labels are hidden, displaying clean, responsive Lucide-React icons.
  - Layout: Multi-column tables hide less descriptive parameters (such as uploader user IDs) to prevent scaling overlap.
* **Mobile (below $768\text{px}$)**:
  - Sidebar: Fully hidden out of the viewport bounds.
  - Hamburger Trigger: A floating, high-contrast header includes a hamburger icon (`[≡]`) that slides the sidebar in from the left over the main screen when tapped.
  - Layout: Tables convert into single vertical card blocks to encourage simple, thumb-friendly scrolling.

---

### 9. STATE STRUCTURE (UI ONLY)

Consistency requires defining clean visual feedback loops for all system states. These are mapped using clean placeholder assets.

#### A. Initial Loading Status (Buffer Phase)
* **What user sees**: An elegant central loader element featuring a rotating circle accented in neon cyan, paired with text: `DIAGNOSTIC SYSTEM ACCESSED // LOADING DATA...`
* **Where it occurs**: On first opening pages or applying query search filters on browse grids.

#### B. Complete Empty State (Null State)
To avoid generic loading fatigue or unhelpful system error boundaries, the platform implements localized, high-fidelity empty states customized for specific user interaction contexts:

##### 1. NO MATERIALS FOUND
* **Scenario**: A student adjusts Browse library query filters (Department, Year, Semester, Category) but no files match the selected specifications.
* **Visual Direction**: Styled as a spacious card floating on the grid environment with thin, dust-gray borders. Centers an interactive, semi-transparent search icon (Lucide `SearchSlash` or `FileSearch` at 0.4 opacity) surrounded by a soft, inactive gray ring. Includes helpful supportive messages guiding students to retry wider credentials.
* **Example UI Copy**: `"No materials found for selected filters."`
* **CTA Button Action**: A ghost button displaying `[ Reset Filters ]` or `[ Try changing filters ]` which programmatically clears search text and sets dropdown elements back to "All".
* **Where it appears**: Main body region of `/student/browse` when query results return empty.

##### 2. NO REPORTS FOUND
* **Scenario**: Admin accesses the ticket resolver stream, and all historical student discrepancies have been verified and marked settled (zero active complaints present).
* **Visual Direction**: An extremely calm, clean layout decorated in deep, supportive dark tones. Centers a solid, glowing success badge (Lucide `ShieldCheck` accented inside vibrant `#22C55E` success coordinates), with an integrated soft outer radial halo.
* **Example UI Copy**: `"No active reports."`
* **CTA Button Action**: Non-intrusive status labels displaying `[ Everything looks good. ]` which keeps the manager's cognitive load minimum and reinforces platform health.
* **Where it appears**: Table body grid of `/faculty/reports`.

##### 3. NO UPLOADS YET
* **Scenario**: A newly registered faculty/admin opens their inventory catalogue view, or the overall depository indices are clear.
* **Visual Direction**: Displays a clean, interactive onboarding layout centering a large, dynamic dashed-border area containing a subtle file-plus graphic (Lucide `FolderPlus` in secondary velvet violet). Features spacious vertical margins, guiding the educator step-by-step.
* **Example UI Copy**: `"No materials uploaded yet."`
* **CTA Button Action**: A primary neon button showing `[ Upload First Material ]` which navigates the administrator's workspace straight to `/faculty/upload`.
* **Where it appears**: Frame area of `/faculty/manage`.

#### C. System Confirmation Alerts (Toast Success Phase)
* **What user sees**: A small, floating status box at the top right of the viewport with a neon green border that says: `FILE SYNC SECURED // INVENTORY UPDATED SUCCESS.`
* **Where it occurs**: Transmitted on successful logins, file additions, metadata updates, or resolving student tickets.

#### D. Failure Fallbacks (Operational Failure)
* **What user sees**: An alert box with a crimson border that says: `SYSTEM FAULT DETECTED // WRITE TRANSACTION BLOCKED.`
* **Where it occurs**: Form input errors, expired authorization credentials, or file validation failures.

---

### 10. FRONTEND STRUCTURE & COMPONENT ASSIGNMENTS

Below is the concrete modular directory layout mapping these structural decisions directly to standard frontend page elements:

```
src/
├── main.tsx                    # React client system anchor bootstrap
├── index.css                   # Tailwind cyber-glass design variables reference file
├── types.ts                    # Shared interfaces (Student, Faculty roles, Material category enums)
│
├── layouts/                    # REUSABLE PAGE FRAMEWORK STRUCTURES
│   ├── StandaloneLayout.tsx    # Clean wrapper centered for /login and / views
│   └── DashboardLayout.tsx     # Three-pane layout housing custom Navbar & Sidebar wrappers
│
├── navigation/                 # PATH CONTROLLERS (ROUTER WRAPPERS)
│   ├── AppRouter.tsx           # Maps route path definitions
│   ├── ProtectedRoute.tsx      # Guard checking user roles before rendering children
│   ├── Sidebar.tsx             # Sidebar component rendering links and handles collapse states
│   └── TopNavbar.tsx           # Displays breadcrumbs, status alerts, and search links
│
├── components/                 # REUSABLE GRAPHIC WIDGETS
│   ├── Button.tsx              # Brand custom Button classes (Primary, Ghost, Destructive)
│   ├── Input.tsx               # Glowing form fields with inline show/hide buttons
│   ├── Badge.tsx               # Academic semester indicators and report tags
│   ├── Table.tsx               # Grid inventory table structures for management views
│   └── Toast.tsx               # Pop-up state feedback widgets
│
├── modals/                     # FLOATING OVERLAYS GATING SPECIFIC FORMS
│   ├── ReportModal.tsx         # Ticket discrepancy submission form
│   ├── DeleteConfirmModal.tsx  # Interactive double confirmation blocker for admin deletes
│   └── LogoutConfirmModal.tsx  # Prompts user to double confirm logout request
│
└── views/                      # SENSITIVE WORKSPACE ROOT SCREEN ELEMENTS
    ├── RoleSelectionView.tsx   # Portal launcher (/)
    ├── LoginView.tsx           # Secured system access gate portal (/login)
    │
    ├── student/                # STUDENT WORK ENVIRONMENT SCREENS
    │   ├── DashboardView.tsx   # General metrics, recent materials, and greetings banner
    │   ├── BrowseView.tsx      # Interactive search with custom dropdown dropdown selects
    │   ├── ViewerView.tsx      # Secure split-layout cinema PDF viewer
    │   ├── DownloadsView.tsx   # Dedicated screen for Student download history and quick access
    │   └── ReportsView.tsx     # Student's historic logged discrepancies list
    │
    └── faculty/                # FACULTY ADMINISTRATIVE AREA SCREENS
        ├── ConsoleDashboard.tsx# Administrative overview panel and security logging stream
        ├── UploaderView.tsx    # Drag-and-drop materials upload screen
        ├── InventoryView.tsx   # Master index list of files for editing/purging
        └── TicketsQueueView.tsx# Dispatcher resolver workspace queue for student reports
```
