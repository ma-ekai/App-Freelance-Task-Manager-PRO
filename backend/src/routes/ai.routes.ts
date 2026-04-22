import { Router } from 'express';
import { organizeTasks } from '../controllers/ai.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Protegemos la ruta con verifyToken
router.use(verifyToken);

router.post('/organize-tasks', organizeTasks);

export default router;
