import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Clients from './pages/Clients';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';

// Example Placeholder components
const Dashboard = () => (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-anthracite-dark">Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your freelance business</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-mint-50 border-mint-200">
                <h3 className="text-sm font-semibold text-mint-700 uppercase tracking-wider">Total Clients</h3>
                <p className="text-3xl font-bold text-anthracite mt-2">--</p>
            </div>
            <div className="card">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Projects</h3>
                <p className="text-3xl font-bold text-anthracite mt-2">--</p>
            </div>
            <div className="card">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Pending Tasks</h3>
                <p className="text-3xl font-bold text-anthracite mt-2">--</p>
            </div>
        </div>
    </div>
);

const Settings = () => <div className="card"><h1>Settings</h1><p className="text-gray-500">Account settings.</p></div>;

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
