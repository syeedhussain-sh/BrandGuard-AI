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
    expect(mismatchIssue?.category).toBe('terminology');
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
});
