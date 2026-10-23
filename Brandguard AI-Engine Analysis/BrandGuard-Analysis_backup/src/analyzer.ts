import {
  AnalysisInput,
  AnalysisIssue,
  AnalysisOptions,
  AnalysisResponse,
  AnalysisResult,
  BrandProfile,
} from './types.js';
import { checkBrandNameAndTerminology } from './engine/brandNameChecker.js';
import { checkRestrictedPhrases } from './engine/restrictedPhrasesChecker.js';
import { checkRequiredTerms } from './engine/requiredTermsChecker.js';
import { checkToneGuidelines } from './engine/toneChecker.js';
import { checkClaimsRequiringVerification } from './engine/claimsChecker.js';
import { produceCorrectedContent } from './engine/contentCorrector.js';
import { deduplicateIssues, generateIssueId } from './engine/utils.js';
import { randomUUID } from 'crypto';

/**
 * Helper to generate a contract-compliant analysisId (e.g. anlz_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d).
 */
function createAnalysisId(): string {
  try {
    return `anlz_${randomUUID()}`;
  } catch {
    const ts = Date.now().toString(36);
    const rand = Math.random().toString(36).substring(2, 10);
    return `anlz_${ts}_${rand}`;
  }
}

/**
 * Normalizes input arguments to extract text content, brand profile, and options.
 */
function normalizeInputs(
  inputOrContent: string | AnalysisInput,
  profileOrOptions?: BrandProfile | AnalysisOptions,
  maybeOptions?: AnalysisOptions
): {
  content: string;
  profile: BrandProfile;
  options: AnalysisOptions;
} {
  let content = '';
  let profile: BrandProfile = {};
  let options: AnalysisOptions = {};

  if (typeof inputOrContent === 'string') {
    content = inputOrContent;
    if (
      profileOrOptions &&
      ('name' in profileOrOptions ||
        'brandName' in profileOrOptions ||
        'guidelines' in profileOrOptions ||
        'id' in profileOrOptions ||
        'brandId' in profileOrOptions)
    ) {
      profile = profileOrOptions as BrandProfile;
      options = maybeOptions || {};
    } else if (profileOrOptions) {
      options = profileOrOptions as AnalysisOptions;
    }
  } else if (inputOrContent && typeof inputOrContent === 'object') {
    content = inputOrContent.content || '';
    if (inputOrContent.brand) {
      profile = inputOrContent.brand;
    } else if (inputOrContent.profile) {
      profile = inputOrContent.profile;
    } else if (
      profileOrOptions &&
      ('name' in profileOrOptions ||
        'brandName' in profileOrOptions ||
        'guidelines' in profileOrOptions ||
        'id' in profileOrOptions ||
        'brandId' in profileOrOptions)
    ) {
      profile = profileOrOptions as BrandProfile;
    }

    options = {
      ...(inputOrContent.options || {}),
      ...(maybeOptions || {}),
      ...(inputOrContent.context ? { context: inputOrContent.context } : {}),
    };
  }

  // Fallback for brand identifier if not present in profile
  if (typeof inputOrContent === 'object' && inputOrContent.brandId) {
    if (!profile.id) profile.id = inputOrContent.brandId;
    if (!profile.brandId) profile.brandId = inputOrContent.brandId;
  }

  return { content, profile, options };
}

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
export function analyzeBrandCompliance(
  input: AnalysisInput | string,
  profile?: BrandProfile | AnalysisOptions,
  options?: AnalysisOptions
): AnalysisResult {
  const analysisId = options?.analysisId || createAnalysisId();

  try {
    const normalized = normalizeInputs(input, profile, options);
    const content = normalized.content;
    const activeProfile = normalized.profile;
    const activeOptions = normalized.options;

    // Handle empty or whitespace-only content safely
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return {
        success: true,
        analysisId,
        summary: {
          totalIssues: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
        issues: [],
        correctedContent: '',
        analysisMode: 'rules',
      };
    }

    const rawIssues: AnalysisIssue[] = [];

    // 1. Detect incorrect brand-name spelling and terminology
    if (
      activeProfile?.name ||
      activeProfile?.brandName ||
      activeProfile?.preferredTerminology ||
      activeProfile?.guidelines?.terminology
    ) {
      rawIssues.push(...checkBrandNameAndTerminology(content, activeProfile));
    }

    // 2. Detect restricted phrases defined by selected brand profile
    if (
      (activeProfile?.restrictedPhrases && activeProfile.restrictedPhrases.length > 0) ||
      (activeProfile?.guidelines?.restrictedPhrases && activeProfile.guidelines.restrictedPhrases.length > 0)
    ) {
      rawIssues.push(...checkRestrictedPhrases(content, activeProfile));
    }

    // 3. Identify required terms that are missing
    if (
      (activeProfile?.requiredTerms && activeProfile.requiredTerms.length > 0) ||
      (activeProfile?.guidelines?.requiredTerms && activeProfile.guidelines.requiredTerms.length > 0)
    ) {
      rawIssues.push(...checkRequiredTerms(content, activeProfile, activeOptions));
    }

    // 4. Identify wording that may not follow the specified tone
    if (
      activeProfile?.toneGuidelines ||
      activeProfile?.tone ||
      (activeProfile?.guidelines?.toneRules && activeProfile.guidelines.toneRules.length > 0)
    ) {
      rawIssues.push(...checkToneGuidelines(content, activeProfile));
    }

    // 5. Flag claims such as "cheapest in the world", "100% customer satisfaction" or custom claims rules
    rawIssues.push(...checkClaimsRequiringVerification(content, activeProfile));

    // 6. Deduplicate issues to prevent repeated/overlapping warnings on the same text
    const deduplicated = deduplicateIssues(rawIssues);

    // 7. Format issues to strictly comply with the shared contract
    const finalIssues: AnalysisIssue[] = deduplicated.map((issue) => ({
      id: issue.id,
      category: issue.category,
      severity: issue.severity,
      matchedText: issue.matchedText,
      explanation: issue.explanation,
      suggestion: issue.suggestion,
      ...(issue.startIndex !== undefined ? { startIndex: issue.startIndex } : {}),
      ...(issue.endIndex !== undefined ? { endIndex: issue.endIndex } : {}),
    }));

    // 8. Produce corrected content preserving original meaning as much as possible
    const correctedContent = produceCorrectedContent(content, finalIssues, activeProfile);

    // 9. Compute summary
    const summary = {
      totalIssues: finalIssues.length,
      high: finalIssues.filter((i) => i.severity === 'high').length,
      medium: finalIssues.filter((i) => i.severity === 'medium').length,
      low: finalIssues.filter((i) => i.severity === 'low').length,
    };

    return {
      success: true,
      analysisId,
      summary,
      issues: finalIssues,
      correctedContent,
      analysisMode: 'rules',
    };
  } catch (error) {
    return {
      success: false,
      analysisId,
      summary: {
        totalIssues: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
      issues: [],
      correctedContent: typeof input === 'string' ? input : input?.content || '',
      analysisMode: 'rules',
      error: error instanceof Error ? error.message : 'Unknown analysis error',
    };
  }
}

/**
 * Analyzes candidate text against a brand profile's guidelines.
 *
 * Implements the official Member 3 function signature defined in Section 6:
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
 * Pure / Synchronous variant of analyzeContent (Contract Section 6.1).
 */
export function analyzeContentSync(
  content: string,
  brand: BrandProfile
): AnalysisResponse {
  return analyzeBrandCompliance(content, brand);
}
