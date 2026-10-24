import React, { useState } from 'react';
import { Sparkles, BellOff } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';

// Saludo, campana de alertas y avatar (movido tal cual desde DashboardEstudiante).
const DashboardHeader = ({ firstName, notifications, unreadCount, onMarkAsRead }) => {
  const [showNotifList, setShowNotifList] = useState(false);
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <header className="flex justify-between items-center mb-6 mt-2 relative">
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-brand-primary tracking-tighter uppercase italic leading-none">
          Hola, <span className="text-brand-accent">{firstName}</span> 👋
        </h1>
        <p className="text-[9px] md:text-xs text-brand-muted font-black mt-2 italic uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles size={12} className="text-brand-accent" /> ¡Bienvenido al Club!
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <NotificationBell count={unreadCount} onClick={() => setShowNotifList(!showNotifList)} />
          {showNotifList && (
            <div className="absolute right-0 top-14 w-[280px] md:w-96 bg-brand-surface rounded-[2rem] shadow-2xl border border-brand-border-soft z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-brand-bg/80">
                <h3 className="font-black text-brand-primary text-[10px] uppercase italic tracking-widest">Alertas</h3>
                {unreadCount > 0 && <span className="text-[8px] bg-brand-accent/20 text-brand-accent-dark px-2 py-0.5 rounded-full font-black tracking-widest border border-brand-accent/30">{unreadCount} NUEVAS</span>}
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="flex flex-col">
                    {notifications.filter((n) => !n.leido).map((n) => (
                      <div key={n.id} className="p-4 border-b border-slate-50 bg-brand-surface" onClick={() => onMarkAsRead(n.id)}>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full mt-1 shrink-0 bg-brand-accent animate-pulse shadow-accent-dot-sm" />
                          <div>
                            <h4 className="font-black text-brand-primary text-[11px] uppercase tracking-tight leading-none mb-1">{n.titulo}</h4>
                            <p className="text-[10px] text-slate-600 font-medium leading-snug">{n.mensaje}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-2">
                    <BellOff size={24} className="text-slate-300" />
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest italic">Sin notificaciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-[1rem] flex items-center justify-center text-brand-accent font-black border-2 border-brand-accent/40 shadow-lg text-lg">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
