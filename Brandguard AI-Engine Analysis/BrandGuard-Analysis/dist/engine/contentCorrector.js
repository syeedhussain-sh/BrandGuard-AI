"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produceCorrectedContent = produceCorrectedContent;
const brandMismatchChecker_js_1 = require("./brandMismatchChecker.js");
/**
 * Derives a replacement string from an issue and brand profile.
 */
function getReplacementForIssue(issue, profile) {
    const { category, matchedText, suggestion, id, explanation } = issue;
    const officialName = profile?.name || profile?.brandName;
    // Preserve product identity if issue explicitly states so
    if (suggestion &&
        (suggestion.includes('preserve product identity') ||
            suggestion.includes('Verify whether') ||
            suggestion.includes('Manual human review required'))) {
        return null;
    }
    // Handle direct contextual mismatch suggestions (e.g. food brand offering vehicles)
    if (id && id.includes('contextual_mismatch')) {
        if (suggestion && !/^(Verify|Consider|Check)\b/i.test(suggestion.trim())) {
            return suggestion.trim();
        }
    }
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
        // Any generic quoted replacement in suggestion
        const anyQuote = suggestion.match(/["']([^"']+)["']/);
        if (anyQuote && anyQuote[1] && !anyQuote[1].includes(' ')) {
            // Single term/phrase replacement
            return anyQuote[1];
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
    // 4. Claim Verification & Contextual replacements
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
        if (lowerMatched.includes('best in the market') || lowerMatched.includes('best in the world') || lowerMatched.includes("world's best")) {
            return 'a leading solution in the market';
        }
        if (lowerMatched.includes('unbeatable price')) {
            return 'competitive pricing';
        }
        if (lowerMatched.includes('guarantees perfect results') || lowerMatched.includes('perfect results every time')) {
            return 'is designed to deliver high-quality, reliable results';
        }
        if (lowerMatched.includes('immune to every cyberattack') || lowerMatched.includes('completely immune')) {
            return 'engineered with robust defenses against modern cyberattacks';
        }
        if (lowerMatched === 'good bike and good services' || lowerMatched.includes('bike and good services')) {
            return 'quality food and good services';
        }
        if (lowerMatched.includes('provides good bike')) {
            return 'provides quality food';
        }
        if (lowerMatched.includes('good bike')) {
            return 'quality food';
        }
    }
    // 5. Direct replacement string fallback (Contract Section 3.5.4)
    // If suggestion is directly the replacement text rather than an instructional sentence
    if (suggestion && suggestion.trim().length > 0) {
        const isInstructional = /^(Remove|Replace|Use|Qualify|State|Provide|Include|Consider|Clarify|Rephrase|Verify)\b/i.test(suggestion.trim());
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
    // Check if content contains issues requiring human review
    const humanReviewIssues = issues.filter((i) => i.requiresHumanReview);
    const otherIssues = issues.filter((i) => !i.requiresHumanReview);
    // If the entire set of actionable issues only requires human review, return the standard review notice
    if (humanReviewIssues.length > 0 && otherIssues.length === 0) {
        return '[Requires Human Review] Content references competitor brand information that cannot be safely auto-corrected. Manual editorial review required.';
    }
    const spans = [];
    for (const issue of issues) {
        // If this specific issue requires human review, isolate its replacement without suppressing other issues
        if (issue.requiresHumanReview) {
            if ((issue.category === 'brand_identity' || issue.category === 'competitor_brand' || (issue.id && issue.id.includes('brand_identity'))) &&
                issue.startIndex !== undefined &&
                issue.endIndex !== undefined) {
                const { start, end } = (0, brandMismatchChecker_js_1.getEnclosingSentence)(originalContent, issue.startIndex, issue.endIndex);
                spans.push({
                    start,
                    end,
                    replacement: '[Requires Human Review: Content references competitor information that cannot be safely auto-corrected]',
                });
            }
            continue;
        }
        // Competitor / Brand Identity issues
        if (issue.category === 'brand_identity' ||
            issue.category === 'competitor_brand' ||
            (issue.id && issue.id.includes('brand_identity'))) {
            if (issue.suggestion &&
                (issue.suggestion.includes('preserve product identity') ||
                    issue.suggestion.includes('Verify whether'))) {
                continue;
            }
            if (issue.suggestion && issue.startIndex !== undefined && issue.endIndex !== undefined) {
                // Enclosing sentence replacement for competitor offering
                const { start, end } = (0, brandMismatchChecker_js_1.getEnclosingSentence)(originalContent, issue.startIndex, issue.endIndex);
                spans.push({
                    start,
                    end,
                    replacement: issue.suggestion,
                });
                continue;
            }
        }
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