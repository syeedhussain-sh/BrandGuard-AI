"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRequiredTerms = checkRequiredTerms;
const utils_js_1 = require("./utils.js");
/**
 * Checks for mandatory brand terms or legal disclaimers that must be present.
 */
function checkRequiredTerms(content, profile, options) {
    const issues = [];
    if (!profile) {
        return issues;
    }
    // If content is empty or whitespace, missing terms still need to be reported or handled safely
    const trimmedContent = content ? content.trim() : '';
    const rules = [];
    // 1. Guidelines required terms (Contract Section 5)
    if (profile.guidelines?.requiredTerms && Array.isArray(profile.guidelines.requiredTerms)) {
        for (const item of profile.guidelines.requiredTerms) {
            if (item && item.term) {
                // If rule specifies a context requirement and context is not provided or does not match
                if (item.context && !options?.checkAllRequiredTerms) {
                    if (!options?.context || options.context.toLowerCase() !== item.context.toLowerCase()) {
                        continue; // Context-dependent rule does not apply to this analysis
                    }
                }
                rules.push(item);
            }
        }
    }
    // 2. Legacy required terms
    if (profile.requiredTerms && Array.isArray(profile.requiredTerms)) {
        for (const item of profile.requiredTerms) {
            if (typeof item === 'string') {
                const trimmed = item.trim();
                if (trimmed) {
                    rules.push({ term: trimmed });
                }
            }
            else if (item && typeof item === 'object' && item.term) {
                rules.push(item);
            }
        }
    }
    for (const rule of rules) {
        const term = rule.term.trim();
        if (!term)
            continue;
        const occurrences = (0, utils_js_1.findOccurrences)(trimmedContent, term, false);
        if (occurrences.length === 0) {
            const alreadyCaught = issues.some((i) => i.category === 'missing_term' && i.matchedText === term);
            if (!alreadyCaught) {
                issues.push({
                    id: (0, utils_js_1.generateIssueId)('missing_term'),
                    category: 'missing_term',
                    severity: rule.severity || 'medium',
                    matchedText: term,
                    explanation: rule.explanation ||
                        `Required term or notice "${term}" is missing from the submitted content.`,
                    suggestion: rule.suggestion ||
                        `Include "${term}" in the content.`,
                });
            }
        }
    }
    return issues;
}
//# sourceMappingURL=requiredTermsChecker.js.map