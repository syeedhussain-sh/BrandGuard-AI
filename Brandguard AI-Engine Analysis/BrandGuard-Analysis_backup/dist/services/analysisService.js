"use strict";
/**
 * BrandGuard AI - Analysis Service
 *
 * Implements the core analysis engine function conforming to Section 6 of API_CONTRACT.md:
 * "analyzeContent(content: string, brand: BrandProfile): Promise<AnalysisResponse>"
 *
 * Author: Member 3 (Analysis Engine)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeBrandCompliance = void 0;
exports.analyzeContent = analyzeContent;
exports.analyzeContentSync = analyzeContentSync;
const analyzer_js_1 = require("../analyzer.js");
Object.defineProperty(exports, "analyzeBrandCompliance", { enumerable: true, get: function () { return analyzer_js_1.analyzeBrandCompliance; } });
/**
 * Analyzes candidate text against a brand profile's guidelines.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
async function analyzeContent(content, brand) {
    return (0, analyzer_js_1.analyzeBrandCompliance)(content, brand);
}
/**
 * Pure / synchronous variant of analyzeContent for synchronous execution contexts.
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile including guidelines, terminology, and restrictions.
 * @returns An AnalysisResponse object.
 */
function analyzeContentSync(content, brand) {
    return (0, analyzer_js_1.analyzeBrandCompliance)(content, brand);
}
//# sourceMappingURL=analysisService.js.map