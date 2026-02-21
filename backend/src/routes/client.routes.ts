import { Router } from 'express';
import { getClients, createClient, updateClient, deleteClient } from '../controllers/client.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getClients);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
