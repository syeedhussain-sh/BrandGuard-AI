import { describe, it, expect } from 'vitest';
import {
  analyzeContent,
  analyzeContentSync,
  DEMO_BRAND_PROFILE,
  BrandProfile,
  AnalysisResponse,
} from '../src/index.js';

describe('BrandGuard AI — Official API Contract Integration Tests', () => {
  describe('Requirement 3 & 6: Function Signature & Response Structure', () => {
    it('implements and exports analyzeContent returning a Promise<AnalysisResponse>', async () => {
      const content = 'NovaTech provides cloud services.';
      const promise = analyzeContent(content, DEMO_BRAND_PROFILE);

      expect(promise).toBeInstanceOf(Promise);
      const response: AnalysisResponse = await promise;

      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('analysisId');
      expect(typeof response.analysisId).toBe('string');
      expect(response.analysisId.startsWith('anlz_')).toBe(true);
      expect(response).toHaveProperty('analysisMode', 'rules');
      expect(response).toHaveProperty('summary');
      expect(response.summary).toHaveProperty('totalIssues');
      expect(response.summary).toHaveProperty('high');
      expect(response.summary).toHaveProperty('medium');
      expect(response.summary).toHaveProperty('low');
      expect(Array.isArray(response.issues)).toBe(true);
      expect(typeof response.correctedContent).toBe('string');
    });

    it('supports pure synchronous execution via analyzeContentSync', () => {
      const response = analyzeContentSync(
        'NovaTech provides cloud services.',
        DEMO_BRAND_PROFILE
      );
      expect(response.success).toBe(true);
      expect(typeof response.correctedContent).toBe('string');
    });
  });

  describe('Contract Section 3.5.2 & 3.5.4: Official Contract Test Case', () => {
    it('accurately detects all issues and generates the exact corrected content from API_CONTRACT.md Section 3.5.4', async () => {
      const content =
        'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.';

      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      // Verify overall response structure
      expect(result.success).toBe(true);
      expect(result.analysisMode).toBe('rules');
      expect(result.summary.totalIssues).toBe(result.issues.length);
      expect(result.summary.totalIssues).toBe(
        result.summary.high + result.summary.medium + result.summary.low
      );

      // 1. Terminology Issue: "Nova Cloud"
      const novaCloudIssue = result.issues.find((i) => i.matchedText === 'Nova Cloud');
      expect(novaCloudIssue).toBeDefined();
      expect(novaCloudIssue?.category).toBe('terminology');
      expect(novaCloudIssue?.severity).toBe('high');
      expect(novaCloudIssue?.suggestion).toBe('NovaTech Cloud Platform');
      expect(novaCloudIssue?.explanation).toBe(
        'Always refer to our core offering by its complete official brand name.'
      );

      // 2. Restricted Phrase: "cheapest cloud in the market"
      const cheapestIssue = result.issues.find(
        (i) => i.matchedText === 'cheapest cloud in the market'
      );
      expect(cheapestIssue).toBeDefined();
      expect(cheapestIssue?.category).toBe('restricted_phrase');
      expect(cheapestIssue?.severity).toBe('high');
      expect(cheapestIssue?.suggestion).toBe(
        'cost-effective, high-performance cloud infrastructure'
      );
      expect(cheapestIssue?.explanation).toBe(
        'Unsubstantiated pricing superlatives are prohibited.'
      );

      // 3. Tone Issue: "obviously"
      const obviouslyIssue = result.issues.find((i) => i.matchedText === 'obviously');
      expect(obviouslyIssue).toBeDefined();
      expect(obviouslyIssue?.category).toBe('tone');
      expect(obviouslyIssue?.severity).toBe('medium');
      expect(obviouslyIssue?.suggestion).toBe('as demonstrated');
      expect(obviouslyIssue?.explanation).toBe(
        'Condescending tone undermines accessible brand voice.'
      );

      // 4. Restricted Phrase: "100% bug-free"
      const bugFreeIssue = result.issues.find((i) => i.matchedText === '100% bug-free');
      expect(bugFreeIssue).toBeDefined();
      expect(bugFreeIssue?.category).toBe('restricted_phrase');
      expect(bugFreeIssue?.severity).toBe('high');
      expect(bugFreeIssue?.suggestion).toBe('engineered for high reliability and resilience');
      expect(bugFreeIssue?.explanation).toBe(
        'Absolute reliability claims violate compliance policies.'
      );

      // 5. Claim Verification: "guarantee"
      const guaranteeIssue = result.issues.find((i) => i.matchedText.toLowerCase() === 'guarantee');
      expect(guaranteeIssue).toBeDefined();
      expect(guaranteeIssue?.category).toBe('claim_verification');
      expect(guaranteeIssue?.severity).toBe('high');
      expect(guaranteeIssue?.suggestion).toBe(
        'commit to high availability under our standard SLA'
      );

      // EXACT CORRECTED CONTENT VERIFICATION
      // Contract Section 3.5.4 specifies:
      // "Our NovaTech Cloud Platform is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA total perfection."
      const expectedCorrected =
        'Our NovaTech Cloud Platform is the cost-effective, high-performance cloud infrastructure and it is as demonstrated engineered for high reliability and resilience. We commit to high availability under our standard SLA total perfection.';

      expect(result.correctedContent).toBe(expectedCorrected);
    });
  });

  describe('Requirement 4 & 5: Individual Check Categories & Issue Fields', () => {
    it('verifies all required fields exist on every issue', async () => {
      const content =
        'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      for (const issue of result.issues) {
        expect(issue).toHaveProperty('id');
        expect(typeof issue.id).toBe('string');
        expect(issue).toHaveProperty('category');
        expect([
          'terminology',
          'restricted_phrase',
          'missing_term',
          'tone',
          'claim_verification',
        ]).toContain(issue.category);
        expect(issue).toHaveProperty('severity');
        expect(['high', 'medium', 'low']).toContain(issue.severity);
        expect(issue).toHaveProperty('matchedText');
        expect(typeof issue.matchedText).toBe('string');
        expect(issue).toHaveProperty('explanation');
        expect(typeof issue.explanation).toBe('string');
        expect(issue).toHaveProperty('suggestion');
        expect(typeof issue.suggestion).toBe('string');
      }
    });

    it('checks preferred and discouraged terminology mappings', async () => {
      const content = 'Deploy our Autonomous Intelligence Bot to your cloud.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      const botIssue = result.issues.find((i) => i.matchedText === 'Bot');
      expect(botIssue).toBeDefined();
      expect(botIssue?.category).toBe('terminology');
      expect(botIssue?.suggestion).toBe('Autonomous Intelligence');
    });

    it('checks restricted phrases with high severity', async () => {
      const content = 'Our software is 100% bug-free across all clusters.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      const issue = result.issues.find((i) => i.matchedText === '100% bug-free');
      expect(issue).toBeDefined();
      expect(issue?.category).toBe('restricted_phrase');
      expect(issue?.severity).toBe('high');
    });

    it('checks missing required terms according to context', async () => {
      const brandWithRequired: BrandProfile = {
        name: 'NovaTech',
        guidelines: {
          requiredTerms: [
            {
              term: 'NovaTech',
              severity: 'medium',
              explanation: 'Brand name must be mentioned explicitly at least once.',
            },
          ],
        },
      };

      // Content missing the brand name
      const content = 'Our cloud servers are running at 99.9% uptime.';
      const result = await analyzeContent(content, brandWithRequired);

      const missing = result.issues.find((i) => i.category === 'missing_term');
      expect(missing).toBeDefined();
      expect(missing?.matchedText).toBe('NovaTech');
      expect(missing?.severity).toBe('medium');
    });

    it('does not flag missing terms when term is present', async () => {
      const brandWithRequired: BrandProfile = {
        name: 'NovaTech',
        guidelines: {
          requiredTerms: [
            {
              term: 'NovaTech',
              severity: 'medium',
              explanation: 'Brand name must be mentioned.',
            },
          ],
        },
      };

      const content = 'NovaTech cloud servers are running at 99.9% uptime.';
      const result = await analyzeContent(content, brandWithRequired);

      const missing = result.issues.find((i) => i.category === 'missing_term');
      expect(missing).toBeUndefined();
    });

    it('checks tone violations (slang, aggressive punctuation, and tone rules)', async () => {
      const brandWithTone: BrandProfile = {
        name: 'NovaTech',
        tone: ['professional'],
        guidelines: {
          toneRules: [
            {
              bannedWordOrStyle: 'insanely quick',
              suggestion: 'rapid',
              explanation: 'Avoid hyperbolic slang.',
            },
          ],
        },
      };

      const content = 'NovaTech is gonna make your cluster insanely quick!!!';
      const result = await analyzeContent(content, brandWithTone);

      const categories = result.issues.map((i) => i.category);
      expect(categories).toContain('tone');

      const slangIssue = result.issues.find((i) => i.matchedText === 'gonna');
      expect(slangIssue).toBeDefined();

      const hyperboleIssue = result.issues.find((i) => i.matchedText === 'insanely quick');
      expect(hyperboleIssue).toBeDefined();
      expect(hyperboleIssue?.suggestion).toBe('rapid');
    });

    it('Requirement 8: Treats unsupported claims as requiring verification, not false', async () => {
      const content = 'NovaTech guarantees 100% customer satisfaction across all regions.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      const claimIssues = result.issues.filter((i) => i.category === 'claim_verification');
      expect(claimIssues.length).toBeGreaterThan(0);

      for (const claim of claimIssues) {
        expect(claim.explanation).toMatch(/requires.*verification|approval|substantiation/i);
        expect(claim.explanation.toLowerCase()).not.toContain('false');
        expect(claim.explanation.toLowerCase()).not.toContain('lie');
        expect(claim.explanation.toLowerCase()).not.toContain('incorrect fact');
      }
    });

    it('does not flag claims substantiated by approved facts', async () => {
      const brandWithFacts: BrandProfile = {
        ...DEMO_BRAND_PROFILE,
        approvedFacts: [
          'NovaTech guarantees 100% customer satisfaction based on 2026 enterprise audit',
        ],
      };

      const content =
        'NovaTech guarantees 100% customer satisfaction based on 2026 enterprise audit.';
      const result = await analyzeContent(content, brandWithFacts);

      const satisfactionClaim = result.issues.find(
        (i) => i.category === 'claim_verification' && i.matchedText.includes('100% customer satisfaction')
      );
      expect(satisfactionClaim).toBeUndefined();
    });
  });

  describe('Requirement 7 & 10: Multi-Violation Quality & Summary Count Integrity', () => {
    it('handles multiple violations in a single sentence gracefully without corrupted output', async () => {
      const content =
        'Our Nova Cloud is the cheapest cloud in the market and obviously 100% bug-free.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      // Verify summary integrity
      expect(result.summary.totalIssues).toBe(result.issues.length);
      expect(result.summary.high).toBe(result.issues.filter((i) => i.severity === 'high').length);
      expect(result.summary.medium).toBe(result.issues.filter((i) => i.severity === 'medium').length);
      expect(result.summary.low).toBe(result.issues.filter((i) => i.severity === 'low').length);

      // Verify corrected content retains valid structure
      expect(result.correctedContent).toContain('NovaTech Cloud Platform');
      expect(result.correctedContent).toContain(
        'cost-effective, high-performance cloud infrastructure'
      );
      expect(result.correctedContent).toContain('as demonstrated');
      expect(result.correctedContent).toContain('engineered for high reliability and resilience');
      expect(result.correctedContent).not.toContain('Nova Cloud');
      expect(result.correctedContent).not.toContain('100% bug-free');
    });

    it('Requirement 10: handles empty, whitespace, and null inputs safely', async () => {
      const emptyResult = await analyzeContent('', DEMO_BRAND_PROFILE);
      expect(emptyResult.success).toBe(true);
      expect(emptyResult.summary.totalIssues).toBe(0);
      expect(emptyResult.issues).toEqual([]);
      expect(emptyResult.correctedContent).toBe('');

      const whitespaceResult = await analyzeContent('   \n\t   ', DEMO_BRAND_PROFILE);
      expect(whitespaceResult.success).toBe(true);
      expect(whitespaceResult.summary.totalIssues).toBe(0);

      const emptyProfileResult = await analyzeContent('Some text.', {} as BrandProfile);
      expect(emptyProfileResult.success).toBe(true);
      expect(emptyProfileResult.summary.totalIssues).toBe(0);
    });

    it('strictly preserves original text casing and structure where no violations occur', async () => {
      const content =
        'Enterprise infrastructure with distributed consensus and low latency networks.';
      const result = await analyzeContent(content, DEMO_BRAND_PROFILE);

      expect(result.success).toBe(true);
      expect(result.summary.totalIssues).toBe(0);
      expect(result.correctedContent).toBe(content);
    });
  });
});
