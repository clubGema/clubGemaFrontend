import React from 'react';
import { TrendingDown, MapPin, Edit2, Loader2, Check, X, Trash2 } from 'lucide-react';

export const ExpenseTable = ({
    egresos, sedes, mesNum, inlineEditId, inlineData, setInlineData,
    submitting, saveInlineEdit, setInlineEditId, startInlineEdit, addingMonth, addingType,
    newData, setNewData, startAddNew, saveNewMovimiento, setAddingMonth, setAddingType, movimientoDelete
}) => {
    return (
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
                            {egresos.map((m) => inlineEditId === m.id ? (
                                <tr key={m.id} className="bg-orange-50/50">
                                    <td className="p-2">
                                        <input type="date" value={inlineData.fecha} onChange={e => setInlineData({ ...inlineData, fecha: e.target.value })} className="w-full text-[10px] bg-white border border-orange-300 p-2 rounded-lg outline-none font-bold" />
                                    </td>
                                    <td className="p-2">
                                        <select value={inlineData.sede_id} onChange={e => setInlineData({ ...inlineData, sede_id: e.target.value })} className="w-full text-[9px] bg-white border border-orange-300 p-2 rounded-lg outline-none font-bold uppercase text-[#f97316]">
                                            <option value="">General</option>
                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="text" value={inlineData.concepto} onChange={e => setInlineData({ ...inlineData, concepto: e.target.value.toUpperCase() })} className="w-full bg-white border border-orange-300 p-2 rounded-lg outline-none font-black uppercase" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" value={inlineData.monto} onChange={e => setInlineData({ ...inlineData, monto: e.target.value })} className="w-full bg-white border border-orange-300 p-2 rounded-lg outline-none text-right font-black" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            <button disabled={submitting} onClick={() => saveInlineEdit(m.id, mesNum)} className="text-white bg-[#0f172a] hover:bg-[#1e3a8a] p-1.5 rounded-lg disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                                            <button disabled={submitting} onClick={() => setInlineEditId(null)} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg"><X size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-3 text-slate-500 font-bold">{new Date(m.fecha).toLocaleDateString()}</td>
                                    <td className="p-3 text-[#f97316] font-bold text-[9px] uppercase"><div className="flex items-center gap-1"><MapPin size={10} /> {m.sede}</div></td>
                                    <td className="p-3 text-[#0f172a] font-black uppercase">{m.concepto}</td>
                                    <td className="p-3 text-right font-black text-red-500">- S/ {parseFloat(m.monto).toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => startInlineEdit(m)} className="text-orange-500 font-black uppercase text-[9px] hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-orange-200">
                                            <Edit2 size={12} /> Editar
                                        </button>
                                        <button onClick={() => movimientoDelete(m)} className="text-red-600 font-black uppercase text-[9px] hover:bg-green-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-green-200">
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {addingMonth === mesNum && addingType === 'EGRESO' && (
                                <tr className="bg-orange-50/50">
                                    <td className="p-2">
                                        <input type="date" value={newData.fecha} onChange={e => setNewData({ ...newData, fecha: e.target.value })} className="w-full text-[10px] bg-white border border-orange-400 p-2 rounded-lg outline-none font-bold" />
                                    </td>
                                    <td className="p-2">
                                        <select value={newData.sede_id} onChange={e => setNewData({ ...newData, sede_id: e.target.value })} className="w-full text-[9px] bg-white border border-orange-400 p-2 rounded-lg outline-none font-bold uppercase text-[#f97316]">
                                            <option value="">General</option>
                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="text" placeholder="Concepto..." value={newData.concepto} onChange={e => setNewData({ ...newData, concepto: e.target.value.toUpperCase() })} className="w-full bg-white border border-orange-400 p-2 rounded-lg outline-none font-black uppercase" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" placeholder="0.00" value={newData.monto} onChange={e => setNewData({ ...newData, monto: e.target.value })} className="w-full bg-white border border-orange-400 p-2 rounded-lg outline-none text-right font-black" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            <button disabled={submitting} onClick={() => saveNewMovimiento(mesNum)} className="text-white bg-[#f97316] hover:bg-orange-600 p-1.5 rounded-lg shadow-sm disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                                            <button disabled={submitting} onClick={() => { setAddingMonth(null); setAddingType(null); }} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg shadow-sm"><X size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {egresos.length === 0 && addingType !== 'EGRESO' && (
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
    );
};