import React, { useState, useMemo } from 'react';
import { Fingerprint, MapPin, Phone, Eye, RefreshCw, Zap, ArrowUpDown, Filter, AlertCircle, CreditCard, Search, History } from 'lucide-react';
import { format, subDays } from 'date-fns';

const StudentTable = ({ currentAlumnos, onViewDetails, onAttendanceHistory, onOpenInscriptions, onChangeLevel }) => {
    // 1. ESTADOS PARA ORDENAMIENTO Y FILTROS ESTILO EXCEL
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({ sede: '', nivel: '', estadoVisual: '' });

    // 🔥 NUEVO ESTADO: Filtro de texto avanzado para la primera columna
    const [textFilter, setTextFilter] = useState({ field: 'full_name', value: '' });
    const [isTextFilterOpen, setIsTextFilterOpen] = useState(false);

    // 2. EXTRAER OPCIONES ÚNICAS PARA LOS SELECTS
    const uniqueSedes = [...new Set(currentAlumnos.flatMap(a => a.sedes))].filter(Boolean);
    const uniqueNiveles = [...new Set(currentAlumnos.flatMap(a => a.niveles))].filter(Boolean);
    const uniqueEstados = [...new Set(currentAlumnos.map(a => a.estadoVisual))].filter(Boolean);

    // 3. FUNCIÓN DE ORDENAMIENTO
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // 4. APLICAR FILTROS Y ORDENAMIENTO (USEMEMO)
    const processedAlumnos = useMemo(() => {
        let result = [...currentAlumnos];

        // A. Aplicar Filtro Avanzado de Texto (Nombre, DNI o Celular)
        if (textFilter.value) {
            const lowerValue = textFilter.value.toLowerCase();
            result = result.filter(a => {
                const val = String(a[textFilter.field] || '').toLowerCase();
                return val.includes(lowerValue);
            });
        }

        // B. Aplicar Filtros (Segmentadores Dropdown)
        if (filters.sede) result = result.filter(a => a.sedes.includes(filters.sede));
        if (filters.nivel) result = result.filter(a => a.niveles.includes(filters.nivel));
        if (filters.estadoVisual) result = result.filter(a => a.estadoVisual === filters.estadoVisual);

        // C. Aplicar Ordenamiento
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'monto_pendiente') {
                    aValue = parseFloat(a.monto_pendiente || 0);
                    bValue = parseFloat(b.monto_pendiente || 0);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [currentAlumnos, sortConfig, filters, textFilter]);

    // Comprobar si hay algún filtro activo para mostrar la barra naranja
    const hasFilters = filters.sede || filters.nivel || filters.estadoVisual || textFilter.value;

    // --- SUBCOMPONENTES DE CABECERA ---
    const SortableHeader = ({ label, sortKey, align = 'left' }) => (
        <th className={`p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`} onClick={() => requestSort(sortKey)}>
            <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                {label}
                <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === sortKey ? 'opacity-100 text-[#1e3a8a]' : 'opacity-30 group-hover:opacity-100'}`} />
            </div>
        </th>
    );

    const FilterHeader = ({ label, filterKey, options, align = 'center' }) => (
        <th className={`p-4 group ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}>
            <div className={`flex items-center gap-1.5 ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
                <span>{label}</span>
                <div className="relative inline-flex items-center justify-center">
                    <Filter size={12} className={`transition-colors ${filters[filterKey] !== '' ? 'text-orange-500' : 'text-slate-300 group-hover:text-blue-500'}`} />
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

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-visible">

            {/* Aviso de Filtros Activos */}
            {hasFilters && (
                <div className="bg-orange-50 px-6 py-2 border-b border-orange-100 flex items-center justify-between">
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Filtros Aplicados</span>
                    <button
                        onClick={() => {
                            setFilters({ sede: '', nivel: '', estadoVisual: '' });
                            setTextFilter({ field: 'full_name', value: '' });
                        }}
                        className="text-[9px] font-bold bg-white border border-orange-200 text-orange-500 px-3 py-1 rounded-lg hover:bg-orange-500 hover:text-white transition-all"
                    >
                        Limpiar Filtros
                    </button>
                </div>
            )}

            <div className="overflow-x-auto overflow-y-visible">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100 font-black text-[9px] text-slate-400 uppercase tracking-[0.15em]">

                            {/* 🔥 NUEVO: CABECERA PERSONALIZADA CON POP-UP DE BÚSQUEDA */}
                            <th className="p-4 pl-6 text-left group select-none relative">
                                <div className="flex items-center gap-2">
                                    <div className="cursor-pointer flex items-center gap-1.5 hover:bg-slate-100 p-1 rounded transition-colors" onClick={() => requestSort('full_name')}>
                                        Alumno / Contacto
                                        <ArrowUpDown size={12} className={`transition-opacity ${sortConfig.key === 'full_name' ? 'opacity-100 text-[#1e3a8a]' : 'opacity-30 group-hover:opacity-100'}`} />
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => setIsTextFilterOpen(!isTextFilterOpen)}
                                            className="p-1 rounded hover:bg-slate-200 transition-colors"
                                            title="Búsqueda Avanzada"
                                        >
                                            <Search size={12} className={textFilter.value ? 'text-orange-500' : 'text-slate-300 group-hover:text-[#1e3a8a]'} />
                                        </button>

                                        {/* POP-UP DEL BUSCADOR */}
                                        {isTextFilterOpen && (
                                            <div className="absolute top-full left-6 mt-1 bg-white border border-slate-200 shadow-2xl rounded-2xl p-4 w-64 z-50 normal-case tracking-normal font-normal">
                                                <p className="text-[10px] font-black text-[#1e3a8a] uppercase mb-2 tracking-widest">Filtro de Texto</p>

                                                <select
                                                    value={textFilter.field}
                                                    onChange={(e) => setTextFilter({ ...textFilter, field: e.target.value })}
                                                    className="w-full mb-3 p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-bold text-slate-700 cursor-pointer"
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
                                                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-bold transition-all"
                                                    autoFocus
                                                />

                                                <div className="flex justify-between items-center mt-4">
                                                    <button
                                                        onClick={() => { setTextFilter({ field: 'full_name', value: '' }); setIsTextFilterOpen(false); }}
                                                        className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        Limpiar
                                                    </button>
                                                    <button
                                                        onClick={() => setIsTextFilterOpen(false)}
                                                        className="text-[10px] font-black bg-[#1e3a8a] hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                                    >
                                                        Aplicar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </th>

                            <FilterHeader label="Sede" filterKey="sede" options={uniqueSedes} align="left" />
                            <FilterHeader label="Nivel" filterKey="nivel" options={uniqueNiveles} />
                            <FilterHeader label="Estado" filterKey="estadoVisual" options={uniqueEstados} />
                            <SortableHeader label="Deuda Pendiente" sortKey="monto_pendiente" align="right" />
                            <th className="p-4 text-center">Gestión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {processedAlumnos.length === 0 ? (
                            <tr><td colSpan="6" className="p-12 text-center text-slate-400 text-xs font-bold uppercase italic">No se encontraron alumnos con esos filtros</td></tr>
                        ) : processedAlumnos.map((alum) => (
                            <tr key={alum.id} className="hover:bg-blue-50/30 transition-all group">

                                {/* COLUMNA 1: ALUMNO Y CONTACTO */}
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center font-black text-xl italic shadow-md shadow-blue-100 shrink-0">
                                            {alum.nombres.charAt(0)}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter leading-none">{alum.full_name}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center gap-1 text-[9px] font-bold ${textFilter.field === 'dni' && textFilter.value ? 'text-orange-500 bg-orange-50 px-1 rounded' : 'text-slate-400'}`}>
                                                    <Fingerprint size={10} /> {alum.dni}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[9px] font-bold ${textFilter.field === 'telefono' && textFilter.value ? 'text-orange-500 bg-orange-50 px-1 rounded' : 'text-blue-500'}`}>
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
                                            <span key={idx} className="inline-flex items-center gap-1 w-fit text-[9px] font-black text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md uppercase border border-orange-100 italic">
                                                <MapPin size={10} /> {s}
                                            </span>
                                        )) : (
                                            <span className="inline-flex items-center gap-1 w-fit text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md uppercase border border-slate-100 italic">S/N</span>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMNA 3: NIVEL */}
                                <td className="p-4 text-center">
                                    <div className="flex justify-center flex-wrap gap-1">
                                        {alum.niveles.length > 0 ? alum.niveles.map((n, idx) => (
                                            <span key={idx} className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-indigo-100 italic">{n}</span>
                                        )) : (
                                            <span className="bg-slate-100 text-slate-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase border border-slate-200 italic">SIN NIVEL</span>
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
                                        <span className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5
                                            ${alum.estadoVisual === 'ACTIVO' ? (alum.estaVencido ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200') : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                                        >
                                            <Zap size={10} fill="currentColor" className={alum.multiplesActivas ? "animate-bounce" : ""} />
                                            {alum.estadoVisual === 'ACTIVO' ? (alum.estaVencido ? 'VENCIDO' : 'ACTIVO') : alum.estadoVisual}
                                            {alum.multiplesActivas && <span className="bg-orange-500 text-white px-1 rounded ml-1 animate-pulse">+</span>}
                                        </span>
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
                                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                            title="Ver Expediente"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={() => onAttendanceHistory(alum)}
                                            className="w-10 h-10 bg-slate-100 text-slate-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
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
                                                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                                    : 'bg-[#1e3a8a] text-white hover:bg-orange-600 active:scale-95'
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