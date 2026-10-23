import {
  analyzeContent as engineAnalyzeContent,
  analyzeContentSync as engineAnalyzeContentSync,
  AnalysisOptions
} from '@brandguard/analysis-engine';
import { AnalysisResponse, BrandProfile } from '../types';

/**
 * Analysis Service Adapter
 * 
 * Integrates the backend with the official BrandGuard Analysis Engine (@brandguard/analysis-engine)
 * supporting both Mode A (Configured Brand Analysis) and Mode B (Universal Generic Brand Analysis).
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile or company descriptor.
 * @param options - Optional analysis execution options.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export async function analyzeContent(
  content: string,
  brand: BrandProfile,
  options?: AnalysisOptions
): Promise<AnalysisResponse> {
  return engineAnalyzeContent(content, brand, options);
}

/**
 * Synchronous variant of analyzeContent.
 */
export function analyzeContentSync(
  content: string,
  brand: BrandProfile,
  options?: AnalysisOptions
): AnalysisResponse {
  return engineAnalyzeContentSync(content, brand, options);
}
