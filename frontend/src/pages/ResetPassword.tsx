import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { token, newPassword });
            navigate('/login?reset=success');
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Error al restablecer la contraseña.';
            setError(msg === 'Invalid or expired reset token'
                ? 'El enlace ha caducado o no es válido. Solicita uno nuevo.'
                : msg);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <p className="text-red-500 text-sm">Enlace inválido. Por favor solicita uno nuevo.</p>
                    <Link to="/forgot-password" className="text-mint-700 text-sm hover:underline mt-4 block">
                        Solicitar enlace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-anthracite font-black text-lg">TM</span>
                    </div>
                    <h2 className="text-2xl font-light text-anthracite-dark">Nueva contraseña</h2>
                    <p className="text-gray-500 mt-2 text-sm">Elige una contraseña segura para tu cuenta.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            id="reset-new-password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Confirmar contraseña
                        </label>
                        <input
                            id="reset-confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
                            placeholder="Repite la contraseña"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        id="reset-password-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-anthracite text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-anthracite-dark transition disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Establecer nueva contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
