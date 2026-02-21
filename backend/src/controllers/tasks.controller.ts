import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const { page, limit, projectId, clientId, priority, status } = req.query;
  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: any = { userId };
  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;
  if (priority) where.priority = priority;
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
    prisma.task.count({ where })
  ]);

  res.json({ data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
};

export const getTask = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const task = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
};

export const createTask = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const task = await prisma.task.create({ data: { ...req.body, userId } });
  res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body });
  res.json(task);
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const { status } = req.body;
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  const task = await prisma.task.update({ where: { id: req.params.id }, data: { status } });
  res.json(task);
};

export const deleteTask = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId } });
  if (!existing) return res.status(404).json({ error: 'Task not found' });
  await prisma.task.delete({ where: { id: req.params.id } });
  res.status(204).send();
};

export const getKanban = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  const { projectId, clientId, priority } = req.query;

  const where: any = { userId };
  if (projectId) where.projectId = projectId;
  if (clientId) where.clientId = clientId;
  if (priority) where.priority = priority;

  const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } });

  const columns = ['todo', 'doing', 'blocked', 'review', 'done'];
  const kanban: Record<string, typeof tasks> = {};
  columns.forEach(col => { kanban[col] = []; });
  tasks.forEach(task => { if (kanban[task.status]) kanban[task.status].push(task); });

  res.json(kanban);
};
