import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Improvement 2: Evidence-Based Claim Verification Backend API Tests', () => {
  // =========================================================================
  // Scenario 1: Approved Fact Substantiation
  // =========================================================================
  describe('Scenario 1: Approved Fact Substantiation via API', () => {
    it('returns supported status and attaches approved fact reference without flagging errors', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          brandId: 'demo-brand',
          companyName: 'NovaTech',
          content: 'NovaTech delivers 99.99% availability under our Enterprise SLA.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify supportedClaims attached
      expect(res.body.supportedClaims).toBeDefined();
      expect(res.body.supportedClaims.length).toBeGreaterThanOrEqual(1);

      const supported = res.body.supportedClaims[0];
      expect(supported.status).toBe('supported');
      expect(supported.supportingFact).toBe('NovaTech provides 99.99% availability under our Enterprise SLA.');
      expect(supported.evidenceCitation).toContain('Approved Brand Fact');

      // Verify no claim_verification error in issues
      const claimIssues = res.body.issues.filter((i: any) => i.category === 'claim_verification');
      expect(claimIssues.length).toBe(0);

      // Verify no unnecessary text replacement in corrected content
      expect(res.body.correctedContent).toBe('NovaTech delivers 99.99% availability under our Enterprise SLA.');

      // Verify claim verification summary
      expect(res.body.claimVerificationSummary).toBeDefined();
      expect(res.body.claimVerificationSummary.supportedClaimsCount).toBeGreaterThanOrEqual(1);
      expect(res.body.claimVerificationSummary.unsupportedClaimsCount).toBe(0);
    });
  });

  // =========================================================================
  // Scenario 2: Unsupported Absolute Claims
  // =========================================================================
  describe('Scenario 2: Unsupported Absolute Claims via API', () => {
    it('flags unevidenced absolute guarantees with high severity and qualified corrections', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          brandId: 'demo-brand',
          companyName: 'NovaTech',
          content: 'Our system guarantees 100% bug-free operation with zero risk.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify high severity
      const highIssues = res.body.issues.filter((i: any) => i.severity === 'high');
      expect(highIssues.length).toBeGreaterThanOrEqual(1);

      // Verify unsupported verificationStatus
      const unsupportedIssues = res.body.issues.filter((i: any) => i.verificationStatus === 'unsupported');
      expect(unsupportedIssues.length).toBeGreaterThanOrEqual(1);

      // Verify explanation states why guarantee requires substantiation
      for (const issue of unsupportedIssues) {
        expect(issue.explanation).toMatch(/cannot be verified|operational risk|substantiation|compliance|legal team/i);
      }

      // Verify qualified correction without inventing facts
      expect(res.body.correctedContent).not.toContain('100% bug-free');
      expect(res.body.correctedContent).not.toContain('zero risk');
      expect(res.body.correctedContent).toMatch(/high reliability|resilience|minimized operational risk/i);

      // Verify claim verification summary
      expect(res.body.claimVerificationSummary).toBeDefined();
      expect(res.body.claimVerificationSummary.unsupportedClaimsCount).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Scenario 3: Quantitative Claims Requiring Review
  // =========================================================================
  describe('Scenario 3: Quantitative Claims Requiring Review via API', () => {
    it('identifies unapproved quantitative claims as requiring human review', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          brandId: 'demo-brand',
          companyName: 'NovaTech',
          content: 'Reduces infrastructure overhead by 40% across all deployments.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify root-level human review required
      expect(res.body.requiresHumanReview).toBe(true);

      // Verify quantitative claim issue attributes
      const quantIssue = res.body.issues.find((i: any) => i.matchedText.includes('40%'));
      expect(quantIssue).toBeDefined();
      expect(quantIssue.requiresHumanReview).toBe(true);
      expect(quantIssue.verificationStatus).toBe('requires_review');
      expect(quantIssue.severity).toBe('medium');
      expect(quantIssue.explanation).toMatch(/audited benchmarks|supporting evidence|case studies/i);

      // Verify not marked as supported
      expect(res.body.supportedClaims || []).toHaveLength(0);

      // Verify claim verification summary
      expect(res.body.claimVerificationSummary).toBeDefined();
      expect(res.body.claimVerificationSummary.requiresReviewCount).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // Scenario 4: Preserve Mode B for Generic Companies
  // =========================================================================
  describe('Scenario 4: Preserve Mode B for Generic Companies via API', () => {
    it('evaluates Tata Motors using automotive rules in Mode B without configured guidelines', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({
          companyName: 'Tata Motors',
          industry: 'Automotive',
          content: 'Our electric SUV is 100% crash-proof and never needs maintenance.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.governanceMode).toBe('generic');
      expect(res.body.officialGuidelinesConfigured).toBe(false);

      // Verify crash-proof issue
      const crashIssue = res.body.issues.find((i: any) => i.matchedText.includes('100% crash-proof'));
      expect(crashIssue).toBeDefined();
      expect(crashIssue.severity).toBe('high');
      expect(crashIssue.category).toBe('claim_verification');
      expect(crashIssue.verificationStatus).toBe('unsupported');

      // Verify maintenance issue
      const maintenanceIssue = res.body.issues.find((i: any) => i.matchedText.includes('never needs maintenance'));
      expect(maintenanceIssue).toBeDefined();
      expect(maintenanceIssue.severity).toBe('high');

      // Verify recommended correction refers to verified crash-safety ratings without inventing a specific 5-star rating
      expect(res.body.correctedContent).toContain('engineered with verified crash-safety ratings');
      expect(res.body.correctedContent).not.toContain('5-star crash safety');
      expect(res.body.correctedContent).toContain('extended maintenance intervals');
    });
  });
});
