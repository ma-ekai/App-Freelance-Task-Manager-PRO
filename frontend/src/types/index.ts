export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Client {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    notes?: string;
    createdAt: string;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'paused' | 'closed';
    clientId?: string;
    client?: Client;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'doing' | 'blocked' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'critical';
    projectId?: string;
    project?: Project;
    clientId?: string;
    client?: Client;
    dueDate?: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
}
