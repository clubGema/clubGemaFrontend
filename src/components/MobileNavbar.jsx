import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, User, 
  Menu, X, Activity, Ticket, LogOut, 
  Megaphone, UserPlus, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";
import Cookies from "js-cookie";

const MobileNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Sincronización de Alerta de Noticias (Dashboard -> Móvil)
  useEffect(() => {
    const checkNewsAlert = async () => {
      try {
        const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const newestId = String(result.data[0].id);
          const viewedId = Cookies.get('last_viewed_news');
          if (viewedId !== newestId) setHasNewNews(true);
        }
      } catch (e) {
        console.error("Error al verificar noticias:", e);
      }
    };

    checkNewsAlert();
    const handleNewsRead = () => setHasNewNews(false);
    window.addEventListener('news_read', handleNewsRead);
    return () => window.removeEventListener('news_read', handleNewsRead);
  }, []);

  return (
    <>
      {/* PANEL LATERAL FLOTANTE (MENÚ EXTENDIDO) */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        ></div>
        
        <div className={`absolute right-0 top-0 h-full w-72 bg-[#0f172a] shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            
            {/* HEADER CON LOGO (Sincronizado con Sidebar Desktop) */}
            <div className="flex-none py-8 px-4 flex flex-col items-center border-b border-white/10 bg-white/5">
              <div className="relative z-10 w-32 aspect-square bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
                <Link to="/" onClick={toggleMenu}>
                  <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
                </Link>
              </div>
              <div className="text-center mt-4">
                <span className="block font-black text-lg tracking-tighter uppercase italic text-white leading-none">
                  Gema<span className="text-orange-500">Student</span>
                </span>
              </div>
            </div>

            {/* NAVEGACIÓN EXTENDIDA */}
            <nav className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Grupo Club Gema */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em]">Club Gema</p>
                <NavLink to="/dashboard/student/myRegistrations" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <Home size={18}/> Horarios Actuales
                </NavLink>
                <NavLink to="/dashboard/student/enrollment" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <UserPlus size={18}/> Nueva Inscripción
                </NavLink>
                <NavLink to="/dashboard/student/news" onClick={toggleMenu} className="flex items-center justify-between text-blue-100/70 py-2 font-bold text-sm italic">
                  <div className="flex items-center gap-4">
                    <Megaphone size={18}/> Muro de Noticias
                  </div>
                  {hasNewNews && (
                    <span className="flex h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
                  )}
                </NavLink>
              </div>

              {/* Grupo Rendimiento */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em]">Rendimiento</p>
                <NavLink to="/dashboard/student/injuries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <Activity size={18}/> Mis Lesiones
                </NavLink>
                <NavLink to="/dashboard/student/recoveries" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <Ticket size={18}/> Mis Recuperaciones
                </NavLink>
              </div>

              {/* Grupo Administración */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em]">Administración</p>
                <NavLink to="/dashboard/student/payments" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <CreditCard size={18}/> Mis Pagos
                </NavLink>
                <NavLink to="/dashboard/student/profile" onClick={toggleMenu} className="flex items-center gap-4 text-blue-100/70 py-2 font-bold text-sm italic">
                  <User size={18}/> Mi Perfil
                </NavLink>
              </div>
            </nav>

            {/* FOOTER: CERRAR SESIÓN */}
            <button onClick={logout} className="p-6 flex items-center gap-4 text-red-400 font-black uppercase italic text-xs border-t border-white/10 tracking-widest">
              <LogOut size={18}/> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* NAVBAR INFERIOR (Pestañas principales) */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#0f172a] border-t border-white/10 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-50 md:hidden transition-all">
        <div className="flex justify-around items-center h-20 max-w-md mx-auto">
          
          <NavLink to="/dashboard/student" end className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-blue-100/50'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[8px] uppercase font-black italic tracking-tighter">Inicio</span>
          </NavLink>

          <NavLink to="/dashboard/student/payments" className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-blue-100/50'}`}>
            <CreditCard size={22} />
            <span className="text-[8px] uppercase font-black italic tracking-tighter">Pagos</span>
          </NavLink>

          <NavLink to="/dashboard/student/profile" className={({ isActive }) => `flex flex-col items-center gap-1 w-full transition-all ${isActive ? 'text-orange-500 scale-110' : 'text-blue-100/50'}`}>
            <User size={22} />
            <span className="text-[8px] uppercase font-black italic tracking-tighter">Perfil</span>
          </NavLink>

          <button onClick={toggleMenu} className="flex flex-col items-center gap-1 w-full text-blue-100/50 relative">
            <Menu size={22} />
            <span className="text-[8px] uppercase font-black italic tracking-tighter">Menú</span>
            {hasNewNews && (
              <span className="absolute top-0 right-1/3 flex h-2 w-2 rounded-full bg-orange-500 border border-[#0f172a]"></span>
            )}
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileNavbar;