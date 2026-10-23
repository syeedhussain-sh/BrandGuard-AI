/**
 * BrandGuard AI - Brand Compliance Analysis Engine
 * Member 3 Deliverable
 */
export * from './types.js';
export { analyzeContent, analyzeContentSync, analyzeBrandCompliance, } from './analyzer.js';
export { checkBrandNameAndTerminology } from './engine/brandNameChecker.js';
export { checkRestrictedPhrases } from './engine/restrictedPhrasesChecker.js';
export { checkRequiredTerms } from './engine/requiredTermsChecker.js';
export { checkToneGuidelines } from './engine/toneChecker.js';
export { checkClaimsRequiringVerification } from './engine/claimsChecker.js';
export { produceCorrectedContent } from './engine/contentCorrector.js';
export { deduplicateIssues, resetIssueCounter, generateIssueId } from './engine/utils.js';
import { BrandProfile } from './types.js';
/**
 * Official reference brand profile for NovaTech defined in API_CONTRACT.md Section 3.2.2 & 3.3.3.
 */
export declare const DEMO_BRAND_PROFILE: BrandProfile;
/**
 * Standard reference profile for NovaTech used in unit tests and integration demos.
 */
export declare const DEMO_NOVATECH_PROFILE: BrandProfile;
//# sourceMappingURL=index.d.ts.map