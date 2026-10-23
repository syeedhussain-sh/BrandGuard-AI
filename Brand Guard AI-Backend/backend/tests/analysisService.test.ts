import { describe, it, expect } from 'vitest';
import { analyzeContent } from '../src/services/analysisService';
import { BrandProfile } from '../src/types';

describe('Analysis Service Unit Tests', () => {
  const mockBrand: BrandProfile = {
    id: 'test-brand',
    name: 'Acme Corp',
    tone: ['authoritative'],
    guidelines: {
      terminology: [
        {
          preferred: 'Acme Ultra System',
          discouraged: ['Acme Basic', 'Old System'],
          explanation: 'Refer only to current product version.'
        }
      ],
      restrictedPhrases: [
        {
          phrase: 'never fails',
          severity: 'high',
          explanation: 'Overpromising reliability.',
          suggestion: 'designed for 99.99% uptime'
        }
      ],
      toneRules: [
        {
          bannedWordOrStyle: 'obviously',
          suggestion: 'clearly',
          explanation: 'Avoid patronizing language.'
        }
      ],
      claimVerification: [
        {
          claimPattern: 'guarantee',
          severity: 'high',
          explanation: 'Claims of absolute guarantee are prohibited.',
          suggestion: 'strive to deliver'
        }
      ],
      requiredTerms: [
        {
          term: 'Acme',
          severity: 'medium',
          explanation: 'Must include company name.'
        }
      ]
    }
  };

  it('should detect terminology violations and generate corrected content', async () => {
    const text = 'You should use Acme Basic because it never fails.';
    const res = await analyzeContent(text, mockBrand);

    expect(res.success).toBe(true);
    expect(res.issues.length).toBeGreaterThanOrEqual(2);

    const termIssue = res.issues.find((i) => i.category === 'terminology');
    expect(termIssue).toBeDefined();
    expect(termIssue?.matchedText).toBe('Acme Basic');
    expect(termIssue?.suggestion).toBe('Acme Ultra System');

    const phraseIssue = res.issues.find((i) => i.category === 'restricted_phrase');
    expect(phraseIssue).toBeDefined();
    expect(phraseIssue?.matchedText).toBe('never fails');
    expect(phraseIssue?.suggestion).toBe('designed for 99.99% uptime');

    expect(res.correctedContent).toContain('Acme Ultra System');
    expect(res.correctedContent).toContain('designed for 99.99% uptime');
  });

  it('should flag missing required terms when not present in text', async () => {
    const text = 'Our cloud service is fast and secure.';
    const res = await analyzeContent(text, mockBrand);

    const missingIssue = res.issues.find((i) => i.category === 'missing_term');
    expect(missingIssue).toBeDefined();
    expect(missingIssue?.matchedText).toContain('Acme');
  });

  it('should flag claims matching regex patterns', async () => {
    const text = 'Acme will guarantee seamless deployment.';
    const res = await analyzeContent(text, mockBrand);

    const claimIssue = res.issues.find((i) => i.category === 'claim_verification');
    expect(claimIssue).toBeDefined();
    expect(claimIssue?.matchedText).toBe('guarantee');
  });
});
