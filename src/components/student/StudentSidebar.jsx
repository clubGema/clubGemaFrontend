import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home, CreditCard, User, LogOut, Activity, Ticket,
  ChevronDown, LayoutDashboard, Megaphone, UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../interceptors/api";
import Cookies from "js-cookie";
import { API_ROUTES } from "../../constants/apiRoutes";

const StudentSidebar = () => {
  const location = useLocation();
  const { logout, user, login } = useAuth();
  const [hasNewNews, setHasNewNews] = useState(false);

  const userData = user?.user || user || {};

  const [openMenus, setOpenMenus] = useState({
    'Club': true,
    'Salud y Rendimiento': false,
    'Administración': false
  });

  // Lógica para detectar si hay noticias nuevas comparando con localStorage
  useEffect(() => {
    const checkNewsAlert = async () => {
      try {
        const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const newestId = String(result.data[0].id);
          const viewedId = Cookies.get('last_viewed_news');

          // Si el ID más reciente no coincide con el guardado, activamos alerta
          if (viewedId !== newestId) {
            setHasNewNews(true);
          }
        }
      } catch (e) {
        console.error("Error al verificar notificaciones:", e);
      }
    };

    checkNewsAlert();

    // Escuchamos el evento personalizado 'news_read' emitido por StudentNews.jsx
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
      type: "link",
      icon: LayoutDashboard,
      path: "/dashboard/student"
    },
    {
      title: "Club",
      type: "dropdown",
      items: [
        { icon: Home, label: "Mis Inscripciones", path: "/dashboard/student/myRegistrations" },
        { icon: UserPlus, label: "Nueva Inscripción", path: "/dashboard/student/enrollment" },
        {
          icon: Megaphone,
          label: "Muro de Noticias",
          path: "/dashboard/student/news",
          hasAlert: hasNewNews
        },
      ]
    },
    {
      title: "Salud y Rendimiento",
      type: "dropdown",
      items: [
        { icon: Activity, label: "Mis Lesiones", path: "/dashboard/student/injuries" },
        { icon: Ticket, label: "Mis Recuperaciones", path: "/dashboard/student/recoveries" },
      ]
    },
    {
      title: "Administración",
      type: "dropdown",
      items: [
        { icon: CreditCard, label: "Mis Pagos", path: "/dashboard/student/payments" },
        { icon: User, label: "Mi Perfil", path: "/dashboard/student/profile" },
      ]
    }
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#1e3a8a] to-[#0f172a] text-white h-screen fixed left-0 top-0 z-40 border-r border-white/10 shadow-2xl overflow-hidden">

        {/* HEADER LOGO */}
        <div className="flex-none py-8 px-4 flex flex-col items-center border-b border-white/10 bg-white/5">
          <div className="relative z-10 w-[180px] aspect-square bg-white rounded-full p-2 shadow-2xl flex items-center justify-center border-4 border-white/20 overflow-hidden">
            <Link to="/" className="relative z-10">
              <img src="/Logo con borde blanco.png" alt="Logo Club Gema" className="w-full h-full object-cover" />
            </Link>
          </div>
          <div className="text-center mt-5">
            <span className="block font-black text-xl tracking-tighter uppercase italic text-white leading-none">
              Gema<span className="text-orange-500">Student</span>
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden text-left">
          <p className="px-4 text-[10px] font-black text-blue-300/40 uppercase tracking-[0.2em] mb-2">
            Acceso al Portal
          </p>

          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {group.type === 'link' ? (
                <Link
                  to={group.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${location.pathname === group.path
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-blue-100/60 hover:bg-white/5'
                    }`}
                >
                  <group.icon size={18} />
                  <span className="text-sm font-bold">{group.title}</span>
                </Link>
              ) : (
                <div className="space-y-0.5">
                  <button
                    onClick={() => toggleMenu(group.title)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-blue-100/60 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${openMenus[group.title] ? 'bg-orange-500' : 'bg-orange-500/40'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{group.title}</span>
                    </div>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${openMenus[group.title] ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`overflow-hidden transition-all duration-300 ${openMenus[group.title] ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-4 space-y-0.5 mt-0.5 border-l border-white/5 ml-4">
                      {group.items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-2 rounded-xl transition-all text-xs ${isActive
                              ? 'text-orange-400 font-bold bg-orange-400/10'
                              : 'text-blue-100/50 hover:text-white'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon size={14} />
                              <span>{item.label}</span>
                            </div>

                            {/* ALERTA NARANJA CON EFECTO NEÓN */}
                            {item.hasAlert && (
                              <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span>
                              </div>
                            )}
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
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-sm">
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;