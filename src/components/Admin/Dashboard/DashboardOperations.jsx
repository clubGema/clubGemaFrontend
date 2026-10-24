import React, { memo, useCallback, useState, useMemo, useRef, useEffect } from 'react';
import { FileSpreadsheet, Filter, X, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';
import { usePagination } from '../../../hooks/usePagination';

// A nivel de modulo: antes se reconstruian en cada render.
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const SELECT_FILTER_COLS = ['Estado Deuda', 'Validación Admin', 'Nivel', 'Medio de pago', 'Sede'];
const ROWS_PER_PAGE = 15;

/**
 * Celda de comentario con estado propio.
 *
 * Antes cada pulsacion hacia setLocalReporte sobre el array completo, lo que
 * re-filtraba todo el dataset, empujaba el resultado al padre y repintaba los 6
 * graficos de Recharts. Ahora el texto vive aqui y solo se confirma al salir del
 * campo, que es cuando ya se llamaba a la API.
 */
const ComentarioCell = memo(({ valor, onCommit }) => {
    const [texto, setTexto] = useState(String(valor ?? ''));
    const [valorPrevio, setValorPrevio] = useState(valor);

    // Si el valor cambia por fuera (recarga, rollback de un error), se adopta.
    // Ajuste en render en vez de useEffect: es el patron que recomienda React
    // para resincronizar estado con una prop, y evita el repintado extra.
    if (valor !== valorPrevio) {
        setValorPrevio(valor);
        setTexto(String(valor ?? ''));
    }

    return (
        <input
            type="text"
            value={texto}
            placeholder="Añadir comentario..."
            className="w-full p-2 border border-transparent hover:border-slate-300 focus:border-brand-accent rounded bg-transparent focus:bg-brand-surface outline-none transition-all font-medium text-slate-600"
            onChange={(e) => setTexto(e.target.value)}
            onBlur={() => { if (texto !== String(valor ?? '')) onCommit(texto); }}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
        />
    );
});

const DashboardOperations = ({ reporte = [], onExport, isExporting }) => {
    // Copia local para la edicion optimista de la tabla.
    const [localReporte, setLocalReporte] = useState([]);

    const [filterState, setFilterState] = useState({});
    const [activeCol, setActiveCol] = useState(null);
    const popoverRef = useRef(null);

    // 2. NUEVO: Sincronizamos los datos del prop 'reporte' con nuestro estado local
    useEffect(() => {
        setLocalReporte(reporte);
    }, [reporte]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) setActiveCol(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const processedData = useMemo(() => {
        return localReporte.filter(item => {
            return Object.entries(filterState).every(([key, val]) => {
                if (!val) return true;
                
                if (key === 'Boleta/Factura') {
                    return String(item[key]) === val;
                }
                
                if (key.includes('Fecha')) {
                    const dateParts = String(item[key]).split('/');
                    const monthIndex = parseInt(dateParts[1]) - 1;
                    return MESES[monthIndex] === val;
                }
                if (key === 'Monto') {
                    const num = parseFloat(item[key]);
                    const [min, max] = val.split('-');
                    return num >= (parseFloat(min) || 0) && num <= (parseFloat(max) || 999999);
                }
                return String(item[key]).toLowerCase().includes(String(val).toLowerCase());
            });
        });
    }, [localReporte, filterState]);

    const { currentPage, setCurrentPage, totalPages, pageItems: paginatedData } =
        usePagination(processedData, ROWS_PER_PAGE);

    // Solo los filtros devuelven a la pagina 1. Antes este efecto dependia de
    // processedData, asi que cualquier edicion optimista (teclear un comentario)
    // tambien te sacaba de la pagina en la que estabas.
    useEffect(() => {
        setCurrentPage(1);
    }, [filterState]);

    // Actualización optimista. useCallback + setLocalReporte funcional para no
    // depender de localReporte y mantener identidad estable.
    const handleInlineEdit = useCallback(async (id, campo, valor) => {
        let previousData = [];
        setLocalReporte(prev => {
            previousData = prev;
            return prev.map(item => (item.id === id ? { ...item, [campo]: valor } : item));
        });

        try {
            const url = API_ROUTES.USUARIOS.EDIT_PAGO(id);
            const response = await apiFetch.patch(url, {
                campo,
                valor
            });
            
            if (response.ok) {
                toast.success('Guardado correctamente');
            } else {
                toast.error('Error al guardar');
                setLocalReporte(previousData); // Revertimos si hay error
            }
        } catch (error) {
            console.error('Error en handleInlineEdit:', error);
            toast.error('Error de conexión');
            setLocalReporte(previousData); // Revertimos si hay error de red
        }
    }, []);

    return (
        <div className="pt-10 mt-10">
            <div className="bg-brand-surface rounded-[2rem] border border-brand-border-soft shadow-sm p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="font-black text-brand-primary text-xl uppercase italic">Reporte Maestro</h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(filterState).map(([key, val]) => val && (
                                <span key={key} className="bg-brand-primary-soft text-brand-primary text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    {key === 'Boleta/Factura' ? (val === 'true' ? 'Enviado' : 'Pendiente') : val}
                                    <X size={10} className="cursor-pointer ml-1" onClick={() => setFilterState({...filterState, [key]: ''})} />
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setFilterState({})} className="text-[10px] font-black text-brand-muted hover:text-red-500 uppercase flex items-center gap-1">
                            <RotateCcw size={12} /> Limpiar
                        </button>
                        <button onClick={() => onExport(processedData)} disabled={isExporting} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-colors">
                            <FileSpreadsheet size={12} className="inline mr-1" /> Exportar Excel
                        </button>
                    </div>
                </div>

                <div className="border rounded-2xl">
                    <div className="overflow-x-auto min-h-[350px] pb-10">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-brand-bg">
                                <tr className="text-[10px] uppercase font-black text-brand-muted">
                                    {/* CAMBIO: Usamos localReporte[0] para generar los headers */}
                                    {localReporte.length > 0 && Object.keys(localReporte[0]).filter(k => k !== 'id').map((key) => (
                                        <th key={key} className="p-4 relative overflow-visible whitespace-nowrap">
                                            <div className="flex items-center gap-2">{key} 
                                                <Filter size={10} className="cursor-pointer hover:text-brand-primary transition-colors" onClick={() => setActiveCol(activeCol === key ? null : key)} />
                                            </div>
                                            {activeCol === key && (
                                                <div ref={popoverRef} className="absolute top-12 left-0 w-64 bg-brand-surface p-4 shadow-2xl rounded-2xl border z-dropdown font-normal text-slate-600">
                                                    <p className="text-[10px] font-bold mb-3 text-brand-muted uppercase">FILTRAR POR {key}</p>
                                                    
                                                    {SELECT_FILTER_COLS.includes(key) ? (
                                                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                                            {/* CAMBIO: Usamos localReporte */}
                                                            {[...new Set(localReporte.map(item => item[key]))].filter(Boolean).map(opt => (
                                                                <button key={opt} onClick={() => setFilterState({...filterState, [key]: opt})} className={`flex justify-between items-center px-3 py-2 text-xs rounded-lg transition-colors ${filterState[key] === opt ? 'bg-brand-primary text-white' : 'hover:bg-brand-surface-alt'}`}>
                                                                    {opt} {filterState[key] === opt && <Check size={12} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : key.includes('Fecha') ? (
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {MESES.map(m => (
                                                                <button key={m} onClick={() => setFilterState({...filterState, [key]: m})} className={`p-2 text-[10px] rounded-lg border transition-colors ${filterState[key] === m ? 'bg-brand-primary text-white border-brand-primary' : 'hover:bg-brand-bg'}`}>
                                                                    {m}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : key === 'Monto' ? (
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="Min" className="w-1/2 p-2 border rounded-lg text-xs outline-none focus:border-brand-primary" onChange={(e) => setFilterState({...filterState, [key]: `${e.target.value}-${filterState[key]?.split('-')[1] || ''}`})} />
                                                            <input type="number" placeholder="Max" className="w-1/2 p-2 border rounded-lg text-xs outline-none focus:border-brand-primary" onChange={(e) => setFilterState({...filterState, [key]: `${filterState[key]?.split('-')[0] || ''}-${e.target.value}`})} />
                                                        </div>
                                                    ) : key === 'Boleta/Factura' ? (
                                                        <select
                                                            className="w-full p-2 border rounded-lg text-xs outline-none focus:border-brand-primary text-slate-600 cursor-pointer"
                                                            value={filterState[key] || ''}
                                                            onChange={(e) => setFilterState({...filterState, [key]: e.target.value})}
                                                        >
                                                            <option value="">Todos los registros</option>
                                                            <option value="true">Enviado</option>
                                                            <option value="false">Pendiente</option>
                                                        </select>
                                                    ) : (
                                                        <input className="w-full p-2 border rounded-lg text-xs outline-none focus:border-brand-primary" placeholder="Escribir..." value={filterState[key] || ''} onChange={(e) => setFilterState({...filterState, [key]: e.target.value})} />
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-600 font-bold">
                                {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                                    <tr key={item.id || idx} className="border-b hover:bg-brand-bg transition-colors">
                                        {Object.entries(item).filter(([k]) => k !== 'id').map(([key, val], i) => {
                                            
                                            // CHECKBOX BOOLETA/FACTURA
                                            if (key === 'Boleta/Factura') {
                                                const isChecked = val === true || val === 'true';
                                                return (
                                                    <td key={i} className="p-4 text-center">
                                                        <label className="flex items-center justify-start gap-2 cursor-pointer w-fit">
                                                            <input 
                                                                type="checkbox" 
                                                                className="hidden"
                                                                checked={isChecked} 
                                                                onChange={(e) => {
                                                                    handleInlineEdit(item.id, key, e.target.checked);
                                                                }}
                                                            />
                                                            <div className={`w-4 h-4 rounded shadow-sm border flex items-center justify-center transition-all duration-200 ${
                                                                isChecked 
                                                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                                                : 'bg-brand-surface border-slate-300 text-transparent hover:border-emerald-400'
                                                            }`}>
                                                                <Check size={12} strokeWidth={4} />
                                                            </div>
                                                            <span className={`text-[10px] uppercase font-black tracking-wide ${
                                                                isChecked ? 'text-emerald-600' : 'text-brand-muted'
                                                            }`}>
                                                                {isChecked ? 'Enviado' : 'Pendiente'}
                                                            </span>
                                                        </label>
                                                    </td>
                                                );
                                            }

                                            // TEXTO EDITABLE
                                            if (key === 'Comentarios') {
                                                return (
                                                    <td key={i} className="p-4 min-w-[200px]">
                                                        <ComentarioCell
                                                            valor={val}
                                                            onCommit={(texto) => handleInlineEdit(item.id, key, texto)}
                                                        />
                                                    </td>
                                                );
                                            }

                                            return <td key={i} className="p-4 whitespace-nowrap">{String(val || '')}</td>;
                                        })}
                                    </tr>
                                )) : (
                                    <tr><td colSpan="100%" className="p-10 text-center text-brand-muted">No se encontraron registros.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] text-brand-muted font-bold uppercase">Página {currentPage} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg hover:bg-brand-surface-alt disabled:opacity-50 transition-colors"><ChevronLeft size={14} /></button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg hover:bg-brand-surface-alt disabled:opacity-50 transition-colors"><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOperations;