import React, { useEffect, useState } from 'react';
import api from '../api';
import { Client } from '../types';
import { Plus, User as UserIcon, Mail, Phone, Building2 } from 'lucide-react';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [newClient, setNewClient] = useState({ name: '', company: '', email: '', phone: '', notes: '' });

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients', error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/clients', newClient);
            setShowModal(false);
            setNewClient({ name: '', company: '', email: '', phone: '', notes: '' });
            fetchClients();
        } catch (error) {
            alert('Error creating client');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-anthracite-dark">Clients</h1>
                    <p className="text-gray-500 mt-1">Manage your professional relationships</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    <span>Add Client</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <div key={client.id} className="card hover:border-mint transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-10 h-10 bg-mint-100 text-mint-700 rounded-lg flex items-center justify-center">
                                <UserIcon size={20} />
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
                        <h2 className="text-2xl font-bold mb-6">Add New Client</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    className="input-field"
                                    value={newClient.name}
                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    className="input-field"
                                    value={newClient.company}
                                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="input-field"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        className="input-field"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="input-field min-h-[100px]"
                                    value={newClient.notes}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-500 hover:text-anthracite">Cancel</button>
                                <button type="submit" className="btn-primary">Create Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
