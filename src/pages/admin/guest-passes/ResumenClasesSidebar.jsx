import React from 'react';
import { Loader2, Send, X, Clock, Layers, MapPin, Calendar, ShoppingBag } from 'lucide-react';

const ResumenClasesSidebar = ({ formDataList, alumnos, horarios, metodosPago, onRemoveItem, submitting }) => (
    <div className="bg-brand-primary-dark text-white p-6 rounded-[2.5rem] shadow-2xl border-4 border-slate-800 flex flex-col max-h-[80vh]">

        <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
            <div>
                <h3 className="font-black uppercase italic text-lg text-brand-accent">Resumen de Clases</h3>
            </div>
            <div className="bg-slate-800 px-3 py-2 rounded-xl text-xs font-black text-white border border-slate-700">
                {formDataList.length}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {formDataList.length > 0 ? (
                formDataList.map((item, index) => {
                    const alumno = alumnos.find(a => a.id === Number(item.alumno_id));
                    const horario = horarios.find(h => h.id === Number(item.idHorario));
                    const pago = metodosPago.find(m => m.id === Number(item.metodo_pago));

                    return (
                        <div key={index} className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl relative group hover:border-slate-700 transition-all animate-fade-in">

                            <button
                                type="button"
                                onClick={() => onRemoveItem(index)}
                                className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <X size={16} />
                            </button>

                            <p className="text-xs font-black text-brand-accent uppercase tracking-wide mb-1 truncate max-w-[85%]">
                                {alumno ? `${alumno.nombres} ${alumno.apellidos}` : "Alumno Indefinido"}
                            </p>

                            <div className="space-y-1 text-[11px] text-slate-300 font-medium uppercase">
                                <p className="flex items-center gap-1.5 truncate">
                                    <Clock size={10} className="text-slate-500" />
                                    {horario ? `${horario.dia?.nombre} ${horario.hora}` : "Horario no encontrado"}
                                </p>
                                <p className="flex items-center gap-1.5 truncate">
                                    <Layers size={10} className="text-slate-500" />
                                    {horario ? `${horario.nivel?.nombre}` : "Nivel no encontrada"}
                                </p>
                                <p className="flex items-center gap-1.5 truncate">
                                    <MapPin size={10} className="text-slate-500" />
                                    {horario ? `${horario.sede?.nombre}` : "Sede no encontrada"}
                                </p>
                                <p className="flex items-center gap-1.5 text-brand-muted text-[10px]">
                                    <Calendar size={10} className="text-slate-500" />
                                    Fecha: {item.fecha_inicio_electiva.split("-").reverse().join("-")}
                                </p>
                                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-bold text-brand-muted">
                                    <span>{pago ? pago.nombre : 'Pago'}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                    <ShoppingBag size={32} className="text-brand-body mb-2" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Las clases agregadas se mostrarán en esta sección</p>
                </div>
            )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 space-y-3">
            {formDataList.length > 0 && (
                <div className="flex items-center justify-between px-2 text-sm font-black uppercase italic">
                    <span className="text-brand-muted">Total:</span>
                    <span className="text-brand-accent text-base">
                        S/. {formDataList[0]?.montoTotal || '0'}
                    </span>
                </div>
            )}
            <button
                type="submit"
                disabled={submitting || formDataList.length === 0}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-800 disabled:text-slate-600 text-white py-5 rounded-2xl font-black uppercase italic tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl disabled:shadow-none hover:shadow-green-900/30 group"
            >
                {submitting ? (
                    <Loader2 className="animate-spin" size={20} />
                ) : (
                    <Send size={20} className="group-hover:scale-110 transition-transform" />
                )}
                Enviar
            </button>
        </div>

    </div>
);

export default ResumenClasesSidebar;
