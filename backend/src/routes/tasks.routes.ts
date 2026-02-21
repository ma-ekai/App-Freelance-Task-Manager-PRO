import { Router } from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask, getKanban, updateTaskStatus } from '../controllers/tasks.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.get('/kanban', authenticateToken, getKanban);
router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, createTask);
router.get('/:id', authenticateToken, getTask);
router.patch('/:id', authenticateToken, updateTask);
router.patch('/:id/status', authenticateToken, updateTaskStatus);
router.delete('/:id', authenticateToken, deleteTask);
export default router;
