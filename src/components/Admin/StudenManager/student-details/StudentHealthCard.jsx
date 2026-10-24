import React from 'react';
import { Stethoscope, User } from 'lucide-react';

const StudentHealthCard = ({ detalle, onStatusHistoryChange }) => (
    <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-brand-primary-soft/50 border-b border-brand-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-primary">
                <Stethoscope size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest italic">Información de Salud</span>
            </div>
            <span className="bg-brand-primary text-white text-[8px] font-black px-2 py-1 rounded-md">GRUPO SANGUÍNEO: {detalle.salud.sangre}</span>
        </div>
        <div className="p-8 grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div className="bg-brand-bg p-6 rounded-3xl border border-brand-border-soft">
                    <p className="text-[9px] font-black text-brand-muted uppercase mb-2 italic">Alergias / Condiciones:</p>
                    <p className="text-sm font-bold text-brand-body italic leading-relaxed">{detalle.salud.condiciones}</p>
                </div>
                <div className="flex justify-between p-5 bg-brand-surface border border-brand-border-soft rounded-3xl">
                    <span className="text-[9px] font-black text-brand-muted uppercase">Seguro Médico:</span>
                    <span className="text-sm font-black text-brand-primary italic uppercase">{detalle.salud.seguro}</span>
                </div>
            </div>
            <div className="bg-brand-bg p-6 rounded-3xl border border-brand-border-soft">
                <div className="flex items-center gap-2 mb-2 text-brand-muted">
                    <User size={14} />
                    <p className="text-[9px] font-black uppercase italic">Historial Deportivo:</p>
                </div>
                <select
                    value={detalle.salud?.historial ?? 'Nuevo'}
                    onChange={(e) => onStatusHistoryChange(e.target.value)}
                    className="w-full text-[11px] font-medium text-slate-500 italic leading-relaxed bg-transparent border border-brand-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-primary-light"
                >
                    <option value="Antiguo">Antiguo</option>
                    <option value="Nuevo">Nuevo</option>
                </select>
            </div>
        </div>
    </div>
);

export default StudentHealthCard;
