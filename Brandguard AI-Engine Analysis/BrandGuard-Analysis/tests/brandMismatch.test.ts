import { describe, it, expect } from 'vitest';
import {
  analyzeContentSync,
  DEMO_BRAND_PROFILE,
  checkCompanyIdentityMismatch
} from '../src/index.js';

describe('Company Identity and Brand Mismatch Checker (Section C & J)', () => {
  it('detects when selected Tata Motors has copy referencing Nova Cloud / Nova', () => {
    const content =
      'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.governanceMode).toBe('generic');
    expect(result.companyName).toBe('Tata Motors');

    // Must detect Nova Cloud mismatch
    const mismatchIssue = result.issues.find(
      (i) => i.matchedText === 'Nova Cloud' || i.matchedText.includes('Nova')
    );
    expect(mismatchIssue).toBeDefined();
    expect(mismatchIssue?.category).toBe('brand_identity');
    expect(mismatchIssue?.severity).toBe('high');
    expect(mismatchIssue?.explanation).toContain('Tata Motors');
  });

  it('does NOT produce a false mismatch warning when company and content match', () => {
    const content =
      'Tata Motors introduces our new passenger vehicle engineered for safety and reliability.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    const mismatchIssue = result.issues.find(
      (i) => i.explanation.includes('appears to be a different company')
    );
    expect(mismatchIssue).toBeUndefined();
  });

  it('detects foreign brand when custom startup is selected with Samsung copy', () => {
    const content =
      'The new Samsung Galaxy features infinite battery life and an unbreakable screen.';
    const result = analyzeContentSync(content, {
      name: 'SolarPulse Innovations',
      companyName: 'SolarPulse Innovations',
      industry: 'Renewable Energy',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    const mismatchIssue = result.issues.find(
      (i) => i.matchedText === 'Samsung Galaxy' || i.matchedText === 'Samsung'
    );
    expect(mismatchIssue).toBeDefined();
    expect(mismatchIssue?.explanation).toContain('SolarPulse Innovations');
  });

  it('does not produce fabricated issues for compliant copy', () => {
    const content =
      'SolarPulse Innovations provides sustainable rooftop solar installations with transparent pricing and standard warranties.';
    const result = analyzeContentSync(content, {
      name: 'SolarPulse Innovations',
      companyName: 'SolarPulse Innovations',
      industry: 'Renewable Energy',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.summary.totalIssues).toBe(0);
    expect(result.correctedContent).toBe(content);
  });

  it('detects unsupported absolute marketing claims in generic mode', () => {
    const content =
      'Our new electric scooter is 100% crash-proof and never needs maintenance with infinite battery life!';
    const result = analyzeContentSync(content, {
      name: 'ElectroSpeed',
      companyName: 'ElectroSpeed',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.summary.totalIssues).toBeGreaterThan(0);
    const crashProof = result.issues.find((i) => i.matchedText === '100% crash-proof');
    expect(crashProof).toBeDefined();
    const maintenance = result.issues.find((i) => i.matchedText === 'never needs maintenance');
    expect(maintenance).toBeDefined();
  });

  it('corrected copy addresses issues without fabricating facts', () => {
    const content =
      'Our software is obviously 100% bug-free and the cheapest in the market.';
    const result = analyzeContentSync(content, {
      name: 'CloudScale',
      companyName: 'CloudScale',
      industry: 'Technology and software',
      isGeneric: true
    });

    expect(result.correctedContent).not.toContain('100% bug-free');
    expect(result.correctedContent).not.toContain('obviously');
    expect(result.correctedContent).toContain('engineered for high reliability');
  });

  // =========================================================================
  // Section 5: Focused Brand Analysis Scenarios
  // =========================================================================

  // Scenario 1: A predefined brand with matching content
  it('Scenario 1: Predefined brand with matching content produces no brand mismatch', () => {
    const content = 'Tata Motors introduces our new passenger vehicle engineered for safety and reliability.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.companyName).toBe('Tata Motors');
    const mismatch = result.issues.find((i) => i.id.includes('brand_identity'));
    expect(mismatch).toBeUndefined();
    expect(result.summary.totalIssues).toBe(0);
  });

  // Scenario 2: A predefined brand with content belonging to another company
  it('Scenario 2: Predefined brand with content belonging to another company detects mismatch', () => {
    const content = 'Kentucky Fried Chicken serves delicious crispy chicken meals with original recipe.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    const mismatch = result.issues.find(
      (i) => i.id.includes('brand_identity') || i.matchedText.includes('Kentucky Fried Chicken') || i.matchedText.includes('KFC')
    );
    expect(mismatch).toBeDefined();
    expect(mismatch?.severity).toBe('high');
    expect(mismatch?.explanation).toContain('Tata Motors');
  });

  // Scenario 3: A newly entered brand with matching content
  it('Scenario 3: Newly entered brand with matching content produces no false mismatch', () => {
    const content = 'Rivian introduces our all-electric R1T pickup truck engineered for off-road performance and reliability.';
    const result = analyzeContentSync(content, {
      name: 'Rivian',
      companyName: 'Rivian',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.companyName).toBe('Rivian');
    const mismatch = result.issues.find((i) => i.id.includes('brand_identity'));
    expect(mismatch).toBeUndefined();
    expect(result.summary.totalIssues).toBe(0);
  });

  // Scenario 4: A newly entered brand with mismatched content
  it('Scenario 4: Newly entered brand with mismatched content detects the brand discrepancy', () => {
    const content = 'The new Tesla Model 3 features full self-driving capability and rapid supercharging.';
    const result = analyzeContentSync(content, {
      name: 'Rivian',
      companyName: 'Rivian',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    const mismatch = result.issues.find((i) => i.id.includes('brand_identity'));
    expect(mismatch).toBeDefined();
    expect(mismatch?.explanation).toContain('Rivian');
    expect(mismatch?.matchedText).toContain('Tesla');
  });

  // Scenario 5: A brand with limited or insufficient context
  it('Scenario 5: Brand with limited or insufficient context returns needs-review result', () => {
    const content = 'Our innovative system improves efficiency and accelerates business velocity across operations.';
    const result = analyzeContentSync(content, {
      name: 'ApexVentures',
      companyName: 'ApexVentures',
      // No industry provided
      isGeneric: true
    });

    expect(result.success).toBe(true);
    const contextIssue = result.issues.find((i) => i.id.includes('brand_context'));
    expect(contextIssue).toBeDefined();
    expect(contextIssue?.severity).toBe('low');
    expect(contextIssue?.explanation).toContain('ApexVentures');
  });

  // Scenario 6: Content containing product names, technical terminology, and important factual details
  it('Scenario 6: Content containing product names, technical terminology, and factual details preserves them in correction', () => {
    const content = 'The new Tata Nexon EV features a 40.5 kWh lithium-ion battery delivering 453 km ARAI range and is obviously 100% bug-free.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    // Corrects problematic claims
    expect(result.correctedContent).not.toContain('obviously');
    expect(result.correctedContent).not.toContain('100% bug-free');

    // Preserves product name, technical terminology, and factual specifications
    expect(result.correctedContent).toContain('Tata Nexon EV');
    expect(result.correctedContent).toContain('40.5 kWh lithium-ion battery');
    expect(result.correctedContent).toContain('453 km ARAI range');
  });

  // Scenario 7: Empty or invalid input
  it('Scenario 7: Empty or invalid input returns safe zero-issue response', () => {
    const emptyResult = analyzeContentSync('', {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });
    expect(emptyResult.success).toBe(true);
    expect(emptyResult.summary.totalIssues).toBe(0);
    expect(emptyResult.correctedContent).toBe('');

    const whitespaceResult = analyzeContentSync('   \t\n  ', {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });
    expect(whitespaceResult.success).toBe(true);
    expect(whitespaceResult.summary.totalIssues).toBe(0);
    expect(whitespaceResult.correctedContent).toBe('');
  });

  // Scenario 8: Repeated analysis requests with different brands to check for stale results
  it('Scenario 8: Repeated analysis requests with different brands update results appropriately without stale state', () => {
    const content = 'Our platform provides scalable database infrastructure and cloud storage.';

    // Run 1: NovaTech (matching cloud context)
    const result1 = analyzeContentSync(content, {
      name: 'NovaTech',
      companyName: 'NovaTech',
      industry: 'Enterprise Cloud and AI',
      isGeneric: true
    });
    expect(result1.companyName).toBe('NovaTech');

    // Run 2: Tata Motors (Automotive selected with different context)
    const result2 = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });
    expect(result2.companyName).toBe('Tata Motors');
    expect(result2.analysisId).not.toBe(result1.analysisId);

    // Run 3: KFC (Food selected with different context)
    const result3 = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food and beverages',
      isGeneric: true
    });
    expect(result3.companyName).toBe('KFC');
    expect(result3.analysisId).not.toBe(result2.analysisId);
  });

  // =========================================================================
  // Requirement 10: Focused Verification Test Suite
  // =========================================================================

  // Req 10.1: KFC with McDonald's competitor content
  it('Req 10.1: KFC with McDonald\'s competitor content classifies as brand_identity and generates KFC-appropriate alternative', () => {
    const content = "McDonald's offers burgers and milkshakes.";
    const result = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'FOOD AND RESTAURANT',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.originalContent).toBe(content);

    // 1. Detect competitor violation as brand_identity (not ordinary terminology)
    const mismatch = result.issues.find((i) => i.matchedText.includes("McDonald's"));
    expect(mismatch).toBeDefined();
    expect(mismatch?.category).toBe('brand_identity');
    expect(mismatch?.severity).toBe('high');
    expect(mismatch?.explanation).toContain('KFC');

    // 2. Produces relevant KFC-appropriate alternative
    expect(result.correctedContent).toBe("Enjoy KFC's signature fried chicken and delicious sides.");
    expect(mismatch?.suggestion).toBe("Enjoy KFC's signature fried chicken and delicious sides.");
    expect(result.requiresHumanReview).toBeFalsy();
  });

  // Req 10.2: Tata Motors with Tesla competitor content
  it('Req 10.2: Tata Motors with Tesla competitor content classifies as brand_identity and preserves automotive marketing intent', () => {
    const content = 'Tesla offers electric vehicles with advanced autonomous driving.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.originalContent).toBe(content);

    // 1. Detect competitor violation as brand_identity
    const mismatch = result.issues.find((i) => i.matchedText === 'Tesla');
    expect(mismatch).toBeDefined();
    expect(mismatch?.category).toBe('brand_identity');
    expect(mismatch?.severity).toBe('high');

    // 2. Safe, grammatically correct Tata Motors EV alternative
    expect(result.correctedContent).toBe('Tata Motors offers innovative electric vehicles with reliable engineering.');
    expect(mismatch?.suggestion).toBe('Tata Motors offers innovative electric vehicles with reliable engineering.');
    expect(result.requiresHumanReview).toBeFalsy();
  });

  // Req 10.3: Content that already complies with the selected brand
  it('Req 10.3: Content that already complies with the selected brand produces zero issues and returns original copy', () => {
    const content = "Enjoy KFC's hot and crispy chicken buckets delivered fresh.";
    const result = analyzeContentSync(content, {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food and Restaurant',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.summary.totalIssues).toBe(0);
    expect(result.issues.length).toBe(0);
    expect(result.correctedContent).toBe(content);
    expect(result.originalContent).toBe(content);
    expect(result.requiresHumanReview).toBeFalsy();
  });

  // Req 10.4: Empty content
  it('Req 10.4: Empty or blank content returns safe zero-issue response with empty strings', () => {
    const emptyResult = analyzeContentSync('', {
      name: 'KFC',
      companyName: 'KFC',
      industry: 'Food',
      isGeneric: true
    });

    expect(emptyResult.success).toBe(true);
    expect(emptyResult.summary.totalIssues).toBe(0);
    expect(emptyResult.issues).toEqual([]);
    expect(emptyResult.correctedContent).toBe('');
    expect(emptyResult.originalContent).toBe('');

    const whitespaceResult = analyzeContentSync('   \n\t  ', {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(whitespaceResult.success).toBe(true);
    expect(whitespaceResult.summary.totalIssues).toBe(0);
    expect(whitespaceResult.correctedContent).toBe('');
  });

  // Req 10.5: Cases where correction generation fails
  it('Req 10.5: Cases where reliable correction cannot be generated mark content as requiring human review', () => {
    const content = 'Tesla Q3 earnings report shows $25B revenue from Cybertruck deliveries and patent 99281.';
    const result = analyzeContentSync(content, {
      name: 'Tata Motors',
      companyName: 'Tata Motors',
      industry: 'Automotive',
      isGeneric: true
    });

    expect(result.success).toBe(true);
    expect(result.originalContent).toBe(content);

    // Must detect competitor brand mismatch
    const mismatch = result.issues.find((i) => i.matchedText === 'Tesla');
    expect(mismatch).toBeDefined();
    expect(mismatch?.category).toBe('brand_identity');

    // Must be flagged as requiring human review rather than claiming auto-corrected
    expect(mismatch?.requiresHumanReview).toBe(true);
    expect(result.requiresHumanReview).toBe(true);
    expect(result.correctedContent).toContain('Requires Human Review');
  });
});
