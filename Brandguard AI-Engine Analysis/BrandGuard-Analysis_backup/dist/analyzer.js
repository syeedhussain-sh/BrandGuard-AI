"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBrandCompliance = analyzeBrandCompliance;
exports.analyzeContent = analyzeContent;
exports.analyzeContentSync = analyzeContentSync;
const brandNameChecker_js_1 = require("./engine/brandNameChecker.js");
const restrictedPhrasesChecker_js_1 = require("./engine/restrictedPhrasesChecker.js");
const requiredTermsChecker_js_1 = require("./engine/requiredTermsChecker.js");
const toneChecker_js_1 = require("./engine/toneChecker.js");
const claimsChecker_js_1 = require("./engine/claimsChecker.js");
const contentCorrector_js_1 = require("./engine/contentCorrector.js");
const utils_js_1 = require("./engine/utils.js");
const crypto_1 = require("crypto");
/**
 * Helper to generate a contract-compliant analysisId (e.g. anlz_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d).
 */
function createAnalysisId() {
    try {
        return `anlz_${(0, crypto_1.randomUUID)()}`;
    }
    catch {
        const ts = Date.now().toString(36);
        const rand = Math.random().toString(36).substring(2, 10);
        return `anlz_${ts}_${rand}`;
    }
}
/**
 * Normalizes input arguments to extract text content, brand profile, and options.
 */
function normalizeInputs(inputOrContent, profileOrOptions, maybeOptions) {
    let content = '';
    let profile = {};
    let options = {};
    if (typeof inputOrContent === 'string') {
        content = inputOrContent;
        if (profileOrOptions &&
            ('name' in profileOrOptions ||
                'brandName' in profileOrOptions ||
                'guidelines' in profileOrOptions ||
                'id' in profileOrOptions ||
                'brandId' in profileOrOptions)) {
            profile = profileOrOptions;
            options = maybeOptions || {};
        }
        else if (profileOrOptions) {
            options = profileOrOptions;
        }
    }
    else if (inputOrContent && typeof inputOrContent === 'object') {
        content = inputOrContent.content || '';
        if (inputOrContent.brand) {
            profile = inputOrContent.brand;
        }
        else if (inputOrContent.profile) {
            profile = inputOrContent.profile;
        }
        else if (profileOrOptions &&
            ('name' in profileOrOptions ||
                'brandName' in profileOrOptions ||
                'guidelines' in profileOrOptions ||
                'id' in profileOrOptions ||
                'brandId' in profileOrOptions)) {
            profile = profileOrOptions;
        }
        options = {
            ...(inputOrContent.options || {}),
            ...(maybeOptions || {}),
            ...(inputOrContent.context ? { context: inputOrContent.context } : {}),
        };
    }
    // Fallback for brand identifier if not present in profile
    if (typeof inputOrContent === 'object' && inputOrContent.brandId) {
        if (!profile.id)
            profile.id = inputOrContent.brandId;
        if (!profile.brandId)
            profile.brandId = inputOrContent.brandId;
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
function analyzeBrandCompliance(input, profile, options) {
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
        const rawIssues = [];
        // 1. Detect incorrect brand-name spelling and terminology
        if (activeProfile?.name ||
            activeProfile?.brandName ||
            activeProfile?.preferredTerminology ||
            activeProfile?.guidelines?.terminology) {
            rawIssues.push(...(0, brandNameChecker_js_1.checkBrandNameAndTerminology)(content, activeProfile));
        }
        // 2. Detect restricted phrases defined by selected brand profile
        if ((activeProfile?.restrictedPhrases && activeProfile.restrictedPhrases.length > 0) ||
            (activeProfile?.guidelines?.restrictedPhrases && activeProfile.guidelines.restrictedPhrases.length > 0)) {
            rawIssues.push(...(0, restrictedPhrasesChecker_js_1.checkRestrictedPhrases)(content, activeProfile));
        }
        // 3. Identify required terms that are missing
        if ((activeProfile?.requiredTerms && activeProfile.requiredTerms.length > 0) ||
            (activeProfile?.guidelines?.requiredTerms && activeProfile.guidelines.requiredTerms.length > 0)) {
            rawIssues.push(...(0, requiredTermsChecker_js_1.checkRequiredTerms)(content, activeProfile, activeOptions));
        }
        // 4. Identify wording that may not follow the specified tone
        if (activeProfile?.toneGuidelines ||
            activeProfile?.tone ||
            (activeProfile?.guidelines?.toneRules && activeProfile.guidelines.toneRules.length > 0)) {
            rawIssues.push(...(0, toneChecker_js_1.checkToneGuidelines)(content, activeProfile));
        }
        // 5. Flag claims such as "cheapest in the world", "100% customer satisfaction" or custom claims rules
        rawIssues.push(...(0, claimsChecker_js_1.checkClaimsRequiringVerification)(content, activeProfile));
        // 6. Deduplicate issues to prevent repeated/overlapping warnings on the same text
        const deduplicated = (0, utils_js_1.deduplicateIssues)(rawIssues);
        // 7. Format issues to strictly comply with the shared contract
        const finalIssues = deduplicated.map((issue) => ({
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
        const correctedContent = (0, contentCorrector_js_1.produceCorrectedContent)(content, finalIssues, activeProfile);
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
    }
    catch (error) {
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
async function analyzeContent(content, brand) {
    return analyzeBrandCompliance(content, brand);
}
/**
 * Pure / Synchronous variant of analyzeContent (Contract Section 6.1).
 */
function analyzeContentSync(content, brand) {
    return analyzeBrandCompliance(content, brand);
}
//# sourceMappingURL=analyzer.js.map