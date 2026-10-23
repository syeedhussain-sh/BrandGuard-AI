import { describe, it, expect } from 'vitest';
import { produceCorrectedContent } from '../src/engine/contentCorrector.js';
import { AnalysisIssue, BrandProfile } from '../src/types.js';

describe('contentCorrector', () => {
  const profile: BrandProfile = {
    brandName: 'NovaTech',
    requiredTerms: [
      {
        term: '© 2026 NovaTech Inc.',
        placement: 'append',
      },
    ],
  };

  it('safely handles empty content', () => {
    expect(produceCorrectedContent('', [], profile)).toBe('');
  });

  it('corrects issues in right-to-left order without offset corruption', () => {
    const original = 'Nova Tech offers cheap software with gonna fail.';
    const issues: AnalysisIssue[] = [
      {
        id: '1',
        category: 'terminology',
        severity: 'high',
        matchedText: 'Nova Tech',
        explanation: '',
        suggestion: 'Use "NovaTech" instead',
        startIndex: 0,
        endIndex: 9,
      },
      {
        id: '2',
        category: 'restricted_phrase',
        severity: 'high',
        matchedText: 'cheap software',
        explanation: '',
        suggestion: 'Replace with "cost-effective software"',
        startIndex: 17,
        endIndex: 31,
      },
      {
        id: '3',
        category: 'tone',
        severity: 'low',
        matchedText: 'gonna',
        explanation: '',
        suggestion: 'Use "going to" instead',
        startIndex: 37,
        endIndex: 42,
      },
      {
        id: '4',
        category: 'missing_term',
        severity: 'medium',
        matchedText: '© 2026 NovaTech Inc.',
        explanation: '',
        suggestion: 'Add copyright notice',
      },
    ];

    const corrected = produceCorrectedContent(original, issues, profile);

    expect(corrected).toContain('NovaTech offers');
    expect(corrected).toContain('cost-effective software');
    expect(corrected).toContain('going to fail');
    expect(corrected).toContain('© 2026 NovaTech Inc.');
  });
});
