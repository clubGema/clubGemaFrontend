import React, { memo } from 'react';
import { Clock, MapPin, User, Star, ArrowRight, Sparkles, History, RefreshCw } from 'lucide-react';
import { getSessionVisual, getSessionVisualKey } from '../../../config/sessionStatus';
import { getDiaCorto } from '../../../utils/studentAgenda';

// 'YYYY-MM-DD' -> fecha local legible, sin pasar por Date(iso) (evita el desfase de un día).
const formatFechaCorta = (fecha) => {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString();
};

const SessionCard = ({ sesion, now }) => {
  const visual = getSessionVisual(sesion, now);
  const key = getSessionVisualKey(sesion, now);
  const { Icon } = visual;

  const esMovida = sesion.estado === 'MOVIDA';
  const esReposicion = sesion.tipo === 'REPOSICION';
  const esRecuperacion = sesion.tipo === 'RECUPERACION';

  return (
    <div className={`group relative rounded-2xl md:rounded-[2rem] border transition-all duration-300 ${visual.card}`}>

      {esReposicion && !esMovida && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-brand-accent-dark to-amber-500 text-white p-1 md:p-1.5 rounded-full shadow-lg border-2 border-white z-20 animate-bounce-slow">
          <Sparkles size={10} className="md:w-3 md:h-3" />
        </div>
      )}

      {esRecuperacion && (
        <div className="absolute top-0 right-0 bg-brand-primary text-white flex items-center gap-1 text-[7px] md:text-[8px] font-black px-3 py-1 rounded-bl-xl md:rounded-bl-2xl italic tracking-tighter z-10">
          <RefreshCw size={8} className="md:w-2.5 md:h-2.5" /> RECUPERACIÓN
        </div>
      )}

      <div className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">

        {/* FECHA Y HORA */}
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto md:min-w-[140px]">
          <div className={`flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl font-black shadow-sm md:shadow-md shrink-0 ${visual.dateBox}`}>
            <span className="text-[7px] md:text-[9px] opacity-70 uppercase italic leading-none mt-1">{getDiaCorto(sesion.inicio)}</span>
            <span className="text-xl md:text-2xl leading-none">{sesion.inicio.getDate()}</span>
          </div>

          <div className="text-left flex-1">
            <div className="flex items-center gap-1 text-brand-accent font-black">
              <Clock size={10} className="md:w-3 md:h-3 shrink-0" />
              <span className="text-[11px] md:text-[10px] uppercase tracking-tighter">
                {sesion.horaInicio || '--:--'} - {sesion.horaFin || '--:--'}
              </span>
            </div>

            {(esMovida || esReposicion) && (
              <h4 className="flex items-center gap-1 text-[10px] md:text-[11px] font-black text-brand-primary uppercase italic leading-tight mt-0.5 line-clamp-1">
                {esMovida ? <>Movida <ArrowRight size={10} className="text-brand-muted" /></> : 'Reposición'}
              </h4>
            )}

            {esReposicion && !esMovida && sesion.fechaOriginal && (
              <div className="mt-0.5 flex items-center gap-1 text-brand-primary">
                <History size={8} />
                <span className="text-[7px] md:text-[8px] font-black italic uppercase tracking-tighter truncate">
                  Orig: {formatFechaCorta(sesion.fechaOriginal)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* DETALLES */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 w-full border-t md:border-t-0 md:border-l border-brand-border-soft pt-3 md:pt-0 md:pl-6">
          <div className="space-y-0.5 text-left">
            <p className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase tracking-widest">Sede</p>
            <div className="flex items-start gap-1 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase italic">
              <MapPin size={10} className="text-brand-primary shrink-0 mt-0.5" />
              <span className="whitespace-normal leading-tight">{sesion.sede}</span>
            </div>
          </div>

          <div className="space-y-0.5 text-left">
            <p className="text-[7px] md:text-[8px] font-black text-brand-muted uppercase tracking-widest">Nivel</p>
            <div className="flex items-start gap-1 text-[9px] md:text-[10px] font-bold text-slate-600 uppercase italic">
              <Star size={10} className="text-yellow-500 fill-yellow-500 shrink-0 mt-0.5" />
              <span className="whitespace-normal leading-tight">{sesion.nivel}</span>
            </div>
          </div>

          <div className="space-y-0.5 hidden lg:block text-left">
            <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest">Coordinador</p>
            <div className="flex items-start gap-1 text-[10px] font-black text-brand-primary uppercase italic">
              <User size={10} className="text-brand-primary shrink-0 mt-0.5" />
              <span className="whitespace-normal leading-tight">{sesion.coordinador}</span>
            </div>
          </div>
        </div>

        {/* ESTADO */}
        <div className={`w-full md:w-auto shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase italic shadow-sm border mt-1 md:mt-0 ${visual.badge}`}>
          <Icon
            size={12}
            strokeWidth={3}
            className={key === 'PROGRAMADA' ? 'animate-spin-slow' : key === 'REPOSICION' ? 'animate-pulse' : ''}
          />
          {visual.label}
        </div>

      </div>
    </div>
  );
};

export default memo(SessionCard);
