# BrandGuard AI — Brand Compliance Analysis Engine (Member 3)

A high-performance, deterministic brand compliance analysis engine built with TypeScript, Node.js, and Vitest. This module is self-contained, completely independent of Express or any database, and strictly implements the official specifications from `API_CONTRACT.md`.

---

## 1. Official Exported Function & Signatures

### Required Signature (API_CONTRACT.md Section 6)

```typescript
export async function analyzeContent(
  content: string,
  brand: BrandProfile
): Promise<AnalysisResponse>;
```

### Import Locations for Member 2 (Backend)

Member 2 can import `analyzeContent` and all shared types from either the dedicated services module or the package index:

```typescript
// Option 1: Direct from services module (conforming to Contract Section 6)
import { analyzeContent } from './BrandGuard-Analysis/src/services/analysisService.js';
// or
import { analyzeContent } from './BrandGuard-Analysis/services/analysisService.js';

// Option 2: From package root
import { analyzeContent, DEMO_BRAND_PROFILE } from './BrandGuard-Analysis/src/index.js';

// Option 3: Via local package linking in package.json
import { analyzeContent, BrandProfile, AnalysisResponse } from '@brandguard/analysis-engine';
```

A pure synchronous variant is also provided:

```typescript
import { analyzeContentSync } from './BrandGuard-Analysis/src/services/analysisService.js';
const response: AnalysisResponse = analyzeContentSync(content, brand);
```

---

## 2. API Contract Compliance & Response Structure

### Request Example (API_CONTRACT.md Section 3.5.2)

```typescript
const content = 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';
```

### Response Example (API_CONTRACT.md Section 3.5.4)

```json
{
  "success": true,
  "analysisId": "anlz_38e74a8c-f495-4452-b996-5ee1435bb002",
  "summary": {
    "totalIssues": 5,
    "high": 4,
    "medium": 1,
    "low": 0
  },
  "issues": [
    {
      "id": "terminology_mvjocos8_1_2tqk",
      "category": "terminology",
      "severity": "high",
      "matchedText": "Nova Cloud",
      "explanation": "Always refer to our core offering by its complete official brand name.",
      "suggestion": "NovaTech Cloud Platform"
    },
    {
      "id": "restricted_phrase_mvjocos9_3_4stv",
      "category": "restricted_phrase",
      "severity": "high",
      "matchedText": "cheapest cloud in the market",
      "explanation": "Unsubstantiated pricing superlatives are prohibited.",
      "suggestion": "cost-effective, high-performance cloud infrastructure"
    },
    {
      "id": "tone_mvjocos9_4_xe5n",
      "category": "tone",
      "severity": "medium",
      "matchedText": "obviously",
      "explanation": "Condescending tone undermines accessible brand voice.",
      "suggestion": "as demonstrated"
    },
    {
      "id": "restricted_phrase_mvjocos9_2_06o7",
      "category": "restricted_phrase",
      "severity": "high",
      "matchedText": "100% bug-free",
      "explanation": "Absolute reliability claims violate compliance policies.",
      "suggestion": "engineered for high reliability and resilience"
    },
    {
      "id": "claim_verification_mvjocosb_5_1m91",
      "category": "claim_verification",
      "severity": "high",
      "matchedText": "guarantee",
      "explanation": "Guarantees require explicit legal team approval and SLA references.",
      "suggestion": "commit to high availability under our standard SLA"
    }
  ],
  "correctedContent": "Our NovaTech Cloud Platform is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA total perfection.",
  "analysisMode": "rules"
}
```

---

## 3. Analysis Categories & Severities (API_CONTRACT.md Section 4)

| Category | Description | Severity Range |
| :--- | :--- | :--- |
| `terminology` | Misuse of proprietary naming, improper abbreviations, or outdated brand terms. | `high` / `medium` |
| `restricted_phrase` | Blacklisted words, superlatives, legal liabilities, or banned expressions. | `high` |
| `missing_term` | Required brand disclaimers or mandatory brand mentions missing from content. | `high` / `medium` |
| `tone` | Off-brand tone violations (condescending language, slang, aggressive punctuation, toneRules). | `medium` / `low` |
| `claim_verification` | Unsubstantiated claims, fake guarantees, or unverified statistical claims. Treated strictly as requiring verification (never labeled false). | `high` / `medium` |

---

## 4. Brand Profile Structure (API_CONTRACT.md Section 5)

The engine supports the official TypeScript type definition with complete backward compatibility for legacy profile variations:

```typescript
export interface BrandProfile {
  id?: string;
  name?: string;
  description?: string;
  tone?: string[];
  guidelines?: BrandGuidelines;
  createdAt?: string;
  updatedAt?: string;

  // Backward compatibility:
  brandId?: string;
  brandName?: string;
  brandVariations?: string[];
  preferredTerminology?: Record<string, string> | TerminologyRule[];
  restrictedPhrases?: Array<string | RestrictedPhraseRule>;
  requiredTerms?: Array<string | RequiredTermRule>;
  toneGuidelines?: ToneGuidelines | string | string[];
  approvedFacts?: string[];
}
```

---

## 5. Integration Guide for Member 2 (Backend)

### Step 1: Link or Import Module in Backend

In your backend Express service (e.g. `src/controllers/analyzeController.ts` or `src/services/analysisService.ts`):

```typescript
import {
  analyzeContent,
  BrandProfile,
  DEMO_BRAND_PROFILE
} from '../BrandGuard-Analysis/src/services/analysisService.js';

// Express route handler for POST /api/analyze
export async function handleAnalyze(req: Request, res: Response) {
  const { brandId, content } = req.body;

  // 1. Validate payload
  if (!brandId || typeof brandId !== 'string') {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'brandId is required.' }
    });
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'content cannot be empty.' }
    });
  }

  // 2. Fetch brand profile from storage or use DEMO_BRAND_PROFILE
  const brand: BrandProfile = await brandRepository.findById(brandId) || DEMO_BRAND_PROFILE;
  if (!brand) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `Brand with ID '${brandId}' not found.` }
    });
  }

  // 3. Execute analysis engine
  const analysisResult = await analyzeContent(content, brand);

  // 4. Return compliant HTTP response (Contract Section 3.5.4)
  return res.status(200).json(analysisResult);
}
```

---

## 6. Testing & Validation

### Run Test Suite

```bash
cd BrandGuard-Analysis
npm test
```

### Run Demonstration

```bash
npm run build
node dist/demo.js
```

### Test Coverage Results

54 automated tests across 8 test suites pass with 100% success rate:

- `tests/apiContractIntegration.test.ts` (14 tests: Contract Section 3.5.2 & 3.5.4 exact output, all 5 categories, Promise return, summary integrity, claim verification safety, corrected content quality)
- `tests/analyzer.test.ts` (23 tests: contract schema, boundary safety, casing, slang, deduplication)
- `tests/brandNameChecker.test.ts` (3 tests: preferred vs discouraged terminology, brand variations)
- `tests/claimsChecker.test.ts` (4 tests: #1 claims, unverified claims requiring verification, approved facts substantiation)
- `tests/contentCorrector.test.ts` (2 tests: right-to-left index safe string replacement, term appending)
- `tests/requiredTermsChecker.test.ts` (3 tests: legal notices, context-sensitive required terms)
- `tests/restrictedPhrasesChecker.test.ts` (2 tests: prohibited expressions, tone-related phrasing)
- `tests/toneChecker.test.ts` (3 tests: slang detection, punctuation normalization, toneRules)
