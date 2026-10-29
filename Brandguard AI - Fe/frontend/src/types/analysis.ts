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

// Alias for backwards compatibility with existing UI components
export type AnalysisIssue = IssueItem;

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

export interface AnalyzeRequest {
  brandId?: string;
  companyName?: string;
  brandName?: string;
  industry?: string;
  content: string;
}

// Alias for backwards compatibility
export type AnalysisRequest = AnalyzeRequest;

export interface RecentAnalysisItem {
  id: string;
  brandId: string;
  brandName: string;
  industry?: string;
  governanceMode?: 'configured' | 'generic';
  timestamp: string;
  totalIssues: number;
  highSeverity: number;
  contentSnippet: string;
  characterCount: number;
  wordCount: number;
  analysisResult: AnalysisResponse;
  originalContent: string;
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
  reviewerName: string;
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

