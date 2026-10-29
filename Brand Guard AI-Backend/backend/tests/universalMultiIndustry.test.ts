import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Universal Multi-Industry Backend Integration Tests (Scenarios 1-12)', () => {
  // Scenario 1: NovaTech — existing configured brand (Mode A)
  it('Scenario 1: NovaTech - uses Mode A configured brand guidelines', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        brandId: 'demo-brand',
        content: 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.governanceMode).toBe('configured');
    expect(res.body.officialGuidelinesConfigured).toBe(true);
    expect(res.body.analysisMode).toBe('rules');
    expect(res.body.correctedContent).toContain('NovaTech Cloud Platform');
  });

  // Scenario 2: Tata Motors — automotive content (Mode B)
  it('Scenario 2: Tata Motors - analyzes automotive content with risk indicators', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'The new tata motors EV is 100% crash-proof and never needs maintenance. We guarantee 100% satisfaction.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.governanceMode).toBe('generic');
    expect(res.body.officialGuidelinesConfigured).toBe(false);
    expect(res.body.companyName).toBe('Tata Motors');
    expect(res.body.industry).toBe('Automotive');
    expect(res.body.modeLabel).toContain('Generic Brand Analysis');
    expect(res.body.disclaimer).toBeDefined();

    // Must NOT contain NovaTech-specific rules
    const hasNova = res.body.issues.some((i: any) =>
      i.matchedText.includes('NovaTech') || i.explanation.includes('NovaTech')
    );
    expect(hasNova).toBe(false);

    // Checks automotive risk indicator
    const crashIssue = res.body.issues.find((i: any) => i.matchedText === '100% crash-proof');
    expect(crashIssue).toBeDefined();
    expect(crashIssue.severity).toBe('high');
  });

  // Scenario 3: Samsung — mobile phone content (Mode B)
  it('Scenario 3: Samsung - analyzes electronics content with display and battery risk indicators', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Samsung',
        industry: 'Mobile phones and electronics',
        content: 'Our new samsung phone features infinite battery life and an unbreakable screen with zero latency guaranteed.'
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');
    expect(res.body.companyName).toBe('Samsung');

    const batteryIssue = res.body.issues.find((i: any) => i.matchedText === 'infinite battery life');
    expect(batteryIssue).toBeDefined();

    const screenIssue = res.body.issues.find((i: any) => i.matchedText === 'unbreakable screen');
    expect(screenIssue).toBeDefined();
  });

  // Scenario 4: McDonald's — food and restaurant content (Mode B)
  it('Scenario 4: McDonald\'s - analyzes food and beverage content with health claim indicators', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: "McDonald's",
        industry: 'Food and beverages',
        content: "Our mcdonald's meal offers a miracle detox that cures all diseases and guarantees weight loss!"
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');

    const diseaseIssue = res.body.issues.find((i: any) => i.matchedText.includes('cures all diseases'));
    expect(diseaseIssue).toBeDefined();

    const detoxIssue = res.body.issues.find((i: any) => i.matchedText.includes('miracle detox'));
    expect(detoxIssue).toBeDefined();
  });

  // Scenario 5: Nike — clothing and sportswear content (Mode B)
  it('Scenario 5: Nike - analyzes fashion and apparel content', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Nike',
        industry: 'Clothing and fashion',
        content: 'New nike running sneakers are 100% eco-friendly on earth with cheapest prices guaranteed anywhere! BUY NOW TODAY DO NOT MISS OUT!!!'
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');
    expect(res.body.companyName).toBe('Nike');

    const ecoIssue = res.body.issues.find((i: any) => i.matchedText.includes('100% eco-friendly'));
    expect(ecoIssue).toBeDefined();
  });

  // Scenario 6: Infosys — IT services content (Mode B)
  it('Scenario 6: Infosys - analyzes IT services and technology content', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Infosys',
        industry: 'Technology and software',
        content: 'infosys delivers 100% unhackable cloud architectures with zero downtime guaranteed forever.'
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');

    const unhackableIssue = res.body.issues.find((i: any) => i.matchedText.includes('100% unhackable'));
    expect(unhackableIssue).toBeDefined();
  });

  // Scenario 7: Fictional company name
  it('Scenario 7: Fictional company name - handles user-defined novel brands', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Quantum HyperDynamics',
        industry: 'Deep Space Propulsion',
        content: 'Quantum HyperDynamics offers the cheapest on earth warp drive that never fails and is 100% perfect.'
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');
    expect(res.body.companyName).toBe('Quantum HyperDynamics');
    expect(res.body.summary.totalIssues).toBeGreaterThanOrEqual(3);
  });

  // Scenario 8: Company from an industry not listed in predefined categories
  it('Scenario 8: Unlisted industry - processes any custom industry seamlessly', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Artisan Bloom',
        industry: 'Bespoke Floral Sculptures',
        content: 'Our flowers are obviously the best in the world and 100% risk-free.'
      });

    expect(res.status).toBe(200);
    expect(res.body.governanceMode).toBe('generic');
    expect(res.body.industry).toBe('Bespoke Floral Sculptures');
    expect(res.body.summary.totalIssues).toBeGreaterThan(0);
  });

  // Scenario 9: Empty company name
  it('Scenario 9: Empty company name - returns 400 validation error when no identifier provided', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: '   ',
        content: 'Some marketing content.'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('companyName');
  });

  // Scenario 10: Empty content
  it('Scenario 10: Empty content - returns 400 validation error', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'AnyBrand',
        content: '   '
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.message).toContain('content');
  });

  // Scenario 11: Exaggerated marketing claims
  it('Scenario 11: Exaggerated marketing claims - flags absolutes and generates responsible suggestions', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'AlphaTech',
        content: 'AlphaTech is total perfection and guarantees get rich quick results with zero risk.'
      });

    expect(res.status).toBe(200);
    expect(res.body.summary.high).toBeGreaterThanOrEqual(2);
    expect(res.body.correctedContent).toBeDefined();
    expect(res.body.correctedContent).not.toContain('total perfection');
  });

  // Scenario 12: Unknown brand IDs and malformed API requests
  it('Scenario 12: Unknown brand IDs and malformed requests - returns 404 for unknown brandId without companyName', async () => {
    // 12a: Unknown brandId standalone
    const res404 = await request(app)
      .post('/api/analyze')
      .send({
        brandId: 'non-existing-brand-id',
        content: 'Valid content text'
      });

    expect(res404.status).toBe(404);
    expect(res404.body.success).toBe(false);
    expect(res404.body.error.code).toBe('NOT_FOUND');

    // 12b: Malformed payload (missing content completely)
    const resMalformed = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'SomeBrand'
      });

    expect(resMalformed.status).toBe(400);
    expect(resMalformed.body.error.code).toBe('VALIDATION_ERROR');
  });

  // Scenario 13: Company Identity Mismatch - Tata Motors selected with Nova Cloud copy
  it('Scenario 13: Company Identity Mismatch - detects when Tata Motors is selected but copy references Nova Cloud', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total perfection.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('Tata Motors');

    // Must detect Nova Cloud mismatch
    const mismatchIssue = res.body.issues.find(
      (i: any) => i.matchedText === 'Nova Cloud' || i.matchedText.includes('Nova')
    );
    expect(mismatchIssue).toBeDefined();
    expect(mismatchIssue.category).toBe('brand_identity');
    expect(mismatchIssue.severity).toBe('high');
    expect(mismatchIssue.explanation).toContain('Tata Motors');
  });

  // Scenario 14: Correct Company Identity - no false mismatch warnings
  it('Scenario 14: Correct Company Identity - does not produce false mismatch when content matches selected company', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Tata Motors introduces our new passenger vehicle engineered for safety and reliability.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const mismatchIssue = res.body.issues.find(
      (i: any) => i.explanation.includes('appears to be a different company')
    );
    expect(mismatchIssue).toBeUndefined();
  });

  // Scenario 15: Newly entered brand with matching content via API
  it('Scenario 15: Newly entered brand with matching content via API', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Rivian',
        industry: 'Automotive',
        content: 'Rivian announces our new all-electric R1T adventure vehicle with robust dual-motor capabilities.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.companyName).toBe('Rivian');
    const mismatch = res.body.issues.find((i: any) => i.id.includes('brand_identity'));
    expect(mismatch).toBeUndefined();
  });

  // Scenario 16: Newly entered brand with mismatched content via API
  it('Scenario 16: Newly entered brand with mismatched content via API', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Rivian',
        industry: 'Automotive',
        content: 'Tesla Model Y features industry-leading autopilot and supercharging access across North America.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const mismatch = res.body.issues.find((i: any) => i.id.includes('brand_identity'));
    expect(mismatch).toBeDefined();
    expect(mismatch.explanation).toContain('Rivian');
  });

  // Scenario 17: Newly entered brand with limited context via API
  it('Scenario 17: Newly entered brand with limited context returns needs-review item via API', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'ApexFlow',
        // No industry provided
        content: 'Our core infrastructure accelerates data ingestion and business processing performance.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const contextIssue = res.body.issues.find((i: any) => i.id.includes('brand_context'));
    expect(contextIssue).toBeDefined();
    expect(contextIssue.severity).toBe('low');
  });

  // Scenario 18: KFC with McDonald's competitor content via API
  it('Scenario 18: KFC with McDonald\'s competitor content classifies as brand_identity and corrects content', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'KFC',
        industry: 'FOOD AND RESTAURANT',
        content: "McDonald's offers burgers and milkshakes."
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.originalContent).toBe("McDonald's offers burgers and milkshakes.");
    const mismatch = res.body.issues.find((i: any) => i.matchedText.includes("McDonald's"));
    expect(mismatch).toBeDefined();
    expect(mismatch.category).toBe('brand_identity');
    expect(mismatch.severity).toBe('high');
    expect(res.body.correctedContent).toBe("Enjoy KFC's signature fried chicken and delicious sides.");
  });

  // Scenario 19: Tata Motors with Tesla competitor content via API
  it('Scenario 19: Tata Motors with Tesla competitor content classifies as brand_identity and preserves marketing intent', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Tesla offers electric vehicles with advanced autonomous driving.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.originalContent).toBe('Tesla offers electric vehicles with advanced autonomous driving.');
    const mismatch = res.body.issues.find((i: any) => i.matchedText === 'Tesla');
    expect(mismatch).toBeDefined();
    expect(mismatch.category).toBe('brand_identity');
    expect(res.body.correctedContent).toBe('Tata Motors offers innovative electric vehicles with reliable engineering.');
  });

  // Scenario 20: Competitor content with proprietary claims requiring human review via API
  it('Scenario 20: Competitor content with proprietary claims requiring human review via API', async () => {
    const res = await request(app)
      .post('/api/analyze')
      .send({
        companyName: 'Tata Motors',
        industry: 'Automotive',
        content: 'Tesla Q3 earnings report shows $25B revenue from Cybertruck deliveries and patent 99281.'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.requiresHumanReview).toBe(true);
    expect(res.body.correctedContent).toContain('Requires Human Review');
  });
});
