import { Router } from 'express';
import {
  createReview,
  getReviews,
  getReviewMetrics,
  getReviewByAnalysisId,
} from '../controllers/reviewController';

const router = Router();

// POST /api/reviews - Create or update review decision
router.post('/', createReview);

// GET /api/reviews - List all review decisions
router.get('/', getReviews);

// GET /api/reviews/metrics - Get aggregated review metrics for dashboard
router.get('/metrics', getReviewMetrics);

// GET /api/reviews/analysis/:analysisId - Get review decision by analysisId
router.get('/analysis/:analysisId', getReviewByAnalysisId);

export default router;
