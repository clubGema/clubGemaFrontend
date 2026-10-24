import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, GraduationCap, UserCog, CalendarRange,
    Settings, LogOut, MapPin, BarChart3, DollarSign,
    ChevronDown, History, CheckCircle, Activity,
    TicketPercent, Megaphone, Ticket, ShieldAlert, Sparkles, Layers, Gift, PackageCheck
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';
import { THEME_ASSETS } from "../config/themeAssets.js";

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Estado inicial de los menús (Operaciones abierto por defecto)
    const [openMenus, setOpenMenus] = useState({
        'Operaciones': true,
        'Academia': false,
        'Marketing & Retención': false,
        'Sistema & Soporte': false
    });

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
    };

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada correctamente', { icon: '👋' });
            navigate('/login');
        } catch (error) {
            console.error('Error en handleLogout:', error);
            toast.error('Error al cerrar sesión');
        }
    };

    // 🚀 NUEVA ORGANIZACIÓN LÓGICA PARA EL ADMIN
    const menuGroups = [
        {
            title: 'Principal',
            type: 'link',
            icon: LayoutDashboard,
            path: '/dashboard/admin'
        },
        {
            title: 'Operaciones',
            type: 'dropdown',
            items: [
                { icon: GraduationCap, label: 'Alumnos', path: '/dashboard/admin/students' },
                { icon: Ticket, label: 'Asignar Clase Individual', path: '/dashboard/admin/clases-individuales' },
                { icon: UserCog, label: 'Coordinadores', path: '/dashboard/admin/teachers' },
                { icon: CheckCircle, label: 'Validar Pagos', path: '/dashboard/admin/payment-validation' },
                { icon: DollarSign, label: 'Balance', path: '/dashboard/admin/cash-flow' },
                { icon: PackageCheck, label: 'Entregas Merch', path: '/dashboard/admin/entregas-merch' },
            ]
        },
        {
            title: 'Academia',
            type: 'dropdown',
            items: [
                { icon: CalendarRange, label: 'Horarios Base', path: '/dashboard/admin/schedule' },
                { icon: Layers, label: 'Reprogramaciones', path: '/dashboard/admin/reprogramaciones' },
                { icon: MapPin, label: 'Sedes y Canchas', path: '/dashboard/admin/locations' },
                { icon: BarChart3, label: 'Niveles', path: '/dashboard/admin/levels' },
                { icon: Gift, label: 'Gestión Merch', path: '/dashboard/admin/merch' },
            ]
        },
        {
            title: 'Marketing & Retención',
            type: 'dropdown',
            items: [
                { icon: Megaphone, label: 'Publicaciones (Muro)', path: '/dashboard/admin/publications' },
                { icon: Sparkles, label: 'Anuncios Carrusel', path: '/dashboard/admin/anuncios-beneficios' },
                { icon: TicketPercent, label: 'Crear Descuentos', path: '/dashboard/admin/CreateBenefits' },
                { icon: TicketPercent, label: 'Asignar Descuentos', path: '/dashboard/admin/benefits' },
                { icon: Ticket, label: 'Clases Únicas', path: '/dashboard/admin/guest-passes' },
            ]
        },
        {
            title: 'Sistema & Soporte',
            type: 'dropdown',
            items: [
                { icon: Activity, label: "Control de Lesiones", path: "/dashboard/admin/injuries" },
                { icon: History, label: 'Depurar Recuperaciones', path: '/dashboard/admin/delete-makeups' },
                { icon: DollarSign, label: 'Catálogo de Precios', path: '/dashboard/admin/catalog' },
                { icon: Settings, label: 'Configuración', path: '/dashboard/admin/settings' },
            ]
        }
    ];

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 h-screen 
                bg-gradient-to-b from-[#3D0A14] via-[#1A050A] to-[#0A0204] text-white 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:sticky md:top-0 md:translate-x-0 border-r border-[#D4AF37]/20
                flex flex-col overflow-hidden shadow-2xl
            `}>

                {/* 🌟 LOGO CIRCULAR (Estilo Premium) */}
                <div className="flex-none pt-8 pb-6 px-4 flex flex-col items-center bg-white/5 relative">
                    <div className="relative z-10 w-[140px] aspect-square bg-brand-surface rounded-full p-2.5 shadow-2xl flex items-center justify-center border-[4px] border-brand-accent/40 overflow-hidden mb-3 hover:border-brand-accent transition-colors">
                        <Link to="/" className="relative z-10 hover:scale-105 transition-transform duration-300">
                            <img src={THEME_ASSETS.logoFramed} alt="Logo Imperio 7" className="w-full h-full object-cover" />
                        </Link>
                    </div>
                    <div className="text-center">
                        <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
                            Imperio<span className="text-brand-accent">7</span>
                        </span>
                        <span className="text-[8.5px] font-black uppercase tracking-[0.3em] text-[#F5D77F] italic mt-1 block">
                            Panel Administrativo
                        </span>
                    </div>
                </div>

                {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL (El "Botón del Dinero") */}
                <div className="px-5 pb-6 pt-4 border-b border-white/10 relative z-20">
                    <Link
                        to="/dashboard/admin/payment-validation"
                        className="group relative w-full flex items-center justify-center gap-3 py-3.5 bg-gradient-to-r from-brand-accent to-brand-accent-dark text-white rounded-xl shadow-accent-glow hover:shadow-accent-glow-hover transition-all duration-300 active:scale-95 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                        <CheckCircle size={18} className="relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10 text-[12px] font-black uppercase tracking-widest italic">Validar Pagos</span>
                    </Link>
                </div>

                {/* NAVEGACIÓN CON DROPDOWNS */}
                <nav className={`
                    flex-1 py-4 px-3 overflow-y-auto space-y-1
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                `}>
                    <p className="px-4 text-[9px] font-black text-amber-200/40 uppercase tracking-[0.3em] mb-3">Panel de Control</p>

                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            {group.type === 'link' ? (
                                <Link
                                    to={group.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group/link ${location.pathname === group.path ? 'bg-brand-accent/20 text-white shadow-inner border border-brand-accent/30' : 'text-stone-300/70 hover:bg-white/5 hover:text-white'}`}
                                >
                                    <group.icon size={18} className={location.pathname === group.path ? 'text-brand-accent' : 'group-hover/link:text-brand-accent transition-colors'} />
                                    <span className="text-[12px] font-bold uppercase tracking-wider">{group.title}</span>
                                </Link>
                            ) : (
                                <div className="space-y-1 mt-2">
                                    <button
                                        onClick={() => toggleMenu(group.title)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-stone-300/50 hover:bg-white/5 hover:text-stone-200 transition-all group"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-widest">{group.title}</span>
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[group.title] ? 'rotate-180' : ''}`} />
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[group.title] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-4 space-y-1 mt-1 border-l-2 border-white/5 ml-4">
                                            {group.items.map((item) => {
                                                const isActive = location.pathname === item.path;
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={() => onClose && onClose()}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-amber-300 bg-amber-400/15 font-black' : 'text-stone-300/60 hover:text-white hover:bg-white/5'}`}
                                                    >
                                                        <item.icon size={14} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                {/* FOOTER */}
                <div className="flex-none p-4 bg-black/20 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest active:scale-95">
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay Móvil */}
            {isOpen && <div className="fixed inset-0 bg-brand-primary-dark/60 backdrop-blur-sm z-30 md:hidden" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;