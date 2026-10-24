import React from 'react';
import { ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    /* Reducimos la altura mínima y los paddings para compactarlo */
    <div className="relative w-full min-h-[45vh] md:min-h-[50vh] flex items-center bg-brand-primary-dark overflow-hidden py-8 md:py-12">

      {/* 1. IMAGEN DE FONDO CON ILUMINACIÓN ARENA IMPERIAL */}
      <img
        src="/imperio7-arena-bg.jpg"
        alt="Arena Imperio 7"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 select-none"
      />

      {/* 2. OVERLAY (Degradado Imperial Vinotinto a Obsidiana) */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-primary-dark via-brand-primary-dark/90 to-brand-primary-dark/40"></div>

      {/* Decoración: Resplandor de oro imperial */}
      <div className="absolute -right-12 top-0 w-96 h-96 bg-brand-accent/15 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-brand-primary/30 blur-[90px] rounded-full pointer-events-none"></div>

      {/* 3. CONTENIDO */}
      <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex items-center justify-between">

        <div className="max-w-2xl animate-fade-in-up mt-4 md:mt-8">
          
          {/* Badge Distintivo Imperio 7 */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-brand-accent/40 backdrop-blur-md mb-4 shadow-lg shadow-black/50">
            <Trophy size={14} className="text-brand-accent" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-200">
              Club & Academia Imperio 7
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.95] mb-4 uppercase italic tracking-tighter">
            Forja tu grandeza <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDF3C7] via-[#D4AF37] to-[#C49422]">
              domina el juego
            </span>
          </h1>

          <p className="text-base md:text-lg text-stone-300 mb-8 leading-relaxed max-w-lg font-medium">
            Disciplina · Honor · Alto Rendimiento Deportivo
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/register" className="bg-gradient-to-r from-[#BF953F] via-[#D4AF37] to-[#A67C1E] text-brand-primary-dark font-black uppercase tracking-widest px-7 py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xl hover:brightness-110 hover:-translate-y-0.5 active:scale-95 group border border-[#FCF6BA]/60">
              Inscribirme Ahora
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#programacion"
              className="bg-brand-primary/40 hover:bg-brand-primary/80 text-white border border-brand-accent/40 font-black uppercase tracking-widest px-7 py-4 rounded-xl text-xs transition-all backdrop-blur-md flex items-center justify-center gap-2 group cursor-pointer hover:border-brand-accent shadow-lg"
            >
              <Sparkles size={16} className="text-brand-accent" />
              Ver Horarios
            </a>
          </div>

          {/* Texto motivacional */}
          <div className="mt-10 flex items-start gap-4 border-l-2 border-brand-accent/40 pl-6 py-2 bg-white/[0.02] rounded-r-xl">
            <p className="text-xs md:text-sm text-stone-300/80 leading-relaxed max-w-md font-medium italic">
              "El éxito no se hereda, se conquista en cada entrenamiento. Únete al legado de Imperio 7."
            </p>
          </div>
        </div>

        {/* Lado derecho: Emblema heráldico flotante con resplandor (Solo en desktop) */}
        <div className="hidden lg:flex items-center justify-center relative w-[320px] aspect-square">
          <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-[80px] animate-pulse"></div>
          <div className="relative z-10 w-64 h-64 rounded-full border-2 border-brand-accent/30 p-4 bg-brand-primary-dark/60 backdrop-blur-xl shadow-2xl flex items-center justify-center group hover:scale-105 transition-transform duration-500">
            <img
              src="/imperio7-emblem.png"
              alt="Emblema Imperio 7"
              className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;