import { describe, it, expect } from 'vitest';
import { checkBrandNameAndTerminology } from '../src/engine/brandNameChecker.js';
import { BrandProfile } from '../src/types.js';

describe('brandNameChecker', () => {
  const profile: BrandProfile = {
    brandName: 'CloudPulse',
    brandVariations: ['Cloud Pulse', 'cloud-pulse'],
    preferredTerminology: [
      { term: 'on-prem', preferred: 'on-premises', severity: 'medium' },
      { term: 'uptime guarantee', preferred: 'service level agreement', severity: 'low' },
    ],
  };

  it('detects variations and casing issues', () => {
    const text = 'Cloud Pulse provides 24/7 monitoring. Choose cloudpulse today.';
    const issues = checkBrandNameAndTerminology(text, profile);

    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(issues.some((i) => i.matchedText === 'Cloud Pulse')).toBe(true);
    expect(issues.every((i) => i.severity === 'high')).toBe(true);
  });

  it('detects preferred terminology from array rules', () => {
    const text = 'CloudPulse supports on-prem installations with our uptime guarantee.';
    const issues = checkBrandNameAndTerminology(text, profile);

    const onPrem = issues.find((i) => i.matchedText === 'on-prem');
    expect(onPrem).toBeDefined();
    expect(onPrem?.suggestion).toContain('on-premises');
    expect(onPrem?.severity).toBe('medium');
  });

  it('handles empty text and missing brandName safely', () => {
    expect(checkBrandNameAndTerminology('', profile)).toEqual([]);
    expect(checkBrandNameAndTerminology('hello', {} as BrandProfile)).toEqual([]);
  });
});
