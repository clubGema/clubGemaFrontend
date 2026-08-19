import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InscriptionsModal = ({ isOpen, data, onClose }) => {

    // 🔥 FIX: agrupamos las inscripciones REGULARES que comparten sede + nivel +
    // estado + fecha de corte, porque en realidad son LA MISMA inscripción con
    // varios horarios a la semana (ej: martes y jueves) — no inscripciones
    // distintas. Antes se pintaba una tarjeta idéntica por cada horario.
    // Las INDIVIDUALES (clase única) NO se agrupan: cada una tiene su propia
    // fecha de clase y deben verse por separado.
    const gruposInscripciones = useMemo(() => {
        if (!data?.historialInscripciones) return [];

        const mapa = new Map();

        data.historialInscripciones.forEach((insc) => {
            const esIndividual = insc.tipoInscripcion === 'INDIVIDUAL';

            const fechaCorteKey = insc.fechaCorte ? new Date(insc.fechaCorte).toISOString() : 'sin-fecha';
            const key = esIndividual
                ? `IND__${insc.sede}__${insc.nivel}__${insc.fechaInscripcion}__${insc.horario}`
                : `REG__${insc.sede}__${insc.nivel}__${insc.estado}__${fechaCorteKey}`;

            if (!mapa.has(key)) {
                mapa.set(key, {
                    ...insc,
                    horarios: insc.horario ? [insc.horario] : [],
                });
            } else if (insc.horario) {
                const grupo = mapa.get(key);
                if (!grupo.horarios.includes(insc.horario)) {
                    grupo.horarios.push(insc.horario);
                }
            }
        });

        return Array.from(mapa.values());
    }, [data]);

    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                            Detalle de <span className="text-[#1e3a8a]">Inscripciones</span>
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                            {data.full_name}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {gruposInscripciones.length === 0 ? (
                        <p className="text-center text-sm font-bold text-slate-400 py-8">No hay registros de inscripciones.</p>
                    ) : (
                        gruposInscripciones.map((insc, idx) => (
                            <div key={idx} className="bg-white border-2 border-slate-50 rounded-2xl p-5 hover:border-blue-100 hover:shadow-md transition-all group relative overflow-hidden">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${insc.estado === 'ACTIVO' ? (insc.estaVencido ? 'bg-red-500' : 'bg-emerald-500') : 'bg-slate-300'}`}></div>

                                <div className="flex justify-between items-start pl-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-[#1e3a8a] text-[9px] font-black px-2 py-1 rounded-md uppercase italic border border-blue-200">
                                                {insc.nivel}
                                            </span>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase italic border
                                                ${insc.estado === 'ACTIVO' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                                {insc.tipoInscripcion === 'INDIVIDUAL' ? 'CLASE ÚNICA' : insc.estado}
                                            </span>
                                        </div>
                                        <p className="text-sm font-black text-slate-700 uppercase italic mt-2">
                                            SEDE {insc.sede}
                                        </p>

                                        {/* 🔥 Ahora se listan TODOS los horarios agrupados dentro de la misma tarjeta */}
                                        {insc.horarios.length > 0 && (
                                            <div className="flex flex-col gap-1 mt-1">
                                                {insc.horarios.map((h, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                                        <Clock size={12} className="text-blue-400" />
                                                        {h}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        {insc.tipoInscripcion === 'INDIVIDUAL' ? (
                                            <>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fecha de la Clase</p>
                                                <div className="text-base font-black uppercase italic flex items-center justify-end gap-1 text-slate-800">
                                                    <Calendar size={14} />
                                                    {new Date(insc.fechaInscripcion).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Fecha de Corte</p>
                                                <div className={`text-base font-black uppercase italic flex items-center justify-end gap-1
                                            ${insc.estado === 'ACTIVO'
                                                        ? (insc.estaVencido ? 'text-red-500' : 'text-slate-800')
                                                        : 'text-slate-400'}`}
                                                >
                                                    <Calendar size={14} />
                                                    {insc.fechaCorte ? format(insc.fechaCorte, "dd MMM yyyy", { locale: es }) : '---'}
                                                </div>
                                            </>
                                        )}
                                        {insc.estado === 'ACTIVO' && insc.estaVencido && (
                                            <p className="text-[8px] font-bold text-red-500 uppercase mt-1 animate-pulse">PAGO PENDIENTE</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InscriptionsModal;