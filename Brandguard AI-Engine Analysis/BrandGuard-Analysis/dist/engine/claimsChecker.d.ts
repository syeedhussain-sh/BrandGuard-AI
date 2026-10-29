import { AnalysisIssue, BrandProfile, SupportedClaim } from '../types.js';
/**
 * Searches approved brand facts to find a substantiating reference for a given claim or sentence.
 */
export declare function findSubstantiatingFact(claimText: string, approvedFacts: string[], sentenceContext?: string): {
    fact: string;
    citation: string;
} | null;
/**
 * Primary claim verification function.
 * Evaluates claims in content against brand rules and approved brand facts.
 *
 * Returns:
 * - issues: Unsubstantiated claims, absolute guarantees, or claims requiring review.
 * - supportedClaims: Claims verified and substantiated by approved brand facts.
 */
export declare function verifyContentClaims(content: string, profile: BrandProfile): {
    issues: AnalysisIssue[];
    supportedClaims: SupportedClaim[];
};
/**
 * Backwards compatibility helper returning only issues.
 */
export declare function checkClaimsRequiringVerification(content: string, profile: BrandProfile): AnalysisIssue[];
//# sourceMappingURL=claimsChecker.d.ts.map