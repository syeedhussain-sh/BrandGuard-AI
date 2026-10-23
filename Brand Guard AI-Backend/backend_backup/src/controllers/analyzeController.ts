import { Request, Response } from 'express';
import * as brandService from '../services/brandService';
import * as analysisService from '../services/analysisService';
import { ApiErrorResponse } from '../types';

export async function analyzeContent(req: Request, res: Response): Promise<void> {
  try {
    const { brandId, content } = req.body || {};

    // Validate presence and type of brandId
    if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Field "brandId" is required and must be a non-empty string.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Validate presence and type of content
    if (content === undefined || content === null || typeof content !== 'string') {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Field "content" is required and must be a string.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!content.trim()) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Field "content" must not be empty.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Retrieve brand profile
    const brand = await brandService.getBrandById(brandId.trim());

    if (!brand) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Brand with ID "${brandId}" was not found.`
        }
      };
      res.status(404).json(errorResponse);
      return;
    }

    // Call separate analysis service
    const result = await analysisService.analyzeContent(content, brand);

    // Return exact API contract response
    res.status(200).json(result);
  } catch (error) {
    console.error('Error during content analysis:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while analyzing content.'
      }
    };
    res.status(500).json(errorResponse);
  }
}
