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
 * Checks whether an entity alias matches the selected target company.
 */
/**
 * Normalizes straight and typographic apostrophes for consistent matching.
 */
export declare function normalizeApostrophes(str: string): string;
/**
 * Checks content for references to foreign companies or competitor entities
 * that differ from the selected active company.
 *
 * @param content - The marketing copy submitted by the user.
 * @param selectedCompany - The active company or brand name selected in the audit context.
 * @param selectedIndustry - The active industry selected (optional).
 * @returns Array of AnalysisIssue items flagging detected company identity mismatches.
 */
/**
 * Result of generating a safe, contextual correction for competitor brand references.
 */
export interface CompetitorCorrection {
    canCorrect: boolean;
    requiresHumanReview: boolean;
    suggestedText: string;
    explanation: string;
}
/**
 * Extracts enclosing sentence around a text span.
 */
export declare function getEnclosingSentence(content: string, startIndex: number, endIndex: number): {
    sentence: string;
    start: number;
    end: number;
};
/**
 * Generates a safe, brand-appropriate correction or marks content for human review.
 */
export declare function generateCompetitorBrandCorrection(content: string, startIndex: number, endIndex: number, matchedText: string, competitorEntity: BrandEntity, selectedCompany: string, selectedIndustry?: string): CompetitorCorrection;
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