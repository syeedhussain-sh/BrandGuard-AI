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
  analysisMode: 'rules' | 'ai' | 'hybrid' | string;
}

export interface AnalyzeRequest {
  brandId: string;
  content: string;
}

// Alias for backwards compatibility
export type AnalysisRequest = AnalyzeRequest;

export interface RecentAnalysisItem {
  id: string;
  brandId: string;
  brandName: string;
  timestamp: string;
  totalIssues: number;
  highSeverity: number;
  contentSnippet: string;
  characterCount: number;
  wordCount: number;
  analysisResult: AnalysisResponse;
  originalContent: string;
}
