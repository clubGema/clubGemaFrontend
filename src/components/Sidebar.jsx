import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, GraduationCap, UserCog, CalendarRange,
    Settings, LogOut, MapPin, BarChart3, DollarSign,
    ChevronDown,
    CheckCircle,
    Activity, TicketPercent, Megaphone,Ticket,
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Estado para manejar qué dropdown está abierto
    const [openMenus, setOpenMenus] = useState({
        'Gestión Deportiva': true,
        'Comunidad': false,
        'Administración': false
    });

    const toggleMenu = (title) => {
        setOpenMenus(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada correctamente', { icon: '👋', id: 'logout-toast' });
            navigate('/login');
        } catch (error) {
            toast.error('Error al cerrar sesión');
        }
    };

    const menuGroups = [
        {
            title: 'Principal',
            type: 'link',
            icon: LayoutDashboard,
            path: '/dashboard/admin'
        },
        {
            title: 'Gestión Deportiva',
            type: 'dropdown',
            items: [
                { icon: MapPin, label: 'Sedes y Canchas', path: '/dashboard/admin/locations' },
                { icon: CalendarRange, label: 'Horarios', path: '/dashboard/admin/schedule' },
                { icon: CalendarRange, label: 'Reprogramaciones', path: '/dashboard/admin/reprogramaciones' },
                { icon: BarChart3, label: 'Niveles', path: '/dashboard/admin/levels' },
                { icon: TicketPercent, label: 'Crear Beneficio', path: '/dashboard/admin/CreateBenefits' },
            ]
        },
        {
            title: 'Comunidad',
            type: 'dropdown',
            items: [
                { icon: UserCog, label: 'Coordinadores', path: '/dashboard/admin/teachers' },
                { icon: GraduationCap, label: 'Alumnos', path: '/dashboard/admin/students' },
                { icon: TicketPercent, label: 'Asignar Beneficios', path: '/dashboard/admin/benefits' },
                { icon: Megaphone, label: 'Publicaciones', path: '/dashboard/admin/publications' },
            ]
        },
        {
            title: 'Administración',
            type: 'dropdown',
            items: [
                { icon: DollarSign, label: 'Catálogo de Precios', path: '/dashboard/admin/catalog' },
                { icon: CheckCircle, label: 'Validación de Pagos', path: '/dashboard/admin/payment-validation' },
                { icon: Activity, label: "Control de Lesiones", path: "/dashboard/admin/injuries" },
                { icon: Ticket, label: 'Pases de Invitado', path: '/dashboard/admin/guest-passes' },
                { icon: Settings, label: 'Configuración', path: '/dashboard/admin/settings' },
            ]
        }
    ];

    return (
        <>
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 h-screen 
                bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] text-white 
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:sticky md:top-0 md:translate-x-0 border-r border-white/10
                flex flex-col overflow-hidden shadow-2xl
            `}>

                {/* LOGO */}
                <div className="flex-none py-8 px-6 flex flex-col items-center border-b border-white/10">
                    <div className="relative z-10 w-[180px] aspect-square bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
                        <Link to="/" className="relative z-10">
                            <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
                        </Link>
                    </div>
                    <div className="text-center mt-2">
                        <span className="block font-black text-lg tracking-tighter uppercase italic text-white">
                            Gema<span className="text-orange-500">Admin</span>
                        </span>
                    </div>
                </div>

                {/* NAVEGACIÓN CON DROPDOWNS */}
                <nav className={`
                    flex-1 py-4 px-3 overflow-y-auto space-y-2
                    [&::-webkit-scrollbar]:w-1.5
                    [&::-webkit-scrollbar-thumb]:bg-blue-900/40
                    [&::-webkit-scrollbar-thumb]:rounded-full
                `}>
                    {menuGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            {group.type === 'link' ? (
                                // Renderizado de Link Directo
                                <Link
                                    to={group.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${location.pathname === group.path ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/40' : 'text-blue-100/60 hover:bg-white/5'
                                        }`}
                                >
                                    <group.icon size={18} />
                                    <span className="text-sm font-bold">{group.title}</span>
                                </Link>
                            ) : (
                                // Renderizado de Dropdown
                                <>
                                    <button
                                        onClick={() => toggleMenu(group.title)}
                                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-blue-100/60 hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500/40 group-hover:bg-orange-500 transition-colors"></div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{group.title}</span>
                                        </div>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 ${openMenus[group.title] ? 'rotate-180' : ''}`}
                                        />
                                    </button>

                                    {/* Contenido del Dropdown Animado */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[group.title] ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-4 space-y-1 mt-1 border-l border-white/5 ml-4">
                                            {group.items.map((item) => {
                                                const isActive = location.pathname === item.path;
                                                return (
                                                    <Link
                                                        key={item.path}
                                                        to={item.path}
                                                        onClick={() => onClose && onClose()}
                                                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm ${isActive ? 'text-orange-400 font-bold bg-orange-400/10' : 'text-blue-100/50 hover:text-white'
                                                            }`}
                                                    >
                                                        <item.icon size={16} />
                                                        <span>{item.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </nav>

                {/* FOOTER */}
                <div className="p-4 bg-black/20 border-t border-white/10">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm">
                        <LogOut size={18} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Overlay Móvil */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 md:hidden" onClick={onClose}></div>}
        </>
    );
};

export default Sidebar;