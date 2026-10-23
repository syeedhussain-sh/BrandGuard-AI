# BrandGuard AI — Shared API Contract & Integration Specifications

> **Version**: 1.0.0  
> **Author**: Member 2 (Backend & Final Integration)  
> **Status**: Official API Contract for Member 1 (Frontend), Member 2 (Backend), and Member 3 (Analysis Engine)

---

## 1. Overview & Architecture

BrandGuard AI evaluates written content against brand governance rules (terminology, tone, restricted phrases, mandatory claims/disclaimers).

- **Member 1 (Frontend)**: React application consuming REST endpoints.
- **Member 2 (Backend)**: Express + TypeScript server handling routing, persistence, validation, and invoking the analysis engine.
- **Member 3 (Analysis Engine)**: TypeScript module implementing the core rule-checking engine.

Base URL (Local Development): `http://localhost:5000/api`

---

## 2. API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint returning service status, uptime, and version. |
| `GET` | `/api/brands` | List all available brand profiles. |
| `GET` | `/api/brands/:brandId` | Retrieve detailed brand guidelines and rules for a given `brandId`. |
| `PUT` | `/api/brands/:brandId` | Update brand guidelines and rules for a given `brandId`. |
| `POST` | `/api/analyze` | Run brand compliance analysis on submitted content. |

---

## 3. Endpoints Specification

### 3.1. GET /api/health

#### 3.1.1 Purpose

Verify backend availability, timestamp, and environment.

#### 3.1.2 Response (200 OK)

```json
{
  "status": "ok",
  "service": "BrandGuard AI Backend",
  "timestamp": "2026-10-22T05:43:21.000Z",
  "uptime": 124.5
}
```

---

### 3.2. GET /api/brands

#### 3.2.1 Purpose

Retrieve a list of all configured brand profiles (including the default `demo-brand` for **NovaTech**).

#### 3.2.2 Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "demo-brand",
      "name": "NovaTech",
      "description": "Enterprise cloud and AI infrastructure provider.",
      "tone": ["professional", "innovative", "authoritative", "accessible"],
      "createdAt": "2026-10-22T00:00:00.000Z",
      "updatedAt": "2026-10-22T00:00:00.000Z"
    }
  ]
}
```

---

### 3.3. GET /api/brands/:brandId

#### 3.3.1 Purpose

Fetch full guidelines, terminology mappings, restricted phrases, and tone rules for a specific brand.

#### 3.3.2 Parameters

- Path: `brandId` (string, required) — e.g. `demo-brand`

#### 3.3.3 Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "demo-brand",
    "name": "NovaTech",
    "description": "Enterprise cloud and AI infrastructure provider.",
    "tone": ["professional", "innovative", "authoritative", "accessible"],
    "guidelines": {
      "terminology": [
        {
          "preferred": "NovaTech Cloud Platform",
          "discouraged": ["Nova Cloud", "NovaTech CP", "NT Cloud"],
          "explanation": "Always refer to our core offering by its complete official brand name."
        },
        {
          "preferred": "Autonomous Intelligence",
          "discouraged": ["Bot", "Robot", "Script"],
          "explanation": "Reflect modern AI terminology in customer-facing communication."
        }
      ],
      "restrictedPhrases": [
        {
          "phrase": "100% bug-free",
          "severity": "high",
          "explanation": "Absolute reliability claims violate compliance policies.",
          "suggestion": "engineered for high reliability and resilience"
        },
        {
          "phrase": "cheapest cloud in the market",
          "severity": "high",
          "explanation": "Unsubstantiated pricing superlatives are prohibited.",
          "suggestion": "cost-effective, high-performance cloud infrastructure"
        },
        {
          "phrase": "obviously",
          "severity": "medium",
          "explanation": "Condescending tone undermines accessible brand voice.",
          "suggestion": "as demonstrated"
        }
      ],
      "requiredTerms": [
        {
          "term": "NovaTech",
          "context": "Any public press release or product announcement",
          "severity": "medium",
          "explanation": "Brand name must be mentioned explicitly at least once."
        }
      ],
      "claimVerification": [
        {
          "claimPattern": "guarantee(s|d)?",
          "severity": "high",
          "explanation": "Guarantees require explicit legal team approval and SLA references.",
          "suggestion": "commit to high availability under our standard SLA"
        }
      ]
    },
    "createdAt": "2026-10-22T00:00:00.000Z",
    "updatedAt": "2026-10-22T00:00:00.000Z"
  }
}
```

#### 3.3.4 Error Response (404 Not Found)

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Brand with ID 'invalid-id' not found."
  }
}
```

---

### 3.4. PUT /api/brands/:brandId

#### 3.4.1 Purpose

Update an existing brand's profile, tone, terminology, or compliance rules.

#### 3.4.2 Parameters

- Path: `brandId` (string, required)

#### 3.4.3 Request Body

```json
{
  "name": "NovaTech Solutions",
  "description": "Updated enterprise cloud provider description.",
  "tone": ["professional", "visionary", "concise"],
  "guidelines": {
    "terminology": [
      {
        "preferred": "NovaTech Cloud Platform",
        "discouraged": ["Nova Cloud"],
        "explanation": "Use full name."
      }
    ],
    "restrictedPhrases": [
      {
        "phrase": "100% bug-free",
        "severity": "high",
        "explanation": "Do not promise absolute bug-free software.",
        "suggestion": "rigorously tested for maximum stability"
      }
    ]
  }
}
```

#### 3.4.4 Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "demo-brand",
    "name": "NovaTech Solutions",
    "updatedAt": "2026-10-22T05:50:00.000Z"
  },
  "message": "Brand guidelines updated successfully."
}
```

#### 3.4.5 Error Responses

- `400 Bad Request` — Invalid or missing payload fields.
- `404 Not Found` — Brand ID does not exist.

---

### 3.5. POST /api/analyze

#### 3.5.1 Purpose

Analyzes candidate text against the specified brand's rules and returns structured compliance findings, issue severity summaries, and suggested replacements.

#### 3.5.2 Request Body

Supports both Mode A (Configured Brand ID) and Mode B (Universal Company & Industry Input):

##### Mode A: Configured Brand Request
```json
{
  "brandId": "demo-brand",
  "content": "Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection."
}
```

##### Mode B: Universal Multi-Industry Request (Any Company & Industry)
```json
{
  "companyName": "Tata Motors",
  "industry": "Automotive",
  "content": "The new tata motors EV is 100% crash-proof and never needs maintenance."
}
```

#### 3.5.3 Validation Rules

1. `companyName` or `brandId` (string, required): At least one identifier must be provided as a non-empty string.
   - If `brandId` matches a saved profile, or `companyName` matches a configured brand, **Mode A (Configured Brand Analysis)** is executed.
   - If no configured profile exists, the system automatically executes **Mode B (Universal Generic Brand Analysis)** using general governance principles and industry risk indicators.
   - If standalone `brandId` is provided without `companyName` and no matching profile exists, returns `404 NOT_FOUND`.
2. `industry` (string, optional): Contextual industry category (e.g., Automotive, Electronics, Food, Health, Tech, etc.) to tailor general risk indicators.
3. `content` (string, required): Must be a non-empty string (trimmed length >= 1).

#### 3.5.4 Expected Response (200 OK)

```json
{
  "success": true,
  "analysisId": "anlz_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "summary": {
    "totalIssues": 4,
    "high": 3,
    "medium": 1,
    "low": 0
  },
  "issues": [
    {
      "id": "iss_1",
      "category": "terminology",
      "severity": "high",
      "matchedText": "Nova Cloud",
      "explanation": "Always refer to our core offering by its complete official brand name.",
      "suggestion": "NovaTech Cloud Platform"
    },
    {
      "id": "iss_2",
      "category": "restricted_phrase",
      "severity": "high",
      "matchedText": "cheapest cloud in the market",
      "explanation": "Unsubstantiated pricing superlatives are prohibited.",
      "suggestion": "cost-effective, high-performance cloud infrastructure"
    },
    {
      "id": "iss_3",
      "category": "tone",
      "severity": "medium",
      "matchedText": "obviously",
      "explanation": "Condescending tone undermines accessible brand voice.",
      "suggestion": "as demonstrated"
    },
    {
      "id": "iss_4",
      "category": "restricted_phrase",
      "severity": "high",
      "matchedText": "100% bug-free",
      "explanation": "Absolute reliability claims violate compliance policies.",
      "suggestion": "engineered for high reliability and resilience"
    }
  ],
  "correctedContent": "Our NovaTech Cloud Platform is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA total perfection.",
  "analysisMode": "rules"
}
```

---

## 4. Issue Categories & Severity Values

### 4.1 Categories

| Category | Meaning / Usage |
| :--- | :--- |
| `terminology` | Misuse of proprietary naming, improper abbreviations, or outdated brand terms. |
| `restricted_phrase` | Blacklisted words, superlatives, legal liabilities, or banned expressions. |
| `missing_term` | Required brand disclaimers or mandatory brand mentions missing from content. |
| `tone` | Off-brand tone violations (e.g. passive-aggressive, overly casual, derogatory, slang). |
| `claim_verification` | Unsubstantiated claims, fake guarantees, or unverified statistical claims. |

### 4.2 Severities

| Severity | Meaning |
| :--- | :--- |
| `high` | Critical compliance violation. Must be corrected before publishing. |
| `medium` | Noticeable brand degradation. Strongly recommended for correction. |
| `low` | Minor stylistic advice or polish. |

---

## 5. TypeScript Types Specification

These types are shared across the backend and analysis engine modules.

```typescript
export type IssueCategory = 
  | 'terminology'
  | 'restricted_phrase'
  | 'missing_term'
  | 'tone'
  | 'claim_verification';

export type IssueSeverity = 'high' | 'medium' | 'low';

export interface IssueItem {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  matchedText: string;
  explanation: string;
  suggestion: string;
}

export interface AnalysisSummary {
  totalIssues: number;
  high: number;
  medium: number;
  low: number;
}

export interface AnalysisResponse {
  success: boolean;
  analysisId: string;
  summary: AnalysisSummary;
  issues: IssueItem[];
  correctedContent: string;
  analysisMode: 'rules' | 'ai' | 'hybrid' | 'configured' | 'generic' | string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  governanceMode?: 'configured' | 'generic';
  modeLabel?: string;
  officialGuidelinesConfigured?: boolean;
  disclaimer?: string;
}

export interface TerminologyRule {
  preferred: string;
  discouraged: string[];
  explanation: string;
}

export interface RestrictedPhraseRule {
  phrase: string;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
}

export interface RequiredTermRule {
  term: string;
  context?: string;
  severity: IssueSeverity;
  explanation: string;
}

export interface ClaimVerificationRule {
  claimPattern: string;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
}

export interface BrandGuidelines {
  terminology?: TerminologyRule[];
  restrictedPhrases?: RestrictedPhraseRule[];
  requiredTerms?: RequiredTermRule[];
  claimVerification?: ClaimVerificationRule[];
  toneRules?: Array<{
    bannedWordOrStyle: string;
    suggestion: string;
    explanation: string;
  }>;
}

export interface BrandProfile {
  id: string;
  name: string;
  description?: string;
  tone?: string[];
  guidelines: BrandGuidelines;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string;
  industry?: string;
  isGeneric?: boolean;
}

export interface AnalyzeRequest {
  brandId?: string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  content: string;
}
```

---

## 6. Analysis Service Function Signature (for Member 3)

The analysis engine delivered by Member 3 must implement and export the following function signature in `services/analysisService.ts` (or an importable module):

```typescript
/**
 * Analyzes candidate text against a brand profile's guidelines.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export async function analyzeContent(
  content: string,
  brand: BrandProfile
): Promise<AnalysisResponse>;
```

### 6.1 Pure / Synchronous Engine Support

If Member 3 implements a synchronous engine, it can return `AnalysisResponse` directly. The backend wraps or awaits it seamlessly:

```typescript
export type AnalysisEngineFn = (
  content: string,
  brand: BrandProfile
) => Promise<AnalysisResponse> | AnalysisResponse;
```

---

## 7. Error Handling & Validation Contract

All error responses from the backend adhere to the standard schema:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable explanation of error",
    "details": []
  }
}
```

### 7.1 Standard Error Codes

| Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | 400 | Missing required fields, empty string, or invalid JSON. |
| `NOT_FOUND` | 404 | Brand ID does not match any stored profile. |
| `INTERNAL_ERROR` | 500 | Unexpected server or engine exception. |

---

## 8. Integration Checklist for Final Deliverable

When Member 1 (Frontend) and Member 3 (Analysis Engine) are complete:

- [ ] Connect Frontend `API_BASE_URL` to `http://localhost:5000/api` (via `VITE_API_URL` or `.env`).
- [ ] Ensure Member 3's engine exports `analyzeContent(content, brand)` conforming to the types above.
- [ ] Verify CORS headers allow requests from frontend port (`http://localhost:5173` or `http://localhost:3000`).
- [ ] Run full end-to-end tests: load brand -> enter non-compliant text -> view issues -> preview corrected text.
