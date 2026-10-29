/**
 * BrandGuard AI - Universal Generic Brand Governance Checker
 *
 * Implements Mode B: Universal Generic Brand Analysis for ANY company or brand
 * across ANY industry when official brand guidelines are not configured.
 *
 * Checks include:
 * - Exaggerated or absolute statements and misleading promises
 * - Unsupported factual claims and unverified rankings/guarantees
 * - Professional tone, communication quality, and clarity
 * - Brand name casing consistency
 * - Industry-tailored risk indicators (Automotive, Electronics, Food, Health, Finance, Retail, Tech, etc.)
 *
 * Note: These checks are framed as general brand risk indicators, NOT as verified
 * company policies or official regulations.
 */
import { AnalysisIssue } from '../types.js';
/**
 * Resolves canonical brand capitalization against the known brand registry.
 * If the brand is registered (e.g. "kfc" -> "KFC", "mcdonalds" -> "McDonald's"),
 * the registered canonical casing is returned.
 * If the company is unknown, the user's provided casing is preserved.
 */
export declare function getCanonicalBrandName(companyName: string): string;
/**
 * Primary entry point for Mode B: Universal Generic Brand Governance Analysis.
 *
 * Evaluates text against universal brand safety, clarity, superlatives, and industry risk indicators.
 */
export declare function checkGenericBrandGovernance(content: string, companyName?: string, industry?: string): AnalysisIssue[];
//# sourceMappingURL=genericBrandChecker.d.ts.map