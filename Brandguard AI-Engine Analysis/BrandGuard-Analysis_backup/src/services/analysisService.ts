/**
 * BrandGuard AI - Analysis Service
 *
 * Implements the core analysis engine function conforming to Section 6 of API_CONTRACT.md:
 * "analyzeContent(content: string, brand: BrandProfile): Promise<AnalysisResponse>"
 *
 * Author: Member 3 (Analysis Engine)
 */

import {
  AnalysisResponse,
  AnalysisResult,
  BrandProfile,
  IssueCategory,
  IssueItem,
  IssueSeverity,
  AnalysisSummary,
  BrandGuidelines,
  TerminologyRule,
  RestrictedPhraseRule,
  RequiredTermRule,
  ClaimVerificationRule,
  ToneRule,
} from '../types.js';
import { analyzeBrandCompliance } from '../analyzer.js';

/**
 * Analyzes candidate text against a brand profile's guidelines.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export async function analyzeContent(
  content: string,
  brand: BrandProfile
): Promise<AnalysisResponse> {
  return analyzeBrandCompliance(content, brand);
}

/**
 * Pure / synchronous variant of analyzeContent for synchronous execution contexts.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object.
 */
export function analyzeContentSync(
  content: string,
  brand: BrandProfile
): AnalysisResponse {
  return analyzeBrandCompliance(content, brand);
}

export {
  analyzeBrandCompliance,
  AnalysisResponse,
  AnalysisResult,
  BrandProfile,
  IssueCategory,
  IssueItem,
  IssueSeverity,
  AnalysisSummary,
  BrandGuidelines,
  TerminologyRule,
  RestrictedPhraseRule,
  RequiredTermRule,
  ClaimVerificationRule,
  ToneRule,
};
