import React from 'react';
import { TrendingDown, MapPin, Edit2, Loader2, Check, X, Trash2 } from 'lucide-react';

export const ExpenseTable = ({
    egresos, mesNum,
    // El estado volatil de los formularios llega ya acotado a este mes desde
    // AdminCashFlow; las acciones vienen en un objeto de identidad estable.
    acciones, submitting, inlineEditId, inlineData, addingType, newData
}) => {
    const {
        sedes, setInlineData, saveInlineEdit, cancelInlineEdit, startInlineEdit,
        setNewData, startAddNew, cancelAddNew, saveNewMovimiento, movimientoDelete,
    } = acciones;
    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="text-brand-accent" size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-heading">Control de Gastos</h3>
            </div>
            <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden shadow-sm flex flex-col flex-grow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                        <thead>
                            <tr className="bg-brand-primary-dark text-white text-[10px] uppercase tracking-widest">
                                <th className="p-3 font-black w-24">Fecha</th>
                                <th className="p-3 font-black w-28">Sede</th>
                                <th className="p-3 font-black">Concepto</th>
                                <th className="p-3 font-black text-right w-24">Monto</th>
                                <th className="p-3 font-black text-center w-20">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border-soft text-[11px]">
                            {egresos.map((m) => inlineEditId === m.id ? (
                                <tr key={m.id} className="bg-brand-accent-soft/50">
                                    <td className="p-2">
                                        <input type="date" value={inlineData.fecha} onChange={e => setInlineData({ ...inlineData, fecha: e.target.value })} className="w-full text-[10px] bg-brand-surface border border-brand-accent/40 p-2 rounded-lg outline-none font-bold" />
                                    </td>
                                    <td className="p-2">
                                        <select value={inlineData.sede_id} onChange={e => setInlineData({ ...inlineData, sede_id: e.target.value })} className="w-full text-[9px] bg-brand-surface border border-brand-accent/40 p-2 rounded-lg outline-none font-bold uppercase text-brand-accent">
                                            <option value="">General</option>
                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="text" value={inlineData.concepto} onChange={e => setInlineData({ ...inlineData, concepto: e.target.value.toUpperCase() })} className="w-full bg-brand-surface border border-brand-accent/40 p-2 rounded-lg outline-none font-black uppercase" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" value={inlineData.monto} onChange={e => setInlineData({ ...inlineData, monto: e.target.value })} className="w-full bg-brand-surface border border-brand-accent/40 p-2 rounded-lg outline-none text-right font-black" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            <button disabled={submitting} onClick={() => saveInlineEdit(m.id, mesNum)} className="text-white bg-brand-primary-dark hover:bg-brand-primary p-1.5 rounded-lg disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                                            <button disabled={submitting} onClick={cancelInlineEdit} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg"><X size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={m.id} className="hover:bg-brand-bg transition-colors group">
                                    <td className="p-3 text-slate-500 font-bold">{new Date(m.fecha).toLocaleDateString()}</td>
                                    <td className="p-3 text-brand-accent font-bold text-[9px] uppercase"><div className="flex items-center gap-1"><MapPin size={10} /> {m.sede}</div></td>
                                    <td className="p-3 text-brand-heading font-black uppercase">{m.concepto}</td>
                                    <td className="p-3 text-right font-black text-red-500">- S/ {parseFloat(m.monto).toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => startInlineEdit(m, mesNum)} className="text-brand-accent font-black uppercase text-[9px] hover:bg-brand-accent-soft px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-brand-accent/30">
                                            <Edit2 size={12} /> Editar
                                        </button>
                                        <button onClick={() => movimientoDelete(m, mesNum)} className="text-red-600 font-black uppercase text-[9px] hover:bg-green-50 px-2 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 mx-auto border border-transparent hover:border-green-200">
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {addingType === 'EGRESO' && (
                                <tr className="bg-brand-accent-soft/50">
                                    <td className="p-2">
                                        <input type="date" value={newData.fecha} onChange={e => setNewData({ ...newData, fecha: e.target.value })} className="w-full text-[10px] bg-brand-surface border border-brand-accent p-2 rounded-lg outline-none font-bold" />
                                    </td>
                                    <td className="p-2">
                                        <select value={newData.sede_id} onChange={e => setNewData({ ...newData, sede_id: e.target.value })} className="w-full text-[9px] bg-brand-surface border border-brand-accent p-2 rounded-lg outline-none font-bold uppercase text-brand-accent">
                                            <option value="">General</option>
                                            {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2">
                                        <input type="text" placeholder="Concepto..." value={newData.concepto} onChange={e => setNewData({ ...newData, concepto: e.target.value.toUpperCase() })} className="w-full bg-brand-surface border border-brand-accent p-2 rounded-lg outline-none font-black uppercase" />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" step="0.01" placeholder="0.00" value={newData.monto} onChange={e => setNewData({ ...newData, monto: e.target.value })} className="w-full bg-brand-surface border border-brand-accent p-2 rounded-lg outline-none text-right font-black" />
                                    </td>
                                    <td className="p-2 text-center">
                                        <div className="flex justify-center gap-1.5">
                                            <button disabled={submitting} onClick={() => saveNewMovimiento(mesNum)} className="text-white bg-brand-accent hover:bg-brand-accent-dark p-1.5 rounded-lg shadow-sm disabled:opacity-50">{submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}</button>
                                            <button disabled={submitting} onClick={cancelAddNew} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-1.5 rounded-lg shadow-sm"><X size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )}

                            {egresos.length === 0 && addingType !== 'EGRESO' && (
                                <tr><td colSpan="5" className="p-6 text-center text-brand-muted font-bold italic text-[10px] uppercase">No hay gastos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto p-3 bg-brand-bg border-t border-brand-border">
                    {addingType !== 'EGRESO' && (
                        <button onClick={() => startAddNew(mesNum, 'EGRESO')} className="w-full p-2 text-[10px] font-black uppercase tracking-widest text-brand-heading bg-brand-surface border border-slate-300 hover:border-brand-accent hover:text-brand-accent rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm">
                            <TrendingDown size={14} className="text-brand-accent" /> Registrar Nuevo Gasto
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};