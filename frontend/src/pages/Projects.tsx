import React, { useEffect, useState } from 'react';
import api from '../api';
import { Project, Client } from '../types';
import { Plus, Briefcase, Calendar, User, Pencil, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', clientId: '', status: 'active' };

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [projRes, clientRes] = await Promise.all([
                api.get('/projects'),
                api.get('/clients')
            ]);
            setProjects(projRes.data);
            setClients(clientRes.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const openCreate = () => { setEditProject(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (project: Project) => {
        setEditProject(project);
        setForm({
            name: project.name,
            description: project.description || '',
            clientId: project.clientId || '',
            status: project.status
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editProject) {
                await api.patch(`/projects/${editProject.id}`, form);
            } else {
                await api.post('/projects', form);
            }
            setShowModal(false);
            setForm(EMPTY_FORM);
            setEditProject(null);
            fetchData();
        } catch (error) {
            alert(editProject ? 'Error updating project' : 'Error creating project');
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm('¿Eliminar este proyecto? También se eliminarán las tareas asociadas.')) return;
        setDeleting(projectId);
        try {
            await api.delete(`/projects/${projectId}`);
            fetchData();
        } catch {
            alert('Error deleting project');
        } finally {
            setDeleting(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-mint-100 text-mint-700';
            case 'paused': return 'bg-orange-100 text-orange-700';
            case 'closed': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-anthracite-dark">Projects</h1>
                    <p className="text-gray-500 mt-1">Organize your work by goal</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>New Project</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                    <div key={project.id} className="card hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-mint-50 text-mint-600 rounded-lg flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => openEdit(project)} className="text-gray-400 hover:text-blue-600 transition" title="Editar"><Pencil size={15} /></button>
                                    <button onClick={() => handleDelete(project.id)} disabled={deleting === project.id} className="text-gray-400 hover:text-red-500 transition" title="Eliminar"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-anthracite">{project.name}</h3>
                        <p className="text-gray-500 mt-2 text-sm line-clamp-2">{project.description || 'No description provided'}</p>
                        <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                            {project.client && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <User size={14} className="text-mint-600" />
                                    <span>{project.client.name}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Calendar size={14} />
                                <span>Added {new Date(project.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-anthracite/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{editProject ? 'Edit Project' : 'Start New Project'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                                <select className="input-field" value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
                                    <option value="">No Client (Internal)</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea className="input-field min-h-[100px]" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-anthracite">Cancel</button>
                                <button type="submit" className="btn-primary">{editProject ? 'Save Changes' : 'Create Project'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
