import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const demoEmail = 'demo@example.com';
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 1. Create Demo User
    const user = await prisma.user.upsert({
        where: { email: demoEmail },
        update: {},
        create: {
            name: 'Demo Freelancer',
            email: demoEmail,
            passwordHash: hashedPassword,
        },
    });

    // 2. Create Demo Client
    const client = await prisma.client.create({
        data: {
            name: 'Acme Corp',
            company: 'Acme Industries',
            email: 'contact@acme.com',
            userId: user.id,
        },
    });

    // 3. Create Demo Project
    const project = await prisma.project.create({
        data: {
            name: 'Website Redesign',
            status: 'In Progress',
            clientId: client.id,
            userId: user.id,
        },
    });

    // 4. Create Demo Tasks
    await prisma.task.createMany({
        data: [
            {
                title: 'Design Hero Section',
                status: 'To Do',
                priority: 'High',
                projectId: project.id,
                clientId: client.id,
                userId: user.id,
            },
            {
                title: 'Setup Backend API',
                status: 'In Progress',
                priority: 'Medium',
                projectId: project.id,
                clientId: client.id,
                userId: user.id,
            },
        ],
    });

    console.log('Seed completed: Demo user, client, project and tasks created.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
