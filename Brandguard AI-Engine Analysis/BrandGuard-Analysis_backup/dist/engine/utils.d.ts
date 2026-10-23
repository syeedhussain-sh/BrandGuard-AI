import { AnalysisIssue } from '../types.js';
/**
 * Generate a unique issue ID.
 */
export declare function generateIssueId(prefix?: string): string;
/**
 * Reset issue ID counter (useful for deterministic tests).
 */
export declare function resetIssueCounter(): void;
/**
 * Escape regular expression special characters.
 */
export declare function escapeRegex(text: string): string;
/**
 * Find all whole-word or phrase occurrences in a text with boundary safety.
 */
export declare function findOccurrences(text: string, target: string, caseSensitive?: boolean): Array<{
    start: number;
    end: number;
    matchedText: string;
}>;
/**
 * Filter overlapping or duplicate issues on identical ranges.
 * Prioritizes issues with higher severity or more specific matchedText.
 */
export declare function deduplicateIssues(issues: AnalysisIssue[]): AnalysisIssue[];
//# sourceMappingURL=utils.d.ts.map