"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContent = analyzeContent;
const uuid_1 = require("uuid");
async function analyzeContent(content, brand) {
    const issues = [];
    const guidelines = brand.guidelines || {};
    let issueCounter = 1;
    // Track text replacements for correctedContent generation
    const replacements = [];
    // Helper to record an issue
    const addIssue = (category, severity, matchedText, explanation, suggestion) => {
        issues.push({
            id: `iss_${issueCounter++}`,
            category,
            severity,
            matchedText,
            explanation,
            suggestion
        });
    };
    // 1. Terminology checks (discouraged vs preferred)
    if (Array.isArray(guidelines.terminology)) {
        for (const termRule of guidelines.terminology) {
            for (const discouraged of termRule.discouraged || []) {
                if (!discouraged)
                    continue;
                const regex = new RegExp(`\\b${escapeRegExp(discouraged)}\\b`, 'gi');
                let match;
                while ((match = regex.exec(content)) !== null) {
                    addIssue('terminology', 'high', match[0], termRule.explanation || `Use preferred term "${termRule.preferred}".`, termRule.preferred);
                    replacements.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        suggestion: termRule.preferred
                    });
                }
            }
        }
    }
    // 2. Restricted phrases check
    if (Array.isArray(guidelines.restrictedPhrases)) {
        for (const phraseRule of guidelines.restrictedPhrases) {
            if (!phraseRule.phrase)
                continue;
            const regex = new RegExp(`\\b${escapeRegExp(phraseRule.phrase)}\\b`, 'gi');
            let match;
            while ((match = regex.exec(content)) !== null) {
                addIssue('restricted_phrase', phraseRule.severity || 'high', match[0], phraseRule.explanation || `The phrase "${phraseRule.phrase}" is restricted.`, phraseRule.suggestion || '');
                if (phraseRule.suggestion) {
                    replacements.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        suggestion: phraseRule.suggestion
                    });
                }
            }
        }
    }
    // 3. Tone rules check
    if (Array.isArray(guidelines.toneRules)) {
        for (const toneRule of guidelines.toneRules) {
            if (!toneRule.bannedWordOrStyle)
                continue;
            const regex = new RegExp(`\\b${escapeRegExp(toneRule.bannedWordOrStyle)}\\b`, 'gi');
            let match;
            while ((match = regex.exec(content)) !== null) {
                // Only add if not already captured under restricted_phrase
                const alreadyAdded = issues.some((i) => i.matchedText.toLowerCase() === match[0].toLowerCase() && i.category === 'tone');
                if (!alreadyAdded) {
                    addIssue('tone', 'medium', match[0], toneRule.explanation || 'Tone does not align with brand voice.', toneRule.suggestion || '');
                    if (toneRule.suggestion) {
                        replacements.push({
                            start: match.index,
                            end: match.index + match[0].length,
                            suggestion: toneRule.suggestion
                        });
                    }
                }
            }
        }
    }
    // 4. Claim verification check
    if (Array.isArray(guidelines.claimVerification)) {
        for (const claimRule of guidelines.claimVerification) {
            if (!claimRule.claimPattern)
                continue;
            let regex;
            try {
                regex = new RegExp(`\\b${claimRule.claimPattern}\\b`, 'gi');
            }
            catch {
                regex = new RegExp(escapeRegExp(claimRule.claimPattern), 'gi');
            }
            let match;
            while ((match = regex.exec(content)) !== null) {
                addIssue('claim_verification', claimRule.severity || 'high', match[0], claimRule.explanation || 'Unsubstantiated or unapproved claim detected.', claimRule.suggestion || '');
                if (claimRule.suggestion) {
                    replacements.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        suggestion: claimRule.suggestion
                    });
                }
            }
        }
    }
    // 5. Missing required terms check
    if (Array.isArray(guidelines.requiredTerms)) {
        for (const requiredRule of guidelines.requiredTerms) {
            if (!requiredRule.term)
                continue;
            const regex = new RegExp(`\\b${escapeRegExp(requiredRule.term)}\\b`, 'i');
            if (!regex.test(content)) {
                addIssue('missing_term', requiredRule.severity || 'medium', `[Missing: ${requiredRule.term}]`, requiredRule.explanation || `Required term "${requiredRule.term}" is missing.`, `Include "${requiredRule.term}" in the copy.`);
            }
        }
    }
    // Build corrected content by applying non-overlapping replacements in reverse index order
    replacements.sort((a, b) => b.start - a.start);
    let correctedContent = content;
    let lastStart = Infinity;
    for (const rep of replacements) {
        if (rep.end <= lastStart) {
            correctedContent =
                correctedContent.slice(0, rep.start) +
                    rep.suggestion +
                    correctedContent.slice(rep.end);
            lastStart = rep.start;
        }
    }
    // Calculate summary counts
    const summary = {
        totalIssues: issues.length,
        high: issues.filter((i) => i.severity === 'high').length,
        medium: issues.filter((i) => i.severity === 'medium').length,
        low: issues.filter((i) => i.severity === 'low').length
    };
    return {
        success: true,
        analysisId: `anlz_${(0, uuid_1.v4)()}`,
        summary,
        issues,
        correctedContent,
        analysisMode: 'rules'
    };
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
