import { useState } from 'react';
import apiFetch from '../interceptors/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { API_ROUTES } from '../constants/apiRoutes';

export const ForgotPassword = () => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await apiFetch.post(API_ROUTES.AUTH.FORGOT_PASSWORD, { username });

            if (response.ok) {
                toast.success("Si el usuario existe y tiene un correo, se ha enviado un enlace.");
                setUsername('');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || "Error al solicitar recuperación");
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            toast.error("Error de conexión con el servidor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        /* Fondo Oscuro con degradado radial sutil */
        <div className="min-h-screen flex items-center justify-center bg-[#0a192f] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#112240] via-[#0a192f] to-[#020c1b] px-4">
            <div className="max-w-md w-full">

                {/* Card Principal */}
                <div className="bg-brand-surface rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">

                    {/* Encabezado con Degradado Estilo Club Gema */}
                    <div className="bg-gradient-to-br from-brand-primary to-blue-800 p-10 text-center relative overflow-hidden">
                        {/* Círculos decorativos de fondo */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-brand-accent/10 rounded-full"></div>

                        <h1 className="text-3xl font-black text-white tracking-tight uppercase italic relative z-10">
                            GEMA<span className="text-brand-accent not-italic">CLUB</span>
                        </h1>
                        <div className="h-1.5 w-14 bg-brand-accent mx-auto mt-3 rounded-full relative z-10"></div>
                        <p className="text-blue-100 mt-5 text-sm font-semibold tracking-wide relative z-10 uppercase">
                            Recuperación de Cuenta
                        </p>
                    </div>

                    <div className="p-8 md:p-10 space-y-6">
                        {/* Nota amigable */}
                        <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-left space-y-1.5">
                            <p className="text-xs font-black text-blue-950 uppercase tracking-wide">
                                📩 Revisa primero tu correo
                            </p>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Recuerda que tus credenciales de bienvenida fueron enviadas a tu correo al registrarte. Revisa tu bandeja de entrada o <b>Spam / No deseados</b>.
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium pt-1 border-t border-blue-100">
                                💡 <b>Nota:</b> Si te registraron presencialmente en sede, tu contraseña es tu mismo <b>nombre de usuario</b>.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="group text-left">
                                <label className="block text-[0.7rem] font-black text-brand-muted uppercase tracking-[0.15em] mb-2 ml-1 group-focus-within:text-blue-600 transition-colors">
                                    Nombre de Usuario
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Ej: usuario.gema"
                                        className="w-full px-4 py-3.5 bg-brand-bg border-2 border-brand-border-soft rounded-2xl focus:border-brand-accent outline-none transition-all placeholder:text-slate-300 text-brand-body text-sm font-semibold"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-black py-4 rounded-2xl transition-all shadow-accent-lift active:scale-[0.97] uppercase tracking-widest text-xs ${isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : (
                                    'Enviar Enlace de Restauración'
                                )}
                            </button>
                        </form>

                        {/* Banner de Soporte */}
                        <div className="p-4 rounded-2xl bg-brand-primary-dark text-white text-left space-y-2 border border-white/10 shadow-md">
                            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest block">
                                ¿Perdiste acceso a tu correo?
                            </span>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">
                                Si no tienes acceso a tu correo registrado, comunícate directamente con nuestro equipo de soporte para ayudarte.
                            </p>
                            <a
                                href="https://wa.me/51999888777?text=Hola%20Club%20Gema,%20necesito%20ayuda%20para%20recuperar%20el%20acceso%20a%20mi%20cuenta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full mt-1 px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                            >
                                Contactar Soporte
                            </a>
                        </div>

                        <div className="pt-4 border-t border-brand-border-soft text-center">
                            <Link
                                to="/login"
                                className="text-brand-muted hover:text-brand-primary font-bold text-xs transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span> Volver al Login
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer Decorativo con texto más claro para fondo oscuro */}
                <p className="text-center text-slate-500 text-[10px] mt-10 font-bold uppercase tracking-[0.2em] opacity-60">
                    Club Gema © 2026 · Sports Management System
                </p>
            </div>
        </div>
    );
};