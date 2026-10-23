import { Router } from 'express';
import { analyzeContent } from '../controllers/analyzeController';

const router = Router();

// POST /api/analyze - Run brand compliance analysis
router.post('/', analyzeContent);

export default router;
