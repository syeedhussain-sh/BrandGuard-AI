import { AnalysisIssue, BrandProfile, RestrictedPhraseRule } from '../types.js';
import { findOccurrences, generateIssueId } from './utils.js';

/**
 * Checks for restricted phrases defined in the brand profile.
 */
export function checkRestrictedPhrases(
  content: string,
  profile: BrandProfile
): AnalysisIssue[] {
  const issues: AnalysisIssue[] = [];
  if (!content || !profile) {
    return issues;
  }

  const rules: RestrictedPhraseRule[] = [];

  // 1. Guidelines restricted phrases (Contract Section 5)
  if (profile.guidelines?.restrictedPhrases && Array.isArray(profile.guidelines.restrictedPhrases)) {
    for (const item of profile.guidelines.restrictedPhrases) {
      if (item && item.phrase) {
        rules.push(item);
      }
    }
  }

  // 2. Legacy restricted phrases
  if (profile.restrictedPhrases && Array.isArray(profile.restrictedPhrases)) {
    for (const item of profile.restrictedPhrases) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) {
          rules.push({ phrase: trimmed });
        }
      } else if (item && typeof item === 'object' && item.phrase) {
        rules.push(item);
      }
    }
  }

  for (const rule of rules) {
    const occurrences = findOccurrences(content, rule.phrase, false);

    for (const occ of occurrences) {
      // Determine category: if explanation mentions tone or brand voice, categorize as tone
      const explanation =
        rule.explanation ||
        `The phrase "${occ.matchedText}" is restricted by brand compliance guidelines.`;

      const isToneRelated =
        /tone|voice|condescending|accessible\s+brand/i.test(explanation);

      const category = isToneRelated ? 'tone' : 'restricted_phrase';
      const severity = rule.severity || (isToneRelated ? 'medium' : 'high');
      const suggestion =
        rule.suggestion ||
        `Remove or replace the restricted phrase "${occ.matchedText}".`;

      const alreadyCaught = issues.some(
        (i) => i.startIndex === occ.start && i.endIndex === occ.end && i.category === category
      );

      if (!alreadyCaught) {
        issues.push({
          id: generateIssueId(category),
          category,
          severity,
          matchedText: occ.matchedText,
          explanation,
          suggestion,
          startIndex: occ.start,
          endIndex: occ.end,
        });
      }
    }
  }

  return issues;
}
