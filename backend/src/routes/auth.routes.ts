import { Router } from 'express';
import { register, login, refresh, logout, me, changePassword } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticateToken, me);
router.patch('/change-password', authenticateToken, changePassword);
export default router;
