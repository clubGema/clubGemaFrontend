import React from 'react';
import { Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CyclePreview = ({ fechas }) => {
  const conClase = fechas.filter(f => !f.feriado).length;

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-6 border-2 border-brand-border-soft">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Tus clases del ciclo</p>
        <span className="px-3 py-1 rounded-xl bg-brand-primary text-white text-[10px] font-black italic">{conClase} clases</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {fechas.map(({ fecha, feriado }) => {
          const d = parseISO(fecha);
          return (
            <div key={fecha} className={`flex items-center gap-3 p-3 rounded-2xl border ${feriado ? 'bg-brand-surface-alt border-brand-border opacity-60' : 'bg-brand-bg border-brand-border-soft'}`}>
              <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white ${feriado ? 'bg-brand-muted' : 'bg-brand-primary'}`}>
                <span className="text-sm font-black leading-none">{format(d, 'dd')}</span>
                <span className="text-[7px] font-bold">{format(d, 'MMM', { locale: es }).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-primary uppercase italic">{format(d, 'EEE', { locale: es })}</p>
                {feriado && <p className="text-[8px] font-bold text-brand-muted uppercase">Feriado</p>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 bg-brand-primary-soft/50 p-3 rounded-2xl border border-brand-primary/20">
        <Info size={16} className="text-brand-primary shrink-0" />
        <p className="text-[9px] font-bold text-brand-primary-dark uppercase leading-tight italic">
          Tus 30 días de ciclo contarán a partir de la fecha que inicies. Fechas referenciales: se confirman al generar la matrícula.
        </p>
      </div>
    </div>
  );
};

export default CyclePreview;
