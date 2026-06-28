import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit2, Loader2, Calendar, FileSpreadsheet, Lock, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { apiFetch } from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const currentYear = new Date().getFullYear();
const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", 
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// 🛠️ FIX DEFINITIVO DE ZONA HORARIA
const formatLocalToUTC = (fechaStr) => {
    if(!fechaStr) return new Date().toISOString();
    const [yyyy, mm, dd] = fechaStr.split('-');
    return new Date(yyyy, mm - 1, dd, 12, 0, 0).toISOString();
};

const formatUTCtoLocalInput = (fechaISO) => {
    if(!fechaISO) return '';
    const d = new Date(fechaISO);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AdminCashFlow = () => {
    const [datosPorMes, setDatosPorMes] = useState({});
    const [loadingMeses, setLoadingMeses] = useState({});
    const [sedes, setSedes] = useState([]);
    
    const [filtroAnio, setFiltroAnio] = useState(currentYear);
    const [mesesAbiertos, setMesesAbiertos] = useState([]);

    const [inlineEditId, setInlineEditId] = useState(null);
    const [inlineData, setInlineData] = useState({ concepto: '', monto: '', fecha: '', sede_id: '' });

    const [addingMonth, setAddingMonth] = useState(null);
    const [addingType, setAddingType] = useState(null);
    const [newData, setNewData] = useState({ concepto: '', monto: '', fecha: '', sede_id: '' });
    const [submitting, setSubmitting] = useState(false);

    // 1. Cargar las sedes al iniciar
    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const response = await apiFetch.get(API_ROUTES.SEDES.ACTIVOS);
                if (response.ok) {
                    const data = await response.json();
                    setSedes(data.data || []);
                }
            } catch (error) {
                console.error("No se pudieron cargar las sedes", error);
            }
        };
        fetchSedes();
    }, []);

    // 2. Obtener resumen del mes
    const fetchMes = async (mesNum, anio, mostrarError = true) => {
        try {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: true }));
            const url = API_ROUTES.CAJA ? `${API_ROUTES.CAJA.RESUMEN}?mes=${mesNum}&anio=${anio}` : `/caja/resumen?mes=${mesNum}&anio=${anio}`;
            
            const response = await apiFetch.get(url);
            const data = await response.json();

            if (response.ok && data.success && data.data) {
                let ingresosFlats = [];
                let egresosFlats = [];

                Object.entries(data.data).forEach(([sedeNombre, movimientosSede]) => {
                    movimientosSede.ingresos.forEach(ing => ingresosFlats.push({ ...ing, sede: sedeNombre, tipo: 'INGRESO' }));
                    movimientosSede.egresos.forEach(egr => egresosFlats.push({ ...egr, sede: sedeNombre, tipo: 'EGRESO' }));
                });

                setDatosPorMes(prev => ({
                    ...prev,
                    [mesNum]: { ingresos: ingresosFlats, egresos: egresosFlats }
                }));
            } else {
                if(mostrarError) toast.error(data.message || `Error al cargar mes ${mesNum}`);
            }
        } catch (error) {
            if(mostrarError) toast.error(`Error al cargar el mes ${mesNum}`);
        } finally {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: false }));
        }
    };

    // 3. 🚀 FIX CARGA INICIAL: Cargamos TODOS los meses en paralelo al entrar
    useEffect(() => {
        const cargarTodoElAnio = async () => {
            setDatosPorMes({}); // Limpiamos la data previa
            
            // Creamos un array de promesas para pedir los 12 meses al mismo tiempo
            const promesas = MESES.map((_, index) => fetchMes(index + 1, filtroAnio, false));
            
            // Ejecutamos las 12 peticiones en paralelo para que sea rapidísimo
            await Promise.all(promesas);

            // Dejamos el mes actual abierto por comodidad
            const mesActual = new Date().getMonth() + 1;
            setMesesAbiertos([mesActual]); 
        };

        cargarTodoElAnio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroAnio]);

    // 4. Lógica de Acordeón
    const toggleMes = (mesNum) => {
        setMesesAbiertos(prev => 
            prev.includes(mesNum) ? prev.filter(m => m !== mesNum) : [...prev, mesNum]
        );
        // Ya no necesitamos cargar aquí porque el useEffect del inicio ya cargó todo
    };

    // 5. Lógica de Edición y Creación
    const startInlineEdit = (movimiento) => {
        setInlineEditId(movimiento.id);
        const sedeEncontrada = sedes.find(s => s.nombre === movimiento.sede);
        setInlineData({ 
            concepto: movimiento.concepto, 
            monto: movimiento.monto, 
            fecha: formatUTCtoLocalInput(movimiento.fecha),
            sede_id: sedeEncontrada ? sedeEncontrada.id : ''
        });
    };

    const saveInlineEdit = async (id, mesNum) => {
        if (!inlineData.concepto || !inlineData.monto) return toast.error("Complete concepto y monto");
        try {
            setSubmitting(true);
            const endpoint = `${API_ROUTES.CAJA?.BASE || '/caja'}/${id}`; 
            const payload = {
                concepto: inlineData.concepto,
                monto: parseFloat(inlineData.monto),
                fecha_movimiento: formatLocalToUTC(inlineData.fecha),
                sede_id: inlineData.sede_id ? parseInt(inlineData.sede_id) : null
            };
            const response = await apiFetch.put(endpoint, payload);
            if (response.ok) {
                toast.success("Movimiento actualizado");
                setInlineEditId(null);
                await fetchMes(mesNum, filtroAnio); 
            } else {
                const err = await response.json();
                toast.error(err.message || "Error al actualizar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const startAddNew = (mesNum, tipoMovimiento) => {
        const mesStr = String(mesNum).padStart(2, '0');
        setAddingMonth(mesNum);
        setAddingType(tipoMovimiento);
        setNewData({ concepto: '', monto: '', fecha: `${filtroAnio}-${mesStr}-01`, sede_id: '' });
    };

    const saveNewMovimiento = async (mesNum) => {
        if (!newData.concepto || !newData.monto || !newData.fecha) return toast.error("Complete los datos requeridos");
        try {
            setSubmitting(true);
            const endpoint = API_ROUTES.CAJA?.BASE || '/caja'; 
            const payload = {
                tipo_movimiento: addingType,
                concepto: newData.concepto,
                monto: parseFloat(newData.monto),
                fecha_movimiento: formatLocalToUTC(newData.fecha),
                sede_id: newData.sede_id ? parseInt(newData.sede_id) : null
            };
            const response = await apiFetch.post(endpoint, payload);
            
            if (response.ok) {
                toast.success(`${addingType} registrado correctamente`);
                setAddingMonth(null);
                setAddingType(null);
                await fetchMes(mesNum, filtroAnio); 
            } else {
                const err = await response.json();
                toast.error(err.message || "Error al registrar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    // --- EXPORTAR A EXCEL (¡AQUÍ ESTÁ LA MAGIA DE LA AUDITORÍA!) ---
    const exportToExcel = () => {
        let dataToExport = [];
        Object.keys(datosPorMes).forEach(mes => {
            const dataMes = datosPorMes[mes];
            const todos = [...dataMes.ingresos, ...dataMes.egresos];
            
            // Ordenamos por fecha para que el Excel quede súper limpio
            todos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

            todos.forEach(m => {
                dataToExport.push({
                    "AÑO": filtroAnio,
                    "MES": MESES[parseInt(mes) - 1],
                    "FECHA": new Date(m.fecha).toLocaleDateString(),
                    "SEDE": m.sede,
                    "TIPO": m.tipo,
                    "ALUMNO RELACIONADO": m.alumno || '-',            // <--- NUEVA COLUMNA INYECTADA
                    "CONCEPTO": m.concepto,
                    "MONTO (S/)": m.tipo === 'INGRESO' ? parseFloat(m.monto) : -parseFloat(m.monto),
                    "REGISTRADO POR": m.registrado_por || '-'         // <--- NUEVA COLUMNA INYECTADA
                });
            });
        });

        if(dataToExport.length === 0) return toast.error("No hay datos para exportar.");
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Flujo ${filtroAnio}`);
        XLSX.writeFile(workbook, `Flujo_Caja_Gema_${filtroAnio}.xlsx`);
        toast.success("Reporte Excel descargado (Con detalle de Auditoría)");
    };

    const renderMes = (mesNum, mesNombre) => {
        const isOpen = mesesAbiertos.includes(mesNum);
        const isLoading = loadingMeses[mesNum];
        
        const ingresosMes = datosPorMes[mesNum]?.ingresos || [];
        const egresosMes = datosPorMes[mesNum]?.egresos || [];
        
        const totalIng = ingresosMes.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const totalEgr = egresosMes.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        const balance = totalIng - totalEgr;

        const ingresosAutomaticos = ingresosMes.filter(m => !m.id);
        const ingresosManuales = ingresosMes.filter(m => m.id);

        const ingresosAgrupadosObj = ingresosAutomaticos.reduce((acc, curr) => {
            if (!acc[curr.sede]) {
                acc[curr.sede] = {
                    id: `auto-${curr.sede}`,
                    sede: curr.sede,
                    concepto: 'INGRESOS AUTOMATIZADOS',
                    monto: 0,
                    cantidad: 0,
                };
            }
            acc[curr.sede].monto += parseFloat(curr.monto);
            acc[curr.sede].cantidad += 1;
            return acc;
        }, {});
        const ingresosAgrupados = Object.values(ingresosAgrupadosObj);

        return (
            <div key={mesNum} className="mb-4 animate-fade-in-up">
                {/* ACORDEÓN HEADER */}
                <div 
                    onClick={() => toggleMes(mesNum)}
                    className={`bg-white border rounded-2xl px-6 py-5 cursor-pointer flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm transition-all duration-200 ${isOpen ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                >
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </div>
                        <h2 className="text-[15px] font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
                            {mesNombre} 
                            {isLoading && <Loader2 size={14} className="animate-spin text-orange-500" />}
                        </h2>
                    </div>
                    
                    <div className="flex w-full lg:w-auto justify-between lg:justify-end gap-6 lg:gap-12 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="flex flex-col text-left lg:text-right">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><TrendingUp size={10} className="text-green-500"/> Ingresos</span>
                            <span className="text-sm font-black text-slate-800">S/ {totalIng.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-left lg:text-right">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><TrendingDown size={10} className="text-orange-500"/> Egresos</span>
                            <span className="text-sm font-black text-slate-800">S/ {totalEgr.toFixed(2)}</span>
                        </div>
                        <div className="flex flex-col text-left lg:text-right">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><Activity size={10} className={balance >= 0 ? "text-[#0f172a]" : "text-red-500"}/> Balance</span>
                            <span className={`text-sm font-black ${balance >= 0 ? "text-[#0f172a]" : "text-red-600"}`}>S/ {balance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* CONTENIDO DESPLEGABLE */}
                {isOpen && !isLoading && (
                    <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-6 pl-4 pr-2 pb-4 border-l-2 border-orange-200 ml-4">
                        
                        {/* ----------------- TABLA INGRESOS (IZQUIERDA) ----------------- */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="text-green-600" size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Ingresos (Auto y Manuales)</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-grow">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="bg-[#0f172a] text-white text-[10px] uppercase tracking-widest">
                                                <th className="p-3 font-black w-24">Fecha</th>
                                                <th className="p-3 font-black w-28">Sede</th>
                                                <th className="p-3 font-black">Concepto</th>
                                                <th className="p-3 font-black text-right w-24">Monto</th>
                                                <th className="p-3 font-black text-center w-20">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            
                                            {/* FILAS AGRUPADAS AUTOMÁTICAS (Solo lectura) */}
                                            {ingresosAgrupados.map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50 bg-slate-50/50 transition-colors">
                                                    <td className="p-3 text-slate-500 font-bold uppercase text-[9px] italic">Consolidado</td>
                                                    <td className="p-3 text-[#f97316] font-bold text-[9px] uppercase"><div className="flex items-center gap-1"><MapPin size={10}/> {m.sede}</div></td>
                                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto} <span className="text-slate-400 text-[9px]">({m.cantidad} pagos)</span></td>
                                                    <td className="p-3 text-right font-black text-green-600">+ S/ {m.monto.toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center text-slate-300" title="Agrupado automáticamente (Lectura)"><Lock size={14} /></div>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* FILAS MANUALES (Editables) */}
                                            {ingresosManuales.map(m => inlineEditId === m.id ? (
                                                <tr key={m.id} className="bg-green-50/50">
                                                    <td className="p-2">
                                                        <input type="date" value={inlineData.fecha} onChange={e => setInlineData({...inlineData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-green-300 p-2 rounded-lg outline-none font-bold" />
                                                    </td>
                                                    <td className="p-2">
                                                        <select value={inlineData.sede_id} onChange={e => setInlineData({...inlineData, sede_id: e.target.value})} className="w-full text-[9px] bg-white border border-green-300 p-2 rounded-lg outline-none font-bold uppercase text-[#16a34a]">
                                                            <option value="">General</option>
                                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" value={inlineData.concepto} onChange={e => setInlineData({...inlineData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-green-300 p-2 rounded-lg outline-none font-black uppercase" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" value={inlineData.monto} onChange={e => setInlineData({...inlineData, monto: e.target.value})} className="w-full bg-white border border-green-300 p-2 rounded-lg outline-none text-right font-black" />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button disabled={submitting} onClick={() => saveInlineEdit(m.id, mesNum)} className="text-white bg-[#0f172a] hover:bg-[#1e3a8a] p-1.5 rounded-lg disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}</button>
                                                            <button disabled={submitting} onClick={() => setInlineEditId(null)} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-3 text-slate-500 font-bold">{new Date(m.fecha).toLocaleDateString()}</td>
                                                    <td className="p-3 text-[#f97316] font-bold text-[9px] uppercase"><div className="flex items-center gap-1"><MapPin size={10}/> {m.sede}</div></td>
                                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto} <span className="text-[9px] bg-slate-100 text-slate-400 px-1 rounded ml-1">Manual</span></td>
                                                    <td className="p-3 text-right font-black text-green-600">+ S/ {parseFloat(m.monto).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <button onClick={() => startInlineEdit(m)} className="text-green-600 font-black uppercase text-[9px] hover:bg-green-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-green-200">
                                                            <Edit2 size={12} /> Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* FILA PARA AGREGAR NUEVO INGRESO MANUAL */}
                                            {addingMonth === mesNum && addingType === 'INGRESO' && (
                                                <tr className="bg-green-50/50">
                                                    <td className="p-2">
                                                        <input type="date" value={newData.fecha} onChange={e => setNewData({...newData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-green-400 p-2 rounded-lg outline-none font-bold" />
                                                    </td>
                                                    <td className="p-2">
                                                        <select value={newData.sede_id} onChange={e => setNewData({...newData, sede_id: e.target.value})} className="w-full text-[9px] bg-white border border-green-400 p-2 rounded-lg outline-none font-bold uppercase text-[#16a34a]">
                                                            <option value="">General</option>
                                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" placeholder="Concepto..." value={newData.concepto} onChange={e => setNewData({...newData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-green-400 p-2 rounded-lg outline-none font-black uppercase" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" placeholder="0.00" value={newData.monto} onChange={e => setNewData({...newData, monto: e.target.value})} className="w-full bg-white border border-green-400 p-2 rounded-lg outline-none text-right font-black" />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button disabled={submitting} onClick={() => saveNewMovimiento(mesNum)} className="text-white bg-green-600 hover:bg-green-700 p-1.5 rounded-lg shadow-sm disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}</button>
                                                            <button disabled={submitting} onClick={() => { setAddingMonth(null); setAddingType(null); }} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg shadow-sm"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            
                                            {ingresosMes.length === 0 && (
                                                <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-bold italic text-[10px] uppercase">No hay ingresos registrados</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="mt-auto p-3 bg-slate-50 border-t border-slate-200">
                                    {!(addingMonth === mesNum && addingType === 'INGRESO') && (
                                        <button onClick={() => startAddNew(mesNum, 'INGRESO')} className="w-full p-2 text-[10px] font-black uppercase tracking-widest text-[#0f172a] bg-white border border-slate-300 hover:border-green-600 hover:text-green-600 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                                            <TrendingUp size={14} /> Ingresar Dinero Manual
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ----------------- TABLA EGRESOS (DERECHA) ----------------- */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="text-orange-500" size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Control de Gastos</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-grow">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="bg-[#0f172a] text-white text-[10px] uppercase tracking-widest">
                                                <th className="p-3 font-black w-24">Fecha</th>
                                                <th className="p-3 font-black w-28">Sede</th>
                                                <th className="p-3 font-black">Concepto</th>
                                                <th className="p-3 font-black text-right w-24">Monto</th>
                                                <th className="p-3 font-black text-center w-20">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {egresosMes.map((m, idx) => inlineEditId === m.id ? (
                                                <tr key={m.id} className="bg-orange-50/50">
                                                    <td className="p-2">
                                                        <input type="date" value={inlineData.fecha} onChange={e => setInlineData({...inlineData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-orange-300 p-2 rounded-lg outline-none font-bold" />
                                                    </td>
                                                    <td className="p-2">
                                                        <select value={inlineData.sede_id} onChange={e => setInlineData({...inlineData, sede_id: e.target.value})} className="w-full text-[9px] bg-white border border-orange-300 p-2 rounded-lg outline-none font-bold uppercase text-[#f97316]">
                                                            <option value="">General</option>
                                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" value={inlineData.concepto} onChange={e => setInlineData({...inlineData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-orange-300 p-2 rounded-lg outline-none font-black uppercase" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" value={inlineData.monto} onChange={e => setInlineData({...inlineData, monto: e.target.value})} className="w-full bg-white border border-orange-300 p-2 rounded-lg outline-none text-right font-black" />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button disabled={submitting} onClick={() => saveInlineEdit(m.id, mesNum)} className="text-white bg-[#0f172a] hover:bg-[#1e3a8a] p-1.5 rounded-lg disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}</button>
                                                            <button disabled={submitting} onClick={() => setInlineEditId(null)} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                <tr key={m.id || idx} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-3 text-slate-500 font-bold">{new Date(m.fecha).toLocaleDateString()}</td>
                                                    <td className="p-3 text-[#f97316] font-bold text-[9px] uppercase"><div className="flex items-center gap-1"><MapPin size={10}/> {m.sede}</div></td>
                                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto}</td>
                                                    <td className="p-3 text-right font-black text-red-500">- S/ {parseFloat(m.monto).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        {m.id && (
                                                            <button onClick={() => startInlineEdit(m)} className="text-orange-500 font-black uppercase text-[9px] hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-orange-200">
                                                                <Edit2 size={12} /> Editar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}

                                            {addingMonth === mesNum && addingType === 'EGRESO' && (
                                                <tr className="bg-orange-50/50">
                                                    <td className="p-2">
                                                        <input type="date" value={newData.fecha} onChange={e => setNewData({...newData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-orange-400 p-2 rounded-lg outline-none font-bold" />
                                                    </td>
                                                    <td className="p-2">
                                                        <select value={newData.sede_id} onChange={e => setNewData({...newData, sede_id: e.target.value})} className="w-full text-[9px] bg-white border border-orange-400 p-2 rounded-lg outline-none font-bold uppercase text-[#f97316]">
                                                            <option value="">General</option>
                                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="text" placeholder="Concepto..." value={newData.concepto} onChange={e => setNewData({...newData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-orange-400 p-2 rounded-lg outline-none font-black uppercase" />
                                                    </td>
                                                    <td className="p-2">
                                                        <input type="number" step="0.01" placeholder="0.00" value={newData.monto} onChange={e => setNewData({...newData, monto: e.target.value})} className="w-full bg-white border border-orange-400 p-2 rounded-lg outline-none text-right font-black" />
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button disabled={submitting} onClick={() => saveNewMovimiento(mesNum)} className="text-white bg-[#f97316] hover:bg-orange-600 p-1.5 rounded-lg shadow-sm disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin"/> : <Check size={14}/>}</button>
                                                            <button disabled={submitting} onClick={() => { setAddingMonth(null); setAddingType(null); }} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg shadow-sm"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {egresosMes.length === 0 && addingType !== 'EGRESO' && (
                                                <tr><td colSpan="5" className="p-6 text-center text-slate-400 font-bold italic text-[10px] uppercase">No hay gastos registrados</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="mt-auto p-3 bg-slate-50 border-t border-slate-200">
                                    {!(addingMonth === mesNum && addingType === 'EGRESO') && (
                                        <button onClick={() => startAddNew(mesNum, 'EGRESO')} className="w-full p-2 text-[10px] font-black uppercase tracking-widest text-[#0f172a] bg-white border border-slate-300 hover:border-orange-500 hover:text-orange-500 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                                            <TrendingDown size={14} className="text-orange-500" /> Registrar Nuevo Gasto
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-2 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-1.5 bg-[#f97316] rounded-full"></div>
                        <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight italic">
                            Libro Diario <span className="text-[#f97316]">Mensual</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-70 ml-4">
                        Control de caja y reportes financieros por sede
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-sm hover:border-orange-300 transition-colors">
                        <Calendar size={14} className="text-slate-400" />
                        <select 
                            value={filtroAnio} 
                            onChange={(e) => setFiltroAnio(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black uppercase text-[#0f172a] outline-none cursor-pointer py-2 pl-2 pr-4 focus:ring-0"
                        >
                            <option value="2024">Año 2024</option>
                            <option value="2025">Año 2025</option>
                            <option value="2026">Año 2026</option>
                        </select>
                    </div>

                    <button onClick={exportToExcel} className="bg-[#f97316] hover:bg-orange-600 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
                        <FileSpreadsheet size={16} /> Descargar Excel
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {MESES.map((nombre, index) => renderMes(index + 1, nombre))}
            </div>
        </div>
    );
};

export default AdminCashFlow;