import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Settings from './pages/Settings';
import api from './api';

const Dashboard = () => {
    const [summary, setSummary] = useState({
        totalClients: '--',
        activeProjects: '--',
        pendingTasks: '--',
        completedTasks: '--',
        overdueTasks: '--',
        completionPercentage: 0
    });

    useEffect(() => {
        const loadSummary = () => {
            api.get('/dashboard/summary')
                .then(({ data }) => setSummary({
                    totalClients: data.totalClients ?? '--',
                    activeProjects: data.activeProjects ?? '--',
                    pendingTasks: data.pendingTasks ?? '--',
                    completedTasks: data.completedTasks ?? '--',
                    overdueTasks: data.overdueTasks ?? '--',
                    completionPercentage: data.completionPercentage ?? 0
                }))
                .catch(() => {});
        };
        loadSummary();
        const interval = setInterval(loadSummary, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-light text-anthracite-dark">Tu centro de mandos</h1>
                <p className="text-gray-500 mt-2 font-medium tracking-wide">No soy tu asistente. Soy tu ventaja.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Clientes Activos</h3>
                    <p className="text-4xl font-light text-anthracite">{summary.totalClients}</p>
                </div>
                <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Proyectos en marcha</h3>
                    <p className="text-4xl font-light text-anthracite">{summary.activeProjects}</p>
                </div>
                <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tareas Pendientes</h3>
                    <p className="text-4xl font-light text-anthracite">{summary.pendingTasks}</p>
                </div>
                <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Tareas Completadas</h3>
                    <p className="text-4xl font-light text-anthracite">{summary.completedTasks}</p>
                </div>
                <div className="card border-0 bg-red-50/50 shadow-sm ring-1 ring-red-100 p-8">
                    <h3 className="text-xs font-semibold text-red-400 uppercase tracking-widest mb-2">Foco Urgente (Vencidas)</h3>
                    <p className="text-4xl font-light text-red-600">{summary.overdueTasks}</p>
                </div>
                <div className="card border-0 bg-mint-50/50 shadow-sm ring-1 ring-mint-200 p-8">
                    <h3 className="text-xs font-semibold text-mint-700 uppercase tracking-widest mb-2">Índice de Claridad (Completado)</h3>
                    <p className="text-4xl font-light text-mint-700">{summary.completionPercentage}%</p>
                </div>
            </div>
        </div>
    );
};



const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                    <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
