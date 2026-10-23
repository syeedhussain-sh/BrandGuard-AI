/**
 * BrandGuard AI - Company Identity and Brand Mismatch Checker
 *
 * Validates that marketing content aligns with the selected company identity.
 * Detects when marketing copy appears to reference a different commercial company,
 * competitor brand, or mismatched product context.
 */
import { AnalysisIssue } from '../types.js';
export interface BrandEntity {
    name: string;
    aliases: string[];
    industry: string;
    keywords?: string[];
}
/**
 * Curated registry of recognized commercial brands across major industries.
 * Used for entity identification and detecting cross-brand contamination.
 */
export declare const KNOWN_BRAND_REGISTRY: BrandEntity[];
/**
 * Checks content for references to foreign companies or competitor entities
 * that differ from the selected active company.
 *
 * @param content - The marketing copy submitted by the user.
 * @param selectedCompany - The active company or brand name selected in the audit context.
 * @param selectedIndustry - The active industry selected (optional).
 * @returns Array of AnalysisIssue items flagging detected company identity mismatches.
 */
export declare function checkCompanyIdentityMismatch(content: string, selectedCompany?: string, selectedIndustry?: string): AnalysisIssue[];
//# sourceMappingURL=brandMismatchChecker.d.ts.map