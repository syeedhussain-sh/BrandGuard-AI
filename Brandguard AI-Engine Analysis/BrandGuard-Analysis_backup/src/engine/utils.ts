import { AnalysisIssue } from '../types.js';

let counter = 0;

/**
 * Generate a unique issue ID.
 */
export function generateIssueId(prefix: string = 'issue'): string {
  counter += 1;
  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${prefix}_${timestamp}_${counter}_${randomSuffix}`;
}

/**
 * Reset issue ID counter (useful for deterministic tests).
 */
export function resetIssueCounter(): void {
  counter = 0;
}

/**
 * Escape regular expression special characters.
 */
export function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find all whole-word or phrase occurrences in a text with boundary safety.
 */
export function findOccurrences(
  text: string,
  target: string,
  caseSensitive: boolean = false
): Array<{ start: number; end: number; matchedText: string }> {
  if (!text || !target) return [];

  const escaped = escapeRegex(target);
  // Match with word boundary if target starts/ends with alphanumeric characters
  const startBoundary = /^\w/.test(target) ? '\\b' : '';
  const endBoundary = /\w$/.test(target) ? '\\b' : '';

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`${startBoundary}${escaped}${endBoundary}`, flags);

  const matches: Array<{ start: number; end: number; matchedText: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      matchedText: match[0],
    });
  }

  return matches;
}

/**
 * Filter overlapping or duplicate issues on identical ranges.
 * Prioritizes issues with higher severity or more specific matchedText.
 */
export function deduplicateIssues(issues: AnalysisIssue[]): AnalysisIssue[] {
  const severityRank: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  // Sort by start index, then longer match length, then severity
  const sorted = [...issues].sort((a, b) => {
    const aStart = a.startIndex ?? -1;
    const bStart = b.startIndex ?? -1;
    if (aStart !== bStart) return aStart - bStart;

    const aLen = (a.endIndex ?? 0) - aStart;
    const bLen = (b.endIndex ?? 0) - bStart;
    if (aLen !== bLen) return bLen - aLen;

    return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
  });

  const result: AnalysisIssue[] = [];
  const coveredRanges: Array<{ start: number; end: number; category: string; matched: string }> = [];

  for (const issue of sorted) {
    // If issue has no indices (e.g. missing_term), check for duplicate category + matchedText
    if (issue.startIndex === undefined || issue.endIndex === undefined) {
      const isDuplicate = result.some(
        (r) => r.category === issue.category && r.matchedText === issue.matchedText
      );
      if (!isDuplicate) {
        result.push(issue);
      }
      continue;
    }

    const start = issue.startIndex;
    const end = issue.endIndex;

    // Check if identical span is already reported
    const exactOverlap = coveredRanges.some(
      (range) => range.start === start && range.end === end
    );

    if (!exactOverlap) {
      result.push(issue);
      coveredRanges.push({
        start,
        end,
        category: issue.category,
        matched: issue.matchedText,
      });
    }
  }

  return result;
}
