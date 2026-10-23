import { AnalysisInput, AnalysisOptions, AnalysisResponse, AnalysisResult, BrandProfile } from './types.js';
/**
 * Analyzes text against a brand profile for brand compliance.
 *
 * Supports overloaded calling conventions:
 * 1. analyzeBrandCompliance(inputObject, [profile])
 * 2. analyzeBrandCompliance(contentString, [profile], [options])
 *
 * @param input Text content or analysis input object
 * @param profile Brand profile containing guidelines and rules
 * @param options Additional execution options
 * @returns Standardized AnalysisResult (AnalysisResponse)
 */
export declare function analyzeBrandCompliance(input: AnalysisInput | string, profile?: BrandProfile | AnalysisOptions, options?: AnalysisOptions): AnalysisResult;
/**
 * Analyzes candidate text against a brand profile's guidelines.
 *
 * Implements the official Member 3 function signature defined in Section 6:
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export declare function analyzeContent(content: string, brand: BrandProfile): Promise<AnalysisResponse>;
/**
 * Pure / Synchronous variant of analyzeContent (Contract Section 6.1).
 */
export declare function analyzeContentSync(content: string, brand: BrandProfile): AnalysisResponse;
//# sourceMappingURL=analyzer.d.ts.map