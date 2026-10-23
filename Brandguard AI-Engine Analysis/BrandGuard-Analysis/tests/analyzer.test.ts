import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeBrandCompliance,
  DEMO_NOVATECH_PROFILE,
  BrandProfile,
  resetIssueCounter,
} from '../src/index.js';

describe('Brand Compliance Analysis Engine', () => {
  beforeEach(() => {
    resetIssueCounter();
  });

  describe('Shared Contract & Structure', () => {
    it('returns response adhering strictly to the shared contract schema', () => {
      const result = analyzeBrandCompliance(
        'Nova Tech guarantees 100% customer satisfaction.',
        DEMO_NOVATECH_PROFILE
      );

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('analysisId');
      expect(typeof result.analysisId).toBe('string');
      expect(result).toHaveProperty('analysisMode', 'rules');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('totalIssues');
      expect(result.summary).toHaveProperty('high');
      expect(result.summary).toHaveProperty('medium');
      expect(result.summary).toHaveProperty('low');
      expect(Array.isArray(result.issues)).toBe(true);
      expect(typeof result.correctedContent).toBe('string');

      for (const issue of result.issues) {
        expect(issue).toHaveProperty('id');
        expect(issue).toHaveProperty('category');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('matchedText');
        expect(issue).toHaveProperty('explanation');
        expect(issue).toHaveProperty('suggestion');
        expect(['high', 'medium', 'low']).toContain(issue.severity);
        expect([
          'terminology',
          'restricted_phrase',
          'missing_term',
          'tone',
          'claim_verification',
        ]).toContain(issue.category);
      }
    });

    it('accepts shared input object format with brandId and content', () => {
      const input = {
        brandId: 'demo-brand',
        content: 'Nova Tech provides enterprise solutions. All rights reserved',
      };

      const result = analyzeBrandCompliance(input, DEMO_NOVATECH_PROFILE);
      expect(result.success).toBe(true);
      // "Nova Tech" should be flagged as terminology
      const brandIssue = result.issues.find((i) => i.category === 'terminology');
      expect(brandIssue).toBeDefined();
      expect(brandIssue?.matchedText).toBe('Nova Tech');
    });
  });

  describe('Feature 1: Brand Name Spelling & Preferred Terminology', () => {
    it('flags misspelled brand name and suggests approved brand name', () => {
      const content = 'Welcome to Nova Tech, the future of cloud computing. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const brandIssue = result.issues.find(
        (i) => i.category === 'terminology' && i.matchedText === 'Nova Tech'
      );
      expect(brandIssue).toBeDefined();
      expect(brandIssue?.severity).toBe('high');
      expect(brandIssue?.suggestion).toContain('NovaTech');
    });

    it('flags unapproved casing (e.g. novatech instead of NovaTech)', () => {
      const content = 'Choose novatech for all your database needs. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const issue = result.issues.find(
        (i) => i.category === 'terminology' && i.matchedText.toLowerCase() === 'novatech'
      );
      expect(issue).toBeDefined();
      expect(issue?.severity).toBe('high');
    });

    it('flags non-preferred terminology according to brand profile', () => {
      const content =
        'NovaTech powers your e-commerce operations. Drop us a line anytime. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const ecomIssue = result.issues.find((i) => i.matchedText.toLowerCase() === 'e-commerce');
      expect(ecomIssue).toBeDefined();
      expect(ecomIssue?.suggestion).toContain('ecommerce');

      const contactIssue = result.issues.find(
        (i) => i.matchedText.toLowerCase() === 'drop us a line'
      );
      expect(contactIssue).toBeDefined();
      expect(contactIssue?.suggestion).toContain('contact our team');
    });
  });

  describe('Feature 2: Restricted Phrases', () => {
    it('detects restricted phrases and assigns high severity by default', () => {
      const content =
        'NovaTech offers cheap software for small businesses. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const restricted = result.issues.find((i) => i.category === 'restricted_phrase');
      expect(restricted).toBeDefined();
      expect(restricted?.matchedText.toLowerCase()).toBe('cheap software');
      expect(restricted?.severity).toBe('high');
      expect(restricted?.explanation).toContain('premium value');
    });

    it('handles simple string restricted phrases', () => {
      const content = 'NovaTech is a miracle solution that cannot fail. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const miracle = result.issues.find((i) => i.matchedText.toLowerCase() === 'miracle solution');
      const fail = result.issues.find((i) => i.matchedText.toLowerCase() === 'cannot fail');

      expect(miracle).toBeDefined();
      expect(fail).toBeDefined();
    });
  });

  describe('Feature 3: Missing Required Terms', () => {
    it('flags when required legal disclaimer or trademark is missing', () => {
      const content = 'NovaTech delivers reliable enterprise performance.';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const missing = result.issues.find((i) => i.category === 'missing_term');
      expect(missing).toBeDefined();
      expect(missing?.matchedText).toBe('All rights reserved');
    });

    it('does not flag missing terms when present in content', () => {
      const content = 'NovaTech delivers reliable enterprise performance. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const missing = result.issues.find((i) => i.category === 'missing_term');
      expect(missing).toBeUndefined();
    });
  });

  describe('Feature 4: Tone Guidelines', () => {
    it('flags informal slang words in professional copy', () => {
      const content =
        'NovaTech is gonna deliver high performance. Wanna see more? All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const gonna = result.issues.find((i) => i.matchedText.toLowerCase() === 'gonna');
      const wanna = result.issues.find((i) => i.matchedText.toLowerCase() === 'wanna');

      expect(gonna).toBeDefined();
      expect(gonna?.category).toBe('tone');
      expect(gonna?.suggestion).toContain('going to');

      expect(wanna).toBeDefined();
      expect(wanna?.category).toBe('tone');
      expect(wanna?.suggestion).toContain('want to');
    });

    it('flags aggressive punctuation like repeated exclamation marks', () => {
      const content = 'NovaTech offers fast deployments!!! All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const punct = result.issues.find((i) => i.category === 'tone' && i.matchedText === '!!!');
      expect(punct).toBeDefined();
      expect(punct?.suggestion).toContain('single');
    });

    it('flags tone-disallowed words defined in the profile', () => {
      const content = 'Avoid crappy alternatives and choose NovaTech. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const disallowed = result.issues.find(
        (i) => i.category === 'tone' && i.matchedText.toLowerCase() === 'crappy'
      );
      expect(disallowed).toBeDefined();
    });
  });

  describe('Feature 5: Claim Verification Rule', () => {
    it('marks unverified superlative claims as requiring verification, not false', () => {
      const content =
        'NovaTech guarantees 100% customer satisfaction and is the best in the market. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const claims = result.issues.filter((i) => i.category === 'claim_verification');
      expect(claims.length).toBeGreaterThanOrEqual(1);

      for (const claim of claims) {
        expect(claim.severity).toBe('medium');
        expect(claim.explanation).toMatch(/requires.*verification|substantiation/i);
        expect(claim.explanation).not.toMatch(/false/i);
      }
    });

    it('does not flag claims that are substantiated by approved facts', () => {
      const profileWithFact: BrandProfile = {
        ...DEMO_NOVATECH_PROFILE,
        approvedFacts: [
          'NovaTech guarantees 100% customer satisfaction in independent 2025 benchmark',
        ],
      };

      const content =
        'NovaTech guarantees 100% customer satisfaction. All rights reserved';
      const result = analyzeBrandCompliance(content, profileWithFact);

      const claimIssue = result.issues.find((i) => i.category === 'claim_verification');
      expect(claimIssue).toBeUndefined();
    });

    it('flags global pricing claim like cheapest in the world without facts', () => {
      const content =
        'NovaTech offers the cheapest in the world cloud servers. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      const claim = result.issues.find(
        (i) => i.category === 'claim_verification' && i.matchedText.includes('cheapest in the world')
      );
      expect(claim).toBeDefined();
    });
  });

  describe('Feature 6: Corrected Content Generation', () => {
    it('produces corrected content addressing brand name and missing terms', () => {
      const content = 'Nova Tech is a modern cloud platform.';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      expect(result.correctedContent).toContain('NovaTech');
      expect(result.correctedContent).not.toContain('Nova Tech');
      // Should append missing required term
      expect(result.correctedContent).toContain('All rights reserved');
    });

    it('replaces informal slang and normalizes aggressive punctuation', () => {
      const content = 'NovaTech is gonna help you deploy!!! All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      expect(result.correctedContent).toContain('going to');
      expect(result.correctedContent).not.toContain('gonna');
      expect(result.correctedContent).not.toContain('!!!');
    });
  });

  describe('Feature 7: Compliant Content', () => {
    it('returns 0 issues for fully compliant content', () => {
      const content =
        'NovaTech provides reliable ecommerce cloud hosting for enterprise organizations. All rights reserved';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      expect(result.success).toBe(true);
      expect(result.summary.totalIssues).toBe(0);
      expect(result.summary.high).toBe(0);
      expect(result.summary.medium).toBe(0);
      expect(result.summary.low).toBe(0);
      expect(result.issues.length).toBe(0);
    });
  });

  describe('Feature 8: Edge Cases & Robustness', () => {
    it('handles empty string safely without errors', () => {
      const result = analyzeBrandCompliance('', DEMO_NOVATECH_PROFILE);
      expect(result.success).toBe(true);
      expect(result.summary.totalIssues).toBe(0);
      expect(result.issues).toEqual([]);
      expect(result.correctedContent).toBe('');
    });

    it('handles whitespace-only text safely', () => {
      const result = analyzeBrandCompliance('    \n\t   ', DEMO_NOVATECH_PROFILE);
      expect(result.success).toBe(true);
      expect(result.summary.totalIssues).toBe(0);
    });

    it('handles null / undefined / empty brand profile safely', () => {
      const result1 = analyzeBrandCompliance('Some text here.', undefined as unknown as BrandProfile);
      expect(result1.success).toBe(true);
      expect(result1.summary).toBeDefined();

      const result2 = analyzeBrandCompliance('Some text here.', {} as BrandProfile);
      expect(result2.success).toBe(true);
    });

    it('avoids duplicate issues for the exact same occurrence', () => {
      const content = 'Nova Tech guarantees 100% customer satisfaction.';
      const result = analyzeBrandCompliance(content, DEMO_NOVATECH_PROFILE);

      // Verify no duplicate IDs and no identical startIndex/endIndex
      const ids = result.issues.map((i) => i.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);

      const positions = result.issues
        .filter((i) => i.startIndex !== undefined)
        .map((i) => `${i.startIndex}-${i.endIndex}`);
      const uniquePositions = new Set(positions);
      expect(positions.length).toBe(uniquePositions.size);
    });

    it('works with custom arbitrary brand profiles', () => {
      const customProfile: BrandProfile = {
        brandName: 'FinSecure',
        brandVariations: ['Fin Secure', 'finsecure'],
        preferredTerminology: {
          'crypto coin': 'digital asset',
        },
        restrictedPhrases: ['guaranteed 10x returns'],
        requiredTerms: ['Member FDIC'],
        toneGuidelines: 'formal',
      };

      const content =
        'Fin Secure lets you buy crypto coin with guaranteed 10x returns gonna make you rich.';
      const result = analyzeBrandCompliance(content, customProfile);

      expect(result.success).toBe(true);
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(4);

      const categories = result.issues.map((i) => i.category);
      expect(categories).toContain('terminology');
      expect(categories).toContain('restricted_phrase');
      expect(categories).toContain('missing_term');
      expect(categories).toContain('tone');
    });
  });
});
