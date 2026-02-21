import { Router } from 'express';
import { getSubtasks, createSubtask, updateSubtask, deleteSubtask } from '../controllers/subtasks.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });
router.get('/', authenticateToken, getSubtasks);
router.post('/', authenticateToken, createSubtask);
router.patch('/:subtaskId', authenticateToken, updateSubtask);
router.delete('/:subtaskId', authenticateToken, deleteSubtask);
export default router;
