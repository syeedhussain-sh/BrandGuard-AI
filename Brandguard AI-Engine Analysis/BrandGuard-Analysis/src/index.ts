/**
 * BrandGuard AI - Brand Compliance Analysis Engine
 * Member 3 Deliverable
 */

export * from './types.js';
export {
  analyzeContent,
  analyzeContentSync,
  analyzeBrandCompliance,
} from './analyzer.js';
export { checkBrandNameAndTerminology } from './engine/brandNameChecker.js';
export { checkRestrictedPhrases } from './engine/restrictedPhrasesChecker.js';
export { checkRequiredTerms } from './engine/requiredTermsChecker.js';
export { checkToneGuidelines } from './engine/toneChecker.js';
export { checkClaimsRequiringVerification } from './engine/claimsChecker.js';
export { checkGenericBrandGovernance } from './engine/genericBrandChecker.js';
export { checkCompanyIdentityMismatch, KNOWN_BRAND_REGISTRY } from './engine/brandMismatchChecker.js';
export { produceCorrectedContent } from './engine/contentCorrector.js';
export { deduplicateIssues, resetIssueCounter, generateIssueId } from './engine/utils.js';

import { BrandProfile } from './types.js';

/**
 * Official reference brand profile for NovaTech defined in API_CONTRACT.md Section 3.2.2 & 3.3.3.
 */
export const DEMO_BRAND_PROFILE: BrandProfile = {
  id: 'demo-brand',
  name: 'NovaTech',
  description: 'Enterprise cloud and AI infrastructure provider.',
  tone: ['professional', 'innovative', 'authoritative', 'accessible'],
  guidelines: {
    terminology: [
      {
        preferred: 'NovaTech Cloud Platform',
        discouraged: ['Nova Cloud', 'NovaTech CP', 'NT Cloud'],
        explanation: 'Always refer to our core offering by its complete official brand name.',
      },
      {
        preferred: 'Autonomous Intelligence',
        discouraged: ['Bot', 'Robot', 'Script'],
        explanation: 'Reflect modern AI terminology in customer-facing communication.',
      },
    ],
    restrictedPhrases: [
      {
        phrase: '100% bug-free',
        severity: 'high',
        explanation: 'Absolute reliability claims violate compliance policies.',
        suggestion: 'engineered for high reliability and resilience',
      },
      {
        phrase: 'cheapest cloud in the market',
        severity: 'high',
        explanation: 'Unsubstantiated pricing superlatives are prohibited.',
        suggestion: 'cost-effective, high-performance cloud infrastructure',
      },
      {
        phrase: 'obviously',
        severity: 'medium',
        explanation: 'Condescending tone undermines accessible brand voice.',
        suggestion: 'as demonstrated',
      },
    ],
    requiredTerms: [
      {
        term: 'NovaTech',
        context: 'Any public press release or product announcement',
        severity: 'medium',
        explanation: 'Brand name must be mentioned explicitly at least once.',
      },
    ],
    claimVerification: [
      {
        claimPattern: 'guarantee(s|d)?',
        severity: 'high',
        explanation: 'Guarantees require explicit legal team approval and SLA references.',
        suggestion: 'commit to high availability under our standard SLA',
      },
    ],
  },
  createdAt: '2026-10-22T00:00:00.000Z',
  updatedAt: '2026-10-22T00:00:00.000Z',
};

/**
 * Standard reference profile for NovaTech used in unit tests and integration demos.
 */
export const DEMO_NOVATECH_PROFILE: BrandProfile = {
  brandId: 'demo-brand',
  id: 'demo-brand',
  brandName: 'NovaTech',
  name: 'NovaTech',
  brandVariations: ['Nova Tech', 'Nova-Tech', 'novatech', 'Nova tech'],
  preferredTerminology: {
    'e-commerce': 'ecommerce',
    'drop us a line': 'contact our team',
    'web app': 'web application',
  },
  restrictedPhrases: [
    {
      phrase: 'cheap software',
      explanation: 'Our brand focuses on premium value, not cut-rate pricing.',
      suggestion: 'cost-effective solution',
      severity: 'high',
    },
    'cannot fail',
    'miracle solution',
  ],
  requiredTerms: [
    {
      term: 'All rights reserved',
      explanation: 'Legal copyright notice must accompany official copy.',
      severity: 'medium',
      placement: 'append',
    },
  ],
  toneGuidelines: {
    primaryTone: 'professional',
    avoidSlang: true,
    avoidAggressivePunctuation: true,
    avoidExcessiveCapitalization: true,
    disallowedWords: ['crappy', 'insane discount', 'freaking'],
  },
  approvedFacts: [
    'NovaTech guarantees 99.9% uptime per SLA',
    'Over 10,000 satisfied enterprise customers',
  ],
};
