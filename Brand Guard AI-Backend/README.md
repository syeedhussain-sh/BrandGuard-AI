# BrandGuard AI — Backend Service

> AI-Powered Brand Governance & Content Compliance System  
> 🏆 **Hackathon:** TechCircuit Hackathon | **Problem Statement Provider:** Inkloom AI  
> 👥 **Team:** ChipSmiths (Syeed Hussain S H, U Tamilarasu, Shyam G R, Sandep S)  
> ⚙️ **Backend Lead:** Shyam G R

BrandGuard AI safeguards enterprise communication consistency by automatically analyzing written content against official brand guidelines, prohibited terminology, tone parameters, and legal claims.

---

## 🗂️ Project Repository Structure

```text
BrandGuard-AI/
├── API_CONTRACT.md         # Shared API contract for Member 1, 2, and 3
├── README.md               # Monorepo overview and quickstart
├── docs/                   # Architecture and integration guides
│   └── INTEGRATION_GUIDE.md
├── backend/                # Member 2: Express + TypeScript backend
│   ├── src/
│   │   ├── routes/         # Express API routes
│   │   ├── controllers/    # Route controllers & input validators
│   │   ├── services/       # Brand storage & analysis service
│   │   ├── data/           # JSON brand guidelines database
│   │   ├── types/          # Shared TypeScript type definitions
│   │   ├── app.ts          # Express application configuration
│   │   └── server.ts       # Server bootstrapper
│   ├── tests/              # Vitest test suite
│   ├── .env.example
│   └── package.json
└── frontend/               # Member 1: React frontend module (pending integration)
```

---

## 🚀 Quick Start (Backend)

1. Navigate to backend:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   The backend server runs on `http://localhost:5000`.

4. Run backend tests:

   ```bash
   npm test
   ```

5. Build for production:

   ```bash
   npm run build
   npm start
   ```

---

## 📋 API Overview

- `GET  /api/health` — Service health and uptime
- `GET  /api/brands` — List brand profiles (includes demo brand `NovaTech`)
- `GET  /api/brands/:brandId` — Fetch detailed guidelines for a brand
- `PUT  /api/brands/:brandId` — Update guidelines for a brand
- `POST /api/analyze` — Run brand compliance analysis
- `POST /api/reviews` — Record human review approval or rejection decision
- `GET  /api/reviews` — List all review decisions
- `GET  /api/reviews/metrics` — Dashboard review metrics and approval rate
- `GET  /api/reviews/analysis/:analysisId` — Fetch review decision for a specific analysis

Full documentation and TypeScript signatures are available in [API_CONTRACT.md](./API_CONTRACT.md).
