import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Fingerprint, Phone, Mail, Calendar, User,
    MapPin, Stethoscope, ShieldAlert, Users, KeyRound,
    CalendarClock, Loader2, Layers, DollarSign, Clock, Info, CircleAlert,
    Zap, X
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

import ChangePasswordModal from '../../../components/shared/ChangePasswordModal'; // Ajusta la ruta si es necesario
import apiFetch from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const StudentDetails = ({ selectedAlumno, onBack, onStatusHistoryChange }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [ciclos, setCiclos] = useState([]);
    const [loadingCiclos, setLoadingCiclos] = useState(true);

    // 🆕 Clase individual seleccionada para ver su resumen en modal aparte
    const [claseIndividualSeleccionada, setClaseIndividualSeleccionada] = useState(null);

    // 🆕 Detalle completo del alumno (dirección, salud, contacto, email, etc.)
    // — ya NO viene en selectedAlumno (ese objeto viene de resumen-tabla,
    // que es liviano). Se pide aparte solo al abrir el expediente.
    const [detalle, setDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(true);

    useEffect(() => {
        if (!selectedAlumno) return;

        const fetchDetalle = async () => {
            try {
                setLoadingDetalle(true);
                const res = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.ALUMNO_DETALLE(selectedAlumno.id));
                const result = await res.json();
                if (res.ok) {
                    setDetalle(result.data);
                } else {
                    toast.error("No se pudo obtener el detalle del alumno");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor para obtener el detalle");
            } finally {
                setLoadingDetalle(false);
            }
        };

        fetchDetalle();
    }, [selectedAlumno]);

    // 🔥 /historial-academico/alumno/:id — el backend YA entrega cada tarjeta
    // agrupada por cuenta_id, con fecha_inicio_real / fecha_fin_real calculadas
    // desde clases realmente generadas en registros_asistencia, ordenadas de
    // más reciente a más antigua (las "sin_registros" van al final).
    useEffect(() => {
        if (!selectedAlumno) return;

        const fetchCiclos = async () => {
            try {
                setLoadingCiclos(true);
                const res = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.ALUMNO(selectedAlumno.id));
                const result = await res.json();

                if (res.ok) {
                    setCiclos(result.data || []);
                } else {
                    toast.error("No se pudo obtener el historial académico");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor para obtener el historial");
            } finally {
                setLoadingCiclos(false);
            }
        };

        fetchCiclos();
    }, [selectedAlumno]);

    // Helpers para la UI
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "S/F";
        return format(parseISO(fechaString.slice(0, 10)), "dd MMM yyyy", { locale: es });
    };

    // 🚀 Extrae "Abril - Mayo 2026" evaluando inicio y fin REAL (calculado por asistencias)
    const obtenerRangoCiclo = (fechaInicio, fechaFin) => {
        if (!fechaInicio) return "SIN CLASES REGISTRADAS";

        const inicioDate = parseISO(fechaInicio.slice(0, 10));
        const mesInicio = format(inicioDate, "MMMM", { locale: es });
        const anioInicio = format(inicioDate, "yyyy");

        if (!fechaFin) return `${mesInicio} ${anioInicio} · EN CURSO`;

        const finDate = parseISO(fechaFin.slice(0, 10));
        const mesFin = format(finDate, "MMMM", { locale: es });
        const anioFin = format(finDate, "yyyy");

        if (mesInicio === mesFin && anioInicio === anioFin) {
            return `${mesInicio} ${anioInicio}`;
        }
        else if (anioInicio === anioFin) {
            return `${mesInicio} - ${mesFin} ${anioInicio}`;
        }
        else {
            return `${mesInicio.slice(0, 3)} ${anioInicio} - ${mesFin.slice(0, 3)} ${anioFin}`;
        }
    };

    // BADGE PARA EL PAGO (Mensualidad)
    const getEstadoPagoBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'PAGADA':
            case 'PAGADO': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDIENTE': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'VENCIDO': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-slate-100 text-slate-500 border-slate-200';
        }
    };

    // BADGE PARA LA(S) INSCRIPCIÓN(ES) — puede haber más de un estado dentro
    // de la misma tarjeta si el paquete agrupa varias inscripciones.
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

    if (!selectedAlumno) return null;

    // 🛡️ Evita el crash: mientras no haya detalle cargado, no renderiza el
    // cuerpo que depende de direccion/salud/contactoEmergencia/email/etc.
    if (loadingDetalle || !detalle) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
                <p className="font-black text-[#1e3a8a] text-xs uppercase italic tracking-widest animate-pulse">Cargando expediente...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header del Expediente */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-black uppercase italic text-slate-800 leading-none">Expediente <span className="text-[#1e3a8a]">Gema</span></h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ficha completa del Alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA (Datos Personales y Médicos) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Perfil Principal */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                        <div className="w-28 h-28 bg-[#1e3a8a] text-white rounded-3xl flex items-center justify-center font-black text-5xl italic shadow-2xl relative z-10 shrink-0">
                            {selectedAlumno.nombres.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-6 relative z-10 w-full">
                            <div className='flex items-center gap-4'>
                                <div className='flex-1'>
                                    <h3 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{selectedAlumno.full_name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        {selectedAlumno.sedes.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black uppercase italic border border-orange-200">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-black text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-slate-800 hover:border-white">
                                    <KeyRound size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span>Contraseña</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Fingerprint size={16} className="text-blue-500" /> {selectedAlumno.dni}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold lowercase">
                                    <Mail size={16} className="text-blue-500" /> {detalle.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Calendar size={16} className="text-blue-500" /> {detalle.cumpleanos}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Phone size={16} className="text-blue-500" /> {selectedAlumno.telefono}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold tracking-tighter">
                                    <User size={16} className="text-blue-500" /> {detalle.username || 'Sin nombre de usuario'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Dirección Registrada</p>
                                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-black text-slate-700 uppercase italic leading-tight">
                                            {detalle.direccion.distrito} <span className="text-slate-300 font-normal mx-2">|</span> {detalle.direccion.completa}
                                        </p>
                                        {detalle.direccion.referencia && (
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold italic tracking-wide">Ref: {detalle.direccion.referencia}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información Médica */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#1e3a8a]">
                                <Stethoscope size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">Información de Salud</span>
                            </div>
                            <span className="bg-[#1e3a8a] text-white text-[8px] font-black px-2 py-1 rounded-md">GRUPO SANGUÍNEO: {detalle.salud.sangre}</span>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Alergias / Condiciones:</p>
                                    <p className="text-sm font-bold text-slate-700 italic leading-relaxed">{detalle.salud.condiciones}</p>
                                </div>
                                <div className="flex justify-between p-5 bg-white border border-slate-100 rounded-3xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Seguro Médico:</span>
                                    <span className="text-sm font-black text-[#1e3a8a] italic uppercase">{detalle.salud.seguro}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <User size={14} />
                                    <p className="text-[9px] font-black uppercase italic">Historial Deportivo:</p>
                                </div>
                                <select
                                    value={detalle.salud?.historial ?? 'Nuevo'}
                                    onChange={(e) => onStatusHistoryChange(e.target.value)}
                                    className="w-full text-[11px] font-medium text-slate-500 italic leading-relaxed bg-transparent border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="Antiguo">Antiguo</option>
                                    <option value="Nuevo">Nuevo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA (Emergencia y Ciclos) */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Contacto de Emergencia */}
                    <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8 relative overflow-hidden shrink-0">
                        <div className="absolute -right-4 -bottom-4 text-red-100 opacity-50">
                            <ShieldAlert size={120} />
                        </div>
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3 text-red-600">
                                <Users size={24} />
                                <span className="text-xs font-black uppercase tracking-widest italic">Contacto Emergencia</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Responsable</p>
                                    <p className="text-lg font-black text-red-900 leading-tight uppercase italic">{detalle.contactoEmergencia.nombre}</p>
                                    <p className="text-[10px] font-bold text-red-600 uppercase italic mt-1">{detalle.contactoEmergencia.relacion}</p>
                                </div>
                                <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-red-400 uppercase mb-1">Teléfono Directo</p>
                                        <p className="text-xl font-black text-red-900 tracking-tighter">{detalle.contactoEmergencia.telefono}</p>
                                    </div>
                                    <a href={`tel:${detalle.contactoEmergencia.telefono}`} className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
                                        <Phone size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Ciclos (historial académico real por cuenta) */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-5 bg-orange-50/50 border-b border-orange-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                                <CalendarClock size={16} />
                            </div>
                            <h3 className="text-xs font-black text-slate-800 uppercase italic tracking-widest leading-tight">
                                Historial de Ciclos
                            </h3>
                        </div>

                        <div className="p-4 sm:p-5 overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[500px] space-y-3 bg-slate-50/30">
                            {loadingCiclos ? (
                                <div className="flex flex-col justify-center items-center py-10 gap-2">
                                    <Loader2 className="animate-spin text-orange-500" size={24} />
                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Cargando ciclos...</span>
                                </div>
                            ) : ciclos.length > 0 ? (
                                ciclos.map((ciclo) => {
                                    const estadosInscripcion = [...new Set(
                                        (ciclo.inscripciones || []).map(i => i.estado)
                                    )];

                                    // 🚩 Tarjeta especial: sin clases registradas (todas CANCELADO o cuenta vieja sin link)
                                    if (ciclo.sin_registros) {
                                        return (
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
                                        );
                                    }

                                    // 🆕 Tarjeta compacta para CLASE INDIVIDUAL: solo un botón que abre el modal
                                    // con el resumen completo. Así no compite en tamaño/detalle con los paquetes.
                                    if (ciclo.es_individual) {
                                        return (
                                            <button
                                                key={ciclo.cuenta_id}
                                                onClick={() => setClaseIndividualSeleccionada(ciclo)}
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
                                        );
                                    }

                                    return (
                                        <div key={ciclo.cuenta_id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative transition-all hover:border-orange-200 hover:shadow-md overflow-hidden">
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

                                                    <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-2 min-w-0">
                                                        <MapPin size={10} className="text-orange-500 shrink-0" />
                                                        <span className="truncate">{ciclo.inscripciones?.[0]?.sede || 'S/D'}</span>
                                                    </div>
                                                    <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 mt-1 min-w-0">
                                                        <User size={10} className="text-slate-400 shrink-0" />
                                                        <span className="truncate">
                                                            {ciclo.inscripciones?.[0]?.nivel || 'S/D'}
                                                            {ciclo.inscripciones?.[0]?.profesor ? ` · ${ciclo.inscripciones[0].profesor}` : ''}
                                                        </span>
                                                    </div>

                                                    {ciclo.horarios?.length > 0 && (
                                                        <div className="text-[9px] font-bold text-slate-400 flex items-start gap-1.5 mt-1 min-w-0">
                                                            <Clock size={10} className="text-slate-400 shrink-0 mt-0.5" />
                                                            <span className="break-words">
                                                                {ciclo.horarios.map(h => `${h.dia.slice(0, 3)} ${h.hora_inicio}-${h.hora_fin}`).join(' · ')}
                                                            </span>
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

                                            <div className="grid grid-cols-2 gap-x-2 gap-y-2 pt-3 border-t border-slate-100">
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
                                                <div className="flex items-start gap-1.5 pt-2 border-t border-dashed border-slate-100" title="Fecha límite administrativa para pagar esta cuenta, no representa el fin de las clases">
                                                    <Info size={10} className="text-slate-300 shrink-0 mt-0.5" />
                                                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest break-words">
                                                        Plazo de pago: {formatearFecha(ciclo.fecha_vencimiento_pago)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10 flex flex-col items-center justify-center opacity-60">
                                    <CalendarClock size={32} className="text-slate-300 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin registros de ciclos</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                userId={selectedAlumno.id}
            />

            {/* 🆕 MODAL RESUMEN CLASE INDIVIDUAL */}
            {claseIndividualSeleccionada && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                    onClick={() => setClaseIndividualSeleccionada(null)}
                >
                    <div
                        className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Zap size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">Resumen de Clase Suelta</span>
                            </div>
                            <button
                                onClick={() => setClaseIndividualSeleccionada(null)}
                                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <X size={16} className="text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                    {obtenerRangoCiclo(claseIndividualSeleccionada.fecha_inicio_real, claseIndividualSeleccionada.fecha_fin_real)}
                                </span>
                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getEstadoPagoBadge(claseIndividualSeleccionada.estado_pago)}`}>
                                    {claseIndividualSeleccionada.estado_pago}
                                </span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <MapPin size={12} className="text-orange-500 shrink-0" />
                                    {claseIndividualSeleccionada.inscripciones?.[0]?.sede || 'S/D'}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                    <User size={12} className="text-slate-400 shrink-0" />
                                    {claseIndividualSeleccionada.inscripciones?.[0]?.nivel || 'S/D'}
                                    {claseIndividualSeleccionada.inscripciones?.[0]?.profesor ? ` · ${claseIndividualSeleccionada.inscripciones[0].profesor}` : ''}
                                </div>
                                {claseIndividualSeleccionada.horarios?.length > 0 && (
                                    <div className="flex items-start gap-2 text-[10px] font-bold text-slate-500">
                                        <Clock size={12} className="text-slate-400 shrink-0 mt-0.5" />
                                        <span className="break-words">
                                            {claseIndividualSeleccionada.horarios.map(h => `${h.dia.slice(0, 3)} ${h.hora_inicio}-${h.hora_fin}`).join(' · ')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {(claseIndividualSeleccionada.inscripciones || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {[...new Set(claseIndividualSeleccionada.inscripciones.map(i => i.estado))].map((estado, i) => (
                                        <span key={i} className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getEstadoInscripcionBadge(estado)}`}>
                                            {estado}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-x-2 gap-y-3 pt-4 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Inicio</span>
                                    <span className="text-[11px] font-black text-slate-700">{formatearFecha(claseIndividualSeleccionada.fecha_inicio_real)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Fin real</span>
                                    <span className="text-[11px] font-black text-slate-700">
                                        {claseIndividualSeleccionada.fecha_fin_real ? formatearFecha(claseIndividualSeleccionada.fecha_fin_real) : 'EN CURSO'}
                                    </span>
                                </div>
                                {claseIndividualSeleccionada.monto_final > 0 && (
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Monto</span>
                                        <span className="text-[13px] font-black text-emerald-600 flex items-center gap-0.5">
                                            <DollarSign size={12} className="shrink-0" />{Number(claseIndividualSeleccionada.monto_final).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {claseIndividualSeleccionada.fecha_vencimiento_pago && (
                                <div className="flex items-start gap-1.5 pt-3 border-t border-dashed border-slate-100">
                                    <Info size={12} className="text-slate-300 shrink-0 mt-0.5" />
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest break-words">
                                        Plazo de pago: {formatearFecha(claseIndividualSeleccionada.fecha_vencimiento_pago)}
                                    </span>
                                </div>
                            )}

                            <p className="text-[9px] text-slate-300 font-bold italic pt-1">
                                Cuenta #{claseIndividualSeleccionada.cuenta_id} · {claseIndividualSeleccionada.concepto}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetails;