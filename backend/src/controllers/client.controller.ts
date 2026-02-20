import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

export const getClients = async (req: AuthRequest, res: Response) => {
    try {
        const clients = await prisma.client.findMany({
            where: { userId: req.userId }
        });
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching clients' });
    }
};

export const createClient = async (req: AuthRequest, res: Response) => {
    try {
        const { name, company, email, phone, notes } = req.body;
        const client = await prisma.client.create({
            data: {
                name,
                company,
                email,
                phone,
                notes,
                userId: req.userId!
            }
        });
        res.status(201).json(client);
    } catch (error) {
        res.status(500).json({ error: 'Error creating client' });
    }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, company, email, phone, notes } = req.body;
        const client = await prisma.client.updateMany({
            where: { id, userId: req.userId },
            data: { name, company, email, phone, notes }
        });
        if (client.count === 0) return res.status(404).json({ error: 'Client not found or unauthorized' });
        res.json({ message: 'Client updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating client' });
    }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.client.deleteMany({
            where: { id, userId: req.userId }
        });
        if (deleted.count === 0) return res.status(404).json({ error: 'Client not found or unauthorized' });
        res.json({ message: 'Client deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting client' });
    }
};
