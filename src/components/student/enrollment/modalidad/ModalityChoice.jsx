import React from 'react';
import { CalendarDays, CheckCircle2, Sparkles } from 'lucide-react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';

const ModalityChoice = ({ value = MODALIDAD.MENSUAL, onChange }) => (
  <div className="w-full">
    <div
      onClick={() => onChange?.(MODALIDAD.MENSUAL)}
      className="relative p-6 md:p-8 rounded-[2.5rem] border-2 border-brand-primary bg-brand-surface shadow-xl shadow-brand-primary/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <CalendarDays size={22} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent-dark bg-brand-accent-soft px-3 py-1 rounded-full border border-brand-accent/30 inline-flex items-center gap-1.5">
            <Sparkles size={11} /> Plan Oficial de Membresía
          </span>
        </div>
        <div className="bg-brand-primary rounded-full p-1 shadow-lg shadow-brand-primary/20">
          <CheckCircle2 size={22} className="text-white" fill="currentColor" />
        </div>
      </div>
      <h3 className="text-2xl md:text-3xl font-black uppercase italic leading-none tracking-tighter text-brand-primary">
        Mensual
      </h3>
      <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-2">
        Ciclo de 30 días continuos con tus días fijos de la semana
      </p>
    </div>
  </div>
);

export default ModalityChoice;
