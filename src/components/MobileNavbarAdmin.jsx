import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, CheckCircle, Users, Menu, X, 
  MapPin, CalendarRange, BarChart3, TicketPercent, 
  UserCog, GraduationCap, DollarSign, Activity, Settings, LogOut,
  Megaphone, Ticket
} from 'lucide-react';
import { logoutService } from '../services/auth.service';
import toast from 'react-hot-toast';

const MobileNavbarAdmin = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const handleLogout = async () => {
        try {
            await logoutService();
            toast.success('Sesión cerrada');
            navigate('/login');
        } catch (error) {
            toast.error('Error al salir');
        }
    };

    return (
        <>
            {/* PANEL LATERAL (DRAWER) */}
            <div className={`fixed inset-0 z-[60] ${isMenuOpen ? 'visible' : 'invisible'}`}>
                <div 
                    className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={toggleMenu}
                ></div>
                
                <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] shadow-2xl transition-transform duration-500 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col h-full border-l border-white/10">
                        <div className="p-6 flex justify-between items-center border-b border-white/10 bg-white/5">
                            <span className="font-black text-sm tracking-widest uppercase italic text-white">
                                Gema<span className="text-orange-500">Menu</span>
                            </span>
                            <button onClick={toggleMenu} className="p-2 bg-white/5 rounded-lg text-white/50">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="space-y-1">
                                <p className="px-4 text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] mb-2">Gestión Deportiva</p>
                                <NavLink to="/dashboard/admin/locations" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><MapPin size={18}/> Sedes y Canchas</NavLink>
                                <NavLink to="/dashboard/admin/schedule" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><CalendarRange size={18}/> Horarios</NavLink>
                                <NavLink to="/dashboard/admin/levels" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><BarChart3 size={18}/> Niveles</NavLink>
                                <NavLink to="/dashboard/admin/CreateBenefits" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><TicketPercent size={18}/> Crear Beneficio</NavLink>
                            </div>

                            <div className="space-y-1">
                                <p className="px-4 text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] mb-2">Comunidad</p>
                                <NavLink to="/dashboard/admin/teachers" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><UserCog size={18}/> Profesores</NavLink>
                                <NavLink to="/dashboard/admin/students" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><GraduationCap size={18}/> Alumnos</NavLink>
                                <NavLink to="/dashboard/admin/benefits" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><TicketPercent size={18}/> Lista Beneficios</NavLink>
                                {/* 👇 Enlace a Publicaciones añadido aquí */}
                                <NavLink to="/dashboard/admin/publications" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><Megaphone size={18}/> Publicaciones</NavLink>
                            </div>

                            <div className="space-y-1">
                                <p className="px-4 text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] mb-2">Administración</p>
                                <NavLink to="/dashboard/admin/catalog" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><DollarSign size={18}/> Catálogo Precios</NavLink>
                                <NavLink to="/dashboard/admin/payment-validation" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><CheckCircle size={18}/> Validación de Pagos</NavLink>
                                <NavLink to="/dashboard/admin/injuries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><Activity size={18}/> Control Lesiones</NavLink>
                                <NavLink to="/dashboard/admin/guest-passes" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><Ticket size={18}/> Pases de Invitado</NavLink>
                                <NavLink to="/dashboard/admin/settings" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 px-4 py-3 rounded-xl hover:bg-white/5"><Settings size={18}/> Configuración</NavLink>
                            </div>
                        </div>

                        <div className="p-4 bg-black/20">
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-red-400 bg-red-500/5 border border-red-500/20 font-bold text-sm">
                                <LogOut size={18}/> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* BARRA INFERIOR */}
            <nav className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 md:hidden h-20">
                <div className="flex justify-around items-center h-full max-w-md mx-auto px-4">
                    
                    {/* INICIO */}
                    <NavLink to="/dashboard/admin" end className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500' : 'text-blue-100/40'}`}>
                        {({ isActive }) => (
                            <>
                                <LayoutDashboard size={isActive ? 24 : 22} />
                                <span className="text-[9px] uppercase font-black tracking-tighter">Inicio</span>
                            </>
                        )}
                    </NavLink>

                    {/* PAGOS */}
                    <NavLink to="/dashboard/admin/payment-validation" className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500' : 'text-blue-100/40'}`}>
                        {({ isActive }) => (
                            <>
                                <CheckCircle size={isActive ? 24 : 22} />
                                <span className="text-[9px] uppercase font-black tracking-tighter">Pagos</span>
                            </>
                        )}
                    </NavLink>

                    {/* ALUMNOS */}
                    <NavLink to="/dashboard/admin/students" className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500' : 'text-blue-100/40'}`}>
                        {({ isActive }) => (
                            <>
                                <GraduationCap size={isActive ? 24 : 22} />
                                <span className="text-[9px] uppercase font-black tracking-tighter">Alumnos</span>
                            </>
                        )}
                    </NavLink>

                    {/* MÁS (MENÚ) */}
                    <button onClick={toggleMenu} className="flex flex-col items-center gap-1 w-full text-blue-100/40">
                        <Menu size={22} />
                        <span className="text-[9px] uppercase font-black tracking-tighter">Más</span>
                    </button>

                </div>
            </nav>
        </>
    );
};

export default MobileNavbarAdmin;