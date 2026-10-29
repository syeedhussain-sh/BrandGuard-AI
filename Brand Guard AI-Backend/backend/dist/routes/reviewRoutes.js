"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const router = (0, express_1.Router)();
// POST /api/reviews - Create or update review decision
router.post('/', reviewController_1.createReview);
// GET /api/reviews - List all review decisions
router.get('/', reviewController_1.getReviews);
// GET /api/reviews/metrics - Get aggregated review metrics for dashboard
router.get('/metrics', reviewController_1.getReviewMetrics);
// GET /api/reviews/analysis/:analysisId - Get review decision by analysisId
router.get('/analysis/:analysisId', reviewController_1.getReviewByAnalysisId);
exports.default = router;
