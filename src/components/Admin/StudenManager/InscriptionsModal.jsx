import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, X, MapPin, User, DollarSign, Info, Layers, CircleAlert, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

import apiFetch from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const InscriptionsModal = ({ isOpen, data, onClose }) => {

    // 🆕 Ya NO se arma desde data.historialInscripciones (pobre en datos).
    // Ahora pide el mismo endpoint rico que usa StudentDetails, con monto,
    // profesor, cuenta_id, concepto y fecha de vencimiento por cuenta.
    const [ciclos, setCiclos] = useState([]);
    const [loadingCiclos, setLoadingCiclos] = useState(true);
    const [individualSeleccionada, setIndividualSeleccionada] = useState(null);

    useEffect(() => {
        if (!isOpen || !data?.id) return;

        const fetchCiclos = async () => {
            try {
                setLoadingCiclos(true);
                const res = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.ALUMNO(data.id));
                const result = await res.json();

                if (res.ok) {
                    setCiclos(result.data || []);
                } else {
                    toast.error("No se pudo obtener el detalle de inscripciones");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor para obtener el detalle");
            } finally {
                setLoadingCiclos(false);
            }
        };

        fetchCiclos();
    }, [isOpen, data]);

    // Reset de la selección al cerrar, para no arrastrar estado a la próxima apertura
    useEffect(() => {
        if (!isOpen) setIndividualSeleccionada(null);
    }, [isOpen]);

    // Helpers para la UI (mismos que StudentDetails, para mantener consistencia)
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "S/F";
        return format(parseISO(fechaString.slice(0, 10)), "dd MMM yyyy", { locale: es });
    };

    const obtenerRangoCiclo = (fechaInicio, fechaFin) => {
        if (!fechaInicio) return "SIN CLASES REGISTRADAS";

        const inicioDate = parseISO(fechaInicio.slice(0, 10));
        const mesInicio = format(inicioDate, "MMMM", { locale: es });
        const anioInicio = format(inicioDate, "yyyy");

        if (!fechaFin) return `${mesInicio} ${anioInicio} · EN CURSO`;

        const finDate = parseISO(fechaFin.slice(0, 10));
        const mesFin = format(finDate, "MMMM", { locale: es });
        const anioFin = format(finDate, "yyyy");

        if (mesInicio === mesFin && anioInicio === anioFin) return `${mesInicio} ${anioInicio}`;
        if (anioInicio === anioFin) return `${mesInicio} - ${mesFin} ${anioInicio}`;
        return `${mesInicio.slice(0, 3)} ${anioInicio} - ${mesFin.slice(0, 3)} ${anioFin}`;
    };

    const getEstadoPagoBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'PAGADA':
            case 'PAGADO': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDIENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'VENCIDO': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    const getEstadoInscripcionBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'ACTIVO': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            case 'INACTIVO': return 'text-slate-500 bg-slate-50 border-slate-200';
            case 'FINALIZADO': return 'text-slate-500 bg-slate-100 border-slate-200';
            case 'PENDIENTE_PAGO': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'CONGELADO': return 'text-blue-600 bg-blue-50 border-blue-100';
            default: return 'text-slate-400 bg-slate-50 border-slate-100';
        }
    };

    if (!isOpen || !data) return null;

    // Separamos regulares (con clases) vs individuales vs sin_registros,
    // igual que en StudentDetails, para mantener el mismo orden visual.
    const ciclosRegulares = ciclos.filter(c => !c.sin_registros && !c.es_individual);
    const ciclosIndividuales = ciclos.filter(c => !c.sin_registros && c.es_individual);
    const ciclosSinRegistros = ciclos.filter(c => c.sin_registros);

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
                    {loadingCiclos ? (
                        <div className="flex flex-col justify-center items-center py-10 gap-2">
                            <Loader2 className="animate-spin text-orange-500" size={24} />
                            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Cargando inscripciones...</span>
                        </div>
                    ) : ciclos.length === 0 ? (
                        <p className="text-center text-sm font-bold text-slate-400 py-8">No hay registros de inscripciones.</p>
                    ) : (
                        <>
                            {/* TARJETAS REGULARES (paquetes) — con TODO el detalle: monto, profesor, plazo de pago */}
                            {ciclosRegulares.map((ciclo) => {
                                const estadosInscripcion = [...new Set((ciclo.inscripciones || []).map(i => i.estado))];

                                return (
                                    <div key={ciclo.cuenta_id} className="bg-white border-2 border-slate-50 rounded-2xl p-5 hover:border-blue-100 hover:shadow-md transition-all relative overflow-hidden">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                                        {obtenerRangoCiclo(ciclo.fecha_inicio_real, ciclo.fecha_fin_real)}
                                                    </span>
                                                    {ciclo.horarios?.length > 1 && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded-md border border-indigo-100 uppercase">
                                                            <Layers size={9} /> x{ciclo.horarios.length} horarios
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm font-black text-slate-700 uppercase italic mt-2">
                                                    SEDE {ciclo.inscripciones?.[0]?.sede || 'S/D'}
                                                </p>

                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 mt-1 min-w-0">
                                                    <User size={11} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">
                                                        {ciclo.inscripciones?.[0]?.nivel || 'S/D'}
                                                        {ciclo.inscripciones?.[0]?.profesor ? ` · ${ciclo.inscripciones[0].profesor}` : ''}
                                                    </span>
                                                </div>

                                                {ciclo.horarios?.length > 0 && (
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        {ciclo.horarios.map((h, i) => (
                                                            <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                                                                <Clock size={12} className="text-blue-400" />
                                                                {h.dia} {h.hora_inicio}-{h.hora_fin}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border whitespace-nowrap ${getEstadoPagoBadge(ciclo.estado_pago)}`}>
                                                    {ciclo.estado_pago}
                                                </span>
                                                {estadosInscripcion.map((estado, i) => (
                                                    <span key={i} className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border whitespace-nowrap ${getEstadoInscripcionBadge(estado)}`}>
                                                        {estado}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-3 mt-3 border-t border-slate-100">
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Inicio</span>
                                                <span className="text-[10px] font-black text-slate-700 truncate">{formatearFecha(ciclo.fecha_inicio_real)}</span>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Fin real</span>
                                                <span className="text-[10px] font-black text-slate-700 truncate">
                                                    {ciclo.fecha_fin_real ? formatearFecha(ciclo.fecha_fin_real) : 'EN CURSO'}
                                                </span>
                                            </div>
                                            {ciclo.monto_final > 0 && (
                                                <div className="flex flex-col min-w-0 col-span-2">
                                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Monto</span>
                                                    <span className="text-[11px] font-black text-emerald-600 flex items-center gap-0.5">
                                                        <DollarSign size={10} className="shrink-0" />{Number(ciclo.monto_final).toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {ciclo.fecha_vencimiento_pago && (
                                            <div className="flex items-start gap-1.5 pt-2 mt-2 border-t border-dashed border-slate-100">
                                                <Info size={10} className="text-slate-300 shrink-0 mt-0.5" />
                                                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest break-words">
                                                    Plazo de pago: {formatearFecha(ciclo.fecha_vencimiento_pago)}
                                                </span>
                                            </div>
                                        )}

                                        <p className="text-[8px] text-slate-300 font-bold italic pt-2">
                                            Cuenta #{ciclo.cuenta_id} · {ciclo.concepto}
                                        </p>
                                    </div>
                                );
                            })}

                            {/* SECCIÓN DE CLASES SUELTAS (individuales): botones compactos */}
                            {ciclosIndividuales.length > 0 && (
                                <div className="space-y-2">
                                    {ciclosRegulares.length > 0 && (
                                        <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest pt-2">
                                            Clases Sueltas
                                        </p>
                                    )}
                                    {ciclosIndividuales.map((ciclo) => (
                                        <button
                                            key={ciclo.cuenta_id}
                                            onClick={() => setIndividualSeleccionada(ciclo)}
                                            className="w-full bg-white border border-purple-100 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm hover:border-purple-300 hover:shadow-md transition-all text-left active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                                    <Zap size={16} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Clase Suelta</p>
                                                    <p className="text-[11px] font-bold text-slate-600 truncate">
                                                        {formatearFecha(ciclo.fecha_inicio_real)} · {ciclo.inscripciones?.[0]?.sede || 'S/D'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border shrink-0 ${getEstadoPagoBadge(ciclo.estado_pago)}`}>
                                                {ciclo.estado_pago}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* TARJETAS SIN CLASES REGISTRADAS */}
                            {ciclosSinRegistros.map((ciclo) => (
                                <div key={ciclo.cuenta_id} className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-4 flex flex-col gap-2 opacity-80">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                                            <CircleAlert size={14} className="shrink-0" />
                                            <span className="text-[10px] font-black uppercase tracking-widest truncate">Sin clases registradas</span>
                                        </div>
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border shrink-0 ${getEstadoPagoBadge(ciclo.estado_pago)}`}>
                                            {ciclo.estado_pago}
                                        </span>
                                    </div>
                                    <p className="text-[9px] text-slate-400 font-bold italic leading-relaxed">
                                        Cuenta #{ciclo.cuenta_id} · {ciclo.concepto} · S/ {Number(ciclo.monto_final).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* MODAL DE DETALLE DE LA CLASE SUELTA (segundo nivel, sobre el modal principal) */}
            {individualSeleccionada && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setIndividualSeleccionada(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Zap size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">Detalle de Clase Suelta</span>
                            </div>
                            <button
                                onClick={() => setIndividualSeleccionada(null)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <X size={16} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                    {obtenerRangoCiclo(individualSeleccionada.fecha_inicio_real, individualSeleccionada.fecha_fin_real)}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getEstadoPagoBadge(individualSeleccionada.estado_pago)}`}>
                                    {individualSeleccionada.estado_pago}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <MapPin size={12} className="text-orange-500 shrink-0" />
                                    {individualSeleccionada.inscripciones?.[0]?.sede || 'S/D'}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <User size={12} className="text-slate-400 shrink-0" />
                                    {individualSeleccionada.inscripciones?.[0]?.nivel || 'S/D'}
                                    {individualSeleccionada.inscripciones?.[0]?.profesor ? ` · ${individualSeleccionada.inscripciones[0].profesor}` : ''}
                                </div>
                                {individualSeleccionada.horarios?.length > 0 && (
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500">
                                        <Clock size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="break-words">
                                            {individualSeleccionada.horarios.map(h => `${h.dia.slice(0, 3)} ${h.hora_inicio}-${h.hora_fin}`).join(' · ')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {(individualSeleccionada.inscripciones || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {[...new Set(individualSeleccionada.inscripciones.map(i => i.estado))].map((estado, i) => (
                                        <span key={i} className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getEstadoInscripcionBadge(estado)}`}>
                                            {estado}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-4 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Inicio</span>
                                    <span className="text-[11px] font-black text-slate-700">{formatearFecha(individualSeleccionada.fecha_inicio_real)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Fin real</span>
                                    <span className="text-[11px] font-black text-slate-700">
                                        {individualSeleccionada.fecha_fin_real ? formatearFecha(individualSeleccionada.fecha_fin_real) : 'EN CURSO'}
                                    </span>
                                </div>
                                {individualSeleccionada.monto_final > 0 && (
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Monto</span>
                                        <span className="text-[13px] font-black text-emerald-600 flex items-center gap-0.5">
                                            <DollarSign size={12} className="shrink-0" />{Number(individualSeleccionada.monto_final).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {individualSeleccionada.fecha_vencimiento_pago && (
                                <div className="flex items-start gap-1.5 pt-3 border-t border-dashed border-slate-100">
                                    <Info size={12} className="text-slate-300 shrink-0 mt-0.5" />
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest break-words">
                                        Plazo de pago: {formatearFecha(individualSeleccionada.fecha_vencimiento_pago)}
                                    </span>
                                </div>
                            )}

                            <p className="text-[9px] text-slate-300 font-bold italic pt-1">
                                Cuenta #{individualSeleccionada.cuenta_id} · {individualSeleccionada.concepto}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InscriptionsModal;