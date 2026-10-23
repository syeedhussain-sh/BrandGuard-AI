import {
  analyzeContent as engineAnalyzeContent,
  analyzeContentSync as engineAnalyzeContentSync
} from '@brandguard/analysis-engine';
import { AnalysisResponse, BrandProfile } from '../types';

/**
 * Analysis Service Adapter
 * 
 * Integrates the backend with the official BrandGuard Analysis Engine (@brandguard/analysis-engine)
 * delivered by Member 3, as specified in API_CONTRACT.md Section 6.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export async function analyzeContent(
  content: string,
  brand: BrandProfile
): Promise<AnalysisResponse> {
  return engineAnalyzeContent(content, brand);
}

/**
 * Synchronous variant of analyzeContent.
 */
export function analyzeContentSync(
  content: string,
  brand: BrandProfile
): AnalysisResponse {
  return engineAnalyzeContentSync(content, brand);
}
