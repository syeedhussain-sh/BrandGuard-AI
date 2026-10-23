import { Router } from 'express';
import {
  getAllBrands,
  getBrandById,
  updateBrand
} from '../controllers/brandController';

const router = Router();

// GET /api/brands - List all brands
router.get('/', getAllBrands);

// GET /api/brands/:brandId - Get specific brand guidelines
router.get('/:brandId', getBrandById);

// PUT /api/brands/:brandId - Update brand guidelines
router.put('/:brandId', updateBrand);

export default router;
