import { AnalysisIssue, BrandProfile } from '../types.js';
/**
 * Checks for unsupported claims requiring verification.
 * Note: Claims are NOT marked false; they are flagged as requiring verification.
 */
export declare function checkClaimsRequiringVerification(content: string, profile: BrandProfile): AnalysisIssue[];
//# sourceMappingURL=claimsChecker.d.ts.map