import { Router } from 'express';
import { getSummary } from '../controllers/dashboard.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.get('/summary', authenticateToken, getSummary);
export default router;
