import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Edit2, Loader2, Calendar, FileSpreadsheet, Lock, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

// --- BASE DE DATOS MOCK (Temporal) ---
const currentYear = new Date().getFullYear();

let mockDatabase = [
    // ENERO
    { id: 1, tipo: 'INGRESO', concepto: 'MATRÍCULA - GATO', monto: 52.00, fecha: `${currentYear}-01-12` },
    { id: 3, tipo: 'EGRESO', concepto: 'COMPRA DE AGUA', monto: 26.00, fecha: `${currentYear}-01-12` },
    // FEBRERO
    { id: 4, tipo: 'INGRESO', concepto: 'MENSUALIDAD - POLLO', monto: 26.00, fecha: `${currentYear}-02-12` },
    { id: 5, tipo: 'INGRESO', concepto: 'MENSUALIDAD - CUY', monto: 54646.00, fecha: `${currentYear}-02-12` },
    { id: 6, tipo: 'EGRESO', concepto: 'PAGO DE LUZ', monto: 120.00, fecha: `${currentYear}-02-15` },
    { id: 7, tipo: 'EGRESO', concepto: 'MANTENIMIENTO REDES', monto: 250.00, fecha: `${currentYear}-02-20` },
    // MARZO
    { id: 8, tipo: 'INGRESO', concepto: 'MENSUALIDAD - VALERIO', monto: 150.00, fecha: `${currentYear}-03-02` },
    { id: 9, tipo: 'EGRESO', concepto: 'PAGO ARBITRIOS', monto: 85.00, fecha: `${currentYear}-03-05` },
];

const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", 
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];
// ------------------------------------

const AdminCashFlow = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [filtroAnio, setFiltroAnio] = useState(currentYear);
    const [mesesAbiertos, setMesesAbiertos] = useState([new Date().getMonth() + 1]);

    const [inlineEditId, setInlineEditId] = useState(null);
    const [inlineData, setInlineData] = useState({ concepto: '', monto: '', fecha: '' });

    const [addingMonth, setAddingMonth] = useState(null);
    const [newData, setNewData] = useState({ concepto: '', monto: '', fecha: '' });

    const fetchMovimientos = async () => {
        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 500)); 
            
            const filteredData = mockDatabase.filter(m => parseInt(m.fecha.split('-')[0]) === parseInt(filtroAnio));
            setMovimientos(filteredData);
        } catch (error) {
            toast.error("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMovimientos(); }, [filtroAnio]);

    const toggleMes = (mesNum) => {
        setMesesAbiertos(prev => 
            prev.includes(mesNum) ? prev.filter(m => m !== mesNum) : [...prev, mesNum]
        );
    };

    // --- LÓGICA DE EDICIÓN EXCEL-STYLE ---
    const startInlineEdit = (movimiento) => {
        setInlineEditId(movimiento.id);
        setInlineData({ concepto: movimiento.concepto, monto: movimiento.monto, fecha: movimiento.fecha });
    };

    const saveInlineEdit = async (id) => {
        if (!inlineData.concepto || !inlineData.monto) return toast.error("Complete los campos");
        const index = mockDatabase.findIndex(m => m.id === id);
        mockDatabase[index] = { ...mockDatabase[index], ...inlineData, monto: parseFloat(inlineData.monto) };
        toast.success("Egreso actualizado");
        setInlineEditId(null);
        fetchMovimientos();
    };

    const startAddNew = (mesNum) => {
        const mesStr = String(mesNum).padStart(2, '0');
        setAddingMonth(mesNum);
        setNewData({ concepto: '', monto: '', fecha: `${filtroAnio}-${mesStr}-01` });
    };

    const saveNewEgreso = async () => {
        if (!newData.concepto || !newData.monto || !newData.fecha) return toast.error("Complete los datos");
        const newId = mockDatabase.length > 0 ? Math.max(...mockDatabase.map(m => m.id)) + 1 : 1;
        mockDatabase.push({ id: newId, tipo: 'EGRESO', ...newData, monto: parseFloat(newData.monto) });
        toast.success("Egreso registrado");
        setAddingMonth(null);
        fetchMovimientos();
    };

    // --- EXPORTAR A EXCEL ---
    const exportToExcel = () => {
        const dataToExport = movimientos.map(m => ({
            "AÑO": filtroAnio,
            "MES": MESES[parseInt(m.fecha.split('-')[1]) - 1],
            "FECHA": m.fecha,
            "TIPO": m.tipo,
            "CONCEPTO": m.concepto,
            "MONTO (S/)": m.tipo === 'INGRESO' ? m.monto : -m.monto
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Flujo ${filtroAnio}`);
        XLSX.writeFile(workbook, `Flujo_Caja_Gema_${filtroAnio}.xlsx`);
        toast.success("Reporte Excel descargado");
    };

    const renderMes = (mesNum, mesNombre) => {
        const movsMes = movimientos.filter(m => parseInt(m.fecha.split('-')[1]) === mesNum);
        const ingresosMes = movsMes.filter(m => m.tipo === 'INGRESO');
        const egresosMes = movsMes.filter(m => m.tipo === 'EGRESO');
        
        const totalIng = ingresosMes.reduce((sum, item) => sum + Number(item.monto), 0);
        const totalEgr = egresosMes.reduce((sum, item) => sum + Number(item.monto), 0);
        const balance = totalIng - totalEgr;
        const isOpen = mesesAbiertos.includes(mesNum);

        return (
            <div key={mesNum} className="mb-4 animate-fade-in-up">
                {/* ACORDEÓN: ESTILO GEMA */}
                <div 
                    onClick={() => toggleMes(mesNum)}
                    className={`bg-white border rounded-2xl px-6 py-5 cursor-pointer flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm transition-all duration-200 ${isOpen ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
                >
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </div>
                        <h2 className="text-[15px] font-black text-[#0f172a] uppercase tracking-widest">{mesNombre}</h2>
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

                {/* CONTENIDO DESPLEGABLE (TABLAS LADO A LADO EN PANTALLAS GRANDES) */}
                {isOpen && (
                    <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-6 pl-4 pr-2 pb-4 border-l-2 border-orange-200 ml-4">
                        
                        {/* TABLA INGRESOS (IZQUIERDA) */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="text-green-600" size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Ingresos Automatizados</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-grow">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#0f172a] text-white text-[10px] uppercase tracking-widest">
                                                <th className="p-3 font-black w-24">Fecha</th>
                                                <th className="p-3 font-black">Concepto</th>
                                                <th className="p-3 font-black text-right w-24">Monto</th>
                                                <th className="p-3 font-black text-center w-20">Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {ingresosMes.map(m => (
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 text-slate-500 font-bold">{m.fecha}</td>
                                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto}</td>
                                                    <td className="p-3 text-right font-black text-green-600">+ S/ {parseFloat(m.monto).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex justify-center text-slate-300" title="Registro seguro (No editable)">
                                                            <Lock size={14} />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {ingresosMes.length === 0 && (
                                                <tr><td colSpan="4" className="p-6 text-center text-slate-400 font-bold italic text-[10px] uppercase">No hay ingresos en este mes</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* TABLA EGRESOS (DERECHA) */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingDown className="text-orange-500" size={16} />
                                <h3 className="text-xs font-black uppercase tracking-widest text-[#0f172a]">Control de Egresos</h3>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-grow">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#0f172a] text-white text-[10px] uppercase tracking-widest">
                                                <th className="p-3 font-black w-24">Fecha</th>
                                                <th className="p-3 font-black">Concepto</th>
                                                <th className="p-3 font-black text-right w-24">Monto</th>
                                                <th className="p-3 font-black text-center w-20">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-[11px]">
                                            {egresosMes.map(m => inlineEditId === m.id ? (
                                                /* MODO EDICIÓN EN LÍNEA */
                                                <tr key={m.id} className="bg-orange-50/50">
                                                    <td className="p-2"><input type="date" value={inlineData.fecha} onChange={e => setInlineData({...inlineData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-orange-300 p-2 rounded-xl outline-none font-bold focus:ring-2 ring-orange-500/20" /></td>
                                                    <td className="p-2"><input type="text" value={inlineData.concepto} onChange={e => setInlineData({...inlineData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-orange-300 p-2 rounded-xl outline-none font-black uppercase focus:ring-2 ring-orange-500/20" /></td>
                                                    <td className="p-2"><input type="number" value={inlineData.monto} onChange={e => setInlineData({...inlineData, monto: e.target.value})} className="w-full bg-white border border-orange-300 p-2 rounded-xl outline-none text-right font-black focus:ring-2 ring-orange-500/20" /></td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button onClick={() => saveInlineEdit(m.id)} className="text-white bg-[#0f172a] hover:bg-[#1e3a8a] p-1.5 rounded-lg transition-colors shadow-sm" title="Guardar"><Check size={14}/></button>
                                                            <button onClick={() => setInlineEditId(null)} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg transition-colors shadow-sm" title="Cancelar"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                /* MODO LECTURA NORMAL */
                                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                                    <td className="p-3 text-slate-500 font-bold">{m.fecha}</td>
                                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto}</td>
                                                    <td className="p-3 text-right font-black text-red-500">- S/ {parseFloat(m.monto).toFixed(2)}</td>
                                                    <td className="p-3 text-center">
                                                        <button onClick={() => startInlineEdit(m)} className="text-orange-500 font-black uppercase text-[9px] hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-orange-200">
                                                            <Edit2 size={12} /> Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {/* FILA PARA AGREGAR NUEVO EGRESO */}
                                            {addingMonth === mesNum && (
                                                <tr className="bg-orange-50/50">
                                                    <td className="p-2"><input type="date" value={newData.fecha} onChange={e => setNewData({...newData, fecha: e.target.value})} className="w-full text-[10px] bg-white border border-orange-400 p-2 rounded-xl outline-none font-bold shadow-sm" /></td>
                                                    <td className="p-2"><input type="text" placeholder="Concepto..." value={newData.concepto} onChange={e => setNewData({...newData, concepto: e.target.value.toUpperCase()})} className="w-full bg-white border border-orange-400 p-2 rounded-xl outline-none font-black uppercase shadow-sm" /></td>
                                                    <td className="p-2"><input type="number" placeholder="0.00" value={newData.monto} onChange={e => setNewData({...newData, monto: e.target.value})} className="w-full bg-white border border-orange-400 p-2 rounded-xl outline-none text-right font-black shadow-sm" /></td>
                                                    <td className="p-2 text-center">
                                                        <div className="flex justify-center gap-1.5">
                                                            <button onClick={saveNewEgreso} className="text-white bg-[#f97316] hover:bg-orange-600 p-1.5 rounded-lg transition-colors shadow-sm"><Check size={14}/></button>
                                                            <button onClick={() => setAddingMonth(null)} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg transition-colors shadow-sm"><X size={14}/></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* BOTÓN AÑADIR AL FINAL DE EGRESOS */}
                                <div className="mt-auto p-3 bg-slate-50 border-t border-slate-200">
                                    {addingMonth !== mesNum && (
                                        <button 
                                            onClick={() => startAddNew(mesNum)}
                                            className="w-full p-2 text-[10px] font-black uppercase tracking-widest text-[#0f172a] bg-white border border-slate-300 hover:border-orange-500 hover:text-orange-500 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                                        >
                                            <Plus size={14} /> Registrar Egreso en {mesNombre}
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

    if (loading && movimientos.length === 0) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <Loader2 className="animate-spin text-orange-500" size={40} />
            <p className="font-black italic animate-pulse tracking-widest uppercase text-[10px]">Estructurando Libro Diario...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up p-2 max-w-[1400px] mx-auto">
            
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-1.5 bg-[#f97316] rounded-full"></div>
                        <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight italic">
                            Libro Diario <span className="text-[#f97316]">Mensual</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-70 ml-4">
                        Visualización comparativa de ingresos vs egresos
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

            {/* LISTA DE MESES */}
            <div className="space-y-3">
                {MESES.map((nombre, index) => renderMes(index + 1, nombre))}
            </div>

        </div>
    );
};

export default AdminCashFlow;