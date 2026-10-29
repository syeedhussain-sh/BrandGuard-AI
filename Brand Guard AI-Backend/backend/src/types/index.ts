export type IssueCategory =
  | 'brand_identity'
  | 'competitor_brand'
  | 'terminology'
  | 'restricted_phrase'
  | 'missing_term'
  | 'tone'
  | 'claim_verification';

export type IssueSeverity = 'high' | 'medium' | 'low';

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

export interface AnalysisSummary {
  totalIssues: number;
  high: number;
  medium: number;
  low: number;
}

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

export interface TerminologyRule {
  preferred: string;
  discouraged: string[];
  explanation: string;
}

export interface RestrictedPhraseRule {
  phrase: string;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
}

export interface RequiredTermRule {
  term: string;
  context?: string;
  severity: IssueSeverity;
  explanation: string;
}

export interface ClaimVerificationRule {
  claimPattern: string;
  severity: IssueSeverity;
  explanation: string;
  suggestion: string;
}

export interface ToneRule {
  bannedWordOrStyle: string;
  suggestion: string;
  explanation: string;
}

export interface BrandGuidelines {
  terminology?: TerminologyRule[];
  restrictedPhrases?: RestrictedPhraseRule[];
  requiredTerms?: RequiredTermRule[];
  claimVerification?: ClaimVerificationRule[];
  toneRules?: ToneRule[];
}

export interface BrandProfile {
  id: string;
  name: string;
  description?: string;
  tone?: string[];
  guidelines: BrandGuidelines;
  createdAt?: string;
  updatedAt?: string;
  companyName?: string;
  industry?: string;
  isGeneric?: boolean;
  officialGuidelinesConfigured?: boolean;
  approvedFacts?: string[];
}

export interface AnalyzeRequest {
  brandId?: string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  content: string;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface ReviewAuditEntry {
  status: ReviewStatus;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerEmail?: string;
  notes?: string;
  rejectionReason?: string;
  timestamp: string;
}

export interface ReviewDecision {
  id: string;
  analysisId: string;
  brandId?: string;
  brandName?: string;
  companyName?: string;
  industry?: string;
  contentSnippet?: string;
  status: ReviewStatus;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerEmail?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  auditTrail?: ReviewAuditEntry[];
}

export interface CreateReviewRequest {
  analysisId: string;
  brandId?: string;
  brandName?: string;
  companyName?: string;
  industry?: string;
  contentSnippet?: string;
  status: ReviewStatus;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerEmail?: string;
  notes?: string;
  rejectionReason?: string;
  allowUpdate?: boolean;
}

export interface ReviewMetrics {
  totalAnalysesReviewed: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  approvalRate: number;
  recentDecisions: ReviewDecision[];
}

