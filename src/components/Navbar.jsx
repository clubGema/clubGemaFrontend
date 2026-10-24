import React, { useState } from 'react';
import { Bell, Menu, X, UserCircle, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { THEME_ASSETS } from "../config/themeAssets.js";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Nosotros', path: '/about' },
    { label: 'Planes', path: '/pricing' },
    { label: 'Blog', path: '/blog' },
  ];

  const currentUser = user?.user || user;
  const firstName = currentUser?.nombres ? currentUser.nombres.split(' ')[0] : null;
  const initial = firstName ? firstName.charAt(0).toUpperCase() : '';

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    switch (currentUser.rol) {
      case 'Alumno':
        return '/dashboard/student';
      case 'Coordinador':
        return '/dashboard//teacher';
      case 'Administrador':
        return '/dashboard//admin';
      default:
        return '/login';
    }
  };

  const targetPath = getDashboardPath();

  return (
    <nav className="bg-brand-surface border-b border-brand-border-soft sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Altura ajustada a h-20 para un look más compacto y moderno */}
        <div className="flex justify-between items-center h-24">

          {/* --- BLOQUE LOGO IMPERIO 7 --- */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <img
                src={THEME_ASSETS.logoFramed}
                alt="Imperio 7 Club Deportivo"
                className="w-14 h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(88,18,32,0.18)] group-hover:scale-105 transition-all duration-300"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black text-brand-primary tracking-tighter uppercase italic leading-none group-hover:text-brand-primary-light transition-colors">
                Imperio<span className="text-brand-accent">7</span>
              </span>
              <span className="text-[8.5px] font-black uppercase tracking-[0.28em] text-brand-accent-dark italic mt-1">
                Club Deportivo
              </span>
            </div>
          </Link>

          {/* Menú Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${location.pathname === link.path
                  ? 'text-brand-accent bg-brand-primary shadow-sm'
                  : 'text-stone-600 hover:text-brand-primary hover:bg-brand-primary-soft'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Acciones Derecha */}
          <div className="hidden md:flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <Link
              to={targetPath}
              className="flex items-center gap-2.5 pl-2 group"
            >
              <div className="text-right hidden lg:block">
                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest leading-none">Mi Portal</p>
                <p className="text-xs font-black text-brand-primary group-hover:text-brand-accent transition-colors mt-0.5">{currentUser ? firstName : 'Ingresar'}</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-brand-bg flex items-center justify-center text-brand-muted group-hover:bg-brand-primary group-hover:text-white transition-all border border-brand-border-soft shadow-sm">
                <UserCircle size={22} />
              </div>
            </Link>
          </div>

          {/* Mobile Hamburguesa */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-brand-primary text-brand-accent shadow-lg shadow-brand-primary/20' : 'bg-brand-surface-alt text-brand-primary'
                }`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Móvil */}
      {isOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-border-soft absolute w-full left-0 shadow-2xl animate-fade-in-down z-50">
          <div className="px-5 py-6 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-brand-primary bg-brand-bg/50 hover:bg-brand-primary-soft transition-all"
              >
                {link.label}
                <ChevronRight size={18} className="text-brand-accent" />
              </Link>
            ))}

            <div className="pt-4 mt-4 border-t border-brand-border-soft">
              <Link
                to={targetPath}
                onClick={() => setIsOpen(false)}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg transition-all
                  ${currentUser
                    ? 'bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-brand-primary/20'
                    : 'bg-brand-primary text-white shadow-brand-primary/20'}`}
              >
                <UserCircle size={20} />
                {currentUser ? 'Ir a mi Portal' : 'Iniciar Sesión'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;