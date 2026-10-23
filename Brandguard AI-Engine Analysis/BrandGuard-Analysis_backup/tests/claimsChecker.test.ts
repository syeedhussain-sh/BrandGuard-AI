import { describe, it, expect } from 'vitest';
import { checkClaimsRequiringVerification } from '../src/engine/claimsChecker.js';
import { BrandProfile } from '../src/types.js';

describe('claimsChecker', () => {
  const profile: BrandProfile = {
    brandName: 'Apex',
    approvedFacts: ['Apex was ranked #1 in customer satisfaction by TechReview 2024'],
  };

  it('flags unverified #1 ranking claims if not substantiated', () => {
    const text = 'Apex is the #1 in the world cloud software.';
    const issues = checkClaimsRequiringVerification(text, profile);

    expect(issues.length).toBe(1);
    expect(issues[0].category).toBe('claim_verification');
    expect(issues[0].severity).toBe('medium');
    expect(issues[0].explanation).toContain('requires empirical verification');
  });

  it('does not flag claims that match approved facts', () => {
    const text = 'Apex was ranked #1 in customer satisfaction by TechReview 2024.';
    const issues = checkClaimsRequiringVerification(text, profile);

    expect(issues.length).toBe(0);
  });

  it('flags 100% guarantee claims and risk-free claims', () => {
    const text = 'Apex offers a 100% guarantee with zero risk.';
    const issues = checkClaimsRequiringVerification(text, profile);

    expect(issues.length).toBe(2);
    expect(issues.some((i) => i.matchedText.includes('100% guarantee'))).toBe(true);
    expect(issues.some((i) => i.matchedText.includes('zero risk'))).toBe(true);
  });

  it('handles empty input gracefully', () => {
    expect(checkClaimsRequiringVerification('', profile)).toEqual([]);
  });
});
