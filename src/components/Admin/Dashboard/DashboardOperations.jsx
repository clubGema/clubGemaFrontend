import React, { useState, useMemo, useRef, useEffect } from 'react';
import { FileSpreadsheet, Filter, X, RotateCcw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const DashboardOperations = ({ reporte = [], handleExportExcel, isExporting, setReporteFiltrado }) => {
    const [filterState, setFilterState] = useState({});
    const [activeCol, setActiveCol] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const popoverRef = useRef(null);
    const rowsPerPage = 15;

    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const selectFilterCols = ['Estado Deuda', 'Validación Admin', 'Nivel', 'Medio de pago', 'Sede'];

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target)) setActiveCol(null);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 1. USEMEMO: Actualizado para manejar el filtro booleano estricto de Boleta/Factura
    const processedData = useMemo(() => {
        return reporte.filter(item => {
            return Object.entries(filterState).every(([key, val]) => {
                if (!val) return true;
                
                // Nueva regla estricta para el select de Boleta/Factura
                if (key === 'Boleta/Factura') {
                    return String(item[key]) === val;
                }
                
                if (key.includes('Fecha')) {
                    const dateParts = String(item[key]).split('/');
                    const monthIndex = parseInt(dateParts[1]) - 1;
                    return meses[monthIndex] === val;
                }
                if (key === 'Monto') {
                    const num = parseFloat(item[key]);
                    const [min, max] = val.split('-');
                    return num >= (parseFloat(min) || 0) && num <= (parseFloat(max) || 999999);
                }
                return String(item[key]).toLowerCase().includes(String(val).toLowerCase());
            });
        });
    }, [reporte, filterState]);

    useEffect(() => {
        if (setReporteFiltrado) {
            setReporteFiltrado(processedData);
        }
        setCurrentPage(1);
    }, [processedData, setReporteFiltrado]);

    const handleInlineEdit = async (id, campo, valor) => {
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
            }
        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="pt-10 mt-10">
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="font-black text-[#1e3a8a] text-xl uppercase italic">Reporte Maestro</h2>
                        <div className="flex flex-wrap gap-2 mt-3">
                            {Object.entries(filterState).map(([key, val]) => val && (
                                <span key={key} className="bg-blue-50 text-[#1e3a8a] text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                    {key === 'Boleta/Factura' ? (val === 'true' ? 'Enviado' : 'Pendiente') : val}
                                    <X size={10} className="cursor-pointer ml-1" onClick={() => setFilterState({...filterState, [key]: ''})} />
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setFilterState({})} className="text-[10px] font-black text-slate-400 hover:text-red-500 uppercase flex items-center gap-1">
                            <RotateCcw size={12} /> Limpiar
                        </button>
                        <button onClick={handleExportExcel} disabled={isExporting} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-colors">
                            <FileSpreadsheet size={12} className="inline mr-1" /> Exportar Excel
                        </button>
                    </div>
                </div>

                <div className="border rounded-2xl">
                    <div className="overflow-x-auto min-h-[350px] pb-10">
                        <table className="w-full text-left min-w-[1000px]">
                            <thead className="bg-slate-50">
                                <tr className="text-[10px] uppercase font-black text-slate-400">
                                    {reporte.length > 0 && Object.keys(reporte[0]).filter(k => k !== 'id').map((key) => (
                                        <th key={key} className="p-4 relative overflow-visible whitespace-nowrap">
                                            <div className="flex items-center gap-2">{key} 
                                                <Filter size={10} className="cursor-pointer hover:text-[#1e3a8a] transition-colors" onClick={() => setActiveCol(activeCol === key ? null : key)} />
                                            </div>
                                            {activeCol === key && (
                                                <div ref={popoverRef} className="absolute top-12 left-0 w-64 bg-white p-4 shadow-2xl rounded-2xl border z-[9999] font-normal text-slate-600">
                                                    <p className="text-[10px] font-bold mb-3 text-slate-400 uppercase">FILTRAR POR {key}</p>
                                                    
                                                    {selectFilterCols.includes(key) ? (
                                                        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                                            {[...new Set(reporte.map(item => item[key]))].filter(Boolean).map(opt => (
                                                                <button key={opt} onClick={() => setFilterState({...filterState, [key]: opt})} className={`flex justify-between items-center px-3 py-2 text-xs rounded-lg transition-colors ${filterState[key] === opt ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                                                    {opt} {filterState[key] === opt && <Check size={12} />}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : key.includes('Fecha') ? (
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {meses.map(m => (
                                                                <button key={m} onClick={() => setFilterState({...filterState, [key]: m})} className={`p-2 text-[10px] rounded-lg border transition-colors ${filterState[key] === m ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'hover:bg-slate-50'}`}>
                                                                    {m}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : key === 'Monto' ? (
                                                        <div className="flex gap-2">
                                                            <input type="number" placeholder="Min" className="w-1/2 p-2 border rounded-lg text-xs outline-none focus:border-[#1e3a8a]" onChange={(e) => setFilterState({...filterState, [key]: `${e.target.value}-${filterState[key]?.split('-')[1] || ''}`})} />
                                                            <input type="number" placeholder="Max" className="w-1/2 p-2 border rounded-lg text-xs outline-none focus:border-[#1e3a8a]" onChange={(e) => setFilterState({...filterState, [key]: `${filterState[key]?.split('-')[0] || ''}-${e.target.value}`})} />
                                                        </div>
                                                    // 🔥 AQUI ESTÁ EL NUEVO SELECT PARA EL FILTRO POPUP 🔥
                                                    ) : key === 'Boleta/Factura' ? (
                                                        <select
                                                            className="w-full p-2 border rounded-lg text-xs outline-none focus:border-[#1e3a8a] text-slate-600 cursor-pointer"
                                                            value={filterState[key] || ''}
                                                            onChange={(e) => setFilterState({...filterState, [key]: e.target.value})}
                                                        >
                                                            <option value="">Todos los registros</option>
                                                            <option value="true">Enviado</option>
                                                            <option value="false">Pendiente</option>
                                                        </select>
                                                    ) : (
                                                        <input className="w-full p-2 border rounded-lg text-xs outline-none focus:border-[#1e3a8a]" placeholder="Escribir..." value={filterState[key] || ''} onChange={(e) => setFilterState({...filterState, [key]: e.target.value})} />
                                                    )}
                                                </div>
                                            )}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-xs text-slate-600 font-bold">
                                {paginatedData.length > 0 ? paginatedData.map((item, idx) => (
                                    <tr key={item.id || idx} className="border-b hover:bg-slate-50 transition-colors">
                                        {Object.entries(item).filter(([k]) => k !== 'id').map(([key, val], i) => {
                                            
                                            // COLUMNA SELECT EDITABLE (Boleta/Factura)
                                            if (key === 'Boleta/Factura') {
                                                return (
                                                    <td key={i} className="p-4 text-center">
                                                        <select
                                                            defaultValue={val === true ? "true" : "false"}
                                                            className={`p-1.5 text-xs font-bold rounded-lg outline-none cursor-pointer border ${
                                                                val === true 
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}
                                                            onChange={(e) => {
                                                                const booleanValue = e.target.value === "true";
                                                                handleInlineEdit(item.id, key, booleanValue);
                                                            }}
                                                        >
                                                            <option value="true">Enviado</option>
                                                            <option value="false">Pendiente</option>
                                                        </select>
                                                    </td>
                                                );
                                            }

                                            // COLUMNA TEXTO EDITABLE
                                            if (key === 'Comentarios') {
                                                return (
                                                    <td key={i} className="p-4 min-w-[200px]">
                                                        <input 
                                                            type="text" 
                                                            defaultValue={String(val || '')}
                                                            placeholder="Añadir comentario..."
                                                            className="w-full p-2 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded bg-transparent focus:bg-white outline-none transition-all font-medium text-slate-600"
                                                            onBlur={(e) => {
                                                                if (e.target.value !== String(val || '')) {
                                                                    handleInlineEdit(item.id, key, e.target.value);
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') e.target.blur();
                                                            }}
                                                        />
                                                    </td>
                                                );
                                            }

                                            return <td key={i} className="p-4 whitespace-nowrap">{String(val || '')}</td>;
                                        })}
                                    </tr>
                                )) : (
                                    <tr><td colSpan="100%" className="p-10 text-center text-slate-400">No se encontraron registros.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Página {currentPage} de {totalPages}</span>
                        <div className="flex gap-2">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronLeft size={14} /></button>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg hover:bg-slate-100 disabled:opacity-50 transition-colors"><ChevronRight size={14} /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardOperations;