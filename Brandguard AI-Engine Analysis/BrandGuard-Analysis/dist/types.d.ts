/**
 * Severity levels for brand compliance issues.
 * Contract: 'high' | 'medium' | 'low'
 */
export type IssueSeverity = 'high' | 'medium' | 'low';
/**
 * Categories of brand compliance issues.
 * Contract: 'terminology' | 'restricted_phrase' | 'missing_term' | 'tone' | 'claim_verification'
 */
export type IssueCategory = 'brand_identity' | 'competitor_brand' | 'terminology' | 'restricted_phrase' | 'missing_term' | 'tone' | 'claim_verification';
export type ClaimVerificationStatus = 'supported' | 'unsupported' | 'requires_review';
export interface SupportedClaim {
    claimText: string;
    matchedText: string;
    status: 'supported';
    supportingFact: string;
    evidenceCitation?: string;
    explanation: string;
    startIndex?: number;
    endIndex?: number;
}
export interface ClaimVerificationSummary {
    totalClaimsChecked: number;
    supportedClaimsCount: number;
    unsupportedClaimsCount: number;
    requiresReviewCount: number;
}
/**
 * Structure of an individual detected compliance issue (Contract Section 5).
 */
export interface IssueItem {
    id: string;
    category: IssueCategory;
    severity: IssueSeverity;
    matchedText: string;
    explanation: string;
    suggestion: string;
    startIndex?: number;
    endIndex?: number;
    requiresHumanReview?: boolean;
    verificationStatus?: ClaimVerificationStatus;
    supportingFact?: string;
    evidenceCitation?: string;
}
/**
 * Backwards compatibility alias for IssueItem.
 */
export type AnalysisIssue = IssueItem;
/**
 * Summary counts of detected issues by severity (Contract Section 5).
 */
export interface AnalysisSummary {
    totalIssues: number;
    high: number;
    medium: number;
    low: number;
}
/**
 * Analysis response contract format (Contract Section 5).
 */
export interface AnalysisResponse {
    success: boolean;
    analysisId: string;
    summary: AnalysisSummary;
    issues: IssueItem[];
    correctedContent: string;
    originalContent?: string;
    requiresHumanReview?: boolean;
    analysisMode: 'rules' | 'ai' | 'hybrid' | 'configured' | 'generic' | string;
    companyName?: string;
    brandName?: string;
    industry?: string;
    governanceMode?: 'configured' | 'generic';
    modeLabel?: string;
    officialGuidelinesConfigured?: boolean;
    disclaimer?: string;
    error?: string;
    supportedClaims?: SupportedClaim[];
    claimVerificationSummary?: ClaimVerificationSummary;
}
/**
 * Backwards compatibility alias for AnalysisResponse.
 */
export type AnalysisResult = AnalysisResponse;
/**
 * Terminology rule specification (Contract Section 5).
 */
export interface TerminologyRule {
    preferred: string;
    discouraged?: string[];
    explanation?: string;
    term?: string;
    severity?: IssueSeverity;
}
/**
 * Restricted phrase rule specification (Contract Section 5).
 */
export interface RestrictedPhraseRule {
    phrase: string;
    severity?: IssueSeverity;
    explanation?: string;
    suggestion?: string;
}
/**
 * Required term rule specification (Contract Section 5).
 */
export interface RequiredTermRule {
    term: string;
    context?: string;
    severity?: IssueSeverity;
    explanation?: string;
    suggestion?: string;
    placement?: 'append' | 'prepend';
}
/**
 * Claim verification rule specification (Contract Section 5).
 */
export interface ClaimVerificationRule {
    claimPattern: string;
    severity?: IssueSeverity;
    explanation?: string;
    suggestion?: string;
}
/**
 * Tone rules specified within brand guidelines (Contract Section 5).
 */
export interface ToneRule {
    bannedWordOrStyle: string;
    suggestion: string;
    explanation: string;
}
/**
 * Brand guidelines structure (Contract Section 5).
 */
export interface BrandGuidelines {
    terminology?: TerminologyRule[];
    restrictedPhrases?: RestrictedPhraseRule[];
    requiredTerms?: RequiredTermRule[];
    claimVerification?: ClaimVerificationRule[];
    toneRules?: ToneRule[];
}
/**
 * Tone configuration options and constraints (Legacy support).
 */
export interface ToneGuidelines {
    primaryTone?: 'professional' | 'formal' | 'casual' | 'friendly' | 'authoritative' | 'technical' | string;
    disallowedWords?: string[];
    avoidSlang?: boolean;
    avoidAggressivePunctuation?: boolean;
    avoidExcessiveCapitalization?: boolean;
    explanation?: string;
    severity?: IssueSeverity;
}
/**
 * Comprehensive brand profile definition (Contract Section 5).
 * Supports both new contract format (`guidelines`, `id`, `name`, `tone`) and legacy fields.
 */
export interface BrandProfile {
    id?: string;
    name?: string;
    description?: string;
    tone?: string[];
    guidelines?: BrandGuidelines;
    createdAt?: string;
    updatedAt?: string;
    companyName?: string;
    industry?: string;
    isGeneric?: boolean;
    officialGuidelinesConfigured?: boolean;
    brandId?: string;
    brandName?: string;
    brandVariations?: string[];
    preferredTerminology?: Record<string, string> | TerminologyRule[];
    restrictedPhrases?: Array<string | RestrictedPhraseRule>;
    requiredTerms?: Array<string | RequiredTermRule>;
    toneGuidelines?: ToneGuidelines | string | string[];
    approvedFacts?: string[];
}
/**
 * Shared analyze request payload (Contract Section 5).
 */
export interface AnalyzeRequest {
    brandId?: string;
    companyName?: string;
    brandName?: string;
    industry?: string;
    content: string;
}
/**
 * Options for analysis execution.
 */
export interface AnalysisOptions {
    analysisId?: string;
    preserveUnknownClaims?: boolean;
    context?: string;
    checkAllRequiredTerms?: boolean;
    companyName?: string;
    brandName?: string;
    industry?: string;
    isGeneric?: boolean;
    mode?: 'configured' | 'generic';
}
/**
 * Flexible input object matching the shared contract.
 */
export interface AnalysisInput {
    content: string;
    brandId?: string;
    companyName?: string;
    brandName?: string;
    industry?: string;
    isGeneric?: boolean;
    profile?: BrandProfile;
    brand?: BrandProfile;
    options?: AnalysisOptions;
    context?: string;
}
/**
 * Analysis engine function type (Contract Section 6.1).
 */
export type AnalysisEngineFn = (content: string, brand: BrandProfile) => Promise<AnalysisResponse> | AnalysisResponse;
//# sourceMappingURL=types.d.ts.map