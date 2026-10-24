import React, { useState } from 'react';
import { Fingerprint, MapPin, Phone, Eye, RefreshCw, Zap, ArrowUpDown, Filter, AlertCircle, CreditCard, Search, History, Flame } from 'lucide-react';
import { STATUS_SUCCESS } from '../../../config/statusColors';

// --- SUBCOMPONENTES DE CABECERA ---
// Declarados a nivel de módulo a propósito: definidos dentro del cuerpo de
// StudentTable eran un tipo de componente nuevo en cada render, así que React
// desmontaba y remontaba la cabecera en vez de actualizarla (el popup de búsqueda
// avanzada perdía el foco al teclear). Lo que antes tomaban por closure
// (sortConfig/requestSort, filters/setFilters) ahora entra por props.
const SortableHeader = ({ label, sortKey, align = 'left', sortConfig, requestSort }) => (
    <th className={`p-4 cursor-pointer hover:bg-brand-surface-alt transition-colors group select-none ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`} onClick={() => requestSort(sortKey)}>
        <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
            {label}
            <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === sortKey ? 'opacity-100 text-brand-primary' : 'opacity-30 group-hover:opacity-100'}`} />
        </div>
    </th>
);

const FilterHeader = ({ label, filterKey, options, align = 'center', filters, setFilters }) => (
    <th className={`p-4 group ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
        <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
            <span>{label}</span>
            <div className="relative inline-flex items-center justify-center">
                <Filter size={12} className={`transition-colors ${filters[filterKey] !== '' ? 'text-brand-accent' : 'text-slate-300 group-hover:text-brand-primary'}`} />
                <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={filters[filterKey]}
                    onChange={(e) => setFilters(prev => ({ ...prev, [filterKey]: e.target.value }))}
                    title={`Filtrar por ${label}`}
                >
                    <option value="">Todos</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        </div>
    </th>
);

const StudentTable = ({
    alumnos,
    sortConfig,
    requestSort,
    filters,
    setFilters,
    textFilter,
    setTextFilter,
    uniqueSedes,
    uniqueNiveles,
    uniqueEstados,
    hasFilters,
    onClearFilters,
    onViewDetails,
    onAttendanceHistory,
    onOpenInscriptions,
    onChangeLevel,
}) => {
    // Solo estado de UI (abrir/cerrar popup) se queda local — no es lógica de filtrado
    const [isTextFilterOpen, setIsTextFilterOpen] = useState(false);

    return (
        <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-xl overflow-visible">

            {/* Aviso de Filtros Activos */}
            {hasFilters && (
                <div className="bg-brand-accent-soft px-6 py-2 border-b border-brand-accent-soft flex items-center justify-between">
                    <span className="text-[10px] font-black text-brand-accent-dark uppercase tracking-widest">Filtros Aplicados</span>
                    <button
                        onClick={onClearFilters}
                        className="text-[9px] font-bold bg-brand-surface border border-brand-accent/30 text-brand-accent px-3 py-1 rounded-lg hover:bg-brand-accent hover:text-white transition-all"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            )}

            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-brand-bg/50 border-b border-brand-border-soft font-black text-[9px] text-brand-muted uppercase tracking-[0.15em]">

                            {/* CABECERA PERSONALIZADA CON POP-UP DE BÚSQUEDA */}
                            <th className="p-4 pl-6 text-left group select-none relative">
                                <div className="flex items-center gap-2">
                                    <div className="cursor-pointer flex items-center gap-1.5 hover:bg-brand-surface-alt p-1 rounded transition-colors" onClick={() => requestSort('full_name')}>
                                        Alumno / Contacto
                                        <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === 'full_name' ? 'opacity-100 text-brand-primary' : 'opacity-30 group-hover:opacity-100'}`} />
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => setIsTextFilterOpen(!isTextFilterOpen)}
                                            className="p-1 rounded hover:bg-slate-200 transition-colors"
                                            title="Búsqueda Avanzada"
                                        >
                                            <Search size={12} className={textFilter.value ? 'text-brand-accent' : 'text-slate-300 group-hover:text-brand-primary'} />
                                        </button>

                                        {/* POP-UP DEL BUSCADOR */}
                                        {isTextFilterOpen && (
                                            <div className="absolute top-full left-6 mt-1 bg-brand-surface border border-brand-border shadow-2xl rounded-2xl p-4 w-64 z-dropdown normal-case tracking-normal font-normal">
                                                <p className="text-[10px] font-black text-brand-primary uppercase mb-2 tracking-widest">Filtro de Texto</p>

                                                <select
                                                    value={textFilter.field}
                                                    onChange={(e) => setTextFilter({ ...textFilter, field: e.target.value })}
                                                    className="w-full mb-3 p-2 text-xs bg-brand-bg border border-brand-border rounded-lg outline-none focus:border-brand-accent font-bold text-brand-body cursor-pointer"
                                                >
                                                    <option value="full_name">Nombre del Alumno</option>
                                                    <option value="dni">Documento (DNI)</option>
                                                    <option value="telefono">Celular</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    value={textFilter.value}
                                                    onChange={(e) => setTextFilter({ ...textFilter, value: e.target.value })}
                                                    placeholder={`Ingresa el ${textFilter.field === 'full_name' ? 'nombre' : textFilter.field === 'dni' ? 'DNI' : 'celular'}...`}
                                                    className="w-full p-2.5 text-xs border border-brand-border rounded-lg outline-none focus:ring-2 focus:ring-brand-primary-soft focus:border-brand-accent font-bold transition-all"
                                                    autoFocus
                                                />

                                                <div className="flex justify-between items-center mt-4">
                                                    <button
                                                        onClick={() => { setTextFilter({ field: 'full_name', value: '' }); setIsTextFilterOpen(false); }}
                                                        className="text-[10px] font-bold text-brand-muted hover:text-red-500 transition-colors"
                                                    >
                                                        Limpiar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsTextFilterOpen(false)}
                                                        className="text-[10px] font-black bg-brand-primary hover:bg-brand-primary-dark text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </th>

                            <FilterHeader label="Sede" filterKey="sede" options={uniqueSedes} align="left" filters={filters} setFilters={setFilters} />
                            <FilterHeader label="Nivel" filterKey="nivel" options={uniqueNiveles} filters={filters} setFilters={setFilters} />
                            <FilterHeader label="Estado" filterKey="estadoVisual" options={uniqueEstados} filters={filters} setFilters={setFilters} />
                            <SortableHeader label="Deuda Pendiente" sortKey="monto_pendiente" align="right" sortConfig={sortConfig} requestSort={requestSort} />
                            <th className="p-4 text-center">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {alumnos.length === 0 ? (
                            <tr><td colSpan="6" className="p-12 text-center text-brand-muted text-xs font-bold uppercase italic">No se encontraron alumnos con esos filtros</td></tr>
                        ) : alumnos.map((alum) => (
                            <tr key={alum.id} className="hover:bg-brand-primary-soft/30 transition-all group">

                                {/* COLUMNA 1: ALUMNO Y CONTACTO */}
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black text-xl italic shadow-md shadow-brand-primary-soft shrink-0">
                                            {alum.nombres.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter leading-none">{alum.full_name}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center gap-1 text-[9px] font-bold ${textFilter.field === 'dni' && textFilter.value ? 'text-brand-accent bg-brand-accent-soft px-1 rounded' : 'text-brand-muted'}`}>
                                                    <Fingerprint size={10} /> {alum.dni}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[9px] font-bold ${textFilter.field === 'telefono' && textFilter.value ? 'text-brand-accent bg-brand-accent-soft px-1 rounded' : 'text-brand-primary'}`}>
                                                    <Phone size={10} /> {alum.telefono}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* COLUMNA 2: SEDE */}
                                <td className="p-4">
                                    <div className="flex flex-col gap-1">
                                        {alum.sedes.length > 0 ? alum.sedes.map((s, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 w-fit text-[9px] font-black text-brand-accent-dark bg-brand-accent-soft px-2.5 py-1 rounded-md uppercase border border-brand-accent-soft italic">
                                                <MapPin size={10} /> {s}
                                            </span>
                                        )) : (
                                            <span className="inline-flex items-center gap-1 w-fit text-[9px] font-black text-brand-muted bg-brand-bg px-2.5 py-1 rounded-md uppercase border border-brand-border-soft italic">S/N</span>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMNA 3: NIVEL */}
                                <td className="p-4 text-center">
                                    <div className="flex justify-center flex-wrap gap-1">
                                        {alum.niveles.length > 0 ? alum.niveles.map((n, idx) => (
                                            <span key={idx} className="bg-brand-primary-soft text-brand-primary text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-brand-primary-soft italic">{n}</span>
                                        )) : (
                                            <span className="bg-brand-surface-alt text-brand-muted text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-brand-border italic">SIN NIVEL</span>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMNA 4: ESTADO */}
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onOpenInscriptions(alum)}
                                        className="inline-flex items-center justify-center gap-1.5 text-[9px] font-black uppercase italic hover:scale-105 transition-transform group-hover:shadow-sm rounded-lg p-1"
                                        title="Ver detalle de inscripciones"
                                    >
                                        {alum.esClaseUnica ? (
                                            <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 bg-yellow-50 text-yellow-600 border-yellow-200`}>
                                                <Flame size={10} fill="currentColor" />
                                                INDIVIDUAL
                                            </span>
                                        ) : (
                                            // 🔧 FIX: ahora pinta directo desde estadoDisplay (ya calculado
                                            // arriba en AdminStudentsManager), en vez de recalcular el
                                            // ternario estadoVisual + estaVencido acá adentro. Mismo texto
                                            // que ve el filtro de la cabecera, sin duplicar la lógica.
                                            <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5
                                            ${alum.estadoDisplay === 'ACTIVO'
                                                ? STATUS_SUCCESS
                                                : alum.estadoDisplay === 'NO RENOVADO'
                                                    ? 'bg-red-50 text-red-600 border-red-200'
                                                    : 'bg-brand-bg text-slate-500 border-brand-border'}`}
                                            >
                                                <Zap size={10} fill="currentColor" className={alum.multiplesActivas ? "animate-bounce" : ""} />
                                                {alum.estadoDisplay}
                                                {alum.multiplesActivas && <span className="bg-brand-accent text-white px-1 rounded ml-1 animate-pulse">+</span>}
                                            </span>
                                        )}
                                    </button>
                                </td>

                                {/* COLUMNA 5: DEUDA PENDIENTE */}
                                <td className="p-4 text-right pr-6">
                                    {parseFloat(alum.monto_pendiente || 0) > 0 ? (
                                        <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 text-red-600 px-3 py-2 rounded-xl">
                                            <AlertCircle size={14} className="animate-pulse" />
                                            <div className="flex flex-col text-right">
                                                <span className="text-[8px] font-black uppercase leading-none opacity-70">Deuda</span>
                                                <span className="text-sm font-black italic">S/ {parseFloat(alum.monto_pendiente).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 text-emerald-500 px-3 py-2">
                                            <CreditCard size={14} opacity={0.5} />
                                            <span className="text-xs font-black italic opacity-70">S/ 0.00</span>
                                        </div>
                                    )}
                                </td>

                                {/* COLUMNA 6: GESTIÓN */}
                                <td className="p-4 text-center pr-6">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => onViewDetails(alum)}
                                            className="w-10 h-10 bg-brand-surface-alt text-slate-500 rounded-xl hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center shadow-sm"
                                            title="Ver Expediente"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onAttendanceHistory(alum)}
                                            className="w-10 h-10 bg-brand-surface-alt text-slate-500 rounded-xl hover:bg-brand-accent hover:text-white transition-all flex items-center justify-center shadow-sm"
                                            title="Historial de Asistencias"
                                        >
                                            <History size={18} />
                                        </button>
                                        <button
                                            onClick={() => onChangeLevel(alum)}
                                            disabled={!alum.fechaCorte}
                                            title={!alum.fechaCorte ? "Alumno sin inscripción" : "Cambiar horario"}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm
                                                ${!alum.fechaCorte
                                                    ? 'bg-brand-surface-alt text-slate-300 cursor-not-allowed shadow-none'
                                                    : 'bg-brand-primary text-white hover:bg-brand-accent-dark active:scale-95'
                                                }`}
                                        >
                                            <RefreshCw size={16} className={`${alum.fechaCorte ? 'group-hover:rotate-180' : ''} transition-transform duration-500`} />
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentTable;