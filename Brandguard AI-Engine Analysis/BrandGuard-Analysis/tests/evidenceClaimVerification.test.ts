import { describe, it, expect } from 'vitest';
import { analyzeBrandCompliance } from '../src/analyzer.js';
import { verifyContentClaims, findSubstantiatingFact } from '../src/engine/claimsChecker.js';
import { BrandProfile } from '../src/types.js';

const NOVATECH_TEST_PROFILE: BrandProfile = {
  id: 'demo-brand',
  name: 'NovaTech',
  companyName: 'NovaTech',
  industry: 'Software & Technology',
  tone: ['professional', 'innovative'],
  guidelines: {
    terminology: [
      {
        preferred: 'NovaTech Cloud Platform',
        discouraged: ['Nova Cloud', 'NovaTech CP'],
        explanation: 'Always refer to our core offering by its complete official brand name.',
      },
    ],
    restrictedPhrases: [],
    requiredTerms: [],
    claimVerification: [
      {
        claimPattern: 'guarantee(s|d)?',
        severity: 'high',
        explanation: 'Guarantees require explicit legal team approval and SLA references.',
        suggestion: 'commit to high availability under our standard SLA',
      },
    ],
    toneRules: [],
  },
  approvedFacts: [
    'NovaTech provides 99.99% availability under our Enterprise SLA.',
    'NovaTech Cloud Platform is ISO/IEC 27001 certified for cloud security.',
    'NovaTech was ranked #1 in customer satisfaction by TechReview 2024',
  ],
};

describe('Improvement 2: Evidence-Based Claim Verification Engine Tests', () => {
  // =========================================================================
  // Scenario 1: Approved Fact Substantiation
  // =========================================================================
  describe('Scenario 1: Approved Fact Substantiation', () => {
    it('substantiates claims supported by approved brand facts without flagging errors', () => {
      const content = 'NovaTech delivers 99.99% availability under our Enterprise SLA.';
      const result = analyzeBrandCompliance(content, NOVATECH_TEST_PROFILE);

      // Verify claim is identified as supported
      expect(result.supportedClaims).toBeDefined();
      expect(result.supportedClaims!.length).toBeGreaterThanOrEqual(1);

      const supported = result.supportedClaims![0];
      expect(supported.status).toBe('supported');
      expect(supported.supportingFact).toBe('NovaTech provides 99.99% availability under our Enterprise SLA.');
      expect(supported.evidenceCitation).toContain('Approved Brand Fact');
      expect(supported.explanation).toContain('substantiated by approved brand evidence');

      // Verify claim is NOT flagged as an error
      const claimIssues = result.issues.filter((i) => i.category === 'claim_verification');
      expect(claimIssues.length).toBe(0);

      // Verify no unnecessary correction was generated
      expect(result.correctedContent).toBe(content);

      // Verify claim verification summary
      expect(result.claimVerificationSummary).toBeDefined();
      expect(result.claimVerificationSummary!.supportedClaimsCount).toBeGreaterThanOrEqual(1);
      expect(result.claimVerificationSummary!.unsupportedClaimsCount).toBe(0);
    });

    it('findSubstantiatingFact directly matches substantive keywords', () => {
      const match = findSubstantiatingFact(
        '99.99% availability under our Enterprise SLA',
        NOVATECH_TEST_PROFILE.approvedFacts!,
        'NovaTech delivers 99.99% availability under our Enterprise SLA.'
      );

      expect(match).not.toBeNull();
      expect(match!.fact).toBe('NovaTech provides 99.99% availability under our Enterprise SLA.');
    });
  });

  // =========================================================================
  // Scenario 2: Unsupported Absolute Claims
  // =========================================================================
  describe('Scenario 2: Unsupported Absolute Claims', () => {
    it('flags unevidenced absolute guarantees with high severity and qualified corrections', () => {
      const content = 'Our system guarantees 100% bug-free operation with zero risk.';
      const result = analyzeBrandCompliance(content, NOVATECH_TEST_PROFILE);

      expect(result.issues.length).toBeGreaterThanOrEqual(1);

      // Verify high severity
      const highSeverityIssues = result.issues.filter((i) => i.severity === 'high');
      expect(highSeverityIssues.length).toBeGreaterThanOrEqual(1);

      // Verify unsupported verification status
      const unsupportedIssues = result.issues.filter((i) => i.verificationStatus === 'unsupported');
      expect(unsupportedIssues.length).toBeGreaterThanOrEqual(1);

      // Verify explanation states why substantiation is required
      for (const issue of unsupportedIssues) {
        expect(issue.explanation).toMatch(/cannot be verified|operational risk|substantiation|legal team approval|SLA references/i);
      }

      // Verify suggestions provide qualified language without inventing facts
      expect(result.correctedContent).not.toContain('100% bug-free');
      expect(result.correctedContent).not.toContain('zero risk');
      expect(result.correctedContent).toMatch(/high reliability|resilience|minimized operational risk/i);

      // Verify summary stats
      expect(result.claimVerificationSummary).toBeDefined();
      expect(result.claimVerificationSummary!.unsupportedClaimsCount).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Scenario 3: Quantitative Claims Requiring Review
  // =========================================================================
  describe('Scenario 3: Quantitative Claims Requiring Review', () => {
    it('flags unapproved quantitative performance claims as requiring human review', () => {
      const content = 'Reduces infrastructure overhead by 40% across all deployments.';
      const result = analyzeBrandCompliance(content, NOVATECH_TEST_PROFILE);

      // Verify identification of quantitative claim
      const quantIssue = result.issues.find(
        (i) => i.matchedText.includes('40%') || i.explanation.includes('40%')
      );
      expect(quantIssue).toBeDefined();

      // Verify requiresHumanReview and verificationStatus
      expect(quantIssue!.requiresHumanReview).toBe(true);
      expect(quantIssue!.verificationStatus).toBe('requires_review');
      expect(quantIssue!.severity).toBe('medium');

      // Verify explanation requires audited benchmarks
      expect(quantIssue!.explanation).toMatch(/audited benchmarks|supporting evidence|case studies/i);

      // Verify root-level requiresHumanReview is true
      expect(result.requiresHumanReview).toBe(true);

      // Verify claim was NOT marked as verified or supported
      expect(result.supportedClaims || []).toHaveLength(0);

      // Verify claim verification summary
      expect(result.claimVerificationSummary).toBeDefined();
      expect(result.claimVerificationSummary!.requiresReviewCount).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Scenario 4: Preserve Mode B for Generic Companies (e.g. Tata Motors)
  // =========================================================================
  describe('Scenario 4: Preserve Mode B for Generic Companies', () => {
    it('applies automotive-specific claim rules in Mode B without configured profile and qualifies ratings', () => {
      const content = 'Our electric SUV is 100% crash-proof and never needs maintenance.';
      const result = analyzeBrandCompliance({
        content,
        companyName: 'Tata Motors',
        industry: 'Automotive',
      });

      // Verify Mode B governance mode
      expect(result.governanceMode).toBe('generic');
      expect(result.officialGuidelinesConfigured).toBe(false);

      // Verify absolute safety guarantee flagged
      const crashProofIssue = result.issues.find((i) => i.matchedText.includes('100% crash-proof'));
      expect(crashProofIssue).toBeDefined();
      expect(crashProofIssue!.severity).toBe('high');
      expect(crashProofIssue!.category).toBe('claim_verification');
      expect(crashProofIssue!.verificationStatus).toBe('unsupported');

      // Verify maintenance guarantee flagged
      const maintenanceIssue = result.issues.find((i) => i.matchedText.includes('never needs maintenance'));
      expect(maintenanceIssue).toBeDefined();
      expect(maintenanceIssue!.severity).toBe('high');

      // Verify correction does NOT invent a specific 5-star rating, recommends verified crash-safety ratings
      expect(result.correctedContent).toContain('engineered with verified crash-safety ratings');
      expect(result.correctedContent).not.toContain('5-star crash safety');
      expect(result.correctedContent).toContain('extended maintenance intervals');
    });
  });
});
