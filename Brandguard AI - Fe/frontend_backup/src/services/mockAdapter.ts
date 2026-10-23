import type { BrandProfile, BrandSummary, UpdateBrandRequest } from '../types/brand';
import type { AnalyzeRequest, AnalysisResponse, IssueItem } from '../types/analysis';
import type { HealthStatus } from '../types/api';

/**
 * =====================================================================
 * DEVELOPMENT MOCK ADAPTER - FOR UI TESTING & OFFLINE PREVIEW ONLY
 * =====================================================================
 * This module is isolated and strictly conforms to the BrandGuard AI API Contract
 * so teammates and evaluators can preview the UI when the backend server is offline.
 */

export const INITIAL_NOVATECH_PROFILE: BrandProfile = {
  id: 'demo-brand',
  name: 'NovaTech',
  description: 'Enterprise cloud and AI infrastructure provider.',
  tone: ['professional', 'innovative', 'authoritative', 'accessible'],
  guidelines: {
    terminology: [
      {
        preferred: 'NovaTech Cloud Platform',
        discouraged: ['Nova Cloud', 'NovaTech CP', 'NT Cloud'],
        explanation: 'Always refer to our core offering by its complete official brand name.'
      },
      {
        preferred: 'Autonomous Intelligence',
        discouraged: ['Bot', 'Robot', 'Script'],
        explanation: 'Reflect modern AI terminology in customer-facing communication.'
      },
      {
        preferred: 'AI Co-pilot',
        discouraged: ['AI assistant'],
        explanation: 'Use AI Co-pilot for product features.'
      },
      {
        preferred: 'Enterprise Partner',
        discouraged: ['client', 'customer'],
        explanation: 'Customer relationships are strategic enterprise partnerships.'
      },
      {
        preferred: 'cost-effective',
        discouraged: ['cheap'],
        explanation: 'Use cost-effective for pricing and ROI discussions.'
      }
    ],
    restrictedPhrases: [
      {
        phrase: '100% bug-free',
        severity: 'high',
        explanation: 'Absolute reliability claims violate compliance policies.',
        suggestion: 'engineered for high reliability and resilience'
      },
      {
        phrase: 'cheapest cloud in the market',
        severity: 'high',
        explanation: 'Unsubstantiated pricing superlatives are prohibited.',
        suggestion: 'cost-effective, high-performance cloud infrastructure'
      },
      {
        phrase: 'obviously',
        severity: 'medium',
        explanation: 'Condescending tone undermines accessible brand voice.',
        suggestion: 'as demonstrated'
      },
      {
        phrase: 'guaranteed 100% bug-free',
        severity: 'high',
        explanation: 'Absolute reliability claims violate compliance policies.',
        suggestion: 'engineered for high reliability and resilience'
      },
      {
        phrase: 'can never fail',
        severity: 'high',
        explanation: 'Absolute claims without SLA violate compliance policies.',
        suggestion: 'engineered for fault-tolerant resilience'
      }
    ],
    requiredTerms: [
      {
        term: 'NovaTech',
        context: 'Any public press release or product announcement',
        severity: 'medium',
        explanation: 'Brand name must be mentioned explicitly at least once.'
      },
      {
        term: 'Enterprise-grade',
        context: 'Product capabilities',
        severity: 'low',
        explanation: 'Highlight enterprise reliability tier.'
      }
    ],
    claimVerification: [
      {
        claimPattern: 'guarantee(s|d)?',
        severity: 'high',
        explanation: 'Guarantees require explicit legal team approval and SLA references.',
        suggestion: 'commit to high availability under our standard SLA'
      }
    ],
    toneRules: [
      {
        bannedWordOrStyle: 'miraculous',
        suggestion: 'empirically verified',
        explanation: 'Avoid hyperbole and sensationalism in product announcements.'
      },
      {
        bannedWordOrStyle: 'magic',
        suggestion: 'algorithmic',
        explanation: 'Enterprise AI systems are deterministic and audited, not magic.'
      }
    ]
  },
  createdAt: '2026-10-22T00:00:00.000Z',
  updatedAt: '2026-10-22T00:00:00.000Z'
};

const mockBrandsDatabase: Map<string, BrandProfile> = new Map([
  ['demo-brand', INITIAL_NOVATECH_PROFILE]
]);

export const devMockAdapter = {
  isMockAdapter: true,

  async checkHealth(): Promise<HealthStatus> {
    await new Promise((r) => setTimeout(r, 150));
    return {
      status: 'ok',
      service: 'BrandGuard AI Dev Mock (Offline)',
      timestamp: new Date().toISOString(),
      uptime: 42.0
    };
  },

  async getBrands(): Promise<BrandSummary[]> {
    await new Promise((r) => setTimeout(r, 150));
    return Array.from(mockBrandsDatabase.values()).map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      tone: b.tone,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }));
  },

  async getBrand(brandId: string): Promise<BrandProfile> {
    await new Promise((r) => setTimeout(r, 200));
    const brand = mockBrandsDatabase.get(brandId);
    if (!brand) {
      return { ...INITIAL_NOVATECH_PROFILE, id: brandId };
    }
    return JSON.parse(JSON.stringify(brand));
  },

  async updateBrand(brandId: string, payload: UpdateBrandRequest | BrandProfile): Promise<BrandProfile> {
    await new Promise((r) => setTimeout(r, 250));
    const existing = mockBrandsDatabase.get(brandId) || INITIAL_NOVATECH_PROFILE;
    const updated: BrandProfile = {
      ...existing,
      id: brandId,
      name: payload.name || existing.name,
      description: payload.description !== undefined ? payload.description : existing.description,
      tone: payload.tone || existing.tone,
      guidelines: payload.guidelines || existing.guidelines,
      updatedAt: new Date().toISOString()
    };
    mockBrandsDatabase.set(brandId, updated);
    return JSON.parse(JSON.stringify(updated));
  },

  async analyzeContent(request: AnalyzeRequest): Promise<AnalysisResponse> {
    await new Promise((r) => setTimeout(r, 400));
    const brand = mockBrandsDatabase.get(request.brandId) || INITIAL_NOVATECH_PROFILE;
    const content = request.content || '';

    const issues: IssueItem[] = [];
    let corrected = content;
    let issueCounter = 1;

    const guidelines = brand.guidelines || {};

    // 1. Terminology: check discouraged variations
    if (guidelines.terminology) {
      for (const termRule of guidelines.terminology) {
        for (const discouraged of termRule.discouraged) {
          const regex = new RegExp(`\\b${escapeRegExp(discouraged)}\\b`, 'gi');
          let match;
          while ((match = regex.exec(content)) !== null) {
            issues.push({
              id: `iss_${issueCounter++}`,
              category: 'terminology',
              severity: 'high',
              matchedText: match[0],
              explanation: termRule.explanation,
              suggestion: termRule.preferred
            });
          }
          corrected = corrected.replace(new RegExp(`\\b${escapeRegExp(discouraged)}\\b`, 'gi'), termRule.preferred);
        }
      }
    }

    // 2. Restricted phrases
    if (guidelines.restrictedPhrases) {
      for (const phraseRule of guidelines.restrictedPhrases) {
        const regex = new RegExp(`\\b${escapeRegExp(phraseRule.phrase)}\\b`, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null) {
          issues.push({
            id: `iss_${issueCounter++}`,
            category: 'restricted_phrase',
            severity: phraseRule.severity,
            matchedText: match[0],
            explanation: phraseRule.explanation,
            suggestion: phraseRule.suggestion
          });
        }
        corrected = corrected.replace(new RegExp(`\\b${escapeRegExp(phraseRule.phrase)}\\b`, 'gi'), phraseRule.suggestion);
      }
    }

    // 3. Claim verification regex patterns
    if (guidelines.claimVerification) {
      for (const claimRule of guidelines.claimVerification) {
        try {
          const regex = new RegExp(`\\b${claimRule.claimPattern}\\b`, 'gi');
          let match;
          while ((match = regex.exec(content)) !== null) {
            issues.push({
              id: `iss_${issueCounter++}`,
              category: 'claim_verification',
              severity: claimRule.severity,
              matchedText: match[0],
              explanation: claimRule.explanation,
              suggestion: claimRule.suggestion
            });
          }
          corrected = corrected.replace(new RegExp(`\\b${claimRule.claimPattern}\\b`, 'gi'), claimRule.suggestion);
        } catch {
          // invalid pattern ignored
        }
      }
    }

    // 4. Tone rules
    if (guidelines.toneRules) {
      for (const toneRule of guidelines.toneRules) {
        const regex = new RegExp(`\\b${escapeRegExp(toneRule.bannedWordOrStyle)}\\b`, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null) {
          issues.push({
            id: `iss_${issueCounter++}`,
            category: 'tone',
            severity: 'medium',
            matchedText: match[0],
            explanation: toneRule.explanation,
            suggestion: toneRule.suggestion
          });
        }
        corrected = corrected.replace(new RegExp(`\\b${escapeRegExp(toneRule.bannedWordOrStyle)}\\b`, 'gi'), toneRule.suggestion);
      }
    }

    // 5. Required terms
    if (guidelines.requiredTerms && content.length > 50) {
      for (const reqRule of guidelines.requiredTerms) {
        const contains = new RegExp(`\\b${escapeRegExp(reqRule.term)}\\b`, 'i').test(content);
        if (!contains) {
          issues.push({
            id: `iss_${issueCounter++}`,
            category: 'missing_term',
            severity: reqRule.severity,
            matchedText: `Missing: ${reqRule.term}`,
            explanation: reqRule.explanation,
            suggestion: `Include explicit mention of "${reqRule.term}" in the copy.`
          });
        }
      }
    }

    const highCount = issues.filter((i) => i.severity === 'high').length;
    const mediumCount = issues.filter((i) => i.severity === 'medium').length;
    const lowCount = issues.filter((i) => i.severity === 'low').length;

    return {
      success: true,
      analysisId: `anlz_${Math.random().toString(36).substring(2, 10)}-${Date.now()}`,
      summary: {
        totalIssues: issues.length,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      issues,
      correctedContent: corrected,
      analysisMode: 'rules'
    };
  }
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
