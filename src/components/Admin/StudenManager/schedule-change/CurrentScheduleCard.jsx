import React from 'react';
import { Clock, CheckSquare, Calendar, Ticket } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { diasSemana } from './scheduleLabels';
import { esClaseUnica, fechaClaseUnica } from './scheduleChangeUtils';

const CurrentScheduleCard = ({ horario, isSelected, onSelect }) => {
    const unica = esClaseUnica(horario);
    const fecha = unica ? fechaClaseUnica(horario) : null;

    return (
        <div
            onClick={onSelect}
            className={`cursor-pointer border-2 rounded-2xl p-4 transition-all relative overflow-hidden group ${isSelected
                ? 'border-brand-accent bg-brand-accent-soft/30'
                : 'border-brand-border-soft hover:border-brand-accent/30 hover:bg-brand-bg'
                }`}
        >
            {isSelected && (
                <div className="absolute top-4 right-4 text-brand-accent">
                    <CheckSquare size={20} fill="currentColor" className="text-white bg-brand-accent rounded-lg" />
                </div>
            )}
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {unica && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-brand-accent-soft text-brand-accent-dark border border-brand-accent flex items-center gap-1">
                            <Ticket size={10} className="text-brand-accent" />
                            Clase única
                        </span>
                    )}
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isSelected ? 'bg-brand-accent text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                        {horario.horarios_clases.niveles_entrenamiento?.nombre || 'Sin Nivel'}
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${isSelected ? 'bg-brand-accent/30 text-brand-accent-dark' : 'bg-brand-surface-alt text-slate-500'
                        }`}>
                        {horario.horarios_clases.canchas.sedes.nombre || 'Sin Sede'}
                    </span>
                    {horario.estado === 'PENDIENTE_PAGO' && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md text-amber-600 bg-amber-50 border border-amber-100">
                            Pendiente de pago
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-base">
                        {diasSemana(horario.horarios_clases.dia_semana)}
                    </h3>
                    {fecha && (
                        <div className="flex items-center gap-1.5 text-brand-accent-dark mt-1 capitalize">
                            <Calendar size={12} />
                            <span className="text-[11px] font-black">
                                {format(parseISO(fecha), "EEEE dd 'de' MMMM, yyyy", { locale: es })}
                            </span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                        <Clock size={12} />
                        <span className="text-[11px] font-bold uppercase">{horario.horarios_clases.hora_inicio.slice(11, 16)} - {horario.horarios_clases.hora_fin.slice(11, 16)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CurrentScheduleCard;
