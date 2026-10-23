import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('BrandGuard AI Backend API Endpoints', () => {
  // 1. Health check
  describe('GET /api/health', () => {
    it('should return 200 with service status, uptime, and timestamp', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'ok');
      expect(res.body).toHaveProperty('service', 'BrandGuard AI Backend');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('uptime');
      expect(typeof res.body.uptime).toBe('number');
    });
  });

  // 2. List brands
  describe('GET /api/brands', () => {
    it('should return 200 with list of brands including demo-brand', async () => {
      const res = await request(app).get('/api/brands');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(Array.isArray(res.body.data)).toBe(true);

      const demo = res.body.data.find((b: any) => b.id === 'demo-brand');
      expect(demo).toBeDefined();
      expect(demo.name).toBe('NovaTech');
    });
  });

  // 3. Get brand by ID
  describe('GET /api/brands/:brandId', () => {
    it('should return 200 with demo-brand guidelines', async () => {
      const res = await request(app).get('/api/brands/demo-brand');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('demo-brand');
      expect(res.body.data.name).toBe('NovaTech');
      expect(res.body.data.guidelines).toBeDefined();
      expect(Array.isArray(res.body.data.guidelines.terminology)).toBe(true);
    });

    it('should return 404 when brand ID does not exist', async () => {
      const res = await request(app).get('/api/brands/non-existent-brand');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // 4. Update brand by ID
  describe('PUT /api/brands/:brandId', () => {
    it('should return 200 and update brand guidelines', async () => {
      const updatePayload = {
        description: 'Updated description for testing.',
        tone: ['professional', 'innovative']
      };

      const res = await request(app)
        .put('/api/brands/demo-brand')
        .send(updatePayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Updated description for testing.');
      expect(res.body.data.tone).toEqual(['professional', 'innovative']);
    });

    it('should return 400 when invalid body is provided', async () => {
      const res = await request(app)
        .put('/api/brands/demo-brand')
        .send({ tone: 'not-an-array' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when updating non-existent brand', async () => {
      const res = await request(app)
        .put('/api/brands/ghost-brand')
        .send({ name: 'Ghost' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // 5. Analyze content
  describe('POST /api/analyze', () => {
    it('should return 200 and adhere strictly to the shared API contract', async () => {
      const testContent =
        'Our Nova Cloud is the cheapest cloud in the market and it is obviously 100% bug-free. We guarantee total reliability.';

      const res = await request(app).post('/api/analyze').send({
        brandId: 'demo-brand',
        content: testContent
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('analysisId');
      expect(typeof res.body.analysisId).toBe('string');
      expect(res.body.analysisId.startsWith('anlz_')).toBe(true);

      // Verify summary schema
      expect(res.body).toHaveProperty('summary');
      expect(res.body.summary).toHaveProperty('totalIssues');
      expect(res.body.summary).toHaveProperty('high');
      expect(res.body.summary).toHaveProperty('medium');
      expect(res.body.summary).toHaveProperty('low');
      expect(typeof res.body.summary.totalIssues).toBe('number');
      expect(res.body.summary.totalIssues).toBeGreaterThan(0);

      // Verify issues schema
      expect(Array.isArray(res.body.issues)).toBe(true);
      const firstIssue = res.body.issues[0];
      expect(firstIssue).toHaveProperty('id');
      expect(firstIssue).toHaveProperty('category');
      expect(firstIssue).toHaveProperty('severity');
      expect(firstIssue).toHaveProperty('matchedText');
      expect(firstIssue).toHaveProperty('explanation');
      expect(firstIssue).toHaveProperty('suggestion');

      // Verify valid categories and severities
      const allowedCategories = [
        'terminology',
        'restricted_phrase',
        'missing_term',
        'tone',
        'claim_verification'
      ];
      const allowedSeverities = ['high', 'medium', 'low'];

      for (const issue of res.body.issues) {
        expect(allowedCategories).toContain(issue.category);
        expect(allowedSeverities).toContain(issue.severity);
      }

      // Verify correctedContent and analysisMode
      expect(res.body).toHaveProperty('correctedContent');
      expect(typeof res.body.correctedContent).toBe('string');
      expect(res.body).toHaveProperty('analysisMode', 'rules');

      // Specifically check that "Nova Cloud" was corrected to "NovaTech Cloud Platform"
      expect(res.body.correctedContent).toContain('NovaTech Cloud Platform');
    });

    it('should return 400 when brandId is missing', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({ content: 'Some content' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when content is empty', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({ brandId: 'demo-brand', content: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when brandId does not exist', async () => {
      const res = await request(app)
        .post('/api/analyze')
        .send({ brandId: 'non-existing', content: 'Valid content text' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
