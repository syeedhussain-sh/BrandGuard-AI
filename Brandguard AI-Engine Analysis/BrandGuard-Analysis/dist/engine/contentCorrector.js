"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceCorrectedContent = produceCorrectedContent;
/**
 * Derives a replacement string from an issue and brand profile.
 */
function getReplacementForIssue(issue, profile) {
    const { category, matchedText, suggestion } = issue;
    const officialName = profile?.name || profile?.brandName;
    // Extract explicit quoted replacement from suggestions
    if (suggestion) {
        const replaceWithQuote = suggestion.match(/Replace with ["']([^"']+)["']/i);
        if (replaceWithQuote && replaceWithQuote[1]) {
            return replaceWithQuote[1];
        }
        const withMatch = suggestion.match(/with ["']([^"']+)["']/i);
        if (withMatch && withMatch[1]) {
            return withMatch[1];
        }
        const useMatch = suggestion.match(/Use ["']([^"']+)["']/i);
        if (useMatch && useMatch[1]) {
            return useMatch[1];
        }
        const changeMatch = suggestion.match(/to ["']([^"']+)["']/i);
        if (changeMatch && changeMatch[1]) {
            return changeMatch[1];
        }
    }
    // 1. Terminology / Brand Name
    if (category === 'terminology') {
        if (officialName &&
            matchedText.toLowerCase().replace(/[\s-]/g, '') ===
                officialName.toLowerCase().replace(/[\s-]/g, '')) {
            return officialName;
        }
    }
    // 2. Restricted Phrase
    if (category === 'restricted_phrase') {
        const replaceMatch = suggestion.match(/replace with ([^.]+)/i);
        if (replaceMatch && replaceMatch[1]) {
            return replaceMatch[1].trim();
        }
        if (suggestion.toLowerCase().includes('remove') && !suggestion.includes('or replace')) {
            return '';
        }
    }
    // 3. Tone
    if (category === 'tone') {
        // Multiple punctuation: replace with single period or exclamation
        if (/^!{2,}$/.test(matchedText)) {
            return '.';
        }
        if (/\?!|\?!+/.test(matchedText)) {
            return '?';
        }
        // Caps suggestion
        const titleMatch = suggestion.match(/: ["']([^"']+)["']/i);
        if (titleMatch && titleMatch[1]) {
            return titleMatch[1];
        }
    }
    // 4. Claim Verification
    if (category === 'claim_verification') {
        const quoteMatch = suggestion.match(/["']([^"']+)["']/);
        if (quoteMatch && quoteMatch[1]) {
            return quoteMatch[1];
        }
        const lowerMatched = matchedText.toLowerCase();
        if (lowerMatched.includes('guarantees 100% customer satisfaction')) {
            return 'strives for exceptional customer satisfaction';
        }
        if (lowerMatched.includes('100% customer satisfaction')) {
            return 'exceptional customer satisfaction';
        }
        if (lowerMatched.includes('cheapest in the world')) {
            return 'one of the most affordable options';
        }
        if (lowerMatched.includes('best in the market')) {
            return 'one of the leading solutions in the market';
        }
        if (lowerMatched.includes('unbeatable price')) {
            return 'competitive pricing';
        }
    }
    // 5. Direct replacement string fallback (Contract Section 3.5.4)
    // If suggestion is directly the replacement text rather than an instructional sentence
    if (suggestion && suggestion.trim().length > 0) {
        const isInstructional = /^(Remove|Replace|Use|Qualify|State|Provide|Include|Consider|Clarify|Rephrase)\b/i.test(suggestion.trim());
        if (!isInstructional) {
            return suggestion.trim();
        }
    }
    return null;
}
/**
 * Produces corrected content by applying suggested replacements and missing terms.
 * Guarantees that compliant copy is returned unmodified, and overlapping spans
 * are filtered cleanly to prevent index corruption.
 */
function produceCorrectedContent(originalContent, issues, profile) {
    if (!originalContent || typeof originalContent !== 'string') {
        return originalContent || '';
    }
    if (!issues || issues.length === 0) {
        return originalContent;
    }
    const spans = [];
    for (const issue of issues) {
        if (issue.startIndex !== undefined && issue.endIndex !== undefined) {
            const replacement = getReplacementForIssue(issue, profile);
            if (replacement !== null) {
                spans.push({
                    start: issue.startIndex,
                    end: issue.endIndex,
                    replacement,
                });
            }
        }
    }
    // Filter out overlapping replacement spans to prevent offset corruption
    spans.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const nonOverlappingSpans = [];
    let lastEnd = -1;
    for (const span of spans) {
        if (span.start >= lastEnd) {
            nonOverlappingSpans.push(span);
            lastEnd = span.end;
        }
    }
    // Apply non-overlapping spans descending by start index
    nonOverlappingSpans.sort((a, b) => b.start - a.start);
    let corrected = originalContent;
    for (const span of nonOverlappingSpans) {
        corrected =
            corrected.substring(0, span.start) +
                span.replacement +
                corrected.substring(span.end);
    }
    // Clean up any double spaces that might result from removals
    corrected = corrected.replace(/[ \t]{2,}/g, ' ');
    // Handle missing terms by appending/prepending if required
    const missingTermIssues = issues.filter((i) => i.category === 'missing_term');
    for (const mIssue of missingTermIssues) {
        const termToAdd = mIssue.matchedText.replace(/^Missing:\s*/i, '').trim();
        if (termToAdd && !corrected.toLowerCase().includes(termToAdd.toLowerCase())) {
            let placement = 'append';
            if (profile?.requiredTerms) {
                for (const rt of profile.requiredTerms) {
                    if (typeof rt === 'object' && rt.term === termToAdd && rt.placement) {
                        placement = rt.placement;
                        break;
                    }
                }
            }
            if (placement === 'prepend') {
                corrected = `${termToAdd}\n${corrected}`;
            }
            else {
                const punctuation = /[.!?]$/.test(corrected.trim()) ? '' : '.';
                corrected = `${corrected.trim()}${punctuation} ${termToAdd}`;
            }
        }
    }
    return corrected.trim();
}
//# sourceMappingURL=contentCorrector.js.map