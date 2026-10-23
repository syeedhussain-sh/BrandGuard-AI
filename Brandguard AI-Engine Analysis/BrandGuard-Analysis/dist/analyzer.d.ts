import { AnalysisInput, AnalysisOptions, AnalysisResponse, AnalysisResult, BrandProfile } from './types.js';
/**
 * Analyzes text against a brand profile for brand compliance.
 *
 * Supports two analysis modes:
 * Mode A: Configured Brand Analysis (when brand profile has configured guidelines)
 * Mode B: Universal Generic Brand Analysis (for ANY company or unconfigured brand)
 *
 * @param input Text content or analysis input object
 * @param profile Brand profile containing guidelines and rules
 * @param options Additional execution options
 * @returns Standardized AnalysisResult (AnalysisResponse)
 */
export declare function analyzeBrandCompliance(input: AnalysisInput | string, profile?: BrandProfile | AnalysisOptions, options?: AnalysisOptions): AnalysisResult;
/**
 * Analyzes candidate text against a brand profile's guidelines or universal generic rules.
 *
 * Implements the official function signature defined in Section 6:
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile or company descriptor.
 * @param options - Optional analysis execution options.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
export declare function analyzeContent(content: string, brand: BrandProfile, options?: AnalysisOptions): Promise<AnalysisResponse>;
/**
 * Pure / Synchronous variant of analyzeContent (Contract Section 6.1).
 */
export declare function analyzeContentSync(content: string, brand: BrandProfile, options?: AnalysisOptions): AnalysisResponse;
//# sourceMappingURL=analyzer.d.ts.map