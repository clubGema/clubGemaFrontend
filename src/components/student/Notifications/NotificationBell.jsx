import React from "react";
import { Bell } from "lucide-react";

const NotificationBell = ({ count, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="relative p-2.5 md:p-3 bg-brand-surface rounded-2xl border border-brand-border shadow-sm hover:bg-brand-bg transition-all group focus:outline-none focus:ring-2 focus:ring-brand-accent"
      aria-label="Notificaciones"
    >
      <Bell size={22} className="text-brand-primary group-hover:rotate-12 transition-transform" />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white ring-2 ring-white animate-bounce shadow-sm">
          {count > 9 ? '+9' : count}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;