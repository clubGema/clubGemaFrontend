import React, { useState, useMemo } from 'react';
import { Filter, Calendar, History } from 'lucide-react';
import EmptyState from '../../shared/EmptyState';
import SessionCard from './SessionCard';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/**
 * Historial de clases ya ocurridas, de la más reciente a la más antigua.
 * Los filtros de mes/año viven aquí porque solo gobiernan el pasado: la
 * agenda de próximas clases no se filtra.
 */
const PastHistoryPanel = ({ pasadas, now }) => {
  const [filtroMes, setFiltroMes] = useState('TODOS');
  const [filtroAnio, setFiltroAnio] = useState('TODOS');

  // Solo los años en los que el alumno tiene clases pasadas.
  const aniosOpciones = useMemo(
    () => [...new Set(pasadas.map((s) => s.inicio.getFullYear()))].sort((a, b) => b - a),
    [pasadas],
  );

  const filtradas = useMemo(
    () => pasadas.filter((s) =>
      (filtroMes === 'TODOS' || s.inicio.getMonth().toString() === filtroMes)
      && (filtroAnio === 'TODOS' || s.inicio.getFullYear().toString() === filtroAnio)),
    [pasadas, filtroMes, filtroAnio],
  );

  const porMes = useMemo(() => filtradas.reduce((acc, s) => {
    const mes = `${MESES[s.inicio.getMonth()]} ${s.inicio.getFullYear()}`;
    (acc[mes] ||= []).push(s);
    return acc;
  }, {}), [filtradas]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between bg-brand-surface p-3 rounded-[1.5rem] border border-brand-border-soft shadow-sm flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-border-soft">
          <Filter size={12} className="text-brand-accent" />
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} className="text-[9px] font-black uppercase tracking-widest text-brand-primary outline-none bg-transparent cursor-pointer">
            <option value="TODOS">TODOS LOS MESES</option>
            {MESES.map((mes, idx) => <option key={mes} value={idx.toString()}>{mes.toUpperCase()}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-border-soft">
          <Calendar size={12} className="text-brand-primary" />
          <select value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} className="text-[9px] font-black uppercase tracking-widest text-slate-500 outline-none bg-transparent cursor-pointer">
            <option value="TODOS">TODOS LOS AÑOS</option>
            {aniosOpciones.map((anio) => <option key={anio} value={anio.toString()}>CICLO {anio}</option>)}
          </select>
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={History}
          iconSize={40}
          message="No hay clases pasadas con este filtro"
          className="py-12 text-center text-brand-muted font-black uppercase italic text-[10px] tracking-widest"
        />
      ) : (
        Object.entries(porMes).map(([mes, items]) => (
          <div key={mes} className="space-y-3">
            <div className="flex items-center gap-3 py-1">
              <span className="text-[9px] md:text-[10px] font-black text-brand-accent uppercase tracking-[0.3em] whitespace-nowrap italic">{mes}</span>
              <div className="h-px w-full bg-slate-200"></div>
            </div>
            {items.map((s) => <SessionCard key={s.key} sesion={s} now={now} />)}
          </div>
        ))
      )}
    </div>
  );
};

export default PastHistoryPanel;
