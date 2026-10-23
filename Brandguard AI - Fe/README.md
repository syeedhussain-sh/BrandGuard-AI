# BrandGuard AI — Frontend Platform

**BrandGuard AI** is an Intelligent Brand Governance Platform built for enterprise brand compliance, marketing copy auditing, forbidden terminology detection, tone consistency verification, and instant corrective copy synthesis.

Developed by **Member 1 (Frontend Lead)** for the national-level hackathon.

---

## 🌟 Key Features & Pages

### 1. Executive Governance Dashboard
- **BrandGuard AI Brand Header & Navigation**: Instant access to all governance sub-modules.
- **Real-time Overview Cards**:
  - **Total Analyses**: Count of evaluated documents.
  - **Issues Detected**: High, medium, and low severity issue counters.
  - **Content Audited**: Cumulative word count and character metrics.
  - **Compliance Health Index**: Brand adherence percentage score.
- **Recent Analyses Section**: Interactive audit history table with brand badges, issue counts, timestamps, and direct "View Report" navigation.
- **Active Brand Policy Snapshot**: Live overview of NovaTech guidelines and quick-start links.

### 2. Brand Guidelines
- **Demo Brand (NovaTech)**: Out-of-the-box support for *NovaTech Dynamics Corp.*
- **Comprehensive Policy Controls**:
  - Official Brand Name & Mission Statement.
  - **Preferred Terminology**: Contextual enterprise replacement dictionary (e.g., "AI assistant" → "AI Co-pilot", "cheap" → "Cost-effective").
  - **Restricted Phrases**: Immediate High-Severity violation triggers (e.g., "guaranteed 100% bug-free", "unbreakable security").
  - **Required Terms & Disclaimers**: Mandatory disclosures (e.g., "Enterprise-grade", "SOC 2 Type II Certified").
  - **Tone Guidelines**: Core voice attributes with explicit "DO" and "DON'T" examples.
  - **Approved Facts & Verified Claims**: Cleared corporate statistics and compliance disclosures.
- **Interactive Editing**: Add and remove terms, edit fields, and save changes via `PUT /api/brands/:brandId`.
- **Reset Demo**: One-click restore to official baseline settings.

### 3. Content Checker
- **Brand Selector**: Dropdown to select brand profile (loads dynamically from `GET /api/brands`).
- **Marketing Copy Input**: Multi-line copy input with real-time character and word count tracking.
- **1-Click Demo Presets**:
  - *High-Violation Marketing Draft* (tests forbidden terms, superlatives, and non-standard lexicon).
  - *Partially Compliant Announcement* (tests terminology drift and missing disclaimers).
  - *Clean Compliant Enterprise Copy* (tests 100% compliant copy).
- **Validation**: Strict client-side validation ensuring non-empty copy, minimum length, and brand selection.
- **Submit Action**: Calls `POST /api/analyze` with animated processing state and seamless transition to results.

### 4. Analysis Results & Diagnostics
- **Severity Breakdown**: Color-coded badges and KPI counters for Total, High, Medium, and Low severity issues.
- **Detailed Diagnostics**:
  - Category classification tag.
  - Severity level (`high`, `medium`, `low`).
  - Matched trigger text quote.
  - Governance policy explanation.
  - Recommended action/correction.
- **Auto-Corrected Content Card**:
  - Previews synthesized brand-compliant copy.
  - **Copy Corrected Content Button**: Working one-click clipboard copy with visual "Copied!" feedback and toast alerts.
  - **View Modes**: Switch between Corrected Copy, Original Copy, and Side-by-Side Comparison.
- **Return Action**: "Return to Content Checker" button for seamless workflow loop.

---

## 🛠️ Technology Stack
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with custom Enterprise Dark Slate design system (no Tailwind dependency)
- **Icons**: Lucide React
- **Network Layer**: Native Fetch API with timeout handling and AbortController

---

## 🔌 Shared Backend API Contract

The frontend connects to the shared backend at `http://localhost:5000` (or configured via `VITE_API_BASE_URL`):

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Backend health and ping verification |
| `/api/brands` | `GET` | List all brand summaries |
| `/api/brands/:brandId` | `GET` | Fetch detailed guidelines for a brand |
| `/api/brands/:brandId` | `PUT` | Save updated brand guidelines |
| `/api/analyze` | `POST` | Audit marketing content against brand policies |

### Analyze Content Request Format:
```json
{
  "brandId": "demo-brand",
  "content": "Text entered by the user"
}
```

### Analyze Content Expected Response Format:
```json
{
  "success": true,
  "analysisId": "string",
  "summary": {
    "totalIssues": 0,
    "high": 0,
    "medium": 0,
    "low": 0
  },
  "issues": [
    {
      "id": "string",
      "category": "terminology",
      "severity": "high",
      "matchedText": "string",
      "explanation": "string",
      "suggestion": "string"
    }
  ],
  "correctedContent": "string",
  "analysisMode": "rules"
}
```

---

## 🧪 Isolated Development Mock Adapter (Offline UI Testing)

To allow judges, teammates, and evaluators to test all UI workflows when the separate backend is not running:
- The frontend features an **isolated, explicitly labeled Development Mock Adapter** (`frontend/src/services/mockAdapter.ts`).
- Toggle between **Live Backend** and **Dev Mock Mode** using the switch located at the bottom of the sidebar.
- When backend is offline, an informative banner appears explaining that the backend at `http://localhost:5000` is unreachable, with an option to activate Dev Mock Mode or retry the ping.
- The real API client (`frontend/src/services/api.ts`) remains clean, strictly adhering to the contract without fake fallbacks mixed into production code.

---

## 🚀 Setup & Running Instructions

### Prerequisites
- Node.js (v18+ or v20+ recommended)
- npm

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment (Optional)
The application defaults to `http://localhost:5000`. You can configure a different backend URL in `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run Development Server
From the `frontend` folder:
```bash
npm run dev
```
Or from the workspace root:
```bash
npm run dev
```

### 4. Build for Production
```bash
cd frontend
npm run build
```

The production bundle will be generated in `frontend/dist/`.

---

## 📁 Project Architecture & File Organization
```
Brandguard AI - Fe/
├── package.json               # Root convenience runner
├── README.md                  # Master documentation
└── frontend/
    ├── .env                   # Environment config (VITE_API_BASE_URL)
    ├── .env.example           # Example environment template
    ├── index.html             # HTML entry with metadata & favicon
    ├── package.json           # Frontend package dependencies & scripts
    ├── tsconfig.json          # TypeScript root config
    ├── tsconfig.app.json      # App TypeScript compilation config
    ├── vite.config.ts         # Vite build configuration
    └── src/
        ├── App.tsx            # Main application layout & page router
        ├── App.css            # Responsive layout & component stylesheets
        ├── index.css          # Design tokens & dark slate CSS system
        ├── main.tsx           # React entry point
        ├── types/             # Shared TypeScript interfaces
        │   ├── brand.ts       # BrandGuidelines & BrandSummary types
        │   ├── analysis.ts    # AnalysisRequest, AnalysisResponse, AnalysisIssue types
        │   └── api.ts         # HealthStatus & ApiError types
        ├── services/          # Network & API services
        │   ├── api.ts         # Real Fetch API client for shared backend contract
        │   ├── mockAdapter.ts # Isolated development mock adapter (UI testing)
        │   └── serviceManager.ts # Connectivity manager & runtime mode switcher
        ├── context/           # Application state
        │   └── AppContext.tsx # Central context for active page, brand, and audit history
        ├── components/        # Reusable UI components
        │   ├── Sidebar.tsx    # Responsive navigation & backend status panel
        │   ├── Header.tsx     # Active brand indicator & page header
        │   └── Toast.tsx      # Notification feedback banner
        └── pages/             # Core application views
            ├── DashboardPage.tsx       # Metrics, recent history & brand snapshot
            ├── BrandGuidelinesPage.tsx # View & edit NovaTech brand rules
            ├── ContentCheckerPage.tsx  # Copy input, validation & audit submission
            └── AnalysisResultsPage.tsx # Issue breakdown, copy button & comparison
```
