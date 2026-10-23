"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkClaimsRequiringVerification = checkClaimsRequiringVerification;
const utils_js_1 = require("./utils.js");
const CLAIM_PATTERNS = [
    {
        regex: /\b100%\s+customer\s+satisfaction\b/gi,
        claimType: 'absolute satisfaction guarantee',
        defaultSuggestion: () => 'Rephrase to "committed to high customer satisfaction" or cite survey data',
    },
    {
        regex: /\bguarantees?\s+100%\s+customer\s+satisfaction\b/gi,
        claimType: 'absolute satisfaction guarantee',
        defaultSuggestion: () => 'Rephrase to "strives for exceptional customer satisfaction" or attach verified survey evidence',
    },
    {
        regex: /\b(cheapest|best|fastest|lowest|highest|most\s+reliable)\s+(in\s+the\s+world|on\s+earth|in\s+the\s+market|on\s+the\s+market)\b/gi,
        claimType: 'global superlative claim',
        defaultSuggestion: (matched) => `Qualify claim or replace with "one of the ${matched.split(' ')[0]} options" unless substantiated`,
    },
    {
        regex: /(?:\bnumber\s+one|\bno\.?\s*1|#1)\s+(?:in\s+the\s+market|in\s+the\s+world|brand|solution)\b/gi,
        claimType: 'market leadership claim',
        defaultSuggestion: () => 'Provide third-party ranking source/citation or rephrase to "leading provider"',
    },
    {
        regex: /\b(unbeatable\s+price|lowest\s+price\s+guaranteed?)\b/gi,
        claimType: 'absolute pricing claim',
        defaultSuggestion: () => 'Rephrase to "competitive pricing" or reference official price match policy',
    },
    {
        regex: /\b(100%\s+guaranteed?|unconditional\s+guarantee)\b/gi,
        claimType: 'absolute guarantee claim',
        defaultSuggestion: () => 'Clarify terms of warranty/guarantee or specify "satisfaction pledge"',
    },
    {
        regex: /\b(zero\s+risk|risk-free\s+guarantee)\b/gi,
        claimType: 'risk-free claim',
        defaultSuggestion: () => 'State specific return or trial policy terms instead of claiming absolute zero risk',
    },
];
/**
 * Checks whether an approved fact substantiates a matched claim.
 */
function isClaimSubstantiated(matchedText, approvedFacts) {
    if (!approvedFacts || approvedFacts.length === 0)
        return false;
    const cleanMatched = matchedText.toLowerCase().replace(/[^\w\s%]/g, '').trim();
    for (const fact of approvedFacts) {
        if (typeof fact !== 'string')
            continue;
        const cleanFact = fact.toLowerCase().replace(/[^\w\s%]/g, '').trim();
        // Check if fact directly mentions or validates the claim
        if (cleanFact.includes(cleanMatched) || cleanMatched.includes(cleanFact)) {
            return true;
        }
        // Check if key substantive words overlap significantly (excluding stop words)
        const stopWords = new Set(['the', 'and', 'for', 'with', 'in', 'on', 'of', 'to', 'is', 'was', 'are', 'by', 'our', 'an', 'a']);
        const claimKeywords = cleanMatched
            .split(/\s+/)
            .filter((w) => w.length > 2 && !stopWords.has(w));
        if (claimKeywords.length >= 2) {
            const matchCount = claimKeywords.filter((kw) => cleanFact.includes(kw)).length;
            if (matchCount === claimKeywords.length) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Checks for unsupported claims requiring verification.
 * Note: Claims are NOT marked false; they are flagged as requiring verification.
 */
function checkClaimsRequiringVerification(content, profile) {
    const issues = [];
    if (!content)
        return issues;
    // 1. Guidelines claimVerification rules (Contract Section 5)
    if (profile?.guidelines?.claimVerification && Array.isArray(profile.guidelines.claimVerification)) {
        for (const rule of profile.guidelines.claimVerification) {
            if (!rule || !rule.claimPattern)
                continue;
            try {
                const regexStr = /^\w/.test(rule.claimPattern) && /\w$/.test(rule.claimPattern)
                    ? `\\b(?:${rule.claimPattern})\\b`
                    : rule.claimPattern;
                const regex = new RegExp(regexStr, 'gi');
                let match;
                while ((match = regex.exec(content)) !== null) {
                    const matchedText = match[0];
                    const startIndex = match.index;
                    const endIndex = match.index + matchedText.length;
                    const alreadyCaught = issues.some((i) => i.startIndex === startIndex && i.endIndex === endIndex);
                    if (!alreadyCaught) {
                        issues.push({
                            id: (0, utils_js_1.generateIssueId)('claim_verification'),
                            category: 'claim_verification',
                            severity: rule.severity || 'high',
                            matchedText,
                            explanation: rule.explanation ||
                                `Claim "${matchedText}" requires verification according to brand compliance guidelines.`,
                            suggestion: rule.suggestion || `Provide verification or qualifying language for "${matchedText}".`,
                            startIndex,
                            endIndex,
                        });
                    }
                }
            }
            catch {
                // Fallback to literal search if regex fails
                const occurrences = content.toLowerCase().indexOf(rule.claimPattern.toLowerCase());
                if (occurrences !== -1) {
                    issues.push({
                        id: (0, utils_js_1.generateIssueId)('claim_verification'),
                        category: 'claim_verification',
                        severity: rule.severity || 'high',
                        matchedText: content.substring(occurrences, occurrences + rule.claimPattern.length),
                        explanation: rule.explanation || `Claim requires verification.`,
                        suggestion: rule.suggestion || '',
                        startIndex: occurrences,
                        endIndex: occurrences + rule.claimPattern.length,
                    });
                }
            }
        }
    }
    // 2. Built-in claim patterns and approvedFacts substantiation
    const approvedFacts = Array.isArray(profile?.approvedFacts)
        ? profile.approvedFacts
        : [];
    for (const cp of CLAIM_PATTERNS) {
        const regex = new RegExp(cp.regex.source, 'gi');
        let match;
        while ((match = regex.exec(content)) !== null) {
            const matchedText = match[0];
            const startIndex = match.index;
            const endIndex = match.index + matchedText.length;
            // Check if evidence is available in approvedFacts
            if (isClaimSubstantiated(matchedText, approvedFacts)) {
                continue;
            }
            const alreadyCaught = issues.some((i) => i.startIndex === startIndex && i.endIndex === endIndex);
            if (!alreadyCaught) {
                issues.push({
                    id: (0, utils_js_1.generateIssueId)('claim_verification'),
                    category: 'claim_verification',
                    severity: 'medium',
                    matchedText,
                    explanation: `Claim "${matchedText}" requires empirical verification or substantiation against approved facts.`,
                    suggestion: cp.defaultSuggestion(matchedText),
                    startIndex,
                    endIndex,
                });
            }
        }
    }
    return issues;
}
//# sourceMappingURL=claimsChecker.js.map