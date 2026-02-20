import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            where: { userId: req.userId },
            include: { client: true }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching projects' });
    }
};

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, clientId, status, startDate, endDate } = req.body;
        const project = await prisma.project.create({
            data: {
                name,
                description,
                clientId,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                userId: req.userId!
            }
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ error: 'Error creating project' });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, clientId, status, startDate, endDate } = req.body;
        const project = await prisma.project.updateMany({
            where: { id, userId: req.userId },
            data: {
                name,
                description,
                clientId,
                status,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
            }
        });
        if (project.count === 0) return res.status(404).json({ error: 'Project not found or unauthorized' });
        res.json({ message: 'Project updated' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating project' });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await prisma.project.deleteMany({
            where: { id, userId: req.userId }
        });
        if (deleted.count === 0) return res.status(404).json({ error: 'Project not found or unauthorized' });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting project' });
    }
};
