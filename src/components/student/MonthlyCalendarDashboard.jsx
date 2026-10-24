import React, { useState, useMemo } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { SESSION_VISUAL, CALENDAR_LEGEND_KEYS, getSessionVisual } from '../../config/sessionStatus';
import SessionDetailModal from './dashboard/SessionDetailModal';

const toKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

/**
 * Calendario mensual con contexto: cada clase lleva el ícono y color de lo que
 * le pasó (asististe, faltaste, reposición, recuperación, por venir, movida).
 * No pide datos: recibe las sesiones ya normalizadas del dashboard.
 */
const MonthlyCalendarDashboard = ({ sesiones = [], now = new Date() }) => {
  const [fechaReferencia, setFechaReferencia] = useState(() => new Date());
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);

  const { diasCalendario, mesActual, anioActual } = useMemo(() => {
    const year = fechaReferencia.getFullYear();
    const month = fechaReferencia.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    const startOffset = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1;
    const dias = [];
    const fechaInicio = new Date(primerDiaMes);
    fechaInicio.setDate(fechaInicio.getDate() - startOffset);
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(fechaInicio));
      fechaInicio.setDate(fechaInicio.getDate() + 1);
    }
    return { diasCalendario: dias, mesActual: month, anioActual: year };
  }, [fechaReferencia]);

  const sesionesPorDia = useMemo(() => sesiones.reduce((acc, s) => {
    (acc[s.fecha] ||= []).push(s);
    return acc;
  }, {}), [sesiones]);

  const hoyKey = toKey(now);

  return (
    <section className="bg-brand-surface rounded-[1.5rem] md:rounded-[2.5rem] p-3 md:p-6 shadow-xl border border-brand-border-soft flex flex-col overflow-hidden">
      {/* HEADER COMPACTO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="flex items-center gap-1.5 text-sm md:text-lg font-black italic uppercase tracking-widest text-brand-accent">
            <CalendarDays className="w-4 h-4" /> IMPERIO 7 PLANNER
          </h2>
          <p className="text-[8px] md:text-[9px] font-bold text-brand-muted uppercase tracking-widest mt-0.5 italic">
            Mes de {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(anioActual, mesActual))} {anioActual}
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-center w-full md:w-auto bg-brand-bg p-1 rounded-xl border border-brand-border-soft">
          <button aria-label="Mes anterior" onClick={() => setFechaReferencia(new Date(anioActual, mesActual - 1))} className="p-2 md:p-1.5 hover:bg-brand-surface rounded-lg transition-all shadow-sm bg-brand-surface md:bg-transparent"><ChevronLeft size={16} /></button>
          <span className="text-[10px] font-black px-2 text-brand-primary text-center italic uppercase truncate">
            {new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(new Date(anioActual, mesActual))}
          </span>
          <button aria-label="Mes siguiente" onClick={() => setFechaReferencia(new Date(anioActual, mesActual + 1))} className="p-2 md:p-1.5 hover:bg-brand-surface rounded-lg transition-all shadow-sm bg-brand-surface md:bg-transparent"><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* LEYENDA */}
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3 px-1">
        {CALENDAR_LEGEND_KEYS.map((key) => {
          const { Icon, legend, cell } = SESSION_VISUAL[key];
          return (
            <li key={key} className="flex items-center gap-1.5 text-[8px] md:text-[9px] font-black uppercase tracking-wider text-slate-500">
              <span className={`inline-flex items-center justify-center w-4 h-4 rounded border-l-2 ${cell}`}>
                <Icon size={9} strokeWidth={3} />
              </span>
              {legend}
            </li>
          );
        })}
      </ul>

      {/* GRID CALENDARIO */}
      <div className="border border-brand-border rounded-xl md:rounded-2xl bg-brand-surface overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-brand-bg border-b border-brand-border">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="py-2 text-center text-[9px] md:text-[10px] font-black text-brand-primary italic tracking-wider">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6">
          {diasCalendario.map((dia) => {
            const key = toKey(dia);
            const clases = sesionesPorDia[key] || [];
            const hoy = key === hoyKey;
            const mismoMes = dia.getMonth() === mesActual;

            return (
              <div key={key} className={`min-h-[70px] md:min-h-[100px] border-r border-b border-brand-border-soft p-0.5 md:p-1 transition-colors ${!mismoMes ? 'bg-brand-bg/50 opacity-40' : 'bg-brand-surface'}`}>
                <div className="flex justify-end mb-0.5 md:mb-1">
                  <span className={`text-[8px] md:text-[10px] font-black w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded-full ${hoy ? 'bg-brand-accent text-white shadow-md' : 'text-brand-muted'}`}>
                    {dia.getDate()}
                  </span>
                </div>

                <div className="flex flex-col gap-1 px-0.5">
                  {clases.map((clase) => {
                    const { Icon, cell, label } = getSessionVisual(clase, now);

                    return (
                      <button
                        type="button"
                        key={clase.key}
                        onClick={() => setSesionSeleccionada(clase)}
                        title={`${label} · ${clase.horaInicio || ''} · ${clase.sede}`}
                        aria-label={`${label}, ${clase.horaInicio || ''}, ${clase.sede}. Ver detalle`}
                        className={`w-full text-left border-l-2 shadow-sm px-1 py-0.5 md:p-1.5 rounded-r cursor-pointer hover:brightness-95 hover:shadow-md active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${cell}`}
                      >
                        {/* Móvil: ícono + hora + sede (recortada) */}
                        <span className="md:hidden block">
                          <span className="flex items-center justify-center gap-0.5 text-[7px] font-bold leading-none tracking-tighter">
                            <Icon size={7} strokeWidth={3} className="shrink-0" />
                            {clase.horaInicio || '--:--'}
                          </span>
                          <span className="block text-[6px] font-black uppercase text-center leading-none mt-0.5 truncate opacity-80">
                            {clase.sede}
                          </span>
                        </span>
                        {/* Escritorio: ícono + nivel + hora + sede (recortada) */}
                        <span className="hidden md:block">
                          <span className="flex items-center gap-1 text-[7px] font-black truncate uppercase italic leading-none">
                            <Icon size={9} strokeWidth={3} className="shrink-0" />
                            <span className="truncate">{clase.nivel || 'CLASE'}</span>
                          </span>
                          <span className="block text-[8px] font-bold opacity-70 mt-0.5">
                            {clase.horaInicio || '--:--'}
                          </span>
                          <span className="flex items-center gap-0.5 text-[7px] font-bold uppercase opacity-80 mt-0.5 truncate">
                            <MapPin size={8} className="shrink-0" />
                            <span className="truncate">{clase.sede}</span>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SessionDetailModal
        sesion={sesionSeleccionada}
        now={now}
        onClose={() => setSesionSeleccionada(null)}
      />
    </section>
  );
};

export default MonthlyCalendarDashboard;
