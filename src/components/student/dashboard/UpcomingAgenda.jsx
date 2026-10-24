import React, { useState, useMemo } from 'react';
import { Zap, CalendarCheck, CalendarDays, History, ChevronDown } from 'lucide-react';
import EmptyState from '../../shared/EmptyState';
import SessionCard from './SessionCard';
import PastHistoryPanel from './PastHistoryPanel';
import { groupProximas } from '../../../utils/studentAgenda';

// La lista es un resumen: el resto de clases futuras se consulta en el calendario.
const MAX_PROXIMAS = 4;

/**
 * Las siguientes clases (hasta MAX_PROXIMAS) y, plegado debajo, el historial.
 * El pasado nunca se mezcla con las próximas: hay que pedirlo con el botón.
 */
const UpcomingAgenda = ({ proximas, pasadas, now, onVerCalendario }) => {
  const [showHistory, setShowHistory] = useState(false);
  const resumen = useMemo(() => proximas.slice(0, MAX_PROXIMAS), [proximas]);
  const grupos = useMemo(() => groupProximas(resumen, now), [resumen, now]);
  const restantes = proximas.length - resumen.length;

  return (
    <div className="bg-brand-surface rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-brand-border-soft overflow-hidden">
      <div className="px-5 py-4 md:px-8 md:py-6 border-b border-brand-border-soft flex items-center justify-between bg-brand-bg/50">
        <div className="flex items-center gap-3">
          <div className="w-1.5 md:w-2 h-6 md:h-8 bg-brand-primary rounded-full"></div>
          <h2 className="font-black text-brand-primary uppercase tracking-tight text-sm md:text-lg italic leading-none">Tus próximas clases</h2>
        </div>
        <Zap size={20} className="text-brand-accent fill-brand-accent/20 shrink-0" />
      </div>

      <div className="p-4 md:p-6 space-y-6 bg-brand-bg/30">
        {grupos.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            iconSize={48}
            iconClassName="mx-auto text-slate-200 mb-3"
            message="No tienes clases por venir"
            className="py-12 text-center text-brand-muted font-black uppercase italic tracking-[0.2em] text-[10px] md:text-xs"
          />
        ) : (
          grupos.map((grupo) => (
            <div key={grupo.key} className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 py-1">
                <span className="text-[9px] md:text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] whitespace-nowrap italic">{grupo.label}</span>
                <div className="h-px w-full bg-slate-200"></div>
              </div>
              {grupo.items.map((s) => <SessionCard key={s.key} sesion={s} now={now} />)}
            </div>
          ))
        )}

        {restantes > 0 && (
          <button
            type="button"
            onClick={onVerCalendario}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand-accent-soft/50 text-brand-accent-dark border border-brand-accent/30 hover:bg-brand-accent-soft transition-all"
          >
            <CalendarDays size={14} />
            {restantes === 1 ? 'Tienes 1 clase más' : `Tienes ${restantes} clases más`} · Verlas en el calendario
          </button>
        )}

        {pasadas.length > 0 && (
          <div className="pt-2 space-y-4">
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              aria-expanded={showHistory}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand-surface text-brand-primary border border-brand-border-soft shadow-sm hover:border-brand-primary/30 transition-all"
            >
              <History size={14} />
              {showHistory ? 'Ocultar historial pasado' : `Ver historial pasado (${pasadas.length})`}
              <ChevronDown size={14} className={`transition-transform ${showHistory ? 'rotate-180' : ''}`} />
            </button>

            {showHistory && <PastHistoryPanel pasadas={pasadas} now={now} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingAgenda;
