import React from 'react';
import { Calendar, Minus, Plus, Sparkles, Check } from 'lucide-react';

const PRESETS = [
  { val: 1, label: '1 mes', badge: 'Estándar' },
  { val: 2, label: '2 meses', badge: 'Adelantado' },
  { val: 3, label: '3 meses', badge: 'Trimestre' },
  { val: 6, label: '6 meses', badge: 'Semestre' },
];

const soles = (n) => `S/ ${Number(n).toFixed(2)}`;

/**
 * Selector orgánico de meses por adelantado.
 * Permite escoger 1 mes (estándar) o meses por adelantado (2, 3, 6 o personalizado).
 * Aplica sobre el paquete entero (si escogió 1 día o varios días por semana).
 */
const AdvanceMonthsSelector = ({
  meses = 1,
  onChange,
  diasCount = 1,
  precioUnitario = null,
}) => {
  const clasesPorMes = diasCount * 4;
  const totalClases = meses * clasesPorMes;

  const handleDecrement = () => {
    if (meses > 1) {
      onChange(meses - 1);
    }
  };

  const handleIncrement = () => {
    if (meses < 12) {
      onChange(meses + 1);
    }
  };

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-6 md:p-8 border-2 border-brand-border-soft space-y-6">
      {/* Encabezado y resumen del paquete */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-brand-accent" fill="currentColor" />
            <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Opciones de pago
            </span>
          </div>
          <p className="text-base font-black text-brand-primary uppercase italic">
            ¿Cuántos meses deseas pagar?
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-brand-primary-soft text-brand-primary text-xs font-black uppercase italic tracking-wider self-start sm:self-auto border border-brand-primary/20">
          <Calendar size={14} />
          <span>
            {diasCount > 1
              ? `Paquete ${diasCount} días/sem · ${clasesPorMes} clases/mes`
              : `1 día/sem · ${clasesPorMes} clases/mes`}
          </span>
        </div>
      </div>

      {/* Botones de selección rápida (Presets) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRESETS.map((opt) => {
          const isSelected = meses === opt.val;
          const precioEstimado = precioUnitario != null ? precioUnitario * opt.val : null;

          return (
            <button
              key={`preset-${opt.val}`}
              type="button"
              onClick={() => onChange(opt.val)}
              className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 group ${
                isSelected
                  ? 'bg-brand-accent-soft border-brand-accent shadow-md scale-[1.02]'
                  : 'bg-brand-bg hover:bg-brand-surface-alt border-brand-border-soft hover:border-brand-accent/50'
              }`}
            >
              {isSelected && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-brand-accent text-white shadow">
                  Elegido
                </span>
              )}

              <span className="text-sm font-black uppercase italic text-brand-primary tracking-wide">
                {opt.label}
              </span>

              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-muted mt-0.5">
                {opt.badge}
              </span>

              {precioEstimado != null && (
                <span className="text-xs font-black text-brand-primary-dark mt-2">
                  {soles(precioEstimado)}
                </span>
              )}

              <span className="text-[8px] font-bold text-slate-500 mt-1">
                {opt.val * clasesPorMes} clases
              </span>
            </button>
          );
        })}
      </div>

      {/* Control interactivo de cantidad (Stepper) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-brand-border-soft">
        <div className="space-y-1">
          <p className="text-xs font-black text-brand-primary uppercase italic">
            Meses seleccionados: <span className="text-brand-accent-dark">{meses} {meses === 1 ? 'mes' : 'meses'}</span>
          </p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            Total de clases generadas: <strong className="text-brand-primary">{totalClases} clases</strong> ({meses * 4} por cada día)
          </p>
        </div>

        <div className="flex items-center gap-3 self-center sm:self-auto">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={meses <= 1}
            aria-label="Disminuir meses"
            className="w-10 h-10 rounded-2xl bg-brand-bg border-2 border-brand-border-soft hover:border-brand-primary flex items-center justify-center text-brand-primary transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={16} strokeWidth={3} />
          </button>

          <div className="px-5 py-2 rounded-2xl bg-brand-primary text-white font-black italic text-sm min-w-[5rem] text-center shadow">
            {meses} {meses === 1 ? 'MES' : 'MESES'}
          </div>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={meses >= 12}
            aria-label="Aumentar meses"
            className="w-10 h-10 rounded-2xl bg-brand-bg border-2 border-brand-border-soft hover:border-brand-primary flex items-center justify-center text-brand-primary transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvanceMonthsSelector;

