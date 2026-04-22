import { Router } from 'express';
import { organizeTasks } from '../controllers/ai.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protegemos la ruta con authenticateToken
router.use(authenticateToken);

router.post('/organize-tasks', organizeTasks);

export default router;
