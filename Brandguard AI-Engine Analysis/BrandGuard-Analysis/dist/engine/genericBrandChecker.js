"use strict";
/**
 * BrandGuard AI - Universal Generic Brand Governance Checker
 *
 * Implements Mode B: Universal Generic Brand Analysis for ANY company or brand
 * across ANY industry when official brand guidelines are not configured.
 *
 * Checks include:
 * - Exaggerated or absolute statements and misleading promises
 * - Unsupported factual claims and unverified rankings/guarantees
 * - Professional tone, communication quality, and clarity
 * - Brand name casing consistency
 * - Industry-tailored risk indicators (Automotive, Electronics, Food, Health, Finance, Retail, Tech, etc.)
 *
 * Note: These checks are framed as general brand risk indicators, NOT as verified
 * company policies or official regulations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCanonicalBrandName = getCanonicalBrandName;
exports.checkGenericBrandGovernance = checkGenericBrandGovernance;
const utils_js_1 = require("./utils.js");
const brandMismatchChecker_js_1 = require("./brandMismatchChecker.js");
/**
 * Resolves canonical brand capitalization against the known brand registry.
 * If the brand is registered (e.g. "kfc" -> "KFC", "mcdonalds" -> "McDonald's"),
 * the registered canonical casing is returned.
 * If the company is unknown, the user's provided casing is preserved.
 */
function getCanonicalBrandName(companyName) {
    if (!companyName || !companyName.trim())
        return companyName;
    const clean = companyName.trim();
    const normalizedClean = (0, brandMismatchChecker_js_1.normalizeApostrophes)(clean).toLowerCase();
    for (const entity of brandMismatchChecker_js_1.KNOWN_BRAND_REGISTRY) {
        if ((0, brandMismatchChecker_js_1.normalizeApostrophes)(entity.name).toLowerCase() === normalizedClean) {
            return entity.name;
        }
        for (const alias of entity.aliases) {
            if ((0, brandMismatchChecker_js_1.normalizeApostrophes)(alias).toLowerCase() === normalizedClean) {
                return entity.name;
            }
        }
    }
    return clean;
}
/**
 * Universal rules that apply to content from ANY industry.
 */
const UNIVERSAL_RISK_RULES = [
    // 1. Absolute reliability / perfection claims
    {
        regex: /\b100%\s+bug-free\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Absolute reliability claims create significant legal and compliance exposure. Software and complex systems cannot guarantee zero defects.',
        suggestion: 'engineered for high reliability and resilience',
    },
    {
        regex: /\b100%\s+(?:defect-free|error-free|perfect)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Absolute perfection claims violate truthful advertising standards. Qualified language is recommended.',
        suggestion: 'rigorously quality-tested to meet high performance benchmarks',
    },
    {
        regex: /\b(?:total|absolute)\s+perfection\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Superlative perfection claims are legally unsupportable and degrade consumer trust.',
        suggestion: 'exceptional quality and continuous performance improvement',
    },
    {
        regex: /\b(?:never\s+fails|cannot\s+fail|failsafe\s+forever)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Absolute infallibility claims cannot be defended under real-world operating conditions.',
        suggestion: 'engineered for high availability and fault tolerance',
    },
    {
        regex: /\b(?:100%\s+guaranteed|guarantee(?:s|d)?\s+100%)(?!\w)/gi,
        category: 'claim_verification',
        severity: 'high',
        explanation: 'Absolute "100% guaranteed" claims create unconditional liability and must specify verified qualification terms or warranty bounds.',
        suggestion: 'backed by our verified quality assurance commitments',
    },
    // 2. Absolute pricing & universal superlatives
    {
        regex: /\bcheapest\s+(?:in\s+the\s+market|in\s+the\s+world|on\s+earth|anywhere)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Unsubstantiated pricing superlatives violate fair advertising standards unless supported by exhaustive independent market audits.',
        suggestion: 'cost-effective, high-value solution with competitive pricing',
    },
    {
        regex: /\bcheapest\s+cloud\s+in\s+the\s+market\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Unsubstantiated pricing superlatives are prohibited under responsible brand governance.',
        suggestion: 'cost-effective, high-performance cloud infrastructure',
    },
    {
        regex: /\b(?:best|greatest|most\s+advanced)\s+(?:in\s+the\s+world|on\s+earth|in\s+the\s+universe)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Unqualified global superlatives weaken brand credibility and invite regulatory scrutiny.',
        suggestion: 'recognized for industry-leading innovation and performance',
    },
    {
        regex: /\b(?:the\s+)?world['’]?s\s+best\b/gi,
        category: 'claim_verification',
        severity: 'high',
        explanation: 'Unqualified "world\'s best" superlatives violate advertising standards without verified independent benchmark rankings.',
        suggestion: 'a leading solution',
    },
    {
        regex: /\bguarantees?\s+perfect\s+results(?:\s+every\s+time)?\b/gi,
        category: 'claim_verification',
        severity: 'high',
        explanation: 'Guaranteeing perfect results is legally indefensible and misleads consumers.',
        suggestion: 'designed to deliver consistent, high-quality results',
    },
    // 3. Absolute risk-free & financial promises
    {
        regex: /\b(?:100%\s+risk-free|zero\s+risk(?:\s+guaranteed)?|completely\s+risk-free)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Commercial transactions and products inherently carry operational or market risks; zero-risk promises risk legal liability.',
        suggestion: 'backed by our customer satisfaction policy and transparent terms',
    },
    {
        regex: /\b(?:miracle\s+solution|miracle\s+cure|instant\s+cure)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Sensationalist "miracle" wording compromises professional integrity and risks deceptive marketing classifications.',
        suggestion: 'proven, evidence-based methodology',
    },
    {
        regex: /\b(?:guaranteed\s+(?:profit|wealth|income)|get\s+rich(?:\s+quick)?|double\s+your\s+money)\b/gi,
        category: 'restricted_phrase',
        severity: 'high',
        explanation: 'Guaranteed earnings or wealth generation promises are strictly prohibited under consumer protection frameworks.',
        suggestion: 'designed to help optimize financial performance and strategic value',
    },
    // 4. Guarantees requiring external verification
    {
        regex: /\bguarantee(?:s|d)?\s+total\s+perfection\b/gi,
        category: 'claim_verification',
        severity: 'high',
        explanation: 'Guarantees of perfection require rigorous legal substantiation and formal SLA documentation.',
        suggestion: 'commit to high availability under our standard SLA',
    },
    {
        regex: /\bguarantee(?:s|d)?\s+100%\s+customer\s+satisfaction\b/gi,
        category: 'claim_verification',
        severity: 'high',
        explanation: 'Broad satisfaction guarantees require explicit reference to published refund or resolution policies.',
        suggestion: 'strive to deliver exceptional customer satisfaction backed by our service commitments',
    },
    {
        regex: /\b(?:#1|number\s+one|no\.?\s*1)\s+(?:in\s+the\s+market|in\s+the\s+world|brand|solution|provider)\b/gi,
        category: 'claim_verification',
        severity: 'medium',
        explanation: 'Market leadership rankings require citing a recognized third-party benchmark or research authority.',
        suggestion: 'a leading provider with verified customer satisfaction ratings',
    },
    {
        regex: /\bproven\s+by\s+all\s+(?:scientists|experts|studies|users)\b/gi,
        category: 'claim_verification',
        severity: 'medium',
        explanation: 'Universal consensus claims must be substantiated with published peer-reviewed citations.',
        suggestion: 'supported by documented research and customer case studies',
    },
    // 5. Professional tone & clarity
    {
        regex: /\bobviously\b/gi,
        category: 'tone',
        severity: 'medium',
        explanation: 'Patronizing language can alienate customers and undermines an approachable brand voice.',
        suggestion: 'as demonstrated',
    },
    {
        regex: /\b(?:as\s+anyone\s+knows|clearly\s+you\s+should\s+know|needless\s+to\s+say)\b/gi,
        category: 'tone',
        severity: 'medium',
        explanation: 'Presumptuous phrasing risks alienating readers. Direct, confident phrasing is more effective.',
        suggestion: 'notably',
    },
    {
        regex: /\b(?:crappy|freaking|damn|sucks|junk)\b/gi,
        category: 'tone',
        severity: 'medium',
        explanation: 'Colloquial, vulgar, or disparaging language degrades professional brand dignity.',
        suggestion: 'sub-optimal',
    },
    {
        regex: /\b(?:insane\s+deal|ridiculous\s+discount|shut\s+up\s+and\s+buy)\b/gi,
        category: 'tone',
        severity: 'medium',
        explanation: 'Sensationalist discount hype diminishes premium brand perception.',
        suggestion: 'exceptional value proposition',
    },
];
/**
 * Industry-tailored risk indicators.
 * Used when an industry context is provided or detected.
 */
const INDUSTRY_RULES = {
    automotive: {
        keywords: ['automotive', 'car', 'vehicle', 'motor', 'transport', 'mobility', 'automobile', 'driving', 'tire', 'tyre', 'rubber', 'drone', 'drones', 'aerospace', 'aviation'],
        rules: [
            {
                regex: /\b(?:100%\s+crash-proof|completely\s+accident-proof|impossible\s+to\s+crash)\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Automotive Risk Indicator] Absolute safety or crash-proof claims are legally hazardous and cannot guarantee immunity against all collision physics.',
                suggestion: 'engineered with verified crash-safety ratings and advanced collision mitigation systems',
            },
            {
                regex: /\b(?:100%\s+puncture-proof|puncture-proof\s+warranty)\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Automotive Risk Indicator] Absolute puncture-proof warranties require clear disclosure of road hazard limitations and tread warranty terms.',
                suggestion: 'fortified with run-flat technology and enhanced puncture resistance',
            },
            {
                regex: /\bnever\s+needs\s+maintenance\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Automotive Risk Indicator] Mechanical and electronic vehicle systems require scheduled maintenance; claiming zero maintenance misleads buyers.',
                suggestion: 'engineered for extended maintenance intervals and maximum reliability',
            },
            {
                regex: /\bzero\s+wear\s+and\s+tear\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Automotive Risk Indicator] Friction components experience inevitable mechanical wear; zero wear promises violate fair trade standards.',
                suggestion: 'engineered with ultra-durable compounds for prolonged tread life',
            },
            {
                regex: /\bzero\s+emissions\s+under\s+all\s+conditions\b/gi,
                category: 'claim_verification',
                severity: 'medium',
                explanation: '[Automotive Risk Indicator] Zero-emission claims should explicitly clarify whether they apply to tailpipe emissions or full lifecycle energy usage.',
                suggestion: 'zero tailpipe emissions during electric operation',
            },
        ],
    },
    electronics: {
        keywords: ['mobile', 'phone', 'electronic', 'hardware', 'gadget', 'device', 'smartphone', 'consumer tech', 'telecom'],
        rules: [
            {
                regex: /\b(?:infinite|permanent)\s+battery(?:\s+life)?\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Electronics Risk Indicator] Infinite or permanent battery claims violate consumer advertising standards. State verified battery hours under standard test conditions.',
                suggestion: 'up to all-day battery life under standardized testing conditions',
            },
            {
                regex: /\b(?:unbreakable\s+(?:screen|glass|display)|100%\s+shatterproof)\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Electronics Risk Indicator] Display glass remains vulnerable under extreme impacts. Avoid absolute unbreakable claims without qualifying test parameters.',
                suggestion: 'reinforced with high-durability drop-resistant ceramic glass',
            },
            {
                regex: /\b100%\s+waterproof\s+at\s+(?:any|all)\s+depths?\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Electronics Risk Indicator] Water resistance is bounded by depth and pressure. Always cite formal IP-rating test limits (e.g., IP68).',
                suggestion: 'water-resistant up to 6 meters for 30 minutes under IP68 standards',
            },
            {
                regex: /\bzero\s+latency\s+(?:on\s+earth|guaranteed)\b/gi,
                category: 'claim_verification',
                severity: 'medium',
                explanation: '[Electronics Risk Indicator] Physical signal propagation prohibits true zero latency across networks. Specify sub-millisecond or ultra-low latency benchmarks.',
                suggestion: 'ultra-low latency architecture engineered for demanding performance',
            },
        ],
    },
    food: {
        keywords: ['food', 'beverage', 'drink', 'restaurant', 'nutrition', 'snack', 'dining', 'culinary', 'grocery'],
        rules: [
            {
                regex: /\bcures?\s+(?:all\s+)?diseases?\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Food & Beverage Risk Indicator] Therapeutic or disease-curing claims on food items violate food safety and health authority regulations.',
                suggestion: 'crafted with nutritious ingredients to support wholesome wellness',
            },
            {
                regex: /\b(?:prevents?|cures?)\s+cancer\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Food & Beverage Risk Indicator] Making direct cancer-prevention claims on commercial food products invites severe regulatory penalties.',
                suggestion: 'rich in natural dietary antioxidants as part of a balanced diet',
            },
            {
                regex: /\bmiracle\s+detox\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Food & Beverage Risk Indicator] "Miracle detox" is widely classified as deceptive marketing without rigorous clinical peer review.',
                suggestion: 'refreshing herbal blend formulated to support natural hydration',
            },
            {
                regex: /\b(?:guarantee(?:s|d)?(?:\s+[\w%]+){0,3}\s+weight\s+loss|promises?\s+weight\s+loss)\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Food & Beverage Claim Verification] Weight loss claims require empirical substantiation from approved clinical evidence; this claim is unsupported without verified clinical trial data.',
                suggestion: 'designed to support balanced calorie management alongside healthy exercise',
            },
            {
                regex: /\b(?:guarantee(?:s|d)?\s+(?:100%\s+)?freshness|100%\s+fresh(?:ness)?\s+guaranteed)\b/gi,
                category: 'claim_verification',
                severity: 'medium',
                explanation: '[Food & Beverage Claim Verification] Absolute freshness claims require verification against certified supply chain standards and store preparation guidelines.',
                suggestion: 'prepared fresh daily according to our quality assurance standards',
            },
            {
                regex: /\bguarantee(?:s|d)?\s+(?:100%\s+)?(?:taste|flavor|deliciousness)\b/gi,
                category: 'claim_verification',
                severity: 'medium',
                explanation: '[Food & Beverage Claim Verification] Sensory taste guarantees require reference to satisfaction refund policies or customer survey data.',
                suggestion: 'committed to serving delicious meals prepared with high-quality ingredients',
            },
            {
                regex: /\b100%\s+chemical-free\b/gi,
                category: 'tone',
                severity: 'low',
                explanation: '[Food & Beverage Risk Indicator] All matter consists of chemical elements; "chemical-free" is scientifically inaccurate and often scrutinized.',
                suggestion: 'free from artificial additives, synthetic flavors, and preservatives',
            },
        ],
    },
    health: {
        keywords: ['health', 'pharma', 'medical', 'medicine', 'clinic', 'drug', 'biotech', 'therapeutic', 'healthcare'],
        rules: [
            {
                regex: /\b(?:guaranteed|100%\s+effective)\s+cure\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Healthcare Risk Indicator] Absolute cure guarantees require validated multi-phase clinical trial evidence and formal regulatory approval.',
                suggestion: 'demonstrated statistically significant efficacy in controlled clinical trials',
            },
            {
                regex: /\bcures?\s+(?:all\s+)?diseases?\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Healthcare Risk Indicator] Therapeutic claims of curing all diseases violate medical regulations and advertising standards.',
                suggestion: 'targeted therapeutic formula developed to support clinical outcomes',
            },
            {
                regex: /\binstant\s+healing\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Healthcare Risk Indicator] Medical recovery requires physiological processing; "instant healing" claims breach medical advertising ethics.',
                suggestion: 'rapid-acting therapeutic formula for targeted symptom relief',
            },
            {
                regex: /\bno\s+side\s+effects\s+ever\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Healthcare Risk Indicator] Clinical therapies present varying patient tolerance profiles; absolute zero side-effect claims are unsafe.',
                suggestion: 'demonstrated favorable safety profile in clinical evaluation',
            },
        ],
    },
    finance: {
        keywords: ['bank', 'finance', 'invest', 'financial', 'crypto', 'wealth', 'fund', 'insurance', 'securities'],
        rules: [
            {
                regex: /\bguaranteed\s+(?:returns?|profit|income|yield)\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Financial Risk Indicator] Guaranteeing financial returns or capital appreciation violates securities and consumer banking compliance.',
                suggestion: 'competitive growth potential aligned with risk-managed market strategies',
            },
            {
                regex: /\b(?:zero|risk-free)\s+investment\s+risk\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Financial Risk Indicator] Investments are subject to market volatility; claiming zero risk violates advertising regulations.',
                suggestion: 'structured with defensive asset allocation to manage market risk',
            },
        ],
    },
    tech: {
        keywords: ['tech', 'software', 'it services', 'cloud', 'consulting', 'saas', 'enterprise', 'digital', 'data'],
        rules: [
            {
                regex: /\b100%\s+unhackable\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Technology Risk Indicator] In information security, claiming absolute immunity to cyberattacks creates grave legal liability.',
                suggestion: 'fortified with zero-trust architecture and multi-layered cryptographic defenses',
            },
            {
                regex: /\b(?:completely\s+)?immune\s+to\s+(?:every|all)\s+cyberattacks?\b/gi,
                category: 'claim_verification',
                severity: 'high',
                explanation: '[Technology Risk Indicator] Claiming complete immunity to all cyberattacks is indefensible in cybersecurity engineering and creates severe legal liability.',
                suggestion: 'engineered with robust defenses against modern cyberattacks',
            },
            {
                regex: /\bzero\s+downtime\s+guaranteed\s+forever\b/gi,
                category: 'restricted_phrase',
                severity: 'high',
                explanation: '[Technology Risk Indicator] Distributed infrastructure is subject to maintenance and network events; specify targeted SLA percentages.',
                suggestion: 'architected for 99.99% high availability backed by enterprise SLAs',
            },
            {
                regex: /\b100%\s+automated\s+perfection\b/gi,
                category: 'restricted_phrase',
                severity: 'medium',
                explanation: '[Technology Risk Indicator] Automated systems require human-in-the-loop oversight and edge-case handling.',
                suggestion: 'streamlined intelligent automation with continuous human verification',
            },
        ],
    },
    fashion: {
        keywords: ['fashion', 'clothing', 'retail', 'ecommerce', 'apparel', 'wear', 'shopping', 'luxury', 'shoes'],
        rules: [
            {
                regex: /\b100%\s+eco-friendly\s+(?:on\s+earth|guaranteed)\b/gi,
                category: 'claim_verification',
                severity: 'medium',
                explanation: '[Retail Risk Indicator] Absolute environmental claims (greenwashing) must be substantiated with certified lifecycle sustainability metrics.',
                suggestion: 'crafted with certified recycled materials and lower-impact production methods',
            },
            {
                regex: /\bcheapest\s+prices\s+guaranteed\s+anywhere\b/gi,
                category: 'restricted_phrase',
                severity: 'medium',
                explanation: '[Retail Risk Indicator] Absolute lowest-price claims require formal published price-matching terms and audit records.',
                suggestion: 'exceptional everyday value backed by our competitive price-match commitment',
            },
        ],
    },
};
/**
 * Checks for company name capitalization consistency without imposing unconfigured brand terminology.
 */
function checkCompanyNameCasing(content, companyName) {
    const issues = [];
    if (!companyName || companyName.trim().length < 2)
        return issues;
    // Resolve canonical brand name from known registry if registered (e.g. "kfc" -> "KFC")
    const targetName = getCanonicalBrandName(companyName.trim());
    const escaped = targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['’]/g, "['’]");
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    let match;
    while ((match = regex.exec(content)) !== null) {
        const matchedText = match[0];
        if (matchedText !== targetName) {
            issues.push({
                id: (0, utils_js_1.generateIssueId)('terminology'),
                category: 'terminology',
                severity: 'medium',
                matchedText,
                explanation: `Consistent brand capitalization ("${targetName}") reinforces professional identity in customer communications.`,
                suggestion: targetName,
                startIndex: match.index,
                endIndex: match.index + matchedText.length,
            });
        }
    }
    return issues;
}
/**
 * Checks for excessive aggressive typography (e.g. multiple exclamation points or consecutive all-caps words).
 */
function checkAggressiveTypography(content) {
    const issues = [];
    if (!content)
        return issues;
    // 1. Multiple exclamation marks (!!! or !!)
    const exclRegex = /!{2,}/g;
    let exclMatch;
    while ((exclMatch = exclRegex.exec(content)) !== null) {
        issues.push({
            id: (0, utils_js_1.generateIssueId)('tone'),
            category: 'tone',
            severity: 'low',
            matchedText: exclMatch[0],
            explanation: 'Repeated exclamation marks diminish authoritative brand voice and can appear sensationalist.',
            suggestion: '.',
            startIndex: exclMatch.index,
            endIndex: exclMatch.index + exclMatch[0].length,
        });
    }
    // 2. Excessive all-caps words (3+ consecutive all-caps words of 2+ chars)
    const allCapsRegex = /\b[A-Z]{2,}(?:\s+[A-Z]{2,}){2,}\b/g;
    let capsMatch;
    while ((capsMatch = allCapsRegex.exec(content)) !== null) {
        const phrase = capsMatch[0];
        const converted = phrase
            .split(/\s+/)
            .map((w, idx) => (idx === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : w.toLowerCase()))
            .join(' ');
        issues.push({
            id: (0, utils_js_1.generateIssueId)('tone'),
            category: 'tone',
            severity: 'medium',
            matchedText: phrase,
            explanation: 'Consecutive all-caps text can be perceived as aggressive or shouting. Standard title or sentence casing is recommended.',
            suggestion: converted,
            startIndex: capsMatch.index,
            endIndex: capsMatch.index + phrase.length,
        });
    }
    return issues;
}
/**
 * Matches candidate industry string against industry definition keywords.
 */
function matchIndustryRules(industry) {
    if (!industry || typeof industry !== 'string' || !industry.trim()) {
        return [];
    }
    const normalized = industry.toLowerCase().trim();
    const matchedRules = [];
    for (const def of Object.values(INDUSTRY_RULES)) {
        const isMatch = def.keywords.some((kw) => normalized.includes(kw));
        if (isMatch) {
            matchedRules.push(...def.rules);
        }
    }
    return matchedRules;
}
/**
 * Primary entry point for Mode B: Universal Generic Brand Governance Analysis.
 *
 * Evaluates text against universal brand safety, clarity, superlatives, and industry risk indicators.
 */
function checkGenericBrandGovernance(content, companyName, industry) {
    const issues = [];
    if (!content || !content.trim())
        return issues;
    // 1. Company Name Casing Consistency (if specified)
    if (companyName) {
        issues.push(...checkCompanyNameCasing(content, companyName));
    }
    // 2. Aggressive Typography & Punctuation
    issues.push(...checkAggressiveTypography(content));
    // 3. Universal Risk Rules & Industry Rules
    let resolvedIndustry = industry;
    if (!resolvedIndustry && companyName) {
        const canonical = getCanonicalBrandName(companyName);
        const entity = brandMismatchChecker_js_1.KNOWN_BRAND_REGISTRY.find((e) => e.name === canonical);
        if (entity?.industry) {
            resolvedIndustry = entity.industry;
        }
    }
    const allRules = [...UNIVERSAL_RISK_RULES, ...matchIndustryRules(resolvedIndustry)];
    for (const rule of allRules) {
        const regex = new RegExp(rule.regex.source, rule.regex.flags);
        let match;
        while ((match = regex.exec(content)) !== null) {
            const matchedText = match[0];
            const startIndex = match.index;
            const endIndex = match.index + matchedText.length;
            // Prevent exact span duplicates
            const alreadyCaught = issues.some((i) => i.startIndex === startIndex && i.endIndex === endIndex);
            if (!alreadyCaught) {
                issues.push({
                    id: (0, utils_js_1.generateIssueId)(rule.category),
                    category: rule.category,
                    severity: rule.severity,
                    matchedText,
                    explanation: rule.explanation,
                    suggestion: rule.suggestion,
                    startIndex,
                    endIndex,
                    ...(rule.category === 'claim_verification' ? { verificationStatus: 'unsupported' } : {}),
                });
            }
        }
    }
    return issues;
}
//# sourceMappingURL=genericBrandChecker.js.map