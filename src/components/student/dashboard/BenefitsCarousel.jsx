import React, { useState, useEffect } from 'react';
import {
  Sparkles, ChevronRight, ChevronLeft, RefreshCcw,
  Users, Gift, HeartPulse, Zap, Star, Trophy,
} from 'lucide-react';

// Convierte el nombre de icono guardado en la DB en el componente visual.
const IconMap = {
  RefreshCcw: <RefreshCcw size={24} />,
  Users: <Users size={24} />,
  HeartPulse: <HeartPulse size={24} />,
  Gift: <Gift size={24} />,
  Sparkles: <Sparkles size={24} />,
  Zap: <Zap size={24} />,
  Star: <Star size={24} />,
  Trophy: <Trophy size={24} />,
};

// Carrusel de beneficios (movido tal cual desde DashboardEstudiante).
const BenefitsCarousel = ({ anuncios = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!anuncios || anuncios.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === anuncios.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [anuncios, currentIndex]);

  if (!anuncios || anuncios.length === 0) return null;

  const item = anuncios[currentIndex];

  return (
    <div className="w-full mb-8">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Gift size={16} className="text-brand-accent" />
        <h2 className="font-black uppercase tracking-widest text-[9px] italic text-slate-500">Beneficios Exclusivos Imperio 7</h2>
      </div>

      <div
        key={item.id}
        className="relative overflow-hidden rounded-[2rem] shadow-xl shadow-brand-primary/10 h-36 md:h-40 border border-white/50 animate-in fade-in slide-in-from-right-4 duration-700"
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradiente} transition-all duration-1000`}></div>

        <div className="relative z-10 p-5 text-white flex flex-col justify-center h-full">
          <div className="flex justify-between items-start w-full">
            <div className="flex-1 pr-4">
              <span className="text-[8px] font-black bg-white/20 px-2 py-1 rounded-md mb-2 inline-block tracking-widest uppercase">
                {item.badge}
              </span>
              <h3 className="text-xl md:text-2xl font-black italic uppercase leading-none mb-1.5 tracking-tighter drop-shadow-md">
                {item.titulo}
              </h3>
              <p className="text-[10px] md:text-xs font-medium opacity-90 leading-snug line-clamp-2">
                {item.descripcion}
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 relative">
              {anuncios.length > 1 && (
                <div className="flex gap-1 mb-2">
                  <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex === 0 ? anuncios.length - 1 : currentIndex - 1); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(currentIndex === anuncios.length - 1 ? 0 : currentIndex + 1); }} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
              <div className="opacity-20 flex justify-end scale-[2.5] origin-right pointer-events-none">
                {IconMap[item.icono] || <Gift size={24} />}
              </div>
            </div>
          </div>
        </div>

        {anuncios.length > 1 && (
          <div className="absolute bottom-0 left-0 h-1 bg-black/20 w-full">
            <div
              key={`progress-${currentIndex}`}
              className="h-full bg-white/60 transition-all ease-linear"
              style={{ animation: 'progress-animation 6000ms linear forwards' }}
            />
          </div>
        )}
      </div>

      <style>{`@keyframes progress-animation { from { width: 0%; } to { width: 100%; } }`}</style>
    </div>
  );
};

export default BenefitsCarousel;
