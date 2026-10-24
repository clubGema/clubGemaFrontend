import React from 'react';

const HorarioFilterBar = ({ filterDay, onFilterDayChange, searchTerm, onSearchTermChange, diasSemana }) => (
    <div className="p-6 bg-brand-surface-alt/50 rounded-3xl border-2 border-dashed border-brand-border flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
            <span className="text-[9px] font-black text-brand-primary uppercase ml-2">1. Filtrar por día</span>
            <select
                value={filterDay}
                onChange={(e) => onFilterDayChange(e.target.value)}
                className="w-full p-3 rounded-xl border-none shadow-sm text-xs font-black uppercase bg-brand-surface focus:ring-2 focus:ring-brand-accent"
            >
                <option value="">Selecciona el día...</option>
                {Object.entries(diasSemana).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
            </select>
        </div>
        <div className="flex-[2] space-y-1">
            <span className="text-[9px] font-black text-brand-muted uppercase ml-2">Búsqueda rápida</span>
            <input type="text" placeholder="BUSCAR (Nivel, Cancha)..." value={searchTerm} onChange={(e) => onSearchTermChange(e.target.value)} className="w-full p-3 rounded-xl border-none shadow-sm text-xs font-bold uppercase bg-brand-surface focus:ring-2 focus:ring-brand-accent" />
        </div>
    </div>
);

export default HorarioFilterBar;
