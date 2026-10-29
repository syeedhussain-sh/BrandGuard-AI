import type { IssueSeverity } from './analysis';
export type { IssueSeverity };

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
  approvedFacts?: string[];
}

export interface BrandSummary {
  id: string;
  name: string;
  description?: string;
  tone?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Backward compatibility alias for UI display
  officialName?: string;
}

export interface UpdateBrandRequest {
  name: string;
  description?: string;
  tone?: string[];
  guidelines: BrandGuidelines;
  approvedFacts?: string[];
}

