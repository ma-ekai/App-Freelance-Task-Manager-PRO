import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubtasks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    const { taskId } = req.params;
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const subtasks = await prisma.subtask.findMany({ where: { taskId }, orderBy: { createdAt: 'asc' } });
    res.json(subtasks);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSubtask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    const { taskId } = req.params;
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const subtask = await prisma.subtask.create({ data: { taskId, title: req.body.title } });
    res.status(201).json(subtask);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateSubtask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    const { taskId, subtaskId } = req.params;
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { title: req.body.title, done: req.body.done }
    });
    res.json(subtask);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSubtask = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    const { taskId, subtaskId } = req.params;
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await prisma.subtask.delete({ where: { id: subtaskId } });
    res.status(204).send();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
