import { AnalysisIssue } from '../types.js';
/**
 * Checks content for contextual product and industry mismatches.
 *
 * @param content - User submitted marketing copy
 * @param companyName - Active brand/company name (e.g. "KFC", "Tata Motors")
 * @param industry - Active industry (e.g. "Food and Restaurants", "Automotive")
 */
export declare function checkContextualIndustryMismatch(content: string, companyName?: string, industry?: string): AnalysisIssue[];
//# sourceMappingURL=contextualMismatchChecker.d.ts.map