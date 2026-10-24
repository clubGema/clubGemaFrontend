import React from 'react';
import { Clock } from 'lucide-react';

const HorarioSelect = ({ horariosFiltrados, idHorario, onChange }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <Clock size={12} /> Horarios
            </label>

            {idHorario && idHorario !== "" && (
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                    ✓ Horario seleccionado
                </span>
            )}
        </div>

        <select
            id="horarioSelect"
            className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-brand-primary outline-none transition-all uppercase cursor-pointer border ${idHorario && idHorario !== ""
                ? "bg-green-50/30 border-green-500 focus:ring-4 focus:ring-green-500/20"
                : "bg-brand-bg border-brand-border focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent"
                }`}
            value={idHorario}
            onChange={(e) => onChange(e.target.value)}
        >
            <option value="">SELECCIONAR HORARIO</option>
            {horariosFiltrados.map((hf) => (
                <option key={hf.id} value={hf.id}>
                    [{hf.dia?.nombre}] {hf.hora} | {hf.nivel?.nombre} | {hf.sede?.nombre}
                </option>
            ))}
        </select>
    </div>
);

export default HorarioSelect;
