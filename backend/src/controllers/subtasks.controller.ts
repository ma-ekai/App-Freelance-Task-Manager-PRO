import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSubtasks = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.userId;
  const { taskId } = req.params;
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const subtasks = await prisma.subtask.findMany({ where: { taskId }, orderBy: { createdAt: 'asc' } });
  res.json(subtasks);
};

export const createSubtask = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.userId;
  const { taskId } = req.params;
  const { title } = req.body;
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const subtask = await prisma.subtask.create({ data: { taskId, title } });
  res.status(201).json(subtask);
};

export const updateSubtask = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.userId;
  const { taskId, subtaskId } = req.params;
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const subtask = await prisma.subtask.update({ where: { id: subtaskId }, data: req.body });
  res.json(subtask);
};

export const deleteSubtask = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || (req as any).user?.userId;
  const { taskId, subtaskId } = req.params;
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  await prisma.subtask.delete({ where: { id: subtaskId } });
  res.status(204).send();
};
