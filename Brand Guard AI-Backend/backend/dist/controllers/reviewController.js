"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.getReviews = getReviews;
exports.getReviewByAnalysisId = getReviewByAnalysisId;
exports.getReviewMetrics = getReviewMetrics;
const reviewService = __importStar(require("../services/reviewService"));
async function createReview(req, res) {
    try {
        const body = req.body;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Request body must be a valid JSON object.',
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        // 1. Validate analysisId
        if (!body.analysisId || typeof body.analysisId !== 'string' || !body.analysisId.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Field analysisId is required.',
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        // 2. Validate status
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!body.status || !validStatuses.includes(body.status)) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: `Field status must be one of: ${validStatuses.join(', ')}.`,
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        // 3. Validate reviewerName for finalized decisions
        if ((body.status === 'approved' || body.status === 'rejected') && (!body.reviewerName || !body.reviewerName.trim())) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Reviewer name is required when submitting a review decision.',
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        // 4. Validate rejectionReason for rejected decisions
        if (body.status === 'rejected' && (!body.rejectionReason || !body.rejectionReason.trim())) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Rejection reason is required when rejecting content.',
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        const result = await reviewService.createOrUpdateReview(body);
        if (result.conflict) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'CONFLICT',
                    message: 'A review decision has already been recorded for this analysis. Set allowUpdate: true to submit a revised decision.',
                },
            };
            res.status(409).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            data: result.review,
            message: result.isNew
                ? 'Review decision recorded successfully.'
                : 'Review decision updated successfully.',
        };
        res.status(result.isNew ? 201 : 200).json(response);
    }
    catch (error) {
        console.error('Error creating/updating review:', error);
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to record review decision.',
            },
        };
        res.status(500).json(errorResponse);
    }
}
async function getReviews(req, res) {
    try {
        const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
        const companyName = typeof req.query.companyName === 'string' ? req.query.companyName : undefined;
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const reviews = await reviewService.getReviews({ brandId, companyName, status });
        const response = {
            success: true,
            data: reviews,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching reviews:', error);
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve reviews.',
            },
        };
        res.status(500).json(errorResponse);
    }
}
async function getReviewByAnalysisId(req, res) {
    try {
        const rawAnalysisId = req.params.analysisId;
        const analysisId = Array.isArray(rawAnalysisId) ? rawAnalysisId[0] : rawAnalysisId;
        if (!analysisId || !analysisId.trim()) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Parameter analysisId is required.',
                },
            };
            res.status(400).json(errorResponse);
            return;
        }
        const review = await reviewService.getReviewByAnalysisId(analysisId.trim());
        if (!review) {
            const errorResponse = {
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: `No review found for analysisId '${analysisId}'.`,
                },
            };
            res.status(404).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            data: review,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching review by analysisId:', error);
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve review.',
            },
        };
        res.status(500).json(errorResponse);
    }
}
async function getReviewMetrics(req, res) {
    try {
        const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
        const metrics = await reviewService.getReviewMetrics(brandId);
        const response = {
            success: true,
            data: metrics,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error computing review metrics:', error);
        const errorResponse = {
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to compute review metrics.',
            },
        };
        res.status(500).json(errorResponse);
    }
}
