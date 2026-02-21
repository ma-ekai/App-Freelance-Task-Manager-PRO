import React, { useEffect, useState } from 'react';
import api from '../api';
import { Client } from '../types';
import { Plus, User as UserIcon, Mail, Phone, Building2, Pencil, Trash2, X } from 'lucide-react';

const EMPTY_FORM = { name: '', company: '', email: '', phone: '', notes: '' };

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients', error);
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const openCreate = () => { setEditClient(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (client: Client) => { setEditClient(client); setForm({ name: client.name, company: client.company || '', email: client.email || '', phone: client.phone || '', notes: client.notes || '' }); setShowModal(true); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editClient) {
                await api.patch(`/clients/${editClient.id}`, form);
            } else {
                await api.post('/clients', form);
            }
            setShowModal(false);
            setForm(EMPTY_FORM);
            setEditClient(null);
            fetchClients();
        } catch (error) {
            alert(editClient ? 'Error updating client' : 'Error creating client');
        }
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm('¿Eliminar este cliente? También se eliminarán sus proyectos y tareas asociadas.')) return;
        setDeleting(clientId);
        try {
            await api.delete(`/clients/${clientId}`);
            fetchClients();
        } catch {
            alert('Error deleting client');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-anthracite-dark">Clients</h1>
                    <p className="text-gray-500 mt-1">Manage your professional relationships</p>
                </div>
                <button onClick={openCreate} className="btn-primary flex items-center gap-2">
                    <Plus size={20} />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="card hover:border-mint transition-all group relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-mint-100 text-mint-700 rounded-lg flex items-center justify-center">
                                <UserIcon size={20} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => openEdit(client)} className="text-gray-400 hover:text-blue-600 transition" title="Editar"><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(client.id)} disabled={deleting === client.id} className="text-gray-400 hover:text-red-500 transition" title="Eliminar"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-anthracite group-hover:text-mint-700 transition-colors">{client.name}</h3>
                        {client.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Building2 size={14} />
                                <span>{client.company}</span>
                            </div>
                        )}
                        <div className="mt-6 space-y-2">
                            {client.email && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail size={14} />
                                    <span>{client.email}</span>
                                </div>
                            )}
                            {client.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Phone size={14} />
                                    <span>{client.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-anthracite/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-xl border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">{editClient ? 'Edit Client' : 'Add New Client'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                                <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input className="input-field" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input className="input-field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea className="input-field min-h-[100px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-anthracite">Cancel</button>
                                <button type="submit" className="btn-primary">{editClient ? 'Save Changes' : 'Create Client'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
