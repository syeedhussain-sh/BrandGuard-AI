import { Request, Response } from 'express';
import * as reviewService from '../services/reviewService';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  CreateReviewRequest,
  ReviewDecision,
  ReviewMetrics,
  ReviewStatus,
} from '../types';

export async function createReview(req: Request, res: Response): Promise<void> {
  try {
    const body: CreateReviewRequest = req.body;

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      const errorResponse: ApiErrorResponse = {
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
      const errorResponse: ApiErrorResponse = {
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
    const validStatuses: ReviewStatus[] = ['pending', 'approved', 'rejected'];
    if (!body.status || !validStatuses.includes(body.status)) {
      const errorResponse: ApiErrorResponse = {
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
      const errorResponse: ApiErrorResponse = {
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
      const errorResponse: ApiErrorResponse = {
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
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'CONFLICT',
          message:
            'A review decision has already been recorded for this analysis. Set allowUpdate: true to submit a revised decision.',
        },
      };
      res.status(409).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<ReviewDecision> = {
      success: true,
      data: result.review,
      message: result.isNew
        ? 'Review decision recorded successfully.'
        : 'Review decision updated successfully.',
    };
    res.status(result.isNew ? 201 : 200).json(response);
  } catch (error) {
    console.error('Error creating/updating review:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to record review decision.',
      },
    };
    res.status(500).json(errorResponse);
  }
}

export async function getReviews(req: Request, res: Response): Promise<void> {
  try {
    const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
    const companyName = typeof req.query.companyName === 'string' ? req.query.companyName : undefined;
    const status = typeof req.query.status === 'string' ? (req.query.status as ReviewStatus) : undefined;

    const reviews = await reviewService.getReviews({ brandId, companyName, status });
    const response: ApiSuccessResponse<ReviewDecision[]> = {
      success: true,
      data: reviews,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve reviews.',
      },
    };
    res.status(500).json(errorResponse);
  }
}

export async function getReviewByAnalysisId(req: Request, res: Response): Promise<void> {
  try {
    const rawAnalysisId = req.params.analysisId;
    const analysisId = Array.isArray(rawAnalysisId) ? rawAnalysisId[0] : rawAnalysisId;

    if (!analysisId || !analysisId.trim()) {
      const errorResponse: ApiErrorResponse = {
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
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `No review found for analysisId '${analysisId}'.`,
        },
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<ReviewDecision> = {
      success: true,
      data: review,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching review by analysisId:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve review.',
      },
    };
    res.status(500).json(errorResponse);
  }
}

export async function getReviewMetrics(req: Request, res: Response): Promise<void> {
  try {
    const brandId = typeof req.query.brandId === 'string' ? req.query.brandId : undefined;
    const metrics = await reviewService.getReviewMetrics(brandId);

    const response: ApiSuccessResponse<ReviewMetrics> = {
      success: true,
      data: metrics,
    };
    res.status(200).json(response);
  } catch (error) {
    console.error('Error computing review metrics:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to compute review metrics.',
      },
    };
    res.status(500).json(errorResponse);
  }
}
