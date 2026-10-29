import { Router } from 'express';
import healthRoutes from './healthRoutes';
import brandRoutes from './brandRoutes';
import analyzeRoutes from './analyzeRoutes';
import reviewRoutes from './reviewRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/brands', brandRoutes);
router.use('/analyze', analyzeRoutes);
router.use('/reviews', reviewRoutes);

export default router;
