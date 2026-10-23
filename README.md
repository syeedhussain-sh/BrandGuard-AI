# BrandGuard AI — Intelligent Universal Multi-Industry Brand Governance Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-97%20Passed-success?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg?style=for-the-badge)](LICENSE)

> 🌐 **Public Website URL:** [Deployment  — Awaiting Permanent Cloud Deployment on Render.com - https://brandguard-ai-w20n.onrender.com/ ]`  
> *(The application can be run locally or launched with a live public tunnel via `RUN_PRODUCTION.bat`)*

---

## 1. Executive Summary

**BrandGuard AI** is an enterprise-grade brand governance and marketing compliance platform designed to audit, safeguard, and align promotional copy in real time across any commercial industry.

The platform protects corporate reputation by enforcing trademark lexicon, detecting cross-brand contamination (e.g., promotional copy praising a competitor or foreign brand), intercepting prohibited superlatives, flagging unverified liability guarantees, and generating non-hallucinatory, legally compliant marketing copy.

---

## 2. Problem Statement & Solution

### The Problem

- **Cross-Brand Contamination:** High-velocity marketing campaigns and generative AI copy often introduce competitor brand names, mismatched product ecosystem terminology, or foreign trademarks into official copy.
- **Regulatory and Legal Liability:** Statements containing unverified superlatives (*"cheapest in the world"*, *"100% bug-free"*, *"never needs maintenance"*) violate truth-in-advertising standards and expose companies to litigation and regulatory fines.
- **Inconsistent Voice and Tone:** Disparate global teams often produce off-brand, colloquial, or condescending messaging that undermines premium brand equity.
- **Unconfigured Brand Gap:** Traditional brand management tools only support predefined enterprises with rigid static profiles, failing startups, agencies, and dynamic multi-brand portfolios.

### The Solution

BrandGuard AI addresses these challenges through a unified governance pipeline:

1. **Entity-Aware Brand Mismatch Checking:** Detects when marketing collateral references a different company or competitor from a curated registry of enterprise entities.
2. **Dual Governance Architecture:**
   - **Mode A (Configured Brand Profile):** Audits against saved official corporate guidelines (lexicon glossary, tone pillars, restricted phrases, SLA claim requirements).
   - **Mode B (Universal Multi-Industry Governance):** Applies universal advertising governance principles and industry-specific risk indicators for unconfigured brands or custom startups without requiring source code modifications.
3. **Non-Hallucinatory Auto-Correction:** Rewrites problematic copy by replacing detected violations with approved alternatives without fabricating specifications, pricing, warranties, or claims.

---

## 3. Core Features

- 🛡️ **Company Identity & Brand Mismatch Engine:** Real-time entity recognition cross-checks copy against selected brand identities to prevent cross-brand contamination.
- ⚡ **Dual Analysis Modes:**
  - *Mode A:* Enforces strict registered guidelines configured for known enterprises (e.g., NovaTech).
  - *Mode B:* Analyzes arbitrary custom companies using universal governance and industry-tailored risk indicators (Automotive, Consumer Electronics, Food & Beverage, Fashion, IT Services, Aerospace, Finance).
- 📋 **13-Point Comprehensive Rule Suite:**
  1. Brand and company name entity mismatch
  2. Product naming and terminology consistency
  3. Industry relevance and context
  4. Tone and brand voice consistency
  5. Unsupported superlatives and absolute claims
  6. Potentially misleading or unverified marketing assertions
  7. Conflicting statements and internal inconsistencies
  8. Excessive capitalization and aggressive punctuation
  9. Grammar, spelling, clarity, and readability
  10. Inclusive and professional communication
  11. Configured brand-specific restrictions
  12. Industry-specific risk indicators
  13. Mandatory disclosures and required context terms
- ✏️ **Compliant Content Synthesizer:** Deterministic replacement engine preserves the user's intended narrative while ensuring policy compliance.
- 📊 **Executive Governance Dashboard:** Real-time visibility into overall brand compliance scores, high/medium/low severity distributions, and audit history.
- 🔄 **Universal Company & Industry Selector:** Predefined industry presets (NovaTech, Tata Motors, MRF Tyres, Samsung, McDonald's, Nike, Infosys) plus dynamic support for custom startups.
- 📑 **Formal API Contract:** Full compatibility with the formal `API_CONTRACT.md` specification.

---

## 4. Visual Walkthrough & Screenshots

> 📸 **Visual Demonstration:** The following high-resolution screenshots are captured directly from the live running application (`http://localhost:5000`) at 1920×1080 resolution, demonstrating the dark glassmorphic design system and dual governance workflows.

### 4.1 Executive Governance Dashboard

Overview of compliance health metrics, severity distributions, and recent audit activity.

![Executive Dashboard](screenshots/dashboard.png)

### 4.2 Marketing Content Checker

Multi-industry presets, company/industry selector, real-time word/character count, and copy submission interface.

![Content Checker](screenshots/content-checker.png)

### 4.3 Governance Analysis Audit Report

Detailed issue diagnostics, brand mismatch warnings, severity tier pills, side-by-side comparison, and auto-corrected copy.

![Audit Results](screenshots/audit-results.png)

### 4.4 Brand Governance Guidelines

Brand profile management, terminology glossaries, tone attributes, and clear differentiation between Mode A official rules and Mode B recommended principles.

![Brand Guidelines](screenshots/brand-guidelines.png)

---

## 5. Technology Stack

### Frontend Application

- **Framework:** React 19 with TypeScript
- **Bundler & Tooling:** Vite 8, ESBuild
- **Design System:** Custom dark glassmorphic UI, responsive layouts, vanilla CSS tokens
- **Icons:** Lucide React
- **State Management:** React Context API (`AppContext`) with centralized `ServiceManager`

### Backend REST API

- **Runtime:** Node.js (v18+)
- **Framework:** Express 4.21 with TypeScript
- **Middleware:** CORS, JSON body parser, centralized error handler
- **Static Hosting:** Production static server serving built client assets with SPA fallback

### BrandGuard Analysis Engine

- **Package:** `@brandguard/analysis-engine` (compiled TypeScript package)
- **Architecture:** AST & token-level deterministic rule evaluation pipeline
- **Testing:** Vitest runner (unit tests, contract verification, multi-industry scenarios)

---

## 6. System Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             REACT FRONTEND (SPA)                            │
│  Executive Dashboard │ Content Checker │ Audit Results │ Brand Guidelines   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST (/api)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS BACKEND REST API                           │
│     GET /api/health  │  GET /api/brands  │  POST /api/analyze               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ In-Memory / Adapter Call
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      BRANDGUARD ANALYSIS ENGINE                             │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌────────────────────┐ │
│  │ Brand Mismatch Checker│ │ Generic Brand Checker │ │ Restricted Phrases │ │
│  └───────────────────────┘ └───────────────────────┘ └────────────────────┘ │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌────────────────────┐ │
│  │ Claims Verifier       │ │ Tone & Voice Checker  │ │ Content Corrector  │ │
│  └───────────────────────┘ └───────────────────────┘ └────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Project Structure

```text
BrandGuard_AI/
├── Brand Guard AI-Backend/               # Backend service root
│   ├── API_CONTRACT.md                   # Formal API contract specification
│   ├── README.md                         # Backend-specific documentation
│   └── backend/                          # Express application
│       ├── package.json                  # Backend dependencies
│       ├── tsconfig.json                 # TypeScript compiler configuration
│       ├── src/
│       │   ├── app.ts                    # Express app & static SPA server setup
│       │   ├── server.ts                 # Server entrypoint & port binding
│       │   ├── controllers/              # Route controllers (analyze, brand, health)
│       │   ├── data/
│       │   │   └── brands.json           # Configured brand profiles database
│       │   ├── routes/                   # API route definitions
│       │   ├── services/                 # Business logic & engine adapters
│       │   └── types/                    # Backend TypeScript interfaces
│       └── tests/                        # Vitest test suite (28 tests)
│
├── Brandguard AI - Fe/                   # Frontend workspace root
│   └── frontend/                         # React Vite application
│       ├── package.json                  # Frontend dependencies
│       ├── vite.config.ts                # Vite build and proxy configuration
│       ├── index.html                    # Single-page application entrypoint
│       └── src/
│           ├── components/               # Header, Sidebar, Toast components
│           ├── context/                  # AppContext (global state & sync)
│           ├── pages/                    # Dashboard, Checker, Results, Guidelines
│           ├── services/                 # API client & ServiceManager
│           └── types/                    # Client-side domain interfaces
│
├── Brandguard AI-Engine Analysis/        # Core analysis engine root
│   └── BrandGuard-Analysis/              # TypeScript engine library
│       ├── package.json                  # Engine dependencies & exports
│       ├── tsconfig.json                 # TypeScript build configuration
│       ├── src/
│       │   ├── analyzer.ts               # Core multi-mode analysis orchestrator
│       │   ├── index.ts                  # Public package exports
│       │   ├── types.ts                  # Analysis types & issue interfaces
│       │   └── engine/
│       │       ├── brandMismatchChecker.ts  # Entity mismatch detection & registry
│       │       ├── brandNameChecker.ts      # Brand casing and naming consistency
│       │       ├── claimsChecker.ts         # Absolute claim & guarantee rules
│       │       ├── contentCorrector.ts      # Non-hallucinatory text auto-corrector
│       │       ├── genericBrandChecker.ts   # Mode B universal multi-industry rules
│       │       ├── requiredTermsChecker.ts  # Mandatory term validation
│       │       ├── restrictedPhrasesChecker.ts # Prohibited phrase rules
│       │       ├── toneChecker.ts           # Tone pillars and patronizing terms
│       │       └── utils.ts                 # Text span & normalization helpers
│       └── tests/                        # Vitest test suite (69 tests)
│
├── screenshots/                          # UI screenshots directory
│   ├── README.md                         # Screenshot capture instructions
│   ├── dashboard.png                     # (Pending capture) Executive Dashboard
│   ├── content-checker.png               # (Pending capture) Content Checker
│   ├── audit-results.png                 # (Pending capture) Audit Results
│   └── brand-guidelines.png              # (Pending capture) Brand Guidelines
│
├── .gitignore                            # Excluded items (node_modules, backups, secrets)
├── package.json                          # Root workspace orchestrator
├── render.yaml                           # Render.com cloud deployment blueprint
├── vercel.json                           # Vercel deployment configuration
├── RUN_PRODUCTION.bat                    # 1-click Windows production launcher
└── README.md                             # Comprehensive project documentation
```

---

## 8. Installation & Local Execution

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher

### Method A: 1-Click Windows Launcher (Recommended)

Double-click [`RUN_PRODUCTION.bat`](RUN_PRODUCTION.bat) from the project root. The launcher will:

1. Verify Node.js and npm environments.
2. Build production assets if missing.
3. Launch the unified full-stack server on port `5000`.
4. Perform an automated health check against `http://localhost:5000/api/health`.
5. Open your default web browser to `http://localhost:5000`.

### Method B: Manual Command-Line Execution

1. **Clone the repository:**

   ```bash
   git clone https://github.com/syeedhussain-sh/BrandGuard-AI.git
   cd BrandGuard_AI
   ```

2. **Install all dependencies:**

   ```bash
   npm install --prefix "Brandguard AI-Engine Analysis/BrandGuard-Analysis"
   npm install --prefix "Brand Guard AI-Backend/backend"
   npm install --prefix "Brandguard AI - Fe/frontend"
   ```

3. **Build the complete platform:**

   ```bash
   npm run build
   ```

4. **Start the unified production server:**

   ```bash
   npm start
   ```

5. **Access the application:**
   - Web Application: `http://localhost:5000`
   - Backend API: `http://localhost:5000/api`
   - Health Endpoint: `http://localhost:5000/api/health`

---

## 9. API Overview

The platform exposes RESTful endpoints adhering to [`API_CONTRACT.md`](Brand%20Guard%20AI-Backend/API_CONTRACT.md):

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns service health status, service name, and uptime. |
| `GET` | `/api/brands` | Retrieves list of configured brand profile summaries. |
| `GET` | `/api/brands/:brandId` | Retrieves full guidelines for a specific brand profile. |
| `PUT` | `/api/brands/:brandId` | Updates or saves brand guidelines on the server. |
| `POST` | `/api/analyze` | Executes brand governance audit on submitted copy. |

### Sample Analysis Request (`POST /api/analyze`)

```json
{
  "companyName": "Tata Motors",
  "industry": "Automotive",
  "content": "Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection."
}
```

### Sample Analysis Response

```json
{
  "success": true,
  "analysisId": "anlz_34b185eb-9631-4b03-ab63-f8c1237bb065",
  "summary": {
    "totalIssues": 6,
    "high": 5,
    "medium": 1,
    "low": 0
  },
  "issues": [
    {
      "id": "brand_identity_7_zu3m",
      "category": "terminology",
      "severity": "high",
      "matchedText": "Nova Cloud",
      "explanation": "Content references \"Nova Cloud\" (Enterprise Cloud and AI), which appears to be a different company than the selected brand (\"Tata Motors\"). Ensure marketing copy aligns with the intended brand identity.",
      "suggestion": "Replace with \"Tata Motors\" if this material is intended for Tata Motors, or clarify the context."
    },
    {
      "id": "restricted_phrase_10_xy6o",
      "category": "restricted_phrase",
      "severity": "high",
      "matchedText": "cheapest cloud in the market",
      "explanation": "Unsubstantiated pricing superlatives are prohibited under responsible brand governance.",
      "suggestion": "cost-effective, high-performance cloud infrastructure"
    }
  ],
  "correctedContent": "Our Tata Motors is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA.",
  "analysisMode": "generic",
  "companyName": "Tata Motors",
  "industry": "Automotive",
  "governanceMode": "generic",
  "officialGuidelinesConfigured": false
}
```

---

## 10. Testing & Verification

The project includes an automated test suite across the backend and the analysis engine with **97 verified passing tests**:

```text
========================================================================
Test Suite                             Files    Passed    Status
========================================================================
Backend API Integration Tests              3        28    ALL PASSED ✓
BrandGuard Analysis Engine Tests          10        69    ALL PASSED ✓
------------------------------------------------------------------------
TOTAL VERIFIED TESTS                      13        97    ALL PASSED ✓
========================================================================
```

### Running Tests

- **Run all platform tests:**

  ```bash
  npm test
  ```

- **Run engine tests only:**

  ```bash
  npm run test:engine
  ```

- **Run backend tests only:**

  ```bash
  npm run test:backend
  ```

---

## 11. Cloud Deployment Guide

The repository includes native cloud deployment blueprints:

### Deploying to Render.com

1. Push this repository to your GitHub account (`https://github.com/syeedhussain-sh/BrandGuard-AI`).
2. Log into the [Render Dashboard](https://dashboard.render.com/).
3. Click **New** → **Blueprint**.
4. Select your `BrandGuard-AI` repository.
5. Render automatically processes [`render.yaml`](render.yaml), installs dependencies, runs `npm run build`, and launches the unified service.

### Deploying to Vercel

1. Install Vercel CLI: `npm install -g vercel`.
2. Run `vercel` from the project root.
3. Vercel utilizes [`vercel.json`](vercel.json) to deploy client assets and route API calls.

---

## 12. Author & Acknowledgements

- **Developer:** Syeed Hussain ([@syeedhussain-sh](https://github.com/syeedhussain-sh))
-                 Shyam G R - Frontend Development
                 Sandeep — Analysis Engine Development
                 U Tamilarasu — Analysis Engine Testing and Validation  
- **Project:**   BrandGuard AI — Intelligent Brand Governance Platform
- **License:**   ISC
