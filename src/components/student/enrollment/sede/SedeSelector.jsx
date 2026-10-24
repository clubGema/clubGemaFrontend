import React, { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Check, Search, Building2 } from 'lucide-react';

const SedeSelector = ({ sedes = [], active, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sedesFiltradas = sedes.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (sede) => {
    onSelect(sede);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón Disparador del Combo Box */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-4 sm:p-5 rounded-[2rem] border-2 transition-all duration-300 flex items-center justify-between gap-4 text-left shadow-sm ${
          isOpen
            ? 'border-brand-primary ring-4 ring-brand-primary/10 bg-brand-surface shadow-xl'
            : active
            ? 'border-brand-primary/80 bg-brand-surface hover:border-brand-primary hover:shadow-md'
            : 'border-brand-border-soft bg-brand-surface hover:border-brand-primary/40 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              active
                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                : 'bg-brand-primary-soft text-brand-primary'
            }`}
          >
            <MapPin size={22} className={active ? 'text-brand-accent' : 'text-brand-primary'} />
          </div>
          <div className="min-w-0">
            <span className="block text-[9px] font-black uppercase tracking-[0.25em] text-brand-muted">
              Lugar de Entrenamiento
            </span>
            <span
              className={`block text-base sm:text-lg font-black uppercase italic tracking-tight truncate ${
                active ? 'text-brand-primary' : 'text-slate-400'
              }`}
            >
              {active || 'Selecciona tu sede oficial...'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {active && (
            <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider bg-brand-accent-soft text-brand-accent-dark px-3 py-1 rounded-full border border-brand-accent/30">
              Elegida
            </span>
          )}
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 ${
              isOpen ? 'rotate-180 bg-brand-primary-soft text-brand-primary' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-brand-surface rounded-[2rem] border-2 border-brand-border shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Buscador interno si hay más de 3 sedes */}
          {sedes.length > 3 && (
            <div className="p-2 mb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar sede..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-brand-border-soft rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Lista de Sedes */}
          <div className="max-h-64 overflow-y-auto space-y-1.5 p-1 custom-scrollbar">
            {sedesFiltradas.length === 0 ? (
              <div className="py-6 text-center text-xs font-bold text-slate-400">
                No se encontraron sedes con ese nombre
              </div>
            ) : (
              sedesFiltradas.map((sede) => {
                const isSelected = active === sede;
                return (
                  <button
                    key={sede}
                    type="button"
                    onClick={() => handleSelect(sede)}
                    className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      isSelected
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'hover:bg-brand-primary-soft text-slate-700 hover:text-brand-primary'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-white/10 text-brand-accent'
                            : 'bg-slate-100 text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors'
                        }`}
                      >
                        <Building2 size={16} />
                      </div>
                      <span className="font-black text-xs uppercase italic tracking-wider truncate">
                        {sede}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-brand-accent flex items-center justify-center shrink-0 text-white shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SedeSelector;
