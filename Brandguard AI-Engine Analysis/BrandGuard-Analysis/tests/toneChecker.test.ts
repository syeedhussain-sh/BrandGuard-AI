import { describe, it, expect } from 'vitest';
import { checkToneGuidelines } from '../src/engine/toneChecker.js';
import { BrandProfile } from '../src/types.js';

describe('toneChecker', () => {
  const profile: BrandProfile = {
    brandName: 'FinTrust',
    toneGuidelines: {
      primaryTone: 'formal',
      avoidSlang: true,
      avoidAggressivePunctuation: true,
      avoidExcessiveCapitalization: true,
      disallowedWords: ['super easy', 'insanely fast'],
    },
  };

  it('detects tone violations including custom disallowed words and slang', () => {
    const text = 'FinTrust is gonna make money transfers super easy and INSANELY fast!';
    const issues = checkToneGuidelines(text, profile);

    expect(issues.length).toBeGreaterThanOrEqual(2);
    expect(issues.some((i) => i.matchedText === 'gonna')).toBe(true);
    expect(issues.some((i) => i.matchedText.toLowerCase() === 'super easy')).toBe(true);
  });

  it('detects multiple exclamation marks', () => {
    const text = 'Get started with FinTrust now!!!!';
    const issues = checkToneGuidelines(text, profile);

    const punctIssue = issues.find((i) => i.matchedText === '!!!!');
    expect(punctIssue).toBeDefined();
    expect(punctIssue?.category).toBe('tone');
  });

  it('handles string tone guidelines like "casual" or "professional"', () => {
    const casualProfile: BrandProfile = {
      brandName: 'FunApp',
      toneGuidelines: 'casual',
    };
    const text = 'FunApp is gonna be great.';
    // Casual tone should not flag "gonna" as slang error
    const issues = checkToneGuidelines(text, casualProfile);
    expect(issues.length).toBe(0);
  });
});
