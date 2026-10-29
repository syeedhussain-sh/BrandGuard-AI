"use strict";
/**
 * BrandGuard AI - Company Identity and Brand Mismatch Checker
 *
 * Validates that marketing content aligns with the selected company identity.
 * Detects when marketing copy appears to reference a different commercial company,
 * competitor brand, or mismatched product context.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWN_BRAND_REGISTRY = void 0;
exports.normalizeApostrophes = normalizeApostrophes;
exports.getEnclosingSentence = getEnclosingSentence;
exports.generateCompetitorBrandCorrection = generateCompetitorBrandCorrection;
exports.checkCompanyIdentityMismatch = checkCompanyIdentityMismatch;
const utils_js_1 = require("./utils.js");
/**
 * Curated registry of recognized commercial brands across major industries.
 * Used for entity identification and detecting cross-brand contamination.
 */
exports.KNOWN_BRAND_REGISTRY = [
    // Enterprise Cloud & AI / Tech
    {
        name: 'NovaTech',
        aliases: ['NovaTech Cloud Platform', 'NovaTech Cloud', 'NovaTech CP', 'NovaTech', 'Nova Cloud', 'Nova CP'],
        industry: 'Enterprise Cloud and AI',
        keywords: ['cloud', 'platform', 'infrastructure', 'sla', 'autonomous intelligence'],
    },
    // Electronics & Mobile
    {
        name: 'Samsung',
        aliases: ['Samsung Galaxy', 'Samsung One UI', 'Samsung Electronics', 'Samsung', 'Galaxy Phone', 'Sammy'],
        industry: 'Mobile phones and electronics',
        keywords: ['galaxy', 'one ui', 'smartphone', 'amoled', 'exynos', 'foldable'],
    },
    {
        name: 'Apple',
        aliases: ['Apple Inc', 'Apple iPhone', 'Apple', 'iPhone', 'iPad', 'MacBook', 'iOS'],
        industry: 'Mobile phones and electronics',
        keywords: ['iphone', 'macbook', 'ios', 'retina', 'apple store'],
    },
    {
        name: 'Xiaomi',
        aliases: ['Xiaomi Redmi', 'Redmi Note', 'Xiaomi', 'MIUI', 'HyperOS'],
        industry: 'Mobile phones and electronics',
        keywords: ['redmi', 'miui', 'hyperos'],
    },
    {
        name: 'OnePlus',
        aliases: ['OnePlus Nord', 'OxygenOS', 'OnePlus'],
        industry: 'Mobile phones and electronics',
        keywords: ['oxygenos', 'warp charge'],
    },
    {
        name: 'Sony',
        aliases: ['Sony PlayStation', 'PlayStation', 'Sony Electronics', 'Sony Xperia', 'Sony'],
        industry: 'Mobile phones and electronics',
        keywords: ['playstation', 'bravia', 'xperia'],
    },
    {
        name: 'LG',
        aliases: ['LG Electronics', 'LG OLED', 'LG'],
        industry: 'Mobile phones and electronics',
        keywords: ['oled', 'thinq'],
    },
    // Automotive
    {
        name: 'Tata Motors',
        aliases: ['Tata Motors Passenger Vehicles', 'Tata Motors EV', 'Tata Motors', 'Tata Safari', 'Tata Nexon', 'Tata Harrier'],
        industry: 'Automotive',
        keywords: ['nexon', 'harrier', 'safari', 'icng', 'tiago', 'altroz', 'suv', 'trucks'],
    },
    {
        name: 'Tesla',
        aliases: ['Tesla Motors', 'Tesla Model 3', 'Tesla Model Y', 'Tesla Model S', 'Tesla Model X', 'Cybertruck', 'Tesla Autopilot', 'Supercharger', 'Tesla'],
        industry: 'Automotive',
        keywords: ['autopilot', 'supercharger', 'electric vehicle', 'ev', 'model 3', 'model y', 'cybertruck'],
    },
    {
        name: 'Rivian',
        aliases: ['Rivian Automotive', 'Rivian R1T', 'Rivian R1S', 'Rivian'],
        industry: 'Automotive',
        keywords: ['r1t', 'r1s', 'electric truck', 'adventure vehicle'],
    },
    {
        name: 'MRF Tyres',
        aliases: ['MRF Tyres', 'MRF Radial', 'MRF ZLX', 'MRF Wanderer', 'MRF Tyre', 'MRF'],
        industry: 'Automotive & Rubber',
        keywords: ['tyres', 'tread', 'radial', 'steel radial', 'puncture', 'grip'],
    },
    {
        name: 'BMW',
        aliases: ['BMW Motorsport', 'BMW M', 'BMW'],
        industry: 'Automotive',
        keywords: ['xdrive', 'ultimate driving machine', 'bimmer'],
    },
    {
        name: 'Toyota',
        aliases: ['Toyota Motor', 'Toyota Hybrid', 'Toyota', 'Lexus'],
        industry: 'Automotive',
        keywords: ['camry', 'corolla', 'fortuner', 'prius', 'hybrid'],
    },
    {
        name: 'Hyundai',
        aliases: ['Hyundai Motor', 'Hyundai Creta', 'Hyundai Ioniq', 'Hyundai'],
        industry: 'Automotive',
        keywords: ['creta', 'venue', 'tucson', 'ioniq'],
    },
    {
        name: 'Ford',
        aliases: ['Ford Motor', 'Ford Mustang', 'Ford F-150', 'Ford'],
        industry: 'Automotive',
        keywords: ['mustang', 'f-150', 'mach-e', 'bronco'],
    },
    {
        name: 'Chevrolet',
        aliases: ['Chevy Silverado', 'Chevrolet Silverado', 'Chevrolet', 'Chevy'],
        industry: 'Automotive',
        keywords: ['silverado', 'corvette', 'camaro'],
    },
    {
        name: 'Porsche',
        aliases: ['Porsche 911', 'Porsche Taycan', 'Porsche'],
        industry: 'Automotive',
        keywords: ['taycan', '911', 'carrera'],
    },
    {
        name: 'Audi',
        aliases: ['Audi Quattro', 'Audi e-tron', 'Audi'],
        industry: 'Automotive',
        keywords: ['quattro', 'e-tron'],
    },
    {
        name: 'Mercedes-Benz',
        aliases: ['Mercedes-Benz', 'Mercedes-AMG', 'Mercedes'],
        industry: 'Automotive',
        keywords: ['amg', '4matic'],
    },
    {
        name: 'Volkswagen',
        aliases: ['Volkswagen', 'VW'],
        industry: 'Automotive',
        keywords: ['golf', 'passat', 'id.4'],
    },
    {
        name: 'Honda',
        aliases: ['Honda Motor', 'Honda Civic', 'Honda'],
        industry: 'Automotive',
        keywords: ['civic', 'accord', 'cr-v'],
    },
    // Food & Beverages
    {
        name: 'KFC',
        aliases: ['Kentucky Fried Chicken', 'KFC'],
        industry: 'Food and beverages',
        keywords: ['chicken', 'original recipe', 'fast food', 'bucket', 'crispy chicken'],
    },
    {
        name: "McDonald's",
        aliases: ["McDonald's", "McDonalds", "McDonald’s", 'Big Mac', 'McFlurry', 'Golden Arches'],
        industry: 'Food and beverages',
        keywords: ['burger', 'fries', 'big mac', 'happy meal'],
    },
    {
        name: 'Subway',
        aliases: ['Subway Footlong', 'Subway'],
        industry: 'Food and beverages',
        keywords: ['sub', 'sandwich', 'footlong'],
    },
    {
        name: 'Burger King',
        aliases: ['Burger King', 'Whopper'],
        industry: 'Food and beverages',
        keywords: ['burger', 'whopper', 'flame-grilled'],
    },
    {
        name: 'Starbucks',
        aliases: ['Starbucks Coffee', 'Frappuccino', 'Starbucks'],
        industry: 'Food and beverages',
        keywords: ['coffee', 'frappuccino', 'espresso', 'latte'],
    },
    {
        name: "Domino's",
        aliases: ["Domino's Pizza", 'Dominos Pizza', "Domino's", 'Dominos', "Domino’s Pizza", "Domino’s"],
        industry: 'Food and beverages',
        keywords: ['pizza', 'garlic bread'],
    },
    {
        name: 'Pizza Hut',
        aliases: ['Pizza Hut'],
        industry: 'Food and beverages',
        keywords: ['pizza', 'pan pizza'],
    },
    {
        name: 'Coca-Cola',
        aliases: ['Coca-Cola', 'Coca Cola', 'Coke Zero', 'Diet Coke', 'Coke'],
        industry: 'Food and beverages',
        keywords: ['soft drink', 'soda', 'coke'],
    },
    {
        name: 'Pepsi',
        aliases: ['PepsiCo', 'Pepsi Max', 'Diet Pepsi', 'Pepsi'],
        industry: 'Food and beverages',
        keywords: ['soft drink', 'soda', 'pepsi'],
    },
    {
        name: 'Nestlé',
        aliases: ['Nestle', 'Nescafé', 'Nescafe', 'KitKat', 'Maggi'],
        industry: 'Food and beverages',
        keywords: ['coffee', 'chocolate', 'confectionery'],
    },
    // Clothing & Fashion
    {
        name: 'Nike',
        aliases: ['Nike Running', 'Nike Air', 'Nike Sportswear', 'Nike'],
        industry: 'Clothing and fashion',
        keywords: ['sneakers', 'air jordan', 'air max', 'just do it'],
    },
    {
        name: 'Adidas',
        aliases: ['Adidas Originals', 'Adidas Boost', 'Adidas'],
        industry: 'Clothing and fashion',
        keywords: ['three stripes', 'ultraboost', 'sneakers'],
    },
    {
        name: 'Puma',
        aliases: ['Puma Motorsport', 'Puma'],
        industry: 'Clothing and fashion',
        keywords: ['sneakers', 'sportswear'],
    },
    {
        name: 'Zara',
        aliases: ['Zara Fashion', 'Zara'],
        industry: 'Clothing and fashion',
        keywords: ['apparel', 'fast fashion', 'clothing'],
    },
    {
        name: 'H&M',
        aliases: ['Hennes & Mauritz', 'H&M'],
        industry: 'Clothing and fashion',
        keywords: ['clothing', 'fashion'],
    },
    // Tech & Software
    {
        name: 'Microsoft',
        aliases: ['Microsoft Azure', 'Microsoft 365', 'Microsoft Copilot', 'Microsoft'],
        industry: 'Technology and software',
        keywords: ['azure', 'windows', 'office 365', 'copilot'],
    },
    {
        name: 'Google',
        aliases: ['Google Cloud', 'Google Workspace', 'Google Gemini', 'Google'],
        industry: 'Technology and software',
        keywords: ['gcp', 'gemini', 'workspace', 'search'],
    },
    {
        name: 'Amazon',
        aliases: ['Amazon Prime', 'Amazon Web Services', 'Amazon.com', 'Amazon'],
        industry: 'Retail and e-commerce',
        keywords: ['ecommerce', 'prime delivery', 'aws'],
    },
    {
        name: 'Oracle',
        aliases: ['Oracle Cloud', 'Oracle Database', 'Oracle'],
        industry: 'Technology and software',
        keywords: ['oracle cloud', 'database', 'erp'],
    },
    {
        name: 'Salesforce',
        aliases: ['Salesforce CRM', 'Salesforce'],
        industry: 'Technology and software',
        keywords: ['salesforce', 'crm'],
    },
    {
        name: 'Intel',
        aliases: ['Intel Core', 'Intel Xeon', 'Intel'],
        industry: 'Technology and software',
        keywords: ['intel core', 'semiconductor', 'processor'],
    },
    {
        name: 'Nvidia',
        aliases: ['Nvidia GeForce', 'Nvidia RTX', 'Nvidia'],
        industry: 'Technology and software',
        keywords: ['geforce', 'rtx', 'cuda', 'gpu'],
    },
    {
        name: 'Infosys',
        aliases: ['Infosys BPM', 'Infosys Cobalt', 'Infosys Technologies', 'Infosys'],
        industry: 'Technology and software',
        keywords: ['it consulting', 'outsourcing', 'digital transformation'],
    },
    {
        name: 'TCS',
        aliases: ['Tata Consultancy Services', 'TCS'],
        industry: 'Technology and software',
        keywords: ['it consulting', 'tcs bancs'],
    },
    {
        name: 'Flipkart',
        aliases: ['Flipkart Plus', 'Flipkart Big Billion', 'Flipkart'],
        industry: 'Retail and e-commerce',
        keywords: ['ecommerce', 'online shopping'],
    },
];
/**
 * Checks whether an entity alias matches the selected target company.
 */
/**
 * Normalizes straight and typographic apostrophes for consistent matching.
 */
function normalizeApostrophes(str) {
    if (!str)
        return '';
    return str.replace(/[’‘`]/g, "'");
}
function isSelectedCompanyMatch(targetCompany, entityName, entityAliases) {
    if (!targetCompany)
        return false;
    const cleanTarget = normalizeApostrophes(targetCompany.trim().toLowerCase());
    const cleanEntity = normalizeApostrophes(entityName.trim().toLowerCase());
    if (cleanTarget === cleanEntity)
        return true;
    if (cleanTarget.includes(cleanEntity) || cleanEntity.includes(cleanTarget))
        return true;
    for (const alias of entityAliases) {
        const cleanAlias = normalizeApostrophes(alias.trim().toLowerCase());
        if (cleanTarget === cleanAlias)
            return true;
        if (cleanTarget.includes(cleanAlias) || cleanAlias.includes(cleanTarget))
            return true;
    }
    return false;
}
/**
 * Escapes regex special characters in a search term.
 */
function escapeRegex(term) {
    return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/**
 * Checks if a matched term is ambiguous or used in an ordinary non-brand English sense.
 * Returns true if the match appears to be a genuine brand reference.
 */
function isGenuineBrandContext(content, matchIndex, matchedText) {
    const lower = matchedText.toLowerCase();
    // 1. "Nova" by itself: only consider it a brand reference if accompanied by
    // promotional/entity context like "Nova Cloud", "Our Nova", "Nova platform", "by Nova",
    // or capitalized standalone proper noun, not "super nova" or "bossa nova".
    if (lower === 'nova') {
        const preceding = content.slice(Math.max(0, matchIndex - 15), matchIndex).toLowerCase();
        const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
        if (preceding.includes('super') || preceding.includes('bossa') || preceding.includes('chevy')) {
            return false;
        }
        // Check if followed by commercial words: "cloud", "tech", "platform", "cp", "services"
        if (/\b(?:cloud|platform|cp|infrastructure|suite|systems?|services?)\b/.test(following)) {
            return true;
        }
        // Check if preceded by possessives or entity markers: "our nova", "at nova", "visit nova", "choose nova"
        if (/\b(?:our|at|with|by|from|visit|choose|trust|meet)\s+$/i.test(preceding)) {
            return true;
        }
        // Otherwise, standalone "Nova" capitalized at sentence start might be a name
        return /^[A-Z]/.test(matchedText);
    }
    // 2. "Apple": avoid "eating an apple", "apple pie", etc.
    if (lower === 'apple') {
        const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
        if (/\b(?:pie|cider|sauce|tree|orchard|juice|fruit)\b/.test(following)) {
            return false;
        }
    }
    // 3. "Tata": avoid non-brand contexts
    if (lower === 'tata') {
        const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
        if (/\b(?:bye|ta-ta)\b/.test(following)) {
            return false;
        }
    }
    // 4. "Ford": avoid river crossings
    if (lower === 'ford') {
        const preceding = content.slice(Math.max(0, matchIndex - 15), matchIndex).toLowerCase();
        if (/\b(?:cross|wade|through)\s+(?:a|the)\s+$/i.test(preceding)) {
            return false;
        }
    }
    // 5. "Puma": avoid generic animal contexts
    if (lower === 'puma') {
        const following = content.slice(matchIndex + matchedText.length, matchIndex + matchedText.length + 15).toLowerCase();
        if (/\b(?:animal|cat|predator|wildlife|species)\b/.test(following)) {
            return false;
        }
    }
    return true;
}
/**
 * Extracts enclosing sentence around a text span.
 */
function getEnclosingSentence(content, startIndex, endIndex) {
    let sStart = 0;
    for (let i = startIndex - 1; i >= 0; i--) {
        const ch = content[i];
        if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') {
            let j = i + 1;
            while (j < startIndex && /\s/.test(content[j])) {
                j++;
            }
            sStart = j;
            break;
        }
    }
    let sEnd = content.length;
    for (let i = endIndex; i < content.length; i++) {
        const ch = content[i];
        if (ch === '.' || ch === '!' || ch === '?' || ch === '\n') {
            sEnd = i + 1;
            break;
        }
    }
    const sentence = content.substring(sStart, sEnd).trim();
    return { sentence, start: sStart, end: sEnd };
}
/**
 * Generates a safe, brand-appropriate correction or marks content for human review.
 */
function generateCompetitorBrandCorrection(content, startIndex, endIndex, matchedText, competitorEntity, selectedCompany, selectedIndustry) {
    const { sentence } = getEnclosingSentence(content, startIndex, endIndex);
    const cleanSelected = selectedCompany.trim();
    const lowerSentence = sentence.toLowerCase();
    const lowerSelected = cleanSelected.toLowerCase();
    // Check 1: Check if content contains unresolvable competitor proprietary data
    // (e.g. financial earnings, quarterly reports, revenue numbers, patents, lawsuits, defects/recalls)
    const hasProprietaryData = /\b(?:earnings|revenue|quarterly|fiscal|balance sheet|profit margin|q[1-4]\b|\$\d+(?:\.\d+)?\s*(?:billion|million|b|m)\b|patent\s*#?\d+|lawsuit|subpoena|confidential|nda|internal memo|recalled|recall\s+notice)\b/i.test(sentence);
    if (hasProprietaryData) {
        return {
            canCorrect: false,
            requiresHumanReview: true,
            suggestedText: 'Manual human review required: Content references competitor proprietary financial, patent, or legal data that cannot be safely auto-corrected.',
            explanation: `Content references proprietary or confidential data belonging to competitor "${matchedText}". Manual editorial review is required to avoid fabricating facts or claims.`,
        };
    }
    // Check 2: Unrelated cross-industry product identity (e.g. Nova Cloud when brand is KFC or Tata Motors)
    // Preserves original product identity and flags for review rather than inventing cross-domain products.
    if (competitorEntity.name === 'NovaTech' ||
        competitorEntity.aliases.includes('Nova Cloud') ||
        competitorEntity.aliases.includes('NovaTech Cloud Platform')) {
        const isTechBrand = lowerSelected.includes('nova') ||
            lowerSelected.includes('cloud') ||
            (selectedIndustry && /cloud|software|tech|it/i.test(selectedIndustry));
        if (!isTechBrand) {
            return {
                canCorrect: false,
                requiresHumanReview: false,
                suggestedText: `Verify whether "${matchedText}" was intended or if the wrong brand or industry was selected in settings; preserve product identity.`,
                explanation: `Content references "${matchedText}" (${competitorEntity.industry || 'Technology'}), which appears to be a different company or product than the selected brand ("${cleanSelected}"). Ensure marketing copy aligns with the intended brand identity.`,
            };
        }
    }
    // Check 3: Domain-specific intelligent replacements that preserve intended marketing purpose
    // 3a. QSR / Food & Dining (e.g. KFC, Subway, Burger King, McDonald's)
    if (lowerSelected.includes('kfc') || lowerSelected.includes('kentucky fried chicken')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: "Enjoy KFC's signature fried chicken and delicious sides.",
            explanation: `Content references competitor "${matchedText}" (${competitorEntity.industry || 'Food & Dining'}), which conflicts with selected brand "${cleanSelected}". Ensure marketing copy reinforces the intended brand identity.`,
        };
    }
    if (lowerSelected.includes('subway')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: "Enjoy Subway's freshly made subs and delicious sides.",
            explanation: `Content references competitor "${matchedText}", which conflicts with selected brand "${cleanSelected}".`,
        };
    }
    if (lowerSelected.includes('burger king')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: "Enjoy Burger King's flame-grilled burgers and delicious sides.",
            explanation: `Content references competitor "${matchedText}", which conflicts with selected brand "${cleanSelected}".`,
        };
    }
    if (lowerSelected.includes('mcdonald')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: "Enjoy McDonald's classic menu favorites and delicious meals.",
            explanation: `Content references competitor "${matchedText}", which conflicts with selected brand "${cleanSelected}".`,
        };
    }
    // 3b. Automotive & Electric Vehicles (e.g. Tata Motors, Tesla, Rivian, Mahindra, Hyundai, Ford)
    if (lowerSelected.includes('tata motors') || lowerSelected === 'tata') {
        if (lowerSentence.includes('autonomous') ||
            lowerSentence.includes('self-driving') ||
            lowerSentence.includes('autopilot')) {
            return {
                canCorrect: true,
                requiresHumanReview: false,
                suggestedText: 'Tata Motors offers innovative electric vehicles with reliable engineering.',
                explanation: `Content references competitor "${matchedText}" with autonomous driving claims. Adapted to highlight Tata Motors' innovative EV lineup with reliable engineering.`,
            };
        }
        if (lowerSentence.includes('electric vehicle') ||
            lowerSentence.includes('electric car') ||
            lowerSentence.includes('ev') ||
            lowerSentence.includes('vehicle') ||
            lowerSentence.includes('car') ||
            lowerSentence.includes('suv')) {
            return {
                canCorrect: true,
                requiresHumanReview: false,
                suggestedText: 'Tata Motors delivers innovative electric vehicles and passenger cars.',
                explanation: `Content references competitor "${matchedText}". Adapted to showcase Tata Motors' electric vehicles and passenger cars.`,
            };
        }
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: 'Tata Motors delivers innovative vehicles engineered for reliability and performance.',
            explanation: `Content references competitor "${matchedText}". Adapted to showcase Tata Motors' vehicle engineering.`,
        };
    }
    if (lowerSelected.includes('rivian')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: 'Rivian delivers innovative all-electric adventure vehicles engineered for off-road performance.',
            explanation: `Content references competitor "${matchedText}". Adapted to showcase Rivian's all-electric adventure vehicles.`,
        };
    }
    // 3c. Consumer Electronics & Mobile (e.g. Samsung, Apple)
    if (lowerSelected.includes('samsung')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: 'Samsung Galaxy features innovative display technology and high-performance capabilities.',
            explanation: `Content references competitor "${matchedText}". Adapted to highlight Samsung Galaxy features.`,
        };
    }
    if (lowerSelected.includes('apple')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: 'Apple delivers intuitive devices with powerful performance and elegant design.',
            explanation: `Content references competitor "${matchedText}". Adapted to highlight Apple devices.`,
        };
    }
    // 3d. Sportswear & Footwear (e.g. Nike, Adidas, Puma)
    if (lowerSelected.includes('nike')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: 'Nike offers high-performance athletic footwear and premium sportswear.',
            explanation: `Content references competitor "${matchedText}". Adapted to highlight Nike sportswear.`,
        };
    }
    if (lowerSelected.includes('puma') || lowerSelected.includes('adidas')) {
        return {
            canCorrect: true,
            requiresHumanReview: false,
            suggestedText: `${cleanSelected} delivers stylish athletic footwear and performance sportswear.`,
            explanation: `Content references competitor "${matchedText}". Adapted to highlight ${cleanSelected} sportswear.`,
        };
    }
    // 3e. Universal safe replacement fallback for other brands
    const escapedMatched = escapeRegex(matchedText).replace(/['’]/g, "['’]");
    const replacedSentence = sentence.replace(new RegExp(`\\b${escapedMatched}\\b`, 'gi'), cleanSelected);
    return {
        canCorrect: true,
        requiresHumanReview: false,
        suggestedText: replacedSentence,
        explanation: `Content references competitor "${matchedText}", which conflicts with selected brand "${cleanSelected}". Ensure marketing copy aligns with the intended brand identity.`,
    };
}
/**
 * Checks content for references to foreign companies or competitor entities
 * that differ from the selected active company.
 *
 * @param content - The marketing copy submitted by the user.
 * @param selectedCompany - The active company or brand name selected in the audit context.
 * @param selectedIndustry - The active industry selected (optional).
 * @returns Array of AnalysisIssue items flagging detected company identity mismatches.
 */
function checkCompanyIdentityMismatch(content, selectedCompany, selectedIndustry) {
    const issues = [];
    if (!content || !content.trim() || !selectedCompany || !selectedCompany.trim()) {
        return issues;
    }
    const cleanSelected = selectedCompany.trim();
    const cleanIndustry = (selectedIndustry || '').trim();
    // Evaluate against all known brands in the registry
    for (const entity of exports.KNOWN_BRAND_REGISTRY) {
        // If the entity matches the selected company, skip it (it's the correct brand!)
        if (isSelectedCompanyMatch(cleanSelected, entity.name, entity.aliases)) {
            continue;
        }
        // Sort aliases by length descending so longer compound names (e.g. "NovaTech Cloud Platform")
        // match before shorter substrings (e.g. "Nova")
        const sortedAliases = [...entity.aliases].sort((a, b) => b.length - a.length);
        for (const alias of sortedAliases) {
            const escaped = escapeRegex(alias).replace(/['’]/g, "['’]");
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            let match;
            while ((match = regex.exec(content)) !== null) {
                const matchedText = match[0];
                const startIndex = match.index;
                const endIndex = startIndex + matchedText.length;
                // Check if genuine brand reference rather than incidental word usage
                if (!isGenuineBrandContext(content, startIndex, matchedText)) {
                    continue;
                }
                // Avoid duplicate issue on the same or overlapping text span
                const alreadyCaught = issues.some((i) => (i.startIndex !== undefined &&
                    i.endIndex !== undefined &&
                    startIndex < i.endIndex &&
                    endIndex > i.startIndex));
                if (!alreadyCaught) {
                    const correction = generateCompetitorBrandCorrection(content, startIndex, endIndex, matchedText, entity, cleanSelected, cleanIndustry);
                    issues.push({
                        id: (0, utils_js_1.generateIssueId)('brand_identity'),
                        category: 'brand_identity',
                        severity: 'high',
                        matchedText,
                        explanation: correction.explanation,
                        suggestion: correction.suggestedText,
                        startIndex,
                        endIndex,
                        requiresHumanReview: correction.requiresHumanReview ? true : undefined,
                    });
                }
            }
        }
    }
    return issues;
}
//# sourceMappingURL=brandMismatchChecker.js.map