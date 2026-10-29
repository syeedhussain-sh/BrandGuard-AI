import { AnalysisIssue, BrandProfile, SupportedClaim, IssueSeverity, ClaimVerificationStatus } from '../types.js';
import { generateIssueId } from './utils.js';

interface ClaimPattern {
  regex: RegExp;
  claimType: string;
  severity?: IssueSeverity;
  verificationStatus?: ClaimVerificationStatus;
  requiresHumanReview?: boolean;
  defaultExplanation?: (matched: string) => string;
  defaultSuggestion: (matched: string) => string;
}

const CLAIM_PATTERNS: ClaimPattern[] = [
  // 1. Availability and SLA claims (e.g. 99.99% availability under Enterprise SLA)
  {
    regex: /\b(?:delivers?|provides?|guarantees?|offers?)\s+\d+(?:\.\d+)?%\s+availability(?:\s+under\s+(?:our\s+)?Enterprise\s+SLA)?\b/gi,
    claimType: 'availability SLA claim',
    severity: 'medium',
    verificationStatus: 'requires_review',
    requiresHumanReview: true,
    defaultExplanation: (matched) =>
      `Availability claim "${matched}" requires substantiation against approved enterprise SLA terms or published uptime metrics.`,
    defaultSuggestion: (matched) =>
      `Reference official Enterprise SLA terms or approved availability metrics for "${matched}"`,
  },
  {
    regex: /\b\d+(?:\.\d+)?%\s+availability(?:\s+under\s+(?:our\s+)?Enterprise\s+SLA)?\b/gi,
    claimType: 'availability metric claim',
    severity: 'medium',
    verificationStatus: 'requires_review',
    requiresHumanReview: true,
    defaultExplanation: (matched) =>
      `Service availability metric "${matched}" requires substantiation against approved brand SLA commitments.`,
    defaultSuggestion: (matched) =>
      `Reference official Enterprise SLA documentation or approved uptime benchmarks for "${matched}"`,
  },

  // 2. Absolute technical and operational guarantees (high severity, unsupported without audited proof)
  {
    regex: /\b(?:guarantees?\s+)?100%\s+bug-free(?:\s+operation)?\b/gi,
    claimType: 'absolute bug-free guarantee',
    severity: 'high',
    verificationStatus: 'unsupported',
    requiresHumanReview: false,
    defaultExplanation: (matched) =>
      `Absolute guarantee "${matched}" cannot be verified without audited technical proof. Software and complex systems carry inherent operational risk.`,
    defaultSuggestion: () =>
      'is designed for high reliability and resilience',
  },
  {
    regex: /\b(?:zero\s+risk|risk-free\s+guarantee)\b/gi,
    claimType: 'risk-free claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    requiresHumanReview: false,
    defaultExplanation: (matched) =>
      `Absolute guarantee "${matched}" cannot be verified without audited technical proof. Complex systems and commercial deployments carry inherent operational risk.`,
    defaultSuggestion: () =>
      'minimized operational risk',
  },

  // 3. Quantitative performance and efficiency claims (requires review / audited benchmarks)
  {
    regex: /(?:reduces?|cuts?|saves?|improves?|increases?|boosts?|delivers?)\s+[^.!?,\n]{0,60}?(?:by\s+)?(?:\d+(?:\.\d+)?%|\d+x|\d+\s*(?:times|fold))(?!\w)/gi,
    claimType: 'quantitative performance claim',
    severity: 'medium',
    verificationStatus: 'requires_review',
    requiresHumanReview: true,
    defaultExplanation: (matched) =>
      `Quantitative performance claim "${matched}" requires audited benchmarks, empirical case studies, or approved supporting evidence.`,
    defaultSuggestion: (matched) =>
      `Cite audited benchmark data, case study methodology, or qualify "${matched}" with verified deployment parameters`,
  },
  {
    regex: /\b(?:\d+(?:\.\d+)?%|\d+x|\d+\s*(?:times|fold))\s+(?:overhead|reduction|savings|faster|cheaper|efficiency|increase|growth|performance|boost|latency)\b/gi,
    claimType: 'quantitative efficiency claim',
    severity: 'medium',
    verificationStatus: 'requires_review',
    requiresHumanReview: true,
    defaultExplanation: (matched) =>
      `Quantitative performance claim "${matched}" requires audited benchmarks, empirical case studies, or approved supporting evidence.`,
    defaultSuggestion: (matched) =>
      `Cite audited benchmark results or qualify "${matched}" with specific test conditions`,
  },

  // 4. Customer satisfaction & superlative claims
  {
    regex: /\b100%\s+customer\s+satisfaction\b/gi,
    claimType: 'absolute satisfaction guarantee',
    severity: 'medium',
    verificationStatus: 'requires_review',
    defaultSuggestion: () => 'Rephrase to "committed to high customer satisfaction" or cite survey data',
  },
  {
    regex: /\bguarantees?\s+100%\s+customer\s+satisfaction\b/gi,
    claimType: 'absolute satisfaction guarantee',
    severity: 'medium',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Rephrase to "strives for exceptional customer satisfaction" or attach verified survey evidence',
  },
  {
    regex: /\b(cheapest|best|fastest|lowest|highest|most\s+reliable)\s+(in\s+the\s+world|on\s+earth|in\s+the\s+market|on\s+the\s+market)\b/gi,
    claimType: 'global superlative claim',
    severity: 'medium',
    verificationStatus: 'unsupported',
    defaultSuggestion: (matched) => `Qualify claim or replace with "one of the ${matched.split(' ')[0]} options" unless substantiated`,
  },
  {
    regex: /(?:\bnumber\s+one|\bno\.?\s*1|#1)\s+(?:in\s+the\s+market|in\s+the\s+world|brand|solution)\b/gi,
    claimType: 'market leadership claim',
    severity: 'medium',
    verificationStatus: 'requires_review',
    defaultSuggestion: () => 'Provide third-party ranking source/citation or rephrase to "leading provider"',
  },
  {
    regex: /\b(unbeatable\s+price|lowest\s+price\s+guaranteed?)\b/gi,
    claimType: 'absolute pricing claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Rephrase to "competitive pricing" or reference official price match policy',
  },
  {
    regex: /\b(100%\s+guaranteed?|unconditional\s+guarantee)\b/gi,
    claimType: 'absolute guarantee claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Clarify terms of warranty/guarantee or specify "satisfaction pledge"',
  },
  {
    regex: /\b(?:the\s+)?world['’]?s\s+best\b/gi,
    claimType: 'global superlative claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Rephrase to "a leading solution" or provide verifiable independent benchmark rankings',
  },
  {
    regex: /\bguarantees?\s+perfect\s+results(?:\s+every\s+time)?\b/gi,
    claimType: 'absolute performance claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Rephrase to "designed to deliver consistent, high-quality results" as perfection cannot be guaranteed',
  },
  {
    regex: /\b(?:completely\s+)?immune\s+to\s+(?:every|all)\s+cyberattacks?\b/gi,
    claimType: 'absolute security claim',
    severity: 'high',
    verificationStatus: 'unsupported',
    defaultSuggestion: () => 'Rephrase to "engineered with robust defenses against modern cyberattacks" as no system is 100% immune',
  },
];

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'in', 'on', 'of', 'to', 'is', 'was', 'are', 'by',
  'our', 'an', 'a', 'under', 'their', 'its', 'your', 'we', 'you', 'that', 'this',
  'from', 'as', 'at', 'be', 'has', 'have', 'had'
]);

/**
 * Searches approved brand facts to find a substantiating reference for a given claim or sentence.
 */
export function findSubstantiatingFact(
  claimText: string,
  approvedFacts: string[],
  sentenceContext?: string
): { fact: string; citation: string } | null {
  if (!approvedFacts || approvedFacts.length === 0) return null;

  const targetTexts = [claimText, sentenceContext].filter((t): t is string => Boolean(t && t.trim()));

  for (const fact of approvedFacts) {
    if (typeof fact !== 'string' || !fact.trim()) continue;
    const cleanFact = fact.toLowerCase().replace(/[^\w\s%#.-]/g, ' ').replace(/\s+/g, ' ').trim();

    for (const target of targetTexts) {
      const cleanTarget = target.toLowerCase().replace(/[^\w\s%#.-]/g, ' ').replace(/\s+/g, ' ').trim();

      // 1. Direct inclusion
      if (cleanFact.includes(cleanTarget) || cleanTarget.includes(cleanFact)) {
        return {
          fact,
          citation: `Approved Brand Fact: "${fact}"`,
        };
      }

      // 2. Keyword & metric overlap analysis
      const factTokens = cleanFact.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
      const targetTokens = cleanTarget.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      if (targetTokens.length >= 2 && factTokens.length >= 2) {
        // Check for specific numerical / percentage / ranking metric
        const targetMetrics = cleanTarget.match(/\b(?:\d+(?:\.\d+)?%|#\d+|\bno\.?\s*\d+)\b/g);
        if (targetMetrics) {
          const allMetricsPresent = targetMetrics.every((m) => cleanFact.includes(m));
          if (!allMetricsPresent) {
            continue; // Mismatched metric, cannot substantiate
          }
        }

        const matchCount = targetTokens.filter((kw) => cleanFact.includes(kw)).length;
        const overlapRatio = matchCount / targetTokens.length;

        // If >= 60% of significant keywords overlap and matchCount >= 2
        if (matchCount >= 2 && overlapRatio >= 0.6) {
          return {
            fact,
            citation: `Approved Brand Fact: "${fact}"`,
          };
        }
      }
    }
  }

  return null;
}

/**
 * Extracts the surrounding sentence for a given substring within content.
 */
function extractSentence(content: string, startIndex: number, endIndex: number): string {
  let start = 0;
  for (let i = startIndex - 1; i >= 0; i--) {
    const ch = content[i];
    if (ch === '!' || ch === '?' || ch === '\n') {
      start = i + 1;
      break;
    }
    if (ch === '.') {
      const nextChar = i < content.length - 1 ? content[i + 1] : '';
      const prevChar = i > 0 ? content[i - 1] : '';
      if (/\d/.test(nextChar) && /\d/.test(prevChar)) {
        continue; // Decimal point in number (e.g. 99.99)
      }
      start = i + 1;
      break;
    }
  }

  let end = content.length;
  for (let i = endIndex; i < content.length; i++) {
    const ch = content[i];
    if (ch === '!' || ch === '?' || ch === '\n') {
      end = i + 1;
      break;
    }
    if (ch === '.') {
      const nextChar = i < content.length - 1 ? content[i + 1] : '';
      const prevChar = i > 0 ? content[i - 1] : '';
      if (/\d/.test(nextChar) && /\d/.test(prevChar)) {
        continue; // Decimal point in number (e.g. 99.99)
      }
      end = i + 1;
      break;
    }
  }

  return content.substring(start, end).trim();
}

/**
 * Primary claim verification function.
 * Evaluates claims in content against brand rules and approved brand facts.
 *
 * Returns:
 * - issues: Unsubstantiated claims, absolute guarantees, or claims requiring review.
 * - supportedClaims: Claims verified and substantiated by approved brand facts.
 */
export function verifyContentClaims(
  content: string,
  profile: BrandProfile
): { issues: AnalysisIssue[]; supportedClaims: SupportedClaim[] } {
  const issues: AnalysisIssue[] = [];
  const supportedClaims: SupportedClaim[] = [];
  if (!content) return { issues, supportedClaims };

  const approvedFacts = Array.isArray(profile?.approvedFacts) ? profile.approvedFacts : [];

  // Track claimed spans that have been verified as supported
  const supportedSpans: Array<{ start: number; end: number }> = [];

  // 1. Guidelines claimVerification rules (Contract Section 5)
  if (profile?.guidelines?.claimVerification && Array.isArray(profile.guidelines.claimVerification)) {
    for (const rule of profile.guidelines.claimVerification) {
      if (!rule || !rule.claimPattern) continue;

      try {
        const regexStr = /^\w/.test(rule.claimPattern) && /\w$/.test(rule.claimPattern)
          ? `\\b(?:${rule.claimPattern})\\b`
          : rule.claimPattern;
        const regex = new RegExp(regexStr, 'gi');
        let match: RegExpExecArray | null;

        while ((match = regex.exec(content)) !== null) {
          const matchedText = match[0];
          const startIndex = match.index;
          const endIndex = match.index + matchedText.length;
          const sentence = extractSentence(content, startIndex, endIndex);

          // Check if substantiated by approved facts
          const substantiation = findSubstantiatingFact(matchedText, approvedFacts, sentence);
          if (substantiation) {
            supportedClaims.push({
              claimText: sentence || matchedText,
              matchedText,
              status: 'supported',
              supportingFact: substantiation.fact,
              evidenceCitation: substantiation.citation,
              explanation: `Claim "${matchedText}" is substantiated by approved brand evidence: "${substantiation.fact}".`,
              startIndex,
              endIndex,
            });
            supportedSpans.push({ start: startIndex, end: endIndex });
            continue;
          }

          const alreadyCaught = issues.some(
            (i) => i.startIndex === startIndex && i.endIndex === endIndex
          );

          if (!alreadyCaught) {
            issues.push({
              id: generateIssueId('claim_verification'),
              category: 'claim_verification',
              severity: rule.severity || 'high',
              verificationStatus: 'unsupported',
              matchedText,
              explanation:
                rule.explanation ||
                `Claim "${matchedText}" requires verification according to brand compliance guidelines.`,
              suggestion: rule.suggestion || `Provide verification or qualifying language for "${matchedText}".`,
              startIndex,
              endIndex,
            });
          }
        }
      } catch {
        // Fallback to literal search if regex fails
        const occurrences = content.toLowerCase().indexOf(rule.claimPattern.toLowerCase());
        if (occurrences !== -1) {
          const matchedText = content.substring(occurrences, occurrences + rule.claimPattern.length);
          const startIndex = occurrences;
          const endIndex = occurrences + rule.claimPattern.length;
          const sentence = extractSentence(content, startIndex, endIndex);

          const substantiation = findSubstantiatingFact(matchedText, approvedFacts, sentence);
          if (substantiation) {
            supportedClaims.push({
              claimText: sentence || matchedText,
              matchedText,
              status: 'supported',
              supportingFact: substantiation.fact,
              evidenceCitation: substantiation.citation,
              explanation: `Claim "${matchedText}" is substantiated by approved brand evidence: "${substantiation.fact}".`,
              startIndex,
              endIndex,
            });
            supportedSpans.push({ start: startIndex, end: endIndex });
          } else {
            issues.push({
              id: generateIssueId('claim_verification'),
              category: 'claim_verification',
              severity: rule.severity || 'high',
              verificationStatus: 'unsupported',
              matchedText,
              explanation: rule.explanation || `Claim requires verification.`,
              suggestion: rule.suggestion || '',
              startIndex,
              endIndex,
            });
          }
        }
      }
    }
  }

  // 2. Built-in claim patterns and approvedFacts substantiation
  for (const cp of CLAIM_PATTERNS) {
    const regex = new RegExp(cp.regex.source, 'gi');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const matchedText = match[0];
      const startIndex = match.index;
      const endIndex = match.index + matchedText.length;
      const sentence = extractSentence(content, startIndex, endIndex);

      // Check if already marked as supported
      const isAlreadySupported = supportedSpans.some(
        (span) => (startIndex >= span.start && endIndex <= span.end) || (span.start >= startIndex && span.end <= endIndex)
      );
      if (isAlreadySupported) {
        continue;
      }

      // Check if evidence is available in approvedFacts
      const substantiation = findSubstantiatingFact(matchedText, approvedFacts, sentence);
      if (substantiation) {
        supportedClaims.push({
          claimText: sentence || matchedText,
          matchedText,
          status: 'supported',
          supportingFact: substantiation.fact,
          evidenceCitation: substantiation.citation,
          explanation: `Claim "${matchedText}" is substantiated by approved brand evidence: "${substantiation.fact}".`,
          startIndex,
          endIndex,
        });
        supportedSpans.push({ start: startIndex, end: endIndex });
        continue;
      }

      // Check if already caught
      const alreadyCaught = issues.some(
        (i) => i.startIndex === startIndex && i.endIndex === endIndex
      );

      if (!alreadyCaught) {
        const severity = cp.severity || 'medium';
        const verificationStatus: ClaimVerificationStatus =
          cp.verificationStatus || (severity === 'high' ? 'unsupported' : 'requires_review');
        const requiresHumanReview =
          cp.requiresHumanReview !== undefined ? cp.requiresHumanReview : verificationStatus === 'requires_review';

        issues.push({
          id: generateIssueId('claim_verification'),
          category: 'claim_verification',
          severity,
          verificationStatus,
          requiresHumanReview: requiresHumanReview ? true : undefined,
          matchedText,
          explanation:
            cp.defaultExplanation?.(matchedText) ||
            `Claim "${matchedText}" requires empirical verification or substantiation against approved facts.`,
          suggestion: cp.defaultSuggestion(matchedText),
          startIndex,
          endIndex,
        });
      }
    }
  }

  // 3. Direct approved fact inclusion check
  for (const fact of approvedFacts) {
    if (typeof fact === 'string' && fact.trim().length > 5) {
      const cleanFact = fact.trim().toLowerCase();
      const cleanContent = content.toLowerCase();
      if (cleanContent.includes(cleanFact)) {
        const idx = cleanContent.indexOf(cleanFact);
        const alreadySupported = supportedClaims.some(
          (sc) => sc.supportingFact === fact
        );
        if (!alreadySupported) {
          supportedClaims.push({
            claimText: fact,
            matchedText: content.substring(idx, idx + fact.length),
            status: 'supported',
            supportingFact: fact,
            evidenceCitation: `Approved Brand Fact: "${fact}"`,
            explanation: `Claim is substantiated by approved brand evidence: "${fact}".`,
            startIndex: idx,
            endIndex: idx + fact.length,
          });
        }
      }
    }
  }

  return { issues, supportedClaims };
}

/**
 * Backwards compatibility helper returning only issues.
 */
export function checkClaimsRequiringVerification(
  content: string,
  profile: BrandProfile
): AnalysisIssue[] {
  return verifyContentClaims(content, profile).issues;
}

