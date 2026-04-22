import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch {
            setError('Ha ocurrido un error. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-anthracite font-black text-lg">TM</span>
                    </div>
                    <h2 className="text-2xl font-light text-anthracite-dark">¿Olvidaste tu contraseña?</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Introduce tu email y te enviaremos un enlace para recuperarla.
                    </p>
                </div>

                {sent ? (
                    <div className="text-center space-y-4">
                        <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-6 py-4 text-sm">
                            Si el email está registrado, recibirás un enlace en tu bandeja de entrada.
                        </div>
                        <Link to="/login" className="text-sm text-mint-700 hover:underline font-medium">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                                Email
                            </label>
                            <input
                                id="forgot-email"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            id="send-reset-btn"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-anthracite text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-anthracite-dark transition disabled:opacity-50"
                        >
                            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                        </button>

                        <p className="text-center text-sm text-gray-400">
                            <Link to="/login" className="text-mint-700 hover:underline font-medium">
                                Volver al inicio de sesión
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
