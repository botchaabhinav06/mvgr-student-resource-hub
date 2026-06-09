# MVGR Student Resource Hub
## Phase 1 — Complete UI/UX Design System & Interface Freeze

This document freezes the complete design token architecture, high-fidelity layout schematics, and interactive user flows for the **MVGR Student Resource Hub**. It guarantees a premium, cyber-modern, high-end dashboard appearance ("Secure Academic Operating System") across all device classes.

---

### 1. THE ARCHITECTURAL MOOD & VISUAL SPECS

The platform is styled to feel like a high-end, responsive telemetry deck. It pairs clean, structured borders with soft, radiant neon glows to represent institutional authority combined with technical edge.

#### A. Central Design Philosophy
* **Cyber-Glassmorphism**: Surfaces layer on top of a deep, pitch-black space using varying opacities and backdrop blurs to establish clear z-axis elevation.
* **Functional Embellishment**: Every neon highlight signifies an action or category state. There are zero unrequested elements or decorative clutter.
* **High Contrast Typography**: Bright, light gray copy rests on top of semi-translucent dark slate backplates to provide optimal readability.

#### B. Color Token System (CSS Root Reference)
```css
:root {
  /* Core brand coordinates */
  --color-primary: #00E5FF;          /* Pure Neon Cyan (Active, Primary CTA, Highlights) */
  --color-secondary: #1E90FF;        /* Electric Blue (Interactive links, Secondary CTAs) */
  --color-accent: #8B5CF6;           /* Velvet Violet (Special filters, Admin Actions) */
  
  /* Semantic Signaling */
  --color-success: #22C55E;          /* Forest Emerald (Approved, Resolved, Saved) */
  --color-warning: #F59E0B;          /* Cyber Amber (Pending report, Warning indicators) */
  --color-danger: #EF4444;           /* Laser Crimson (Discrepancy reported, Delete, Urgent) */
  
  /* Depth Layer Coordinates */
  --color-bg: #0D1117;               /* Outer Void (Pure dark page background) */
  --color-surface: #161B22;          /* Solid Plate (Sidebar bases, Table headers) */
  --color-glass-card: rgba(22, 27, 34, 0.75); /* Translucent Shield */
  --color-glass-overlay: rgba(13, 17, 23, 0.85); /* Modal Backing */
  
  /* Outline Boundaries */
  --color-border: #1F2937;           /* Default Subdued Border */
  --color-border-hover: #374151;     /* Interactive subtle hover border */
  --color-neon-cyan-glow: rgba(0, 229, 255, 0.15); /* Soft outer radial glow */
  --color-neon-blue-glow: rgba(30, 144, 255, 0.15); /* Auxiliary soft glow */
  
  /* Text Value Coordinates */
  --color-text-primary: #E5E7EB;     /* Crisp Silver (Headings, primary values) */
  --color-text-muted: #9CA3AF;       /* Dust Gray (Labels, empty text, secondary dates) */
  --color-text-bright: #FFFFFF;      /* Absolute White (Highlighted titles) */
}
```

#### C. Glassmorphism & Shadow Foundations
* **Main Card Style**: 
  - CSS: `background: var(--color-glass-card); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid var(--color-border);`
* **Glow State**:
  - CSS: `box-shadow: 0 0 20px 0 var(--color-neon-cyan-glow);`
* **Card Corner Radius Standard**:
  - Base Layouts, Sidebars: `16px` (`rounded-2xl` equivalents)
  - Small elements, interactive inputs, buttons, badges: `10px` or `12px` (`rounded-xl` equivalents)

---

### 2. GLOBAL SYSTEM-WIDE COMPONENTS

Every reusable element matches our custom-tailored CSS variables to provide unity across all viewports.

#### A. Interactive Buttons (`Button`)
* **Primary Cyber Button**:
  - *Appearance*: Solid fill `#00E5FF` transition, text `#0D1117` active-weight bold. On hover: shifts to standard cyan shadow outline and subtle color scaling.
  - *Sizing*: Desktop: `px-6 py-3 text-sm font-semibold tracking-wide rounded-xl`. Touch target: Minimum vertical coordinate `48px`.
* **Ghost Subdued Button**:
  - *Appearance*: Border `1px solid var(--color-border)` and transparent filling. Text `var(--color-text-primary)`. On hover: cyan border highlight, background adapts to `rgba(0, 229, 255, 0.05)`.
* **Danger/Destructive Button**:
  - *Appearance*: Solid crimson fill or laser border (`var(--color-danger)`). Text `#FFFFFF`. Backlit glow using laser crimson shadow elements.

#### B. Data Inputs & Search Plates (`Input`)
* **Cyber Input Element**:
  - *Appearance*: Flat surface fill `var(--color-surface)` with thin grid borders (`#1F2937`). Font family `Inter` with mono values if inputting register numbers.
  - *Interactive States*: On focus, the border turns neon cyan (`#00E5FF`) paired with a high-fidelity internal glow. Plain placeholder texts are styled in dust gray `var(--color-text-muted)`.

#### C. Filtering Dropdowns (`Select`)
* **Dropdown Selection Plates**:
  - *Appearance*: Flat cards with embedded double-chevron arrows styled in neon cyan. Dynamic lists have standard borders mapping cleanly over background structures. Contains zero generic operating system styling behaviors.

#### D. Badges & Tags (`Badge`)
* **Academic/Status Badges**:
  - Fully rounded pills (`rounded-full`) styled with translucent background and solid borders showing bright colors:
    - *Mid 1 Exam*: Cyan background with bright borders.
    - *Syllabus Pattern*: Velvet violet tags.
    - *Dismissed report*: Forest emerald borders.
    - *Pending issue flags*: Warning amber.

#### E. Command Tables & Data Grids (`Table`)
* **Table Architecture**:
  - Header: Subdivided rows anchored on pure `#161B22` background colors. Titles are presented in uppercase `var(--color-text-muted)` displaying a track spacer.
  - Body columns: Framed by clean, light `#1F2937` horizontal cell separators. Hovering on any line causes a soft background light amplification.

#### F. Dialog Modals (`Modal`)
* **Overlay Gating**:
  - A heavy opaque modal backdrop (`backdrop-filter: blur(8px)`) blocks the background screen interaction completely.
  - Modals slide up elegantly from the baseline with thin neon framing borders keeping layout controls crisp and clear.

#### G. System Status Alerts (`Toasts / Toast`)
* **Notification Pop-ups**:
  - Anchored on the top-right corner of wide screens, or flat full-widths on mobile. Contains an integrated custom SVG vector badge representing progress (Success context: Cyan; Failure/Rollback: Red).

---

### 3. COMPREHENSIVE SCREEN-BY-SCREEN LAYOUTS

#### 🎓 1. ROLE SELECTION PAGE
* **Focus Scenario**: Central gateway directing the academic actor immediately to their target login terminal.
```
┌────────────────────────────────────────────────────────┐
│                      MVGR CYBER CORE                   │
│                    [ RESOURCE HUB ]                    │
│                                                        │
│        ┌──────────────────┐      ┌──────────────────┐  │
│        │  STUDENT PORTAL  │      │  FACULTY GATES   │  │
│        │  🎓              │      │  🛠               │  │
│        │  Access Archives │      │  Manage Registry │  │
│        └──────────────────┘      └──────────────────┘  │
│                                                        │
│                  MVGR College Autonomous               │
└────────────────────────────────────────────────────────┘
```
* **Layout Grid**: Two-column responsive bento layout centering perfectly inside the screen. On mobile, stack columns vertically with generous margin gaps.
* **Component Styling**:
  - Interactive cards shaped via 18px corners. Displays a light gray icon at rest which blooms with neon cyan glow when selected.
  - Text: Heading utilizes tracking-tight displaying strict uppercase branding accents.

#### 🔐 2. SYSTEM LOGIN TERMINAL (Access Gate)
* **Focus Scenario**: High-security, minimal access terminal.
* **Layout Design**: Styled as a compact, floating vertical card `max-w-md` centered on the dark void background canvas.
* **Core Elements & Interactive States**:
  - **Dynamic Title Header**: Includes an active role chip marker at the top indicating whether user logs in as `[Student Security]` or `[Faculty Gatekeeper]`.
  - **Credential Inputs**: Integrated toggle icons for eye-slits to show/hide passcodes. Field inputs auto-focus with instant glowing borders.
  - **Terminal Link**: An auxiliary link below the card for forgot-password placeholders.

#### 📂 3. STUDENT DASHBOARD
* **Structure Layout**: Core visual grid utilizing sidebar layout patterns:
  - **Desktop Screen**: 260px fixed width left sidebar panel containing active icon indicators. Centered work frame scales dynamically using auto-grid maps.
  - **Tablet Layout**: Collapsed icon panel sidebar freeing responsive grid width.
  - **Mobile Layout**: Responsive hamburger trigger popping out the control panel overlay from the left edge.
* **Dashboard Widgets**:
  - **Greetings Banner Panel**: Horizontal card framing high-end greets: `"STUDENT SECURE ACTIVE // ROLL: 19331A1201"`. Displays current date-stamp indicators.
  - **Quick Search Row**: Elegant text index allowing immediate string scanning over titles.
  - **Telemetry Grid**: Cards rendering dynamic system indicators including "Academic Announcements" and most downloaded items of the current week.

#### 🔍 4. BROWSE MATERIALS PAGE
* **Filtering Interface Focus**: Zero clutter, instant visual filtering engine.
```
┌────────────────────────────────────────────────────────┐
│  Search materials...                              [Q]  │
├────────────────├───────────────├──────────────├────────┤
│  ▲ DEPT        │  ▲ YEAR       │  ▲ SEMESTER  │  ▲ CAT  │
├────────────────┴───────────────┴──────────────┴────────┤
│ ┌────────────────────────────────────────────────────┐ │
│ │  Compiler Design Notes       │ IT  │ 3-II  │ Notes │ │
│ │  Uploaded 22 May 2026        └───▲─────────────▲───┘ │
│ │  [Preview PDF]                       [Download PDF]│ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```
* **Control Filters Interface**: A horizontal control dock spanning four responsive dropdown selectors (Department -> Year -> Semester -> Material Category) framed in thin borders.
* **Interactive Material Card**:
  - Renders document titles in absolute white text for pristine readability.
  - Sub-badges display active metadata criteria mapped accurately on the left side.
  - Control action triggers grouped on the bottom row: Inline viewing is styled in Neon Cyan; Downloads use secondary blue accents; Issues/Complaints utilize a laser warning indicator.

#### 📄 5. PREMIUM PDF VIEWER PAGE
* **Visual Frame**: The page transitions into an immersive, deep charcoal cinema reader box to prioritize student reading comfort.
* **Layout Design**: Split-column arrangement:
  - **Left Window (80% Grid width)**: High-resolution iframe/viewer with clean, non-obtrusive dark canvas frames. It displays custom loading progress symbols to reflect files buffering from local directories.
  - **Right Window (20% Grid width)**: Floating control plate. Housing title labels, mapped administrator identity credentials, immediate download triggers, and the critical flag/issue action buttons.

#### ⚙️ 6. FACULTY CENTRAL CONSOLE
* **Dashboard Structure**: Uses the central dashboard sidebar framework but activates an alternative panel profile color claim (Secondary Velvet Violet elements instead of Cyan highlights to denote administrative configuration).
* **Analytics Telemetry Cards**:
  - **Inventory Metrics Card**: Displays total document inventories uploaded. Includes spark-style indicators highlighting scaling numbers.
  - **Report Queue Health**: Renders a warning red badge tracking unresolved student reports.
  - **System Logger Log**: Chronological audit feed tracing actions under crisp monospace text views.

#### 📤 7. DOCUMENT UPLOAD CENTER
* **Upload Interactive Mechanics**:
  - Standardized Drag-and-Drop Dropzone styled with dynamic dashed borders indicating targeted inputs. Dropping files transforms normal structures into glowing file preview indicators matching the metadata inputs below.
  - Relational mapping selectors are laid out below as simple form input zones so administrators map targets (Department and Academic levels) without confusion.

#### 🔧 8. INVENTORY CATALOG MANAGE PAGE
* **Structural Layout**: Grid structures are replaced by clean master inventory lists designed to resemble automated registers.
* **Table Rows**: Columns represent metadata mappings correctly aligned with action blocks (Edit pen controls paired with destructive delete vectors).

#### 🚨 9. INCIDENT REPORT RESOLVER QUEUE
* **Ticket Board Layout**: Warning cases are organized inside modular status columns representing queue queues: `[Pending Inspection]` and `[Resolved Logs]`.
* **Individual Card Layout**: Showcases the reported document title, the reporting student's details, the category label (e.g., Wrong Mapping or Broken File), and the student's optional description. Action buttons at the base map immediately to `"Mark Resolved"` (Green) or `"Dismiss Ticket"` (Muted).

#### 👤 10. PROFILE PORTAL SCREEN
* **Visual Frame Layout**: Centered card presenting user details. Features a circular avatar frame containing a glowing border representing the active access role status. Columns clearly present Roll IDs, official Email addresses, and mapped departments under pristine spacing.

---

### 4. THE COMPONENT NAVIGATION MAP

The platform operates via a stateless layout manager, shifting the core context seamlessly based on active menu targets.

```
                  [ PUBLIC / SELECTION ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
    [Student Portal]                   [Faculty Portal]
            │                                 │
     (Authenticate)                    (Authenticate)
            │                                 │
            ▼                                 ▼
   [STUDENT NAVIGATION]              [FACULTY CENTRAL]
   ├── Dashboard                     ├── Dashboard Overview
   ├── Search & Filter Library       ├── Drag-and-Drop Uploader
   ├── PDF Fullscreen Reader         ├── Academic Inventory Catalog
   ├── Submission Desk (Report)      ├── Student Incident Queue
   └── Student Profile               └── Administrator Logs
```

---

### 5. RESPONSIVE GRID BEHAVIOR (Adaptive UI Specs)

To guarantee that MVGR students can reference files seamlessly from desktop devices, library tablets, or simple mobile phones waiting in line at registrar offices, we define clear breakpoint adaptations:

| Screen Context | Target Width boundaries | Layout Adjustments | Navigation Interaction |
| :--- | :--- | :--- | :--- |
| **Desktop / Wide Screen** | `> 1024px` | Unified 3-column layouts. Active sidebars remain fully expanded (`w-64`) on the viewport edge. | Permanent left-column grid controls. Desktop view cursor hover animations active. |
| **Tablet View** | `768px - 1024px` | 2-column active panels. Left sidebar collapses down into a compact `w-20` action ribbon showing only icons. | Single touch icons. Table lists wrap columns cleanly. |
| **Mobile Screen** | `< 768px` | Single column stacked layouts. Grid tables transform into vertical mobile-friendly lists to prevent truncation. | Hidden sidebar menu, toggled via a floating hamburger active menu overlay. Touch targets scale to continuous `48px` dimensions. |

---

### 6. DETAILED MOTION & TRANSITION BEHAVIOR

We integrate subtle, high-fidelity micro-animations using React's modern `motion` compiler to denote state changes smoothly.

1. **Card Hover Shift**:
   - *Behavior*: Hovering on components triggers a smooth 0.3-second lift.
   - *CSS/Motion*: `scale: 1.02; border-color: var(--color-primary); box-shadow: 0 4px 20px rgba(0, 229, 255, 0.15);`
2. **Page Transitions**:
   - *Behavior*: When switching views, components fade and slide up slightly to establish vertical entering rhythm.
   - *Motion Directive*: `initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}`
3. **Queue Status Toggle**:
   - *Behavior*: Transitioning tickets from active to resolved fades individual cards seamlessly to the left before deleting the height profile.

---

### 7. HUMAN ACCESSIBILITY & CONTRAST STATEMENTS (AA Compliant Dark Mode)

* **Contrast Integrity**: We strictly adhere to WCAG AA-compliant visual guidelines to support students who have visual impairments or operate inside low-lighting library rooms.
* **Strict Guideline**: Text coordinates never match the dark void `#0D1117` directly without clean color spaces. Small text blocks are restricted permanently to the bright dust gray `#9CA3AF` or silver-white `#E5E7EB` to keep the digital context legible.
* **Target Actions**: Secondary interactive links provide a noticeable, high-contrast glow on hovering, avoiding basic visual confusion.
