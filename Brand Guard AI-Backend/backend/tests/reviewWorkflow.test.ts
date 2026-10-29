import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

describe('Improvement 3: Review and Approval Workflow + Brand Guidelines Tests', () => {
  const testAnalysisId = `anlz_test_${Date.now()}`;

  // 1. Review Approval
  describe('Approval Workflow', () => {
    it('creates an approved review decision with reviewer name and optional metadata', async () => {
      const payload = {
        analysisId: testAnalysisId,
        brandId: 'demo-brand',
        companyName: 'NovaTech',
        status: 'approved',
        reviewerName: 'Sarah Jenkins',
        reviewerRole: 'Brand Compliance Lead',
        reviewerEmail: 'sarah.j@novatech.io',
        notes: 'Approved under Enterprise SLA guidelines.',
      };

      const res = await request(app).post('/api/reviews').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^rev_/);
      expect(res.body.data.analysisId).toBe(testAnalysisId);
      expect(res.body.data.status).toBe('approved');
      expect(res.body.data.reviewerName).toBe('Sarah Jenkins');
      expect(res.body.data.reviewerRole).toBe('Brand Compliance Lead');
      expect(res.body.data.notes).toBe('Approved under Enterprise SLA guidelines.');
      expect(res.body.data.createdAt).toBeDefined();
    });

    it('rejects approval submission when reviewerName is missing', async () => {
      const payload = {
        analysisId: `anlz_missing_reviewer_${Date.now()}`,
        status: 'approved',
        notes: 'Notes without name',
      };

      const res = await request(app).post('/api/reviews').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toMatch(/Reviewer name is required/i);
    });
  });

  // 2. Review Rejection Validation
  describe('Rejection Workflow & Validation', () => {
    it('rejects submission when rejectionReason is missing for rejected status', async () => {
      const payload = {
        analysisId: `anlz_rej_missing_${Date.now()}`,
        status: 'rejected',
        reviewerName: 'Marcus Vance',
      };

      const res = await request(app).post('/api/reviews').send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toMatch(/Rejection reason is required/i);
    });

    it('records a rejection when rejectionReason is provided', async () => {
      const rejAnalysisId = `anlz_rej_valid_${Date.now()}`;
      const payload = {
        analysisId: rejAnalysisId,
        brandId: 'demo-brand',
        companyName: 'NovaTech',
        status: 'rejected',
        reviewerName: 'Marcus Vance',
        rejectionReason: 'Violates non-disparagement policy by referencing competitor naming.',
        notes: 'Please revise and resubmit without competitor names.',
      };

      const res = await request(app).post('/api/reviews').send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rejected');
      expect(res.body.data.rejectionReason).toBe(payload.rejectionReason);
      expect(res.body.data.reviewerName).toBe('Marcus Vance');
    });
  });

  // 3. Duplicate Prevention & Lifecycle Updates
  describe('Lifecycle & Conflict Handling', () => {
    it('prevents accidental duplicate decisions on the same analysis without allowUpdate', async () => {
      const conflictAnalysisId = `anlz_conflict_${Date.now()}`;

      // First decision
      await request(app).post('/api/reviews').send({
        analysisId: conflictAnalysisId,
        status: 'approved',
        reviewerName: 'Alice',
      });

      // Second decision without allowUpdate: true
      const secondRes = await request(app).post('/api/reviews').send({
        analysisId: conflictAnalysisId,
        status: 'rejected',
        reviewerName: 'Bob',
        rejectionReason: 'Second opinion rejected',
      });

      expect(secondRes.status).toBe(409);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.error.code).toBe('CONFLICT');
    });

    it('updates existing review and records audit trail when allowUpdate is true', async () => {
      const updateAnalysisId = `anlz_update_${Date.now()}`;

      // First decision: approved
      await request(app).post('/api/reviews').send({
        analysisId: updateAnalysisId,
        status: 'approved',
        reviewerName: 'Alice',
        notes: 'Initial approval',
      });

      // Update decision with allowUpdate: true
      const updateRes = await request(app).post('/api/reviews').send({
        analysisId: updateAnalysisId,
        status: 'rejected',
        reviewerName: 'Compliance Director',
        rejectionReason: 'Overruled due to SLA revision required.',
        allowUpdate: true,
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.status).toBe('rejected');
      expect(updateRes.body.data.reviewerName).toBe('Compliance Director');
      expect(updateRes.body.data.rejectionReason).toBe('Overruled due to SLA revision required.');
      expect(updateRes.body.data.auditTrail).toBeDefined();
      expect(updateRes.body.data.auditTrail.length).toBeGreaterThanOrEqual(1);
      expect(updateRes.body.data.auditTrail[0].status).toBe('approved');
      expect(updateRes.body.data.auditTrail[0].reviewerName).toBe('Alice');
    });
  });

  // 4. Persistence & Retrieval
  describe('Retrieval & Dashboard Metrics', () => {
    it('retrieves saved review by analysisId', async () => {
      const queryAnalysisId = `anlz_query_${Date.now()}`;
      await request(app).post('/api/reviews').send({
        analysisId: queryAnalysisId,
        brandId: 'demo-brand',
        status: 'approved',
        reviewerName: 'David Chen',
      });

      const res = await request(app).get(`/api/reviews/analysis/${queryAnalysisId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.analysisId).toBe(queryAnalysisId);
      expect(res.body.data.reviewerName).toBe('David Chen');
    });

    it('returns 404 when querying an analysisId without a review', async () => {
      const res = await request(app).get('/api/reviews/analysis/non_existent_anlz');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('returns accurate dashboard review metrics from backend storage', async () => {
      const res = await request(app).get('/api/reviews/metrics');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalAnalysesReviewed');
      expect(res.body.data).toHaveProperty('approvedCount');
      expect(res.body.data).toHaveProperty('rejectedCount');
      expect(res.body.data).toHaveProperty('pendingCount');
      expect(res.body.data).toHaveProperty('approvalRate');
      expect(Array.isArray(res.body.data.recentDecisions)).toBe(true);
    });
  });

  // 5. Approved Brand Facts Persistence and Engine Claims Verification
  describe('Approved Brand Facts Persistence', () => {
    it('persists added approved facts via PUT /api/brands/:brandId and uses them in analysis', async () => {
      const uniqueFact = `NovaTech guarantees 99.999% uptime under our New Custom Fact Test ${Date.now()}`;

      // 1. Fetch current brand profile
      const brandRes = await request(app).get('/api/brands/demo-brand');
      const currentFacts = brandRes.body.data.approvedFacts || [];

      // 2. Add the unique approved fact
      const updatedFacts = [...currentFacts, uniqueFact];
      const putRes = await request(app)
        .put('/api/brands/demo-brand')
        .send({
          approvedFacts: updatedFacts,
        });

      expect(putRes.status).toBe(200);
      expect(putRes.body.success).toBe(true);

      // 3. Verify the updated facts persisted
      const checkRes = await request(app).get('/api/brands/demo-brand');
      expect(checkRes.body.data.approvedFacts).toContain(uniqueFact);

      // 4. Test that the analysis engine substantiates claims against this new fact
      const analyzeRes = await request(app)
        .post('/api/analyze')
        .send({
          brandId: 'demo-brand',
          companyName: 'NovaTech',
          content: uniqueFact,
        });

      expect(analyzeRes.status).toBe(200);
      expect(analyzeRes.body.supportedClaims).toBeDefined();
      const matched = analyzeRes.body.supportedClaims.find((c: any) =>
        c.supportingFact.includes(uniqueFact)
      );
      expect(matched).toBeDefined();
    });
  });
});
