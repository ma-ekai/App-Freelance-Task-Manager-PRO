import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const resetSuccess = searchParams.get('reset') === 'success';
    const [loginError, setLoginError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setLoginError('');
        try {
            await login(data.email, data.password);
            navigate('/');
        } catch {
            setLoginError('Email o contraseña incorrectos.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-anthracite font-black text-lg">TM</span>
                    </div>
                    <h2 className="text-2xl font-light text-anthracite-dark">Bienvenida de nuevo</h2>
                    <p className="text-gray-500 mt-2">Accede a tu espacio de trabajo</p>
                </div>

                {resetSuccess && (
                    <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mb-6">
                        Contraseña restablecida correctamente. Ya puedes iniciar sesión.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="tu@email.com"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                            <Link to="/forgot-password" className="text-xs text-mint-700 hover:underline">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>
                        <input
                            {...register('password')}
                            type="password"
                            className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                    </div>

                    {loginError && (
                        <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-4 py-3 text-sm">
                            {loginError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-3"
                    >
                        {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
                    </button>
                </form>

                <p className="text-center mt-6 text-sm text-gray-500">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" className="text-mint-700 font-semibold hover:underline">
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
