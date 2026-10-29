import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Round 3 Improvement 1 Verification: Fix Stale Analysis Results', () => {
  // Scenario 1: Select KFC, enter KFC content referencing competitor, click Audit
  it('Scenario 1: Audit for KFC correctly analyzes KFC and detects competitor', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        industry: 'Food and Restaurant',
        content: "McDonald's offers burgers and milkshakes."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('KFC');
    
    // Check that competitor violation was detected for McDonald's
    const brandIdentityIssue = res.body.issues.find(
      (i: any) => i.category === 'brand_identity' || i.category === 'competitor_brand'
    );
    expect(brandIdentityIssue).toBeDefined();
    expect(brandIdentityIssue.matchedText.toLowerCase()).toContain("mcdonald's");
    expect(res.body.correctedContent.toLowerCase()).toContain('fried chicken');
  });

  // Scenario 2 & 3: Switch to Tata Motors, enter different content, click Audit once
  it('Scenario 2 & 3: Switching to Tata Motors returns Tata Motors results directly without KFC results', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Our new tata motors electric SUV is 100% crash-proof and never needs maintenance. We guarantee 100% customer satisfaction.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('Tata Motors');
    expect(res.body.companyName).not.toBe('KFC');
    
    // Verify Tata Motors automotive issues
    const crashProofIssue = res.body.issues.find((i: any) => i.matchedText.includes('100% crash-proof'));
    expect(crashProofIssue).toBeDefined();
    expect(crashProofIssue.category).toBe('claim_verification');
    expect(res.body.correctedContent).toContain('engineered with verified crash-safety ratings');
  });

  // Scenario 4: Switch back to KFC and run another audit
  it('Scenario 4: Switch back to KFC returns fresh KFC results directly', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        industry: 'Food and Restaurant',
        content: "Enjoy Burger King whopper burgers today at our store."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('KFC');
    expect(res.body.companyName).not.toBe('Tata Motors');
    
    const competitorIssue = res.body.issues.find(
      (i: any) => i.category === 'brand_identity' || i.category === 'competitor_brand'
    );
    expect(competitorIssue).toBeDefined();
    expect(competitorIssue.matchedText.toLowerCase()).toContain('burger king');
    expect(res.body.correctedContent.toLowerCase()).toContain('fried chicken');
  });

  // Scenario 5: Change content while keeping same company selected and audit again
  it('Scenario 5: Change content with same company returns fresh updated results', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        industry: 'Food and Restaurant',
        content: "Our original recipe chicken is 100% miracle detox food that cures all diseases and guarantees weight loss."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('KFC');
    
    // Check that health/detox claim issues are detected
    const detoxIssue = res.body.issues.find((i: any) => i.matchedText.toLowerCase().includes('miracle detox'));
    expect(detoxIssue).toBeDefined();
    expect(['restricted_phrase', 'claim_verification']).toContain(detoxIssue.category);
  });

  // Scenario 6: Concurrent / Rapid Consecutive Audits
  it('Scenario 6: Rapid consecutive audits resolve safely with distinct tokens and results', async () => {
    const p1 = request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Samsung',
        industry: 'Electronics',
        content: 'The new samsung phone has infinite battery life and unbreakable screen.'
      });

    const p2 = request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Nike',
        industry: 'Apparel',
        content: 'Our new nike running shoes are 100% eco-friendly on earth with cheapest prices guaranteed anywhere.'
      });

    const [res1, res2] = await Promise.all([p1, p2]);

    expect(res1.status).toBe(200);
    expect(res1.body.companyName).toBe('Samsung');
    expect(res1.body.issues.some((i: any) => i.matchedText.includes('infinite battery life'))).toBe(true);

    expect(res2.status).toBe(200);
    expect(res2.body.companyName).toBe('Nike');
    expect(res2.body.issues.some((i: any) => i.matchedText.includes('100% eco-friendly'))).toBe(true);
  });

  // Scenario 7: Audit failure handling
  it('Scenario 7: Missing content or invalid request returns clear error rather than misleading results', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        content: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toContain('must not be empty');
  });

  // Scenario 8: Competitor detection and meaningful corrections continue to function
  it('Scenario 8: Competitor detection and brand-appropriate corrections are preserved', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Why buy Tesla when our Tata Motors EV delivers superior electric engineering?'
      });

    expect(res.status).toBe(200);
    expect(res.body.companyName).toBe('Tata Motors');
    
    // Competitor Tesla detected
    const competitorIssue = res.body.issues.find(
      (i: any) => i.category === 'brand_identity' || i.category === 'competitor_brand'
    );
    expect(competitorIssue).toBeDefined();
    expect(competitorIssue.matchedText.toLowerCase()).toContain('tesla');
    // Correction should not simply keep Tesla
    expect(res.body.correctedContent).not.toContain('Why buy Tesla');
  });
});
