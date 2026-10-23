import { AnalysisIssue, BrandProfile } from '../types.js';
/**
 * Produces corrected content by applying suggested replacements and missing terms.
 * Guarantees that compliant copy is returned unmodified, and overlapping spans
 * are filtered cleanly to prevent index corruption.
 */
export declare function produceCorrectedContent(originalContent: string, issues: AnalysisIssue[], profile?: BrandProfile): string;
//# sourceMappingURL=contentCorrector.d.ts.map