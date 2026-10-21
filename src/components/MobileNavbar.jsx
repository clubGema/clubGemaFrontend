import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, CreditCard, User, 
  Menu, X, Activity, Ticket, LogOut, 
  Megaphone, UserPlus, Calendar, Star, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";
import Cookies from "js-cookie";
import { THEME_ASSETS } from "../config/themeAssets.js";

const MobileNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasNewNews, setHasNewNews] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Sincronización de Alerta de Noticias
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
      <div className={`fixed inset-0 z-nav transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Fondo oscuro borroso */}
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        ></div>
        
        {/* Contenedor del Menú */}
        <div className={`absolute right-0 top-0 h-full w-[310px] max-w-[88vw] bg-gradient-to-b from-brand-primary to-brand-primary-dark shadow-2xl transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col h-full">
            
            {/* Botón Cerrar (X) */}
            <button onClick={toggleMenu} className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 p-2 rounded-full cursor-pointer">
              <X size={20} />
            </button>

            {/* HEADER CON LOGO CIRCULAR */}
            <div className="flex-none pt-12 pb-6 px-4 flex flex-col items-center border-b border-white/10 bg-white/5">
              <div className="relative z-10 w-[120px] aspect-square bg-brand-surface rounded-full p-2.5 shadow-2xl flex items-center justify-center border-[4px] border-white/10 overflow-hidden mb-3">
                <Link to="/" onClick={toggleMenu}>
                  <img src={THEME_ASSETS.logoFramed} alt="Logo Club Gema" className="w-full h-full object-cover" />
                </Link>
              </div>
              <div className="text-center">
                <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
                  Gema<span className="text-brand-accent">Student</span>
                </span>
              </div>
            </div>

            {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL DENTRO DEL MENÚ */}
            <div className="px-4 pb-5 pt-4 border-b border-white/10">
              <Link 
                to="/dashboard/student/enrollment" 
                onClick={toggleMenu}
                className="group relative w-full flex flex-col items-center justify-center py-3.5 px-3 bg-gradient-to-r from-amber-500 via-brand-accent to-orange-600 text-white rounded-2xl shadow-[0_4px_25px_rgba(249,115,22,0.45)] hover:shadow-[0_4px_35px_rgba(249,115,22,0.7)] active:scale-95 transition-all border-2 border-white/30 overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent ease-in-out"></div>
                
                <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-black/30 text-[8.5px] font-black uppercase tracking-widest text-amber-200 border border-amber-300/30 mb-1 flex items-center gap-1">
                  <Sparkles size={10} className="animate-pulse" />
                  <span>Primera vez o Renovar</span>
                </span>
                <div className="relative z-10 flex items-center gap-2">
                  <UserPlus size={18} className="text-white" />
                  <span className="text-[13px] font-black uppercase tracking-wider italic leading-none">Matricúlate Aquí</span>
                </div>
                <span className="relative z-10 text-[9px] font-bold text-orange-100 uppercase tracking-widest mt-1">
                  Inscríbete a tus clases
                </span>
              </Link>
            </div>

            {/* NAVEGACIÓN EXTENDIDA CON DESCRIPCIONES */}
            <nav className="flex-1 px-3 py-5 space-y-5 overflow-y-auto [scrollbar-width:none]">
              
              {/* Grupo Principal */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-2">Principal</p>
                
                <NavLink 
                  to="/dashboard/student" 
                  end 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-500/20 text-white border border-blue-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                    <LayoutDashboard size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Inicio</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Resumen de tu servicio, próximas clases y accesos rápidos.
                    </span>
                  </div>
                </NavLink>

                <NavLink 
                  to="/dashboard/student/myRegistrations" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-500/20 text-white border border-blue-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                    <Calendar size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Mis Inscripciones</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Días de asistencia e historial de planes para reinscribirte rápido.
                    </span>
                  </div>
                </NavLink>
                
                <NavLink 
                  to="/dashboard/student/news" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start justify-between gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-500/20 text-white border border-blue-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                      <Megaphone size={17} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <span className="block font-black text-[12px] uppercase tracking-wide text-white">Muro de Noticias</span>
                      <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                        Novedades, eventos y anuncios oficiales de la academia.
                      </span>
                    </div>
                  </div>
                  {hasNewNews && (
                    <div className="relative flex h-2.5 w-2.5 mt-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent shadow-accent-dot"></span>
                    </div>
                  )}
                </NavLink>

                <NavLink 
                  to="/dashboard/student/merch" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl bg-gold-premium text-brand-primary-dark border border-gold-premium-end shadow-gold-glow hover:brightness-110 transition-all ${
                    isActive ? 'ring-2 ring-white/70' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-black/10 flex items-center justify-center shrink-0 mt-0.5 text-brand-primary-dark">
                    <Star size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-brand-primary-dark">Club Merch</span>
                    <span className="block text-[10px] font-bold text-brand-primary-dark/80 leading-tight">
                      Indumentaria, accesorios y coleccionables oficiales GEMA.
                    </span>
                  </div>
                </NavLink>
              </div>

              {/* Grupo Rendimiento */}
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-2">Salud y Rendimiento</p>
                
                <NavLink 
                  to="/dashboard/student/injuries" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5 text-orange-400">
                    <Activity size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Mis Lesiones</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Registro de lesiones para activar suspensión y recuperación médica.
                    </span>
                  </div>
                </NavLink>

                <NavLink 
                  to="/dashboard/student/recoveries" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5 text-orange-400">
                    <Ticket size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Mis Recuperaciones</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Revisa clases pendientes y agenda reprogramaciones por faltas o salud.
                    </span>
                  </div>
                </NavLink>
              </div>

              {/* Grupo Administración */}
              <div className="space-y-1.5 pb-4">
                <p className="text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] ml-2 mb-2">Administración</p>
                
                <NavLink 
                  to="/dashboard/student/payments" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-500/20 text-white border border-blue-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                    <CreditCard size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Mis Pagos</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Historial de pagos, estado de tus deudas y comprobantes.
                    </span>
                  </div>
                </NavLink>

                <NavLink 
                  to="/dashboard/student/profile" 
                  onClick={toggleMenu} 
                  className={({ isActive }) => `flex items-start gap-3 py-2.5 px-3 rounded-2xl transition-all ${
                    isActive ? 'bg-blue-500/20 text-white border border-blue-400/30' : 'text-blue-100/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5 text-blue-400">
                    <User size={17} />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="block font-black text-[12px] uppercase tracking-wide text-white">Mi Perfil</span>
                    <span className="block text-[10px] font-medium text-blue-200/60 leading-tight">
                      Consulta y edita tus datos personales y credenciales de acceso.
                    </span>
                  </div>
                </NavLink>
              </div>
            </nav>

            {/* FOOTER: CERRAR SESIÓN */}
            <div className="flex-none p-4 bg-black/20 border-t border-white/10">
              <button onClick={logout} className="w-full flex items-center justify-center gap-3 py-3 text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-black uppercase italic text-[11px] tracking-widest cursor-pointer">
                <LogOut size={16}/> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 NAVBAR INFERIOR (Las 4 acciones definitivas) */}
      <nav className="fixed bottom-0 left-0 w-full bg-brand-primary-dark border-t border-white/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 md:hidden transition-all pb-safe">
        <div className="flex justify-around items-end h-[72px] px-2 pb-2">
          
          <NavLink to="/dashboard/student" end className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all ${isActive ? 'text-brand-accent' : 'text-blue-100/50'}`}>
            <LayoutDashboard size={20} className={location.pathname === '/dashboard/student' ? 'animate-bounce-short' : ''} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">Inicio</span>
          </NavLink>

          {/* ACCIÓN CLAVE 1: GESTIÓN DE CLASES */}
          <NavLink to="/dashboard/student/myRegistrations" className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all ${isActive ? 'text-blue-400' : 'text-blue-100/50'}`}>
            <Calendar size={20} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">INSCRIPCIONES</span>
          </NavLink>

          {/* 🌟 ACCIÓN CLAVE 2: NUEVA COMPRA (DESTACADO EN EL CENTRO) */}
          <NavLink to="/dashboard/student/enrollment" className={({ isActive }) => `flex flex-col items-center gap-1.5 w-full transition-all relative top-[-8px] ${isActive ? 'text-orange-400' : 'text-brand-accent'}`}>
            <div className={`p-3 rounded-full shadow-lg ${location.pathname === '/dashboard/student/enrollment' ? 'bg-brand-accent-dark shadow-brand-accent/50' : 'bg-brand-accent shadow-brand-accent/30'}`}>
               <UserPlus size={22} className="text-white" />
            </div>
            <span className="text-[8px] text-brand-accent uppercase font-black italic tracking-widest">Matricular</span>
          </NavLink>

          <button onClick={toggleMenu} className="flex flex-col items-center gap-1.5 w-full text-blue-100/50 relative">
            <Menu size={20} />
            <span className="text-[8px] uppercase font-black italic tracking-widest">Menú</span>
            {hasNewNews && (
              <span className="absolute top-0 right-1/4 flex h-2 w-2 rounded-full bg-brand-accent border border-brand-primary-dark"></span>
            )}
          </button>

        </div>
      </nav>
    </>
  );
};

export default MobileNavbar;