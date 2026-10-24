import React from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { diasSemana } from './scheduleLabels';

const AvailableScheduleCard = ({ horario, isSelected, onSelect }) => (
    <div
        onClick={onSelect}
        className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden group ${isSelected
            ? 'border-brand-primary bg-brand-primary-soft/30'
            : 'border-brand-border-soft hover:border-brand-primary/20 hover:bg-brand-bg'
            }`}
    >
        {isSelected && (
            <div className="absolute top-4 right-4 text-brand-primary">
                <CheckCircle2 size={20} fill="currentColor" className="text-white bg-brand-primary rounded-full" />
            </div>
        )}
        <div className="space-y-3">
            <div className="flex gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isSelected ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                    {horario.nivel.nombre || 'Sin Nivel'}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isSelected ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-surface-alt text-slate-500'
                    }`}>
                    {horario.cancha.sede.nombre || 'Sin Sede'}
                </span>
            </div>
            <div>
                <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-base">
                    {diasSemana(horario.dia_semana)}
                </h3>
                <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                    <Clock size={12} />
                    <span className="text-[11px] font-bold uppercase">{horario.hora_inicio} - {horario.hora_fin}</span>
                </div>
            </div>
        </div>
    </div>
);

export default AvailableScheduleCard;
