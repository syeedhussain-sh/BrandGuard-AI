# BrandGuard AI — Backend Service

Backend service for **BrandGuard AI**, providing brand governance, guideline management, and real-time content compliance analysis.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Data Store**: JSON file persistence (`src/data/brands.json`)
- **Security & Networking**: CORS configured for local React frontend
- **Testing**: Vitest + Supertest

---

## 📁 Directory Structure

```text
backend/
├── src/
│   ├── routes/                # API routes
│   │   ├── healthRoutes.ts    # GET /api/health
│   │   ├── brandRoutes.ts     # GET /api/brands, GET/PUT /api/brands/:brandId
│   │   ├── analyzeRoutes.ts   # POST /api/analyze
│   │   └── index.ts           # Route aggregator
│   ├── controllers/           # Request handlers and input validation
│   │   ├── healthController.ts
│   │   ├── brandController.ts
│   │   └── analyzeController.ts
│   ├── services/              # Business logic & rule engine
│   │   ├── brandService.ts    # JSON storage queries & updates
│   │   └── analysisService.ts # Analysis engine implementation
│   ├── data/
│   │   └── brands.json        # Pre-seeded brand profiles (demo-brand NovaTech)
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces & types
│   ├── app.ts                 # Express application & middleware setup
│   └── server.ts              # HTTP server entry point
├── tests/
│   ├── api.test.ts            # Integration tests for all endpoints
│   └── analysisService.test.ts# Unit tests for the analysis engine
├── .env.example               # Template environment variables
├── package.json               # Dependencies and scripts
└── tsconfig.json              # TypeScript configuration
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default configuration:

```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start at `http://localhost:5000`.

### 4. Run Tests

```bash
npm test
```

### 5. Build for Production

```bash
npm run build
```

### 6. Start Production Server

```bash
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health status and uptime. |
| `GET` | `/api/brands` | List all brand profiles. |
| `GET` | `/api/brands/:brandId` | Retrieve guidelines for a specific brand. |
| `PUT` | `/api/brands/:brandId` | Update brand guidelines. |
| `POST` | `/api/analyze` | Analyze text content against brand guidelines. |

For complete request and response schemas, refer to [`API_CONTRACT.md`](../API_CONTRACT.md).

---

## 🔗 Member 3 Integration Note

The analysis engine signature in `src/services/analysisService.ts` is:

```typescript
export async function analyzeContent(
  content: string,
  brand: BrandProfile
): Promise<AnalysisResponse>
```

When Member 3 delivers their analysis engine module, replace or delegate the logic in `analysisService.ts` to Member 3's engine.
