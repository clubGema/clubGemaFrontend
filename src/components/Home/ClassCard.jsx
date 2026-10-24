import React from 'react';
import { MapPin, User, Clock, Flame, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ClassCard = ({ category, title, time, location, coordinator, spots, image }) => {
  // Solo se considera "Agotado" si spots es exactamente 0. 
  // Si es null, se asume que no hay restricción visible de cupos.
  const isSoldOut = spots !== null && spots === 0;

  return (
    <div className="group relative bg-brand-surface rounded-[2rem] border-2 border-brand-border-soft overflow-hidden hover:shadow-2xl hover:shadow-brand-primary/10 hover:border-brand-accent transition-all duration-300 flex flex-col h-full mt-2">

      {/* Etiqueta de Categoría Flotante */}
      <div className="absolute -top-8 left-6 z-20">
        <div className="bg-brand-primary text-white text-[10px] font-black italic uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
          <Flame size={12} className="text-brand-accent" />
          {category}
        </div>
      </div>

      {/* Imagen de cabecera con Gradiente Deportivo */}
      <div className="h-44 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-dark/80 via-brand-primary-dark/20 to-transparent z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
        />

        {/* Agotado Overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-brand-primary-dark/80 backdrop-blur-sm z-30 flex items-center justify-center">
            <div className="border-4 border-red-500 text-red-500 px-6 py-2 rounded-xl transform -rotate-12 bg-brand-primary-dark max-w-fit shadow-[0_0_20px_rgba(239,68,68,0.5)]">
              <span className="text-2xl font-black italic uppercase tracking-widest">Agotado</span>
            </div>
          </div>
        )}

        {/* Hora en la imagen */}
        <div className="absolute bottom-3 left-4 z-20 flex items-center text-white font-black italic text-lg gap-2">
          <div className="bg-brand-accent p-1.5 rounded-lg text-white">
            <Clock size={16} />
          </div>
          {time}
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="p-6 flex flex-col flex-grow bg-brand-surface relative z-10">

        {/* Header content: Título y Cupos */}
        <div className="flex justify-between items-start mb-4 gap-2">
          <h3 className="text-xl md:text-2xl font-black text-brand-primary uppercase italic tracking-tighter leading-none group-hover:text-brand-accent transition-colors">
            {title}
          </h3>
          
          {/* CORRECCIÓN: Solo se muestra el badge si spots NO es null */}
          {spots !== null && (
            <div className={`flex-shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border-2 ${
              spots < 5 && !isSoldOut ? 'text-brand-accent-dark bg-brand-accent-soft border-brand-accent/30 animate-pulse' :
              isSoldOut ? 'text-brand-muted bg-brand-surface-alt border-brand-border' :
              'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {isSoldOut ? 'Lleno' : `${spots} Cupos`}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="bg-brand-surface-alt p-1.5 rounded-lg text-brand-muted group-hover:bg-brand-primary-soft group-hover:text-brand-primary transition-colors">
              <User size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">Coordinador: <span className="text-brand-body">{coordinator || 'Sin asignar'}</span></span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <div className="bg-brand-surface-alt p-1.5 rounded-lg text-brand-muted group-hover:bg-brand-primary-soft group-hover:text-brand-primary transition-colors">
              <MapPin size={14} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">Sede: <span className="text-brand-body">{location}</span></span>
          </div>
        </div>

        <div className="flex-grow"></div>

        {/* Botón de Acción */}
        <Link
          to="/register"
          // El botón solo se deshabilita si isSoldOut es true (spots === 0)
          className={`w-full mt-2 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all duration-300 border-b-4 active:border-b-0 active:translate-y-1 ${
            isSoldOut
              ? 'bg-slate-200 text-brand-muted border-slate-300 cursor-not-allowed pointer-events-none'
              : 'bg-brand-primary text-white border-brand-primary hover:bg-brand-accent hover:border-brand-accent-dark shadow-lg shadow-brand-primary/20 hover:shadow-brand-accent/20 group-hover:scale-[1.02]'
          }`}
        >
          {isSoldOut ? 'No Disponible' : 'Reservar Cupo'}
          {!isSoldOut && <ChevronRight size={16} />}
        </Link>
      </div>
    </div>
  );
};

export default ClassCard;