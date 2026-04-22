import React, { useState } from 'react';
import api from '../api';

const Settings: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas nuevas no coinciden.');
            return;
        }
        if (newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await api.patch('/auth/change-password', { currentPassword, newPassword });
            setSuccess('Contraseña actualizada correctamente.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            const msg = err?.response?.data?.error || 'Error al cambiar la contraseña.';
            setError(msg === 'Current password is incorrect'
                ? 'La contraseña actual no es correcta.'
                : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-lg">
            <div>
                <h1 className="text-3xl font-light text-anthracite-dark">Configuración</h1>
                <p className="text-gray-500 mt-2">Gestiona tu cuenta y preferencias.</p>
            </div>

            <div className="card border-0 bg-white shadow-sm ring-1 ring-gray-100 p-8">
                <h2 className="text-lg font-medium text-anthracite mb-1">Cambiar contraseña</h2>
                <p className="text-sm text-gray-400 mb-6">Por seguridad, necesitas introducir tu contraseña actual.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Contraseña actual
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
                            placeholder="Tu contraseña actual"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            id="new-password"
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
                            Confirmar nueva contraseña
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 transition"
                            placeholder="Repite la nueva contraseña"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-100 text-green-600 rounded-lg px-4 py-3 text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        id="change-password-btn"
                        type="submit"
                        disabled={loading}
                        className="w-full bg-anthracite text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-anthracite-dark transition disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Actualizar contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;
