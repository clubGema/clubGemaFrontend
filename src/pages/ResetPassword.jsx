import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiFetch from '../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../constants/apiRoutes';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) return toast.error("Las contraseñas no coinciden");

        setIsLoading(true);
        try {
            const response = await apiFetch.post(API_ROUTES.AUTH.RESET_PASSWORD, { token, newPassword: password });
            if (response.ok) {
                toast.success("¡Contraseña actualizada! Ya puedes iniciar sesión.");
                navigate('/login');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Error al restablecer");
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            toast.error("Hubo un problema con la conexión");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Fondo Oscuro con degradado radial */
        <div className="min-h-screen flex items-center justify-center bg-[#0C0608] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2D0911] via-[#0C0608] to-black px-4 py-8">
            <div className="max-w-md w-full">

                {/* Card Principal */}
                <div className="bg-brand-surface rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">

                    {/* Encabezado Institucional Imperio 7 */}
                    <div className="bg-gradient-to-br from-brand-primary via-[#3A0B14] to-brand-primary-dark p-10 text-center relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>

                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic relative z-10">
                            IMPERIO<span className="text-brand-accent not-italic"> 7</span>
                        </h1>
                        <div className="h-1.5 w-14 bg-brand-accent mx-auto mt-3 rounded-full relative z-10 shadow-accent-bar-sm"></div>
                        <p className="text-amber-200 mt-5 text-sm font-semibold tracking-wide relative z-10 uppercase">
                            Nueva Contraseña
                        </p>
                    </div>

                    <div className="p-10">
                        <p className="text-slate-500 text-center mb-8 text-sm leading-relaxed font-medium">
                            Crea una nueva contraseña segura para recuperar el acceso a tu cuenta.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Campo: Nueva Contraseña */}
                            <div className="group">
                                <label className="block text-[0.7rem] font-black text-brand-muted uppercase tracking-[0.15em] mb-2 ml-1 group-focus-within:text-brand-accent transition-colors">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-border-soft rounded-2xl focus:ring-0 focus:border-brand-accent outline-none transition-all placeholder:text-slate-300 text-brand-body font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Campo: Confirmar Contraseña */}
                            <div className="group">
                                <label className="block text-[0.7rem] font-black text-brand-muted uppercase tracking-[0.15em] mb-2 ml-1 group-focus-within:text-brand-accent transition-colors">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full px-5 py-4 bg-brand-bg border-2 border-brand-border-soft rounded-2xl focus:ring-0 focus:border-brand-accent outline-none transition-all placeholder:text-slate-300 text-brand-body font-medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Botón de Acción */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-black py-4 rounded-2xl transition-all shadow-accent-lift active:scale-[0.97] uppercase tracking-widest text-sm mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </span>
                                ) : (
                                    'ACTUALIZAR CONTRASEÑA'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                            <Link
                                to="/login"
                                className="text-brand-muted hover:text-brand-primary font-bold text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                Volver al Inicio
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Decorativo */}
                <p className="text-center text-stone-500 text-[10px] mt-10 font-bold uppercase tracking-[0.2em] opacity-75">
                    Imperio 7 © 2026 · Sports Management System
                </p>
            </div>
        </div>
    );
};