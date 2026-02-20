import React, { useEffect, useState } from 'react';
import api from '../api';
import { Task, Project, Client } from '../types';
import { Plus, Search, Filter, CheckCircle2, Circle, AlertCircle, Clock } from 'lucide-react';

const Tasks: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', priority: 'medium', status: 'todo' });

    const fetchData = async () => {
        try {
            const { data } = await api.get('/tasks', {
                params: { search: search || undefined, status: filterStatus || undefined }
            });
            setTasks(data);
            const projRes = await api.get('/projects');
            setProjects(projRes.data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, filterStatus]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/tasks', newTask);
            setShowModal(false);
            setNewTask({ title: '', description: '', projectId: '', priority: 'medium', status: 'todo' });
            fetchData();
        } catch (error) {
            alert('Error creating task');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'medium': return 'text-blue-600 bg-blue-50';
            case 'low': return 'text-gray-600 bg-gray-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-anthracite-dark">Tasks</h1>
                    <p className="text-gray-500 mt-1">Keep track of your daily work</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Add Task</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-mint/50 focus:border-mint outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="px-4 py-2 rounded-lg border border-gray-100 bg-gray-50 focus:ring-2 focus:ring-mint/50 outline-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="todo">To Do</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {tasks.map((task) => (
                    <div key={task.id} className="card py-4 flex items-center gap-4 hover:border-mint/50 transition-all">
                        <div className="text-gray-300">
                            {task.status === 'done' ? <CheckCircle2 className="text-mint" /> : <Circle />}
                        </div>
                        <div className="flex-1">
                            <h3 className={`font-semibold ${task.status === 'done' ? 'line-through text-gray-400' : 'text-anthracite'}`}>
                                {task.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                {task.project && (
                                    <span className="text-xs font-medium text-mint-700 bg-mint-50 px-2 py-0.5 rounded">
                                        {task.project.name}
                                    </span>
                                )}
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                                {task.dueDate && (
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                        <Clock size={10} />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-anthracite/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-gray-100">
                        <h2 className="text-2xl font-bold mb-6">New Task</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    required
                                    className="input-field"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                                    <select
                                        className="input-field"
                                        value={newTask.projectId}
                                        onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                                    >
                                        <option value="">No Project</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="input-field"
                                        value={newTask.priority}
                                        onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-anthracite">Cancel</button>
                                <button type="submit" className="btn-primary">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
