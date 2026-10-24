import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TeacherSidebar from '../components/teacher/TeacherSidebar';
import MobileNavbarTeacher from '../components/MobileNavbarTeacher';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { THEME_ASSETS } from "../config/themeAssets.js";

const TeacherLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    // 1. NORMALIZACIÓN DE DATOS: Acceso seguro al objeto user
    const userData = user?.user || user;

    const displayName = userData?.nombres
        ? `${userData.nombres} ${userData.apellidos}`
        : 'Coordinador Imperio 7';

    const initial = userData?.nombres
        ? userData.nombres.charAt(0).toUpperCase()
        : 'I';

    const userRole = userData?.rol || 'Coordinador';

    return (
        <div className="min-h-screen bg-brand-bg flex overflow-hidden">

            {/* SIDEBAR: Componente fijo a la izquierda */}
            <TeacherSidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* CONTENEDOR PRINCIPAL: 
               - md:ml-64: Crea el espacio exacto para que el Sidebar no tape el contenido en PC.
               - transition-all: Para que el movimiento sea suave si el sidebar cambia.
            */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:ml-64">

                {/* HEADER: Barra superior blanca con sombra suave (oculto en móvil) */}
                <header className="hidden md:flex bg-brand-surface border-b border-brand-primary/10 h-20 items-center justify-between px-4 sm:px-8 z-20 shadow-sm">

                    {/* PERFIL DE USUARIO: Alineado a la derecha */}
                    <div className="flex items-center gap-2 sm:gap-6 ml-auto">
                        <div className="hidden sm:block w-px h-10 bg-slate-200 mx-2"></div>

                        <div className="flex items-center gap-4 group cursor-pointer">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-black text-brand-primary leading-tight uppercase tracking-tight group-hover:text-brand-accent-dark transition-colors">
                                    {displayName}
                                </p>
                                <span className="inline-block px-2 py-0.5 bg-brand-accent-soft text-brand-accent-dark text-[10px] font-black uppercase tracking-widest rounded-md mt-1 border border-brand-accent/20">
                                    {userRole}
                                </span>
                            </div>

                            {/* AVATAR CIRCULAR */}
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark flex items-center justify-center text-white font-black border-2 border-white shadow-lg shadow-brand-primary/20 group-hover:rotate-6 transition-all text-lg">
                                    {initial}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* AREA DE CONTENIDO (OUTLET): Aquí es donde se carga el DashboardTeacher */}
                <main className="flex-1 overflow-y-auto bg-brand-surface-alt p-4 sm:p-6 lg:p-10 pb-24 md:pb-10 relative">

                    {/* MARCA DE AGUA: Logo de fondo sutil */}
                    <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none hidden xl:block">
                        <img src={THEME_ASSETS.logoWatermark} alt="" className="w-96 h-auto rotate-12" />
                    </div>

                    {/* CONTENEDOR DE LA PÁGINA: Centrado y con ancho máximo */}
                    <div className="max-w-7xl mx-auto relative z-10">
                        {/* Las rutas hijas son lazy: este Suspense cubre su descarga. */}
                        <Suspense fallback={<LoadingSpinner />}>
                            <Outlet />
                        </Suspense>
                    </div>
                </main>

                <MobileNavbarTeacher />
            </div>
        </div>
    );
};

export default TeacherLayout;