"use strict";
/**
 * BrandGuard AI - Brand Compliance Analysis Engine
 * Member 3 Deliverable
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEMO_NOVATECH_PROFILE = exports.DEMO_BRAND_PROFILE = exports.generateIssueId = exports.resetIssueCounter = exports.deduplicateIssues = exports.produceCorrectedContent = exports.KNOWN_BRAND_REGISTRY = exports.checkCompanyIdentityMismatch = exports.checkGenericBrandGovernance = exports.checkClaimsRequiringVerification = exports.checkToneGuidelines = exports.checkRequiredTerms = exports.checkRestrictedPhrases = exports.checkBrandNameAndTerminology = exports.analyzeBrandCompliance = exports.analyzeContentSync = exports.analyzeContent = void 0;
__exportStar(require("./types.js"), exports);
var analyzer_js_1 = require("./analyzer.js");
Object.defineProperty(exports, "analyzeContent", { enumerable: true, get: function () { return analyzer_js_1.analyzeContent; } });
Object.defineProperty(exports, "analyzeContentSync", { enumerable: true, get: function () { return analyzer_js_1.analyzeContentSync; } });
Object.defineProperty(exports, "analyzeBrandCompliance", { enumerable: true, get: function () { return analyzer_js_1.analyzeBrandCompliance; } });
var brandNameChecker_js_1 = require("./engine/brandNameChecker.js");
Object.defineProperty(exports, "checkBrandNameAndTerminology", { enumerable: true, get: function () { return brandNameChecker_js_1.checkBrandNameAndTerminology; } });
var restrictedPhrasesChecker_js_1 = require("./engine/restrictedPhrasesChecker.js");
Object.defineProperty(exports, "checkRestrictedPhrases", { enumerable: true, get: function () { return restrictedPhrasesChecker_js_1.checkRestrictedPhrases; } });
var requiredTermsChecker_js_1 = require("./engine/requiredTermsChecker.js");
Object.defineProperty(exports, "checkRequiredTerms", { enumerable: true, get: function () { return requiredTermsChecker_js_1.checkRequiredTerms; } });
var toneChecker_js_1 = require("./engine/toneChecker.js");
Object.defineProperty(exports, "checkToneGuidelines", { enumerable: true, get: function () { return toneChecker_js_1.checkToneGuidelines; } });
var claimsChecker_js_1 = require("./engine/claimsChecker.js");
Object.defineProperty(exports, "checkClaimsRequiringVerification", { enumerable: true, get: function () { return claimsChecker_js_1.checkClaimsRequiringVerification; } });
var genericBrandChecker_js_1 = require("./engine/genericBrandChecker.js");
Object.defineProperty(exports, "checkGenericBrandGovernance", { enumerable: true, get: function () { return genericBrandChecker_js_1.checkGenericBrandGovernance; } });
var brandMismatchChecker_js_1 = require("./engine/brandMismatchChecker.js");
Object.defineProperty(exports, "checkCompanyIdentityMismatch", { enumerable: true, get: function () { return brandMismatchChecker_js_1.checkCompanyIdentityMismatch; } });
Object.defineProperty(exports, "KNOWN_BRAND_REGISTRY", { enumerable: true, get: function () { return brandMismatchChecker_js_1.KNOWN_BRAND_REGISTRY; } });
var contentCorrector_js_1 = require("./engine/contentCorrector.js");
Object.defineProperty(exports, "produceCorrectedContent", { enumerable: true, get: function () { return contentCorrector_js_1.produceCorrectedContent; } });
var utils_js_1 = require("./engine/utils.js");
Object.defineProperty(exports, "deduplicateIssues", { enumerable: true, get: function () { return utils_js_1.deduplicateIssues; } });
Object.defineProperty(exports, "resetIssueCounter", { enumerable: true, get: function () { return utils_js_1.resetIssueCounter; } });
Object.defineProperty(exports, "generateIssueId", { enumerable: true, get: function () { return utils_js_1.generateIssueId; } });
/**
 * Official reference brand profile for NovaTech defined in API_CONTRACT.md Section 3.2.2 & 3.3.3.
 */
exports.DEMO_BRAND_PROFILE = {
    id: 'demo-brand',
    name: 'NovaTech',
    description: 'Enterprise cloud and AI infrastructure provider.',
    tone: ['professional', 'innovative', 'authoritative', 'accessible'],
    guidelines: {
        terminology: [
            {
                preferred: 'NovaTech Cloud Platform',
                discouraged: ['Nova Cloud', 'NovaTech CP', 'NT Cloud'],
                explanation: 'Always refer to our core offering by its complete official brand name.',
            },
            {
                preferred: 'Autonomous Intelligence',
                discouraged: ['Bot', 'Robot', 'Script'],
                explanation: 'Reflect modern AI terminology in customer-facing communication.',
            },
        ],
        restrictedPhrases: [
            {
                phrase: '100% bug-free',
                severity: 'high',
                explanation: 'Absolute reliability claims violate compliance policies.',
                suggestion: 'engineered for high reliability and resilience',
            },
            {
                phrase: 'cheapest cloud in the market',
                severity: 'high',
                explanation: 'Unsubstantiated pricing superlatives are prohibited.',
                suggestion: 'cost-effective, high-performance cloud infrastructure',
            },
            {
                phrase: 'obviously',
                severity: 'medium',
                explanation: 'Condescending tone undermines accessible brand voice.',
                suggestion: 'as demonstrated',
            },
        ],
        requiredTerms: [
            {
                term: 'NovaTech',
                context: 'Any public press release or product announcement',
                severity: 'medium',
                explanation: 'Brand name must be mentioned explicitly at least once.',
            },
        ],
        claimVerification: [
            {
                claimPattern: 'guarantee(s|d)?',
                severity: 'high',
                explanation: 'Guarantees require explicit legal team approval and SLA references.',
                suggestion: 'commit to high availability under our standard SLA',
            },
        ],
    },
    createdAt: '2026-10-22T00:00:00.000Z',
    updatedAt: '2026-10-22T00:00:00.000Z',
};
/**
 * Standard reference profile for NovaTech used in unit tests and integration demos.
 */
exports.DEMO_NOVATECH_PROFILE = {
    brandId: 'demo-brand',
    id: 'demo-brand',
    brandName: 'NovaTech',
    name: 'NovaTech',
    brandVariations: ['Nova Tech', 'Nova-Tech', 'novatech', 'Nova tech'],
    preferredTerminology: {
        'e-commerce': 'ecommerce',
        'drop us a line': 'contact our team',
        'web app': 'web application',
    },
    restrictedPhrases: [
        {
            phrase: 'cheap software',
            explanation: 'Our brand focuses on premium value, not cut-rate pricing.',
            suggestion: 'cost-effective solution',
            severity: 'high',
        },
        'cannot fail',
        'miracle solution',
    ],
    requiredTerms: [
        {
            term: 'All rights reserved',
            explanation: 'Legal copyright notice must accompany official copy.',
            severity: 'medium',
            placement: 'append',
        },
    ],
    toneGuidelines: {
        primaryTone: 'professional',
        avoidSlang: true,
        avoidAggressivePunctuation: true,
        avoidExcessiveCapitalization: true,
        disallowedWords: ['crappy', 'insane discount', 'freaking'],
    },
    approvedFacts: [
        'NovaTech guarantees 99.9% uptime per SLA',
        'Over 10,000 satisfied enterprise customers',
    ],
};
//# sourceMappingURL=index.js.map