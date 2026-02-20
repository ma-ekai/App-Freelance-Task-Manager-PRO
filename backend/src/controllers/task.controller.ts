import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

export const getTasks = async (req: AuthRequest, res: Response) => {
    try {
        const { status, priority, projectId, clientId, search } = req.query;

        const where: any = {
            userId: req.userId,
        };

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (projectId) where.projectId = projectId;
        if (clientId) where.clientId = clientId;
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                project: true,
                client: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tasks' });
    }
};

export const createTask = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, projectId, clientId, priority, status, dueDate, category } = req.body;
        const task = await prisma.task.create({
            data: {
                title,
                description,
                projectId,
                clientId,
                priority,
                status,
                category,
                dueDate: dueDate ? new Date(dueDate) : null,
                userId: req.userId!
            }
        });
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ error: 'Error creating task' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, projectId, clientId, priority, status, dueDate, category } = req.body;
        const task = await prisma.task.updateMany({
            where: { id, userId: req.userId },
            data: {
                title,
                description,
                projectId,
                clientId,
                priority,
                status,
                category,
                dueDate: dueDate ? new Date(dueDate) : null,
            }
        });
        if (task.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating task' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.task.deleteMany({
            where: { id, userId: req.userId }
        });
        if (deleted.count === 0) return res.status(404).json({ error: 'Task not found or unauthorized' });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting task' });
    }
};
