import { describe, it, expect } from 'vitest';
import {
  analyzeContentSync,
  analyzeBrandCompliance,
  produceCorrectedContent,
} from '../src/index.js';
import { getCanonicalBrandName } from '../src/engine/genericBrandChecker.js';
import { normalizeApostrophes } from '../src/engine/brandMismatchChecker.js';

describe('Round 3 Production Consistency Regressions', () => {
  // --------------------------------------------------------------------------
  // Fix 1: NovaTech Approved Facts Verification
  // --------------------------------------------------------------------------
  describe('Fix 1: NovaTech Approved Facts and Claim Verification', () => {
    it('verifies SLA availability claims against approved brand facts without false alarms', () => {
      const result = analyzeContentSync(
        'NovaTech provides 99.99% availability under our Enterprise SLA.',
        {
          id: 'demo-brand',
          name: 'NovaTech',
          companyName: 'NovaTech',
          guidelines: {
            claimVerification: [
              {
                claimPattern: 'guarantee(s|d)?',
                severity: 'high',
                explanation: 'Guarantees require explicit legal team approval and SLA references.',
                suggestion: 'commit to high availability under our standard SLA',
              },
            ],
          },
          approvedFacts: [
            'NovaTech provides 99.99% availability under our Enterprise SLA.',
            'NovaTech Cloud Platform is ISO/IEC 27001 certified for cloud security.',
          ],
        }
      );

      expect(result.success).toBe(true);
      expect(result.claimVerificationSummary?.supportedClaimsCount).toBe(1);
      expect(result.supportedClaims).toBeDefined();
      expect(result.supportedClaims?.[0]?.status).toBe('supported');
      expect(result.supportedClaims?.[0]?.supportingFact).toContain('99.99% availability');
      // No claim verification issues should be flagged since the claim is supported
      const claimIssues = result.issues.filter((i) => i.category === 'claim_verification');
      expect(claimIssues.length).toBe(0);
    });

    it('distinguishes supported claims from unsupported claims absent from approved facts', () => {
      const result = analyzeContentSync(
        'NovaTech guarantees 99.99999% uptime anywhere on earth without SLA bounds.',
        {
          id: 'demo-brand',
          name: 'NovaTech',
          companyName: 'NovaTech',
          guidelines: {
            claimVerification: [
              {
                claimPattern: 'guarantee(s|d)?',
                severity: 'high',
                explanation: 'Guarantees require explicit legal team approval and SLA references.',
                suggestion: 'commit to high availability under our standard SLA',
              },
            ],
          },
          approvedFacts: [
            'NovaTech provides 99.99% availability under our Enterprise SLA.',
          ],
        }
      );

      expect(result.success).toBe(true);
      // The 99.99999% claim is absent from approved facts and should not be marked supported
      const unverified = result.issues.filter((i) => i.category === 'claim_verification');
      expect(unverified.length).toBeGreaterThan(0);
      expect(unverified[0].verificationStatus).toBe('unsupported');
      // Evidence explanation must state claim is unsupported/requires verification, NOT confirmed false
      expect(unverified[0].explanation).not.toContain('confirmed false');
      expect(unverified[0].explanation).not.toContain('is a lie');
    });
  });

  // --------------------------------------------------------------------------
  // Fix 2: Automatic Correction and Human-Review Isolation
  // --------------------------------------------------------------------------
  describe('Fix 2: Human Review Isolation and Safe Correction Preservation', () => {
    it('preserves safe auto-corrections when content also contains an issue requiring human review', () => {
      const content =
        'KFC provides good bike and good services. Tesla Q3 earnings report shows $25B revenue from Cybertruck deliveries and patent 99281.';

      const result = analyzeBrandCompliance({
        content,
        companyName: 'KFC',
      });

      expect(result.success).toBe(true);
      expect(result.issues.length).toBeGreaterThanOrEqual(2);

      // Verify that the safe correction for KFC was applied
      expect(result.correctedContent).toContain('quality food and good services');

      // Verify that the competitor proprietary section is marked for human review
      expect(result.correctedContent).toContain('[Requires Human Review');
    });

    it('returns the global human review notice when the entire content requires human review', () => {
      const content =
        'Tesla Q3 earnings report shows $25B revenue from Cybertruck deliveries and patent 99281.';

      const result = analyzeBrandCompliance({
        content,
        companyName: 'Tata Motors',
      });

      expect(result.requiresHumanReview).toBe(true);
      expect(result.correctedContent).toBe(
        '[Requires Human Review] Content references competitor brand information that cannot be safely auto-corrected. Manual editorial review required.'
      );
    });

    it('does not invent replacement text for unsupported claims', () => {
      const issues = [
        {
          id: 'claim_1',
          category: 'claim_verification' as const,
          severity: 'high' as const,
          verificationStatus: 'unsupported' as const,
          matchedText: '99.999% uptime anywhere on earth',
          explanation: 'Claim requires empirical verification against approved facts.',
          suggestion: 'Provide verified SLA documentation',
          startIndex: 0,
          endIndex: 32,
        },
      ];

      const corrected = produceCorrectedContent('99.999% uptime anywhere on earth', issues);
      // Content should remain un-fabricated rather than having fake SLA text invented
      expect(corrected).toBe('99.999% uptime anywhere on earth');
    });
  });

  // --------------------------------------------------------------------------
  // Fix 3: Brand Mismatch Apostrophe Normalization
  // --------------------------------------------------------------------------
  describe('Fix 3: Straight and Typographic Apostrophe Normalization', () => {
    it('normalizes curly apostrophes to straight apostrophes', () => {
      expect(normalizeApostrophes("McDonald’s")).toBe("McDonald's");
      expect(normalizeApostrophes("Domino’s Pizza")).toBe("Domino's Pizza");
      expect(normalizeApostrophes("‘Nova’")).toBe("'Nova'");
    });

    it('detects brand mismatch for McDonald’s with typographic apostrophe when brand is KFC', () => {
      const result = analyzeBrandCompliance({
        content: 'McDonald’s offers classic burgers and milkshakes.',
        companyName: 'KFC',
      });

      const mismatch = result.issues.find((i) => i.category === 'brand_identity');
      expect(mismatch).toBeDefined();
      expect(mismatch?.matchedText).toMatch(/McDonald[’']s/);
      expect(result.correctedContent).toContain("KFC's signature fried chicken");
    });

    it('detects brand mismatch for McDonald\'s with straight apostrophe when brand is KFC', () => {
      const result = analyzeBrandCompliance({
        content: "McDonald's offers classic burgers and milkshakes.",
        companyName: 'KFC',
      });

      const mismatch = result.issues.find((i) => i.category === 'brand_identity');
      expect(mismatch).toBeDefined();
      expect(mismatch?.matchedText).toBe("McDonald's");
      expect(result.correctedContent).toContain("KFC's signature fried chicken");
    });

    it('detects brand mismatch when KFC copy is used for McDonald’s (typographic) as target company', () => {
      const result = analyzeBrandCompliance({
        content: 'KFC offers fried chicken and sides.',
        companyName: 'McDonald’s',
      });

      const mismatch = result.issues.find((i) => i.category === 'brand_identity');
      expect(mismatch).toBeDefined();
      expect(mismatch?.matchedText).toBe('KFC');
      expect(result.correctedContent).toContain("McDonald's classic menu favorites");
    });
  });

  // --------------------------------------------------------------------------
  // Fix 4: Canonical Brand Capitalization
  // --------------------------------------------------------------------------
  describe('Fix 4: Canonical Brand Capitalization', () => {
    it('resolves canonical casing for known registered brands', () => {
      expect(getCanonicalBrandName('kfc')).toBe('KFC');
      expect(getCanonicalBrandName('KFC')).toBe('KFC');
      expect(getCanonicalBrandName('mcdonalds')).toBe("McDonald's");
      expect(getCanonicalBrandName("mcdonald's")).toBe("McDonald's");
      expect(getCanonicalBrandName('McDonald’s')).toBe("McDonald's");
      expect(getCanonicalBrandName('novatech')).toBe('NovaTech');
      expect(getCanonicalBrandName('samsung')).toBe('Samsung');
    });

    it('preserves user casing for unknown brands', () => {
      expect(getCanonicalBrandName('AcmeCorp')).toBe('AcmeCorp');
      expect(getCanonicalBrandName('techStart')).toBe('techStart');
    });

    it('does not rewrite correct uppercase KFC when user inputs companyName as lowercase kfc', () => {
      const result = analyzeBrandCompliance({
        content: 'KFC provides delicious crispy chicken.',
        companyName: 'kfc',
      });

      // Uppercase KFC must NOT be flagged as an issue
      const terminologyIssues = result.issues.filter(
        (i) => i.category === 'terminology' && i.matchedText === 'KFC'
      );
      expect(terminologyIssues.length).toBe(0);
      expect(result.correctedContent).toContain('KFC provides delicious crispy chicken.');
    });

    it('corrects lowercase kfc to uppercase KFC when analyzing marketing copy', () => {
      const result = analyzeBrandCompliance({
        content: 'kfc provides delicious crispy chicken.',
        companyName: 'kfc',
      });

      const terminologyIssue = result.issues.find((i) => i.matchedText === 'kfc');
      expect(terminologyIssue).toBeDefined();
      expect(terminologyIssue?.suggestion).toBe('KFC');
      expect(result.correctedContent).toContain('KFC provides delicious crispy chicken.');
    });
  });

  // --------------------------------------------------------------------------
  // Fix 5: Food Industry Claim Detection
  // --------------------------------------------------------------------------
  describe('Fix 5: Food Industry Claim Verification and Risk Indicators', () => {
    it('flags unverified weight loss claims in food context without labelling them confirmed false', () => {
      const result = analyzeBrandCompliance({
        content: 'Our original recipe guarantees weight loss within 10 days.',
        companyName: 'KFC',
      });

      const claimIssue = result.issues.find(
        (i) => i.category === 'claim_verification' && i.matchedText.includes('weight loss')
      );
      expect(claimIssue).toBeDefined();
      expect(claimIssue?.verificationStatus).toBe('unsupported');
      expect(claimIssue?.explanation).toContain('Weight loss claims require empirical substantiation');
      expect(claimIssue?.explanation).not.toContain('confirmed false');
    });

    it('flags absolute freshness guarantees in food context as claim_verification', () => {
      const result = analyzeBrandCompliance({
        content: 'KFC guarantees 100% freshness on all meals.',
        companyName: 'KFC',
      });

      const freshnessIssue = result.issues.find(
        (i) => i.category === 'claim_verification' && i.matchedText.includes('freshness')
      );
      expect(freshnessIssue).toBeDefined();
      expect(freshnessIssue?.severity).toBe('medium');
      expect(freshnessIssue?.explanation).toContain('Absolute freshness claims require verification');
    });

    it('detects unverified 100% guarantees in marketing content', () => {
      const result = analyzeBrandCompliance({
        content: 'We guarantee 100% satisfaction on all catering orders.',
        companyName: 'KFC',
      });

      const guaranteeIssue = result.issues.find(
        (i) => i.category === 'claim_verification' && i.matchedText.includes('100%')
      );
      expect(guaranteeIssue).toBeDefined();
      expect(guaranteeIssue?.verificationStatus).toBe('unsupported');
    });
  });
});
