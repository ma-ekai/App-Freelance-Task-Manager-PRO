import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const organizeTasks = async (req: Request, res: Response) => {
  const userId = (req as any).userId || (req as any).user?.id;
  
  // Obtenemos todas las tareas no completadas
  const tasks = await prisma.task.findMany({ 
    where: { 
      userId,
      status: { not: 'done' }
    },
    orderBy: { createdAt: 'desc' } 
  });

  // Mock de lógica de IA basada en las skills de Marisa Aragüés
  const aiBlocks: Record<string, typeof tasks> = {
    foco_profundo: [],
    rapidas: [],
    delegar: [],
    admin: []
  };

  tasks.forEach(task => {
    const title = task.title.toLowerCase();
    const isHighPriority = task.priority === 'critical' || task.priority === 'high';

    if (title.includes('email') || title.includes('factura') || title.includes('presupuesto')) {
      aiBlocks.admin.push(task);
    } else if (task.type === 'DAILY') {
      // Las tareas diarias suelen ser rutinas rápidas
      aiBlocks.rapidas.push(task);
    } else if (title.includes('diseño') || title.includes('estrategia') || title.includes('redactar') || isHighPriority) {
      aiBlocks.foco_profundo.push(task);
    } else if (title.includes('revisar') || title.includes('llamar') || title.includes('mensaje')) {
      aiBlocks.rapidas.push(task);
    } else {
      // Por defecto, si no parece foco profundo, lo marcamos para delegar o rápido
      if (task.priority === 'low') {
        aiBlocks.delegar.push(task);
      } else {
        aiBlocks.rapidas.push(task);
      }
    }
  });

  res.json({
    blocks: aiBlocks,
    message: "Tareas organizadas con éxito."
  });
};
