export type IssueCategory =
  | 'terminology'
  | 'restricted_phrase'
  | 'missing_term'
  | 'tone'
  | 'claim_verification';

export type IssueSeverity = 'high' | 'medium' | 'low';

export interface IssueItem {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  matchedText: string;
  explanation: string;
  suggestion: string;
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
  analysisMode: 'rules' | 'ai' | 'hybrid';
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
}

export interface AnalyzeRequest {
  brandId: string;
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
