import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CreditCard, User, LogOut, Activity, Ticket,
  ChevronDown, LayoutDashboard, Megaphone, UserPlus, Calendar, Star, Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../interceptors/api";
import Cookies from "js-cookie";
import { API_ROUTES } from "../../constants/apiRoutes";
import { THEME_ASSETS } from "../../config/themeAssets.js";

const StudentSidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const [hasNewNews, setHasNewNews] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const [openMenus, setOpenMenus] = useState({
    'Salud y Rendimiento': false,
    'Administración': false
  });

  const showTooltip = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTooltip({
      title: item.title ?? item.label,
      icon: item.icon,
      description: item.description,
      top: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setHoveredTooltip(null);
  };

  useEffect(() => {
    const checkNewsAlert = async () => {
      try {
        const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const newestId = String(result.data[0].id);
          const viewedId = Cookies.get('last_viewed_news');

          if (viewedId !== newestId) {
            setHasNewNews(true);
          }
        }
      } catch (e) {
        console.error("Error al verificar notificaciones:", e);
      }
    };

    checkNewsAlert();

    const handleNewsRead = () => setHasNewNews(false);
    window.addEventListener('news_read', handleNewsRead);

    return () => window.removeEventListener('news_read', handleNewsRead);
  }, []);

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const menuGroups = [
    {
      title: "Inicio",
      description: "Resumen de tu servicio contratado, próximas clases y accesos rápidos.",
      type: "link",
      icon: LayoutDashboard,
      path: "/dashboard/student"
    },
    {
      title: "Mis Inscripciones",
      description: "Consulta tus días de asistencia por semana (en paquetes o clases individuales) y revisa tu historial para reinscribirte rápidamente.",
      type: "link",
      icon: Calendar,
      path: "/dashboard/student/myRegistrations"
    },
    {
      title: "Muro de Noticias",
      description: "Novedades, eventos y anuncios oficiales publicados por la academia.",
      type: "link",
      icon: Megaphone,
      path: "/dashboard/student/news",
      hasAlert: hasNewNews
    },
    {
      title: "Club Merch",
      description: "Catálogo exclusivo de indumentaria, accesorios deportivos y coleccionables oficiales GEMA.",
      type: "link",
      icon: Star,
      path: "/dashboard/student/merch",
      gold: true
    },
    {
      title: "Salud y Rendimiento",
      type: "dropdown",
      items: [
        {
          icon: Activity,
          label: "Mis Lesiones",
          description: "Registra lesiones médicas para activar la cláusula de suspensión y posterior recuperación de tus clases.",
          path: "/dashboard/student/injuries"
        },
        {
          icon: Ticket,
          label: "Mis Recuperaciones",
          description: "Revisa tus clases pendientes y agenda reprogramaciones por faltas justificadas o motivos de salud.",
          path: "/dashboard/student/recoveries"
        },
      ]
    },
    {
      title: "Administración",
      type: "dropdown",
      items: [
        {
          icon: CreditCard,
          label: "Mis Pagos",
          description: "Historial completo de pagos realizados, estado de tus deudas y registro de comprobantes.",
          path: "/dashboard/student/payments"
        },
        {
          icon: User,
          label: "Mi Perfil",
          description: "Consulta y edita tus datos personales, información médica y credenciales de acceso.",
          path: "/dashboard/student/profile"
        },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-brand-primary to-brand-primary-dark text-white h-screen fixed left-0 top-0 z-40 border-r border-white/10 shadow-2xl overflow-hidden">

        {/* HEADER LOGO */}
        <div className="flex-none pt-8 pb-6 px-4 flex flex-col items-center bg-white/5 relative">
          <div className="relative z-10 w-[160px] aspect-square bg-brand-surface rounded-full p-3 shadow-2xl flex items-center justify-center border-[6px] border-white/10 overflow-hidden mb-4 hover:border-brand-accent/20 transition-colors">
            <Link to="/" className="relative z-10 hover:scale-105 transition-transform duration-300">
              <img src={THEME_ASSETS.logoFramed} alt="Logo Club Gema" className="w-full h-full object-cover" />
            </Link>
          </div>
          <div className="text-center">
            <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
              Gema<span className="text-brand-accent">Student</span>
            </span>
          </div>
        </div>

        {/* 🌟 BOTÓN DE ACCIÓN PRINCIPAL (SÚPER VISTOSO: PRIMERA VEZ O RE-INSCRIPCIÓN) */}
        <div className="px-4 pb-6 pt-3 border-b border-white/10 relative z-20">
          <Link
            to="/dashboard/student/enrollment"
            onMouseEnter={(e) => showTooltip(e, {
              title: "Matrícula Gema",
              icon: UserPlus,
              description: "Inscríbete por primera vez a la academia o adquiere y renueva un nuevo paquete de clases.",
            })}
            onMouseLeave={hideTooltip}
            className="group relative w-full flex flex-col items-center justify-center py-3.5 px-3 bg-gradient-to-r from-amber-500 via-brand-accent to-orange-600 text-white rounded-2xl shadow-[0_4px_25px_rgba(249,115,22,0.45)] hover:shadow-[0_4px_35px_rgba(249,115,22,0.7)] hover:scale-[1.02] active:scale-95 transition-all duration-300 border-2 border-white/30 overflow-hidden"
          >
            {/* Efecto de brillo interior animado */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent ease-in-out"></div>
            
            {/* Badge superior distintivo */}
            <span className="relative z-10 px-2.5 py-0.5 rounded-full bg-black/30 text-[8.5px] font-black uppercase tracking-widest text-amber-200 border border-amber-300/30 mb-1 flex items-center gap-1">
              <Sparkles size={10} className="animate-pulse" />
              <span>Primera vez o Renovar</span>
            </span>

            {/* Texto principal */}
            <div className="relative z-10 flex items-center gap-2">
              <UserPlus size={18} className="group-hover:rotate-6 transition-transform text-white" />
              <span className="text-[13px] font-black uppercase tracking-wider italic leading-none">
                Matricúlate Aquí
              </span>
            </div>
            
            {/* Subtítulo explicativo */}
            <span className="relative z-10 text-[9px] font-bold text-orange-100 uppercase tracking-widest mt-1">
              Inscríbete a tus clases
            </span>
          </Link>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
          <p className="px-4 text-[9px] font-black text-blue-300/40 uppercase tracking-[0.3em] mb-3">
            Menú Principal
          </p>

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.type === 'link' ? (
                <Link
                  to={group.path}
                  onMouseEnter={(e) => showTooltip(e, group)}
                  onMouseLeave={hideTooltip}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group/link ${group.gold
                    ? `bg-gold-premium text-brand-primary-dark border border-gold-premium-end shadow-gold-glow hover:shadow-gold-glow-hover hover:brightness-110 ${location.pathname === group.path ? 'ring-2 ring-white/70' : ''}`
                    : location.pathname === group.path
                      ? 'bg-blue-500/20 text-white shadow-inner border border-blue-400/20'
                      : 'text-blue-100/60 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <group.icon size={18} className={group.gold ? 'text-brand-primary-dark' : location.pathname === group.path ? 'text-blue-400' : 'group-hover/link:text-orange-400 transition-colors'} />
                    <span className="text-[12px] font-bold uppercase tracking-wider">{group.title}</span>
                  </div>

                  {group.hasAlert && (
                    <div className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-accent shadow-accent-dot"></span>
                    </div>
                  )}
                </Link>
              ) : (
                <div className="space-y-1 mt-2">
                  <button
                    onClick={() => toggleMenu(group.title)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-blue-100/40 hover:bg-white/5 hover:text-blue-100/80 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">{group.title}</span>
                    <ChevronDown size={14} className={`transition-transform duration-300 ${openMenus[group.title] ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openMenus[group.title] ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-4 space-y-1 mt-1 border-l-2 border-white/5 ml-4">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onMouseEnter={(e) => showTooltip(e, item)}
                            onMouseLeave={hideTooltip}
                            className={`flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-wide ${isActive
                              ? 'text-orange-400 bg-orange-400/10'
                              : 'text-blue-100/50 hover:text-white hover:bg-white/5'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={14} />
                              <span>{item.label}</span>
                            </div>
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
          <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500 hover:text-white transition-all font-black text-[11px] uppercase tracking-widest active:scale-95 cursor-pointer">
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 💡 TOOLTIP FLOTANTE INTELIGENTE (VISIBLE EN HOVER) */}
      {hoveredTooltip && (
        <div
          style={{ top: `${hoveredTooltip.top}px` }}
          className="hidden md:block fixed left-[268px] -translate-y-1/2 z-[100] w-72 pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          <div className="relative bg-slate-900/95 backdrop-blur-md border border-white/20 text-white p-3.5 rounded-2xl shadow-2xl">
            {/* Puntero que apunta a la opción correspondiente */}
            <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 border-l border-b border-white/20 -rotate-45"></div>

            <div className="flex items-center gap-2 mb-1.5">
              {hoveredTooltip.icon && <hoveredTooltip.icon size={15} className="text-orange-400 shrink-0" />}
              <h4 className="text-xs font-black uppercase tracking-wider text-white italic">
                {hoveredTooltip.title}
              </h4>
            </div>
            <p className="text-[11px] font-medium text-slate-300 leading-snug">
              {hoveredTooltip.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentSidebar;