import React from 'react';
import { Calendar, ArrowRight, Zap, Star, Info, X } from 'lucide-react';

const EnrollmentDateModal = ({ isOpen, onClose, previewData, onConfirm }) => {
  if (!isOpen || !previewData) return null;

  const formatDateDetail = (dateStr) => {
    const date = new Date(dateStr);
    return {
      full: dateStr,
      num: date.toLocaleDateString('es-PE', { day: '2-digit' }),
      mes: date.toLocaleDateString('es-PE', { month: 'short' }).replace('.', '').toUpperCase(),
      diaNom: date.toLocaleDateString('es-PE', { weekday: 'long' }).toUpperCase(),
    };
  };

  return (
    /* Cambiamos items-end por items-center y p-4 para que flote */
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0f172a]/80 backdrop-blur-md animate-fade-in p-6">
      
      {/* Overlay para cerrar al hacer clic fuera */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Caja del Modal: Más angosta y centrada */}
      <div className="bg-white w-full max-w-[380px] rounded-[2.5rem] relative z-10 animate-fade-in-up flex flex-col max-h-[80vh] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-white">
        
        {/* Botón de cerrar rápido arriba */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* HEADER COMPACTO */}
        <div className="p-6 pb-2 text-center">
          <div className="bg-orange-50 text-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar size={20} />
          </div>
          <h2 className="text-xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">¿Qué día inicias?</h2>
          <div className="mt-3 bg-blue-50 py-2 px-4 rounded-xl flex items-center gap-2 border border-blue-100 mx-2">
             <Info size={12} className="text-blue-600 shrink-0" />
             <p className="text-blue-700 font-bold text-[8px] uppercase tracking-tight text-left italic">El ciclo de 30 días inicia en la fecha elegida.</p>
          </div>
        </div>

        {/* CUERPO CON SCROLL */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-hide">
          
          {/* SECCIÓN 1 */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Zap size={12} className="text-orange-500" fill="currentColor" /> Inicio Inmediato
            </p>
            <div className="space-y-2">
              {previewData.map(grupo => grupo[0]).map((fecha, idx) => {
                const f = formatDateDetail(fecha);
                return (
                  <button
                    key={`now-${idx}`}
                    onClick={() => onConfirm(f.full)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-orange-50 border-2 border-slate-100 hover:border-orange-500 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#1e3a8a] text-white w-10 h-10 rounded-xl flex flex-col items-center justify-center shadow-md">
                        <span className="text-sm font-black leading-none">{f.num}</span>
                        <span className="text-[7px] font-bold uppercase">{f.mes}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-[#1e3a8a] italic uppercase leading-none">{f.diaNom}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Esta semana</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-orange-500" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 2 */}
          <div className="pb-4">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <Star size={12} className="text-blue-500" fill="currentColor" /> Próximo Turno
            </p>
            <div className="space-y-2">
              {previewData.map(grupo => grupo[1]).map((fecha, idx) => {
                const f = formatDateDetail(fecha);
                return (
                  <button
                    key={`next-${idx}`}
                    onClick={() => onConfirm(f.full)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 border-2 border-slate-100 hover:border-blue-400 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-200 text-slate-500 w-10 h-10 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-sm font-black leading-none">{f.num}</span>
                        <span className="text-[7px] font-bold uppercase">{f.mes}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-600 italic uppercase leading-none">{f.diaNom}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Siguiente semana</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER DISCRETO */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="w-full py-3 text-slate-400 font-black uppercase italic text-[9px] tracking-widest hover:text-red-500 transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentDateModal;