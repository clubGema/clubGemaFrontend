import React from 'react';
import { User, Search } from 'lucide-react';

const AlumnoAutocomplete = ({
    textoBusqueda,
    onTextoBusquedaChange,
    alumnoSelect,
    onSelectAlumno,
    alumnosFiltrados,
    isOpen,
    onOpenChange,
    disabled,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-1">
        <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                <User size={12} /> Nombre del Alumno
            </label>
            {alumnoSelect && (
                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                    ✓ Alumno seleccionado
                </span>
            )}
        </div>

        <div className="relative" onBlur={() => onOpenChange(false)}>
            <input
                disabled={disabled}
                type="text"
                placeholder="Ej. Victor Margarito"
                className={`w-full rounded-2xl px-5 py-4 text-sm font-bold text-brand-primary outline-none transition-all uppercase border disabled:cursor-not-allowed ${alumnoSelect
                    ? "bg-green-50/30 border-green-500 focus:ring-4 focus:ring-green-500/20"
                    : "bg-brand-bg border-brand-border focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent"
                    }`}
                value={textoBusqueda}
                onFocus={() => onOpenChange(true)}
                onChange={(e) => onTextoBusquedaChange(e.target.value)}
            />
            <Search size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${alumnoSelect ? 'text-green-500' : 'text-brand-muted'}`} />

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-brand-surface border border-brand-border-soft rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden p-2 transition-all">
                    {alumnosFiltrados.length > 0 ? (
                        alumnosFiltrados.map((usuario) => (
                            <button
                                key={usuario.id}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm font-bold text-brand-primary hover:bg-brand-bg rounded-xl transition-colors uppercase flex items-center gap-2"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => onSelectAlumno(usuario)}
                            >
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                {`${usuario.nombres} ${usuario.apellidos}`}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-xs font-semibold text-brand-muted italic">
                            NO EXISTEN ALUMNOS CON EL NOMBRE INGRESADO.
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
);

export default AlumnoAutocomplete;
