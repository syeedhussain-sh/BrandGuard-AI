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
const genericBrandChecker_js_1 = require("./engine/genericBrandChecker.js");
const brandMismatchChecker_js_1 = require("./engine/brandMismatchChecker.js");
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
 * Normalizes input arguments to extract text content, brand profile, options, company name, and industry.
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
            ...(inputOrContent.companyName ? { companyName: inputOrContent.companyName } : {}),
            ...(inputOrContent.brandName ? { brandName: inputOrContent.brandName } : {}),
            ...(inputOrContent.industry ? { industry: inputOrContent.industry } : {}),
            ...(inputOrContent.isGeneric !== undefined ? { isGeneric: inputOrContent.isGeneric } : {}),
        };
    }
    // Fallback for brand identifier if not present in profile
    if (typeof inputOrContent === 'object' && inputOrContent.brandId) {
        if (!profile.id)
            profile.id = inputOrContent.brandId;
        if (!profile.brandId)
            profile.brandId = inputOrContent.brandId;
    }
    const companyName = (options.companyName ||
        profile.companyName ||
        (typeof inputOrContent === 'object' ? inputOrContent.companyName || inputOrContent.brandName : '') ||
        profile.name ||
        profile.brandName ||
        '').trim();
    const industry = (options.industry ||
        profile.industry ||
        (typeof inputOrContent === 'object' ? inputOrContent.industry : '') ||
        '').trim();
    return { content, profile, options, companyName, industry };
}
/**
 * Evaluates whether a brand profile has officially configured custom guidelines.
 */
function hasConfiguredGuidelines(profile) {
    if (!profile || typeof profile !== 'object')
        return false;
    const g = profile.guidelines;
    if (g) {
        if (Array.isArray(g.terminology) && g.terminology.length > 0)
            return true;
        if (Array.isArray(g.restrictedPhrases) && g.restrictedPhrases.length > 0)
            return true;
        if (Array.isArray(g.requiredTerms) && g.requiredTerms.length > 0)
            return true;
        if (Array.isArray(g.claimVerification) && g.claimVerification.length > 0)
            return true;
        if (Array.isArray(g.toneRules) && g.toneRules.length > 0)
            return true;
    }
    if (profile.preferredTerminology && Object.keys(profile.preferredTerminology).length > 0)
        return true;
    if (Array.isArray(profile.restrictedPhrases) && profile.restrictedPhrases.length > 0)
        return true;
    if (Array.isArray(profile.requiredTerms) && profile.requiredTerms.length > 0)
        return true;
    return false;
}
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
function analyzeBrandCompliance(input, profile, options) {
    const analysisId = options?.analysisId || createAnalysisId();
    try {
        const normalized = normalizeInputs(input, profile, options);
        const content = normalized.content;
        const activeProfile = normalized.profile;
        const activeOptions = normalized.options;
        const companyName = normalized.companyName;
        const industry = normalized.industry;
        // Check whether official brand guidelines exist or if generic mode is requested
        const isConfigured = hasConfiguredGuidelines(activeProfile) && !activeOptions.isGeneric && !activeProfile.isGeneric;
        const isGeneric = !isConfigured;
        const governanceMode = isConfigured ? 'configured' : 'generic';
        const modeLabel = isConfigured
            ? 'Configured Brand Analysis — Official Brand Guidelines Active'
            : 'Generic Brand Analysis — Official Brand Guidelines Not Configured';
        const officialGuidelinesConfigured = isConfigured;
        const disclaimer = isGeneric
            ? 'Official brand guidelines are not configured for this brand. Content was evaluated using universal brand governance principles and general industry risk indicators.'
            : undefined;
        // Mode A preserves 'rules' string for backward compatibility with existing tests
        const analysisMode = isConfigured ? 'rules' : (activeOptions.mode || 'generic');
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
                analysisMode,
                companyName: companyName || undefined,
                brandName: companyName || undefined,
                industry: industry || undefined,
                governanceMode,
                modeLabel,
                officialGuidelinesConfigured,
                disclaimer,
            };
        }
        const rawIssues = [];
        // 0. Detect cross-company brand identity mismatches (applicable to both Mode A and Mode B)
        if (companyName) {
            rawIssues.push(...(0, brandMismatchChecker_js_1.checkCompanyIdentityMismatch)(content, companyName, industry));
        }
        if (isConfigured) {
            // =========================================================================
            // Mode A: Configured Brand Analysis
            // =========================================================================
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
            // 5. Flag claims requiring verification defined by brand profile
            rawIssues.push(...(0, claimsChecker_js_1.checkClaimsRequiringVerification)(content, activeProfile));
        }
        else {
            // =========================================================================
            // Mode B: Universal Generic Brand Analysis
            // Evaluates content for ANY company across ANY industry without borrowing
            // or inventing unconfigured company rules.
            // =========================================================================
            rawIssues.push(...(0, genericBrandChecker_js_1.checkGenericBrandGovernance)(content, companyName, industry));
        }
        // Deduplicate issues to prevent repeated/overlapping warnings on the same text
        const deduplicated = (0, utils_js_1.deduplicateIssues)(rawIssues);
        // Format issues to strictly comply with the shared contract
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
        // Produce corrected content preserving original meaning as much as possible
        const correctedContent = (0, contentCorrector_js_1.produceCorrectedContent)(content, finalIssues, isConfigured ? activeProfile : { name: companyName });
        // Compute summary
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
            analysisMode,
            companyName: companyName || undefined,
            brandName: companyName || undefined,
            industry: industry || undefined,
            governanceMode,
            modeLabel,
            officialGuidelinesConfigured,
            disclaimer,
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
 * Analyzes candidate text against a brand profile's guidelines or universal generic rules.
 *
 * Implements the official function signature defined in Section 6:
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile or company descriptor.
 * @param options - Optional analysis execution options.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
async function analyzeContent(content, brand, options) {
    return analyzeBrandCompliance(content, brand, options);
}
/**
 * Pure / Synchronous variant of analyzeContent (Contract Section 6.1).
 */
function analyzeContentSync(content, brand, options) {
    return analyzeBrandCompliance(content, brand, options);
}
//# sourceMappingURL=analyzer.js.map