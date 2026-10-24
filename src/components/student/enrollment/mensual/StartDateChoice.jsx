import React, { useMemo } from 'react';
import { ArrowRight, Zap, Star, RefreshCw } from 'lucide-react';
import { format, parseISO, isAfter, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toDateKey } from '../../../../utils/enrollmentCycle';

const sorter = (a, b) => (a > b ? 1 : -1);

const formatDateDetail = (dateStr) => {
  const d = parseISO(dateStr);
  return {
    full: dateStr,
    num: format(d, 'dd'),
    mes: format(d, 'MMM', { locale: es }).toUpperCase(),
    diaNom: format(d, 'EEEE', { locale: es }).toUpperCase(),
    // Más de 7 días adelante = "enganche" (continuación de un paquete vigente).
    isContinuacion: isAfter(d, addDays(new Date(), 7)),
  };
};

/**
 * Pregunta explícita de cuándo empezar. Lógica portada de EnrollmentDateModal:
 * `previewData` es un array por horario con [inmediata, siguiente].
 */
const StartDateChoice = ({ previewData, selectedDate, onSelect }) => {
  const opciones = useMemo(() => ({
    inmediatas: [...new Set(previewData.map(g => toDateKey(g[0])))].sort(sorter),
    siguientes: [...new Set(previewData.map(g => toDateKey(g[1])))].sort(sorter),
  }), [previewData]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-brand-accent" fill="currentColor" />
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Lo más pronto posible</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {opciones.inmediatas.map(fecha => {
            const f = formatDateDetail(fecha);
            const selected = selectedDate === fecha;
            return (
              <button
                key={`now-${fecha}`}
                type="button"
                onClick={() => onSelect('INMEDIATA', fecha)}
                className={`flex items-center justify-between p-4 border-2 rounded-[2rem] transition-all group active:scale-95 ${selected ? 'bg-brand-accent-soft border-brand-accent' : 'bg-brand-bg hover:bg-brand-accent-soft border-brand-border-soft hover:border-brand-accent'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center shadow-lg transition-colors ${selected ? 'bg-brand-accent-dark' : 'bg-brand-primary group-hover:bg-brand-accent-dark'}`}>
                    <span className="text-lg font-black leading-none">{f.num}</span>
                    <span className="text-[8px] font-bold">{f.mes}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-brand-primary uppercase italic">{f.isContinuacion ? f.diaNom : `Este ${f.diaNom}`}</p>
                    {f.isContinuacion ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <RefreshCw size={10} className="text-green-600" />
                        <p className="text-[9px] font-bold text-green-600 uppercase">Continuación de paquete</p>
                      </div>
                    ) : (
                      <p className="text-[9px] font-bold text-brand-muted uppercase">Empezar esta semana</p>
                    )}
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-brand-accent transition-all" />
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Star size={14} className="text-brand-primary" fill="currentColor" />
          <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">Siguiente turno</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {opciones.siguientes.map(fecha => {
            const f = formatDateDetail(fecha);
            const selected = selectedDate === fecha;
            return (
              <button
                key={`next-${fecha}`}
                type="button"
                onClick={() => onSelect('SIGUIENTE', fecha)}
                className={`flex items-center justify-between p-4 border-2 rounded-[2rem] transition-all group active:scale-95 ${selected ? 'bg-brand-primary-soft border-brand-primary-light' : 'bg-brand-surface hover:bg-brand-primary-soft border-brand-border-soft hover:border-brand-primary-light'}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center border transition-colors ${selected ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface-alt text-brand-muted border-brand-border group-hover:bg-brand-primary group-hover:text-white'}`}>
                    <span className="text-lg font-black leading-none">{f.num}</span>
                    <span className="text-[8px] font-bold">{f.mes}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-600 uppercase italic">{f.diaNom}</p>
                    <p className="text-[9px] font-bold text-brand-muted uppercase">Esperar a la siguiente</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-slate-300 group-hover:translate-x-1 group-hover:text-brand-primary transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StartDateChoice;
