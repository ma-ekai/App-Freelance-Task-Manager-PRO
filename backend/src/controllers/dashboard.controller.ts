import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?.id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday.getTime() + 86400000);
    const in7Days = new Date(startOfToday.getTime() + 7 * 86400000);

    const [
      todayTasks,
      overdueTasks,
      next7DaysTasks,
      activeProjects,
      completedTasks,
      totalTasks,
      totalClients,
      pendingTasks
    ] = await Promise.all([
      prisma.task.count({ where: { userId, dueDate: { gte: startOfToday, lt: endOfToday } } }),
      prisma.task.count({ where: { userId, dueDate: { lt: startOfToday }, status: { not: 'done' } } }),
      prisma.task.count({ where: { userId, dueDate: { gte: endOfToday, lt: in7Days } } }),
      prisma.project.count({ where: { userId, status: 'active' } }),
      prisma.task.count({ where: { userId, status: 'done' } }),
      prisma.task.count({ where: { userId } }),
      prisma.client.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: { in: ['todo', 'doing', 'blocked', 'review'] } } }),

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      todayTasks,
      overdueTasks,
      next7DaysTasks,
      activeProjects,
      completedTasks,
      totalTasks,
      totalClients,
      pendingTasks,
      completionPercentage
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
