"use strict";
/**
 * BrandGuard AI - Compliance Analysis Engine Demonstration
 *
 * Demonstrates deterministic brand compliance checking using the core
 * analyzeContent function against the official NovaTech brand profile
 * defined in API_CONTRACT.md.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runDemo = runDemo;
const index_js_1 = require("./index.js");
/**
 * Executes the demo analysis and formats output for display.
 */
async function runDemo() {
    const contentToAnalyze = 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';
    console.log('='.repeat(76));
    console.log(' BRANDGUARD AI — BRAND COMPLIANCE ANALYSIS ENGINE DEMO (API CONTRACT)');
    console.log('='.repeat(76));
    console.log('\n[Input Content (Contract Section 3.5.2)]');
    console.log(`"${contentToAnalyze}"\n`);
    console.log('[Active Brand Profile (Contract Section 3.3.3)]');
    console.log(`  Brand ID     : ${index_js_1.DEMO_BRAND_PROFILE.id}`);
    console.log(`  Brand Name   : ${index_js_1.DEMO_BRAND_PROFILE.name}`);
    console.log(`  Tone Values  : ${index_js_1.DEMO_BRAND_PROFILE.tone?.join(', ')}`);
    console.log(`  Terminology Rules : ${index_js_1.DEMO_BRAND_PROFILE.guidelines?.terminology?.length} rules`);
    console.log(`  Restricted Phrases : ${index_js_1.DEMO_BRAND_PROFILE.guidelines?.restrictedPhrases?.length} rules`);
    console.log(`  Claim Verification : ${index_js_1.DEMO_BRAND_PROFILE.guidelines?.claimVerification?.length} rules`);
    // Invoke the official async engine signature: analyzeContent(content, brand)
    const result = await (0, index_js_1.analyzeContent)(contentToAnalyze, index_js_1.DEMO_BRAND_PROFILE);
    console.log('\n' + '='.repeat(76));
    console.log(' 1. COMPLETE RESULT (API CONTRACT SECTION 3.5.4)');
    console.log('='.repeat(76));
    console.log(JSON.stringify(result, null, 2));
    console.log('\n' + '='.repeat(76));
    console.log(' 2. DETECTED COMPLIANCE ISSUES');
    console.log('='.repeat(76));
    result.issues.forEach((issue, index) => {
        console.log(`\nIssue #${index + 1}:`);
        console.log(`  ID          : ${issue.id}`);
        console.log(`  Category    : ${issue.category}`);
        console.log(`  Severity    : [${issue.severity.toUpperCase()}]`);
        console.log(`  Matched Text: "${issue.matchedText}"`);
        console.log(`  Explanation : ${issue.explanation}`);
        console.log(`  Suggestion  : ${issue.suggestion}`);
        if (issue.startIndex !== undefined && issue.endIndex !== undefined) {
            console.log(`  Range       : [${issue.startIndex}..${issue.endIndex}]`);
        }
    });
    console.log('\n' + '='.repeat(76));
    console.log(' 3. ANALYSIS SUMMARY METRICS');
    console.log('='.repeat(76));
    console.log(`  Total Issues Detected : ${result.summary.totalIssues}`);
    console.log(`  High Severity         : ${result.summary.high}`);
    console.log(`  Medium Severity       : ${result.summary.medium}`);
    console.log(`  Low Severity          : ${result.summary.low}`);
    console.log(`  Analysis Mode         : ${result.analysisMode}`);
    console.log(`  Success Status        : ${result.success}`);
    console.log('\n' + '='.repeat(76));
    console.log(' 4. CORRECTED CONTENT COMPARISON');
    console.log('='.repeat(76));
    console.log(`Original Content :`);
    console.log(`  "${contentToAnalyze}"`);
    console.log(`\nCorrected Content:`);
    console.log(`  "${result.correctedContent}"`);
    console.log('='.repeat(76) + '\n');
}
// Automatically execute when invoked as the main entry point
runDemo().catch((err) => {
    console.error('Demo error:', err);
});
//# sourceMappingURL=demo.js.map