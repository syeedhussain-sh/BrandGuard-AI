"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeContent = analyzeContent;
exports.analyzeContentSync = analyzeContentSync;
const analysis_engine_1 = require("@brandguard/analysis-engine");
/**
 * Analysis Service Adapter
 *
 * Integrates the backend with the official BrandGuard Analysis Engine (@brandguard/analysis-engine)
 * supporting both Mode A (Configured Brand Analysis) and Mode B (Universal Generic Brand Analysis).
 *
 * @param content - Raw text input provided by the user.
 * @param brand - The full brand profile or company descriptor.
 * @param options - Optional analysis execution options.
 * @returns An AnalysisResponse object containing issues, summary counts, and corrected text.
 */
async function analyzeContent(content, brand, options) {
    return (0, analysis_engine_1.analyzeContent)(content, brand, options);
}
/**
 * Synchronous variant of analyzeContent.
 */
function analyzeContentSync(content, brand, options) {
    return (0, analysis_engine_1.analyzeContentSync)(content, brand, options);
}
