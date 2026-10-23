import { Request, Response } from 'express';
import * as brandService from '../services/brandService';
import { ApiErrorResponse, ApiSuccessResponse, BrandProfile } from '../types';

export async function getAllBrands(req: Request, res: Response): Promise<void> {
  try {
    const brands = await brandService.getAllBrands();
    const response: ApiSuccessResponse<BrandProfile[]> = {
      success: true,
      data: brands
    };
    res.status(200).json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve brands.'
      }
    };
    res.status(500).json(errorResponse);
  }
}

export async function getBrandById(req: Request, res: Response): Promise<void> {
  try {
    const rawBrandId = req.params.brandId;
    const brandId = Array.isArray(rawBrandId) ? rawBrandId[0] : rawBrandId;

    if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter brandId is required.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    const brand = await brandService.getBrandById(brandId.trim());

    if (!brand) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Brand with ID '${brandId}' not found.`
        }
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<BrandProfile> = {
      success: true,
      data: brand
    };
    res.status(200).json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve brand profile.'
      }
    };
    res.status(500).json(errorResponse);
  }
}

export async function updateBrand(req: Request, res: Response): Promise<void> {
  try {
    const rawBrandId = req.params.brandId;
    const brandId = Array.isArray(rawBrandId) ? rawBrandId[0] : rawBrandId;
    const body = req.body;

    if (!brandId || typeof brandId !== 'string' || !brandId.trim()) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Parameter brandId is required.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body must be a valid JSON object.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    // Optional field checks
    if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Brand name must be a non-empty string.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (body.tone !== undefined && !Array.isArray(body.tone)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Brand tone must be an array of strings.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    if (body.guidelines !== undefined && (typeof body.guidelines !== 'object' || Array.isArray(body.guidelines))) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Guidelines must be an object containing brand rules.'
        }
      };
      res.status(400).json(errorResponse);
      return;
    }

    const updated = await brandService.updateBrand(brandId.trim(), body);

    if (!updated) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Brand with ID '${brandId}' not found.`
        }
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiSuccessResponse<BrandProfile> = {
      success: true,
      data: updated,
      message: 'Brand guidelines updated successfully.'
    };
    res.status(200).json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update brand profile.'
      }
    };
    res.status(500).json(errorResponse);
  }
}
