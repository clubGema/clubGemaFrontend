import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, CalendarPlus, Sparkles, RefreshCw } from 'lucide-react';
import EmptyState from '../../shared/EmptyState';
import { getMomento, getTiempoRestante } from '../../../utils/studentAgenda';

const diaLargo = (date) => new Intl.DateTimeFormat('es-PE', { weekday: 'long' }).format(date);
const fechaLarga = (date) => new Intl.DateTimeFormat('es-PE', { day: 'numeric', month: 'long' }).format(date);

// Frase principal según cuándo es la clase. El día se resalta en el título.
const buildTitulo = (sesion, momento) => {
  switch (momento) {
    case 'AHORA': return { prefijo: 'Tu clase es', destacado: 'ahora' };
    case 'HOY': return { prefijo: 'Tu próxima clase es', destacado: 'hoy' };
    case 'MANANA': return { prefijo: 'Tu próxima clase es', destacado: 'mañana' };
    default: return { prefijo: 'Tu próxima clase es el', destacado: diaLargo(sesion.inicio) };
  }
};

const NextClassHero = ({ nextClass, now }) => {
  if (!nextClass) {
    return (
      <section className="mb-8 bg-brand-surface rounded-[2rem] border border-brand-border-soft shadow-xl p-6 md:p-8">
        <EmptyState
          icon={CalendarPlus}
          iconSize={44}
          iconClassName="mx-auto text-slate-300 mb-3"
          message="No tienes clases programadas"
          className="text-center text-brand-primary font-black uppercase italic text-sm md:text-base tracking-tight"
        >
          <p className="mt-1 text-[10px] font-bold text-brand-muted uppercase tracking-widest not-italic">Reserva tu próximo entrenamiento</p>
          <Link
            to="/dashboard/student/enrollment"
            className="inline-flex items-center gap-2 mt-4 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white text-[10px] font-black uppercase tracking-widest border border-brand-accent/50 shadow-xl hover:border-brand-accent hover:brightness-110 transition-all active:scale-95 group"
          >
            <CalendarPlus size={14} className="text-brand-accent" /> Inscribirme
          </Link>
        </EmptyState>
      </section>
    );
  }

  const momento = getMomento(nextClass, now);
  const { prefijo, destacado } = buildTitulo(nextClass, momento);
  const restante = momento === 'HOY' ? getTiempoRestante(nextClass, now) : null;
  const esEspecial = nextClass.tipo !== 'REGULAR';

  return (
    <section className="mb-8 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-brand-primary to-brand-primary-dark text-white shadow-2xl p-6 md:p-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="absolute -right-10 -top-10 w-48 h-48 md:w-72 md:h-72 rounded-full bg-brand-accent/20 blur-2xl pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-[0.25em] bg-brand-accent text-white px-3 py-1 rounded-full">
            {momento === 'AHORA' ? 'En curso' : 'Siguiente'}
          </span>
          {esEspecial && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-white/15 border border-white/20 px-3 py-1 rounded-full">
              {nextClass.tipo === 'REPOSICION' ? <Sparkles size={10} /> : <RefreshCw size={10} />}
              {nextClass.tipo === 'REPOSICION' ? 'Reposición' : 'Recuperación'}
            </span>
          )}
          {restante && (
            <span className="text-[9px] font-black uppercase tracking-widest text-white/80">{restante}</span>
          )}
        </div>

        <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-tight">
          {prefijo} <span className="text-brand-accent">{destacado}</span>
          {' '}a las <span className="text-brand-accent">{nextClass.horaInicio || '--:--'}</span>
          <span className="block md:inline"> en {nextClass.sede}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} className="text-brand-accent" />
            {fechaLarga(nextClass.inicio)} · {nextClass.horaInicio || '--:--'} - {nextClass.horaFin || '--:--'}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} className="text-brand-accent" /> {nextClass.sede}
          </span>
        </div>
      </div>
    </section>
  );
};

export default NextClassHero;
