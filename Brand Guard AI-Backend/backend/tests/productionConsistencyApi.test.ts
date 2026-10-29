import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Round 3 Production Consistency Backend API Regressions', () => {
  it('GET /api/brands returns NovaTech with active approved facts in production format', async () => {
    const res = await request(app).get('/api/brands');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const novaTech = res.body.data.find((b: { id: string }) => b.id === 'demo-brand');
    expect(novaTech).toBeDefined();
    expect(Array.isArray(novaTech.approvedFacts)).toBe(true);
    expect(novaTech.approvedFacts.length).toBeGreaterThanOrEqual(15);
  });

  it('POST /api/analyze supports NovaTech SLA claim using approved brand facts', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        brandId: 'demo-brand',
        companyName: 'NovaTech',
        content: 'NovaTech provides 99.99% availability under our Enterprise SLA.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.claimVerificationSummary?.supportedClaimsCount).toBe(1);
    expect(res.body.claimVerificationSummary?.requiresReviewCount).toBe(0);
    expect(res.body.supportedClaims).toBeDefined();
    expect(res.body.supportedClaims[0].status).toBe('supported');

    // Claim should not be flagged as an issue
    const claimIssues = res.body.issues.filter(
      (i: { category: string }) => i.category === 'claim_verification'
    );
    expect(claimIssues.length).toBe(0);
  });

  it('POST /api/analyze preserves uppercase KFC when companyName is lowercase kfc', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'kfc',
        content: 'KFC provides delicious crispy chicken.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Casing issue should not be created for correct uppercase KFC
    const casingIssues = res.body.issues.filter(
      (i: { category: string; matchedText: string }) =>
        i.category === 'terminology' && i.matchedText === 'KFC'
    );
    expect(casingIssues.length).toBe(0);
    expect(res.body.correctedContent).toContain('KFC provides delicious crispy chicken.');
  });

  it('POST /api/analyze capitalizes lowercase kfc to canonical KFC', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'kfc',
        content: 'kfc delivers tasty meals daily.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const issue = res.body.issues.find(
      (i: { matchedText: string }) => i.matchedText === 'kfc'
    );
    expect(issue).toBeDefined();
    expect(issue.suggestion).toBe('KFC');
    expect(res.body.correctedContent).toContain('KFC delivers tasty meals daily.');
  });

  it('POST /api/analyze detects McDonald’s brand mismatch with typographic apostrophe', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        content: 'McDonald’s offers delicious classic burgers.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const mismatch = res.body.issues.find(
      (i: { category: string }) => i.category === 'brand_identity'
    );
    expect(mismatch).toBeDefined();
    expect(res.body.correctedContent).toContain("KFC's signature fried chicken");
  });

  it('POST /api/analyze isolates human review and allows safe corrections on other sentences', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        content:
          'KFC provides good bike and good services. Tesla Q3 earnings report shows $25B revenue from Cybertruck deliveries and patent 99281.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Sentence 1 should be safely auto-corrected
    expect(res.body.correctedContent).toContain('quality food and good services');

    // Sentence 2 should be marked for human review
    expect(res.body.correctedContent).toContain('[Requires Human Review');
  });

  it('POST /api/analyze flags unsupported food guarantees without marking them confirmed false', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        content: 'KFC guarantees weight loss and 100% freshness on all meals.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const claimIssues = res.body.issues.filter(
      (i: { category: string }) => i.category === 'claim_verification'
    );
    expect(claimIssues.length).toBeGreaterThan(0);
    for (const issue of claimIssues) {
      expect(issue.verificationStatus).toBe('unsupported');
      expect(issue.explanation).not.toContain('confirmed false');
    }
  });
});
