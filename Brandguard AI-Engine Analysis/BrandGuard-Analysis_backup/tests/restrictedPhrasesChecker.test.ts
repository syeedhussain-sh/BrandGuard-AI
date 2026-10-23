import { describe, it, expect } from 'vitest';
import { checkRestrictedPhrases } from '../src/engine/restrictedPhrasesChecker.js';
import { BrandProfile } from '../src/types.js';

describe('restrictedPhrasesChecker', () => {
  const profile: BrandProfile = {
    brandName: 'SecureVault',
    restrictedPhrases: [
      {
        phrase: '100% unhackable',
        explanation: 'No security solution can legitimately guarantee 100% unhackability.',
        suggestion: 'Replace with "industry-standard bank-grade encryption"',
        severity: 'high',
      },
      'cheap security',
    ],
  };

  it('detects both object-based and string-based restricted phrases', () => {
    const text = 'SecureVault provides cheap security that is 100% unhackable.';
    const issues = checkRestrictedPhrases(text, profile);

    expect(issues.length).toBe(2);
    expect(issues.every((i) => i.category === 'restricted_phrase')).toBe(true);

    const unhackable = issues.find((i) => i.matchedText === '100% unhackable');
    expect(unhackable).toBeDefined();
    expect(unhackable?.severity).toBe('high');
    expect(unhackable?.explanation).toContain('No security solution');
    expect(unhackable?.suggestion).toContain('bank-grade');

    const cheap = issues.find((i) => i.matchedText === 'cheap security');
    expect(cheap).toBeDefined();
    expect(cheap?.severity).toBe('high');
  });

  it('safely handles empty content or missing profile rules', () => {
    expect(checkRestrictedPhrases('', profile)).toEqual([]);
    expect(checkRestrictedPhrases('Hello world', { brandName: 'SecureVault' })).toEqual([]);
  });
});
