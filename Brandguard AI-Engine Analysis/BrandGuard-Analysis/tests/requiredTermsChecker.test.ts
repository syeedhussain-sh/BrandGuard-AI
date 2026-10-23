import { describe, it, expect } from 'vitest';
import { checkRequiredTerms } from '../src/engine/requiredTermsChecker.js';
import { BrandProfile } from '../src/types.js';

describe('requiredTermsChecker', () => {
  const profile: BrandProfile = {
    brandName: 'MedCare',
    requiredTerms: [
      {
        term: 'Not intended to diagnose or treat medical conditions',
        explanation: 'FDA regulatory compliance disclaimer required on all public copy.',
        severity: 'high',
      },
      'All rights reserved',
    ],
  };

  it('detects when mandatory disclaimers are omitted', () => {
    const text = 'MedCare delivers AI health analytics directly to your phone.';
    const issues = checkRequiredTerms(text, profile);

    expect(issues.length).toBe(2);
    expect(issues.every((i) => i.category === 'missing_term')).toBe(true);

    const fdaIssue = issues.find((i) => i.matchedText.includes('FDA regulatory') || i.matchedText.includes('Not intended'));
    expect(fdaIssue).toBeDefined();
    expect(fdaIssue?.severity).toBe('high');
  });

  it('reports zero issues when all mandatory disclaimers are included', () => {
    const text =
      'MedCare delivers AI health analytics. Not intended to diagnose or treat medical conditions. All rights reserved';
    const issues = checkRequiredTerms(text, profile);

    expect(issues.length).toBe(0);
  });

  it('safely handles missing profile rules', () => {
    expect(checkRequiredTerms('test', { brandName: 'Test' })).toEqual([]);
  });
});
