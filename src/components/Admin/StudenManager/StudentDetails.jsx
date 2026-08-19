import React, { useState, useEffect, useMemo } from 'react';
import {
    ArrowLeft, Fingerprint, Phone, Mail, Calendar, User,
    MapPin, Stethoscope, ShieldAlert, Users, KeyRound,
    CalendarClock, Loader2, Layers, DollarSign
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

    useEffect(() => {
        if (!selectedAlumno) return;

        const fetchCiclos = async () => {
            try {
                setLoadingCiclos(true);
                const res = await apiFetch.get(API_ROUTES.INSCRIPCIONES.HISTORIAL_CICLOS(selectedAlumno.id));
                const result = await res.json();

                if (res.ok) {
                    setCiclos(result.data || []);
                } else {
                    toast.error("No se pudo obtener el historial de ciclos");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor para obtener ciclos");
            } finally {
                setLoadingCiclos(false);
            }
        };

        fetchCiclos();
    }, [selectedAlumno]);

    // 🔥 FIX: el backend devuelve una fila por cada horario semanal de la
    // inscripción (join contra horarios_clases), así que un ciclo con 2 clases
    // por semana llega duplicado (mismo mes, sede, nivel, pago, corte) — solo
    // cambia el inscripcion_id. Agrupamos por lo que identifica al CICLO real:
    // sede + nivel + profesor + mes + fechas + estado + pago + monto.
    // Guardamos cuántos registros se fusionaron para mostrar un pequeño
    // indicador ("x2 horarios") cuando aplica, sin perder esa información.
    const ciclosAgrupados = useMemo(() => {
        const mapa = new Map();

        ciclos.forEach((c) => {
            // 🔥 FIX: monto_mes SALE de la key. El monto es el que varía y
            // debe ACUMULARSE entre los registros agrupados (cada horario
            // semanal es una cuota), no perderse quedándose con el de uno solo.
            const key = [
                c.sede,
                c.nivel,
                c.profesor,
                c.numero_mes_ciclo,
                c.fecha_inicio_ciclo,
                c.fecha_corte_ciclo,
                c.estado_inscripcion,
                c.estado_pago_mes,
            ].join('__');

            if (!mapa.has(key)) {
                mapa.set(key, {
                    ...c,
                    inscripcion_ids: [c.inscripcion_id],
                    cantidadHorarios: 1,
                    montoTotal: Number(c.monto_mes || 0),
                });
            } else {
                const grupo = mapa.get(key);
                grupo.inscripcion_ids.push(c.inscripcion_id);
                grupo.cantidadHorarios += 1;
                grupo.montoTotal += Number(c.monto_mes || 0);
            }
        });

        return Array.from(mapa.values()).sort((a, b) => {
            const fa = a.fecha_inicio_ciclo ? new Date(a.fecha_inicio_ciclo) : 0;
            const fb = b.fecha_inicio_ciclo ? new Date(b.fecha_inicio_ciclo) : 0;
            return fb - fa;
        });
    }, [ciclos]);

    // Helpers para la UI
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "S/F";
        return format(parseISO(fechaString.slice(0, 10)), "dd 'de' MMM, yyyy", { locale: es });
    };

    // 🚀 Extrae "Abril - Mayo 2026" evaluando inicio y corte
    const obtenerMesCiclo = (fechaInicio, fechaCorte) => {
        if (!fechaInicio) return "MES DESCONOCIDO";

        const inicioDate = parseISO(fechaInicio.slice(0, 10));
        const mesInicio = format(inicioDate, "MMMM", { locale: es });
        const anioInicio = format(inicioDate, "yyyy");

        if (!fechaCorte) return `${mesInicio} ${anioInicio}`;

        const corteDate = parseISO(fechaCorte.slice(0, 10));
        const mesCorte = format(corteDate, "MMMM", { locale: es });
        const anioCorte = format(corteDate, "yyyy");

        if (mesInicio === mesCorte && anioInicio === anioCorte) {
            return `${mesInicio} ${anioInicio}`;
        }
        else if (anioInicio === anioCorte) {
            return `${mesInicio} - ${mesCorte} ${anioInicio}`;
        }
        else {
            return `${mesInicio.slice(0, 3)} ${anioInicio} - ${mesCorte.slice(0, 3)} ${anioCorte}`;
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

    // BADGE PARA LA INSCRIPCIÓN (Estado general)
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
                                    <Mail size={16} className="text-blue-500" /> {selectedAlumno.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Calendar size={16} className="text-blue-500" /> {selectedAlumno.cumpleanos}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Phone size={16} className="text-blue-500" /> {selectedAlumno.telefono}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold tracking-tighter">
                                    <User size={16} className="text-blue-500" /> {selectedAlumno.username || 'Sin nombre de usuario'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Dirección Registrada</p>
                                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-black text-slate-700 uppercase italic leading-tight">
                                            {selectedAlumno.direccion.distrito} <span className="text-slate-300 font-normal mx-2">|</span> {selectedAlumno.direccion.completa}
                                        </p>
                                        {selectedAlumno.direccion.referencia && (
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold italic tracking-wide">Ref: {selectedAlumno.direccion.referencia}</p>
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
                            <span className="bg-[#1e3a8a] text-white text-[8px] font-black px-2 py-1 rounded-md">GRUPO SANGUÍNEO: {selectedAlumno.salud.sangre}</span>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Alergias / Condiciones:</p>
                                    <p className="text-sm font-bold text-slate-700 italic leading-relaxed">{selectedAlumno.salud.condiciones}</p>
                                </div>
                                <div className="flex justify-between p-5 bg-white border border-slate-100 rounded-3xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Seguro Médico:</span>
                                    <span className="text-sm font-black text-[#1e3a8a] italic uppercase">{selectedAlumno.salud.seguro}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <User size={14} />
                                    <p className="text-[9px] font-black uppercase italic">Historial Deportivo:</p>
                                </div>
                                <select
                                    value={selectedAlumno.salud?.historial ?? 'Nuevo'}
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
                                    <p className="text-lg font-black text-red-900 leading-tight uppercase italic">{selectedAlumno.contactoEmergencia.nombre}</p>
                                    <p className="text-[10px] font-bold text-red-600 uppercase italic mt-1">{selectedAlumno.contactoEmergencia.relacion}</p>
                                </div>
                                <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-red-400 uppercase mb-1">Teléfono Directo</p>
                                        <p className="text-xl font-black text-red-900 tracking-tighter">{selectedAlumno.contactoEmergencia.telefono}</p>
                                    </div>
                                    <a href={`tel:${selectedAlumno.contactoEmergencia.telefono}`} className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
                                        <Phone size={20} />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historial de Ciclos (Meses) */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-5 bg-orange-50/50 border-b border-orange-100 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                                <CalendarClock size={16} />
                            </div>
                            <h3 className="text-xs font-black text-slate-800 uppercase italic tracking-widest leading-tight">
                                Historial de Ciclos
                            </h3>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar max-h-[500px] space-y-3 bg-slate-50/30">
                            {loadingCiclos ? (
                                <div className="flex flex-col justify-center items-center py-10 gap-2">
                                    <Loader2 className="animate-spin text-orange-500" size={24} />
                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Cargando ciclos...</span>
                                </div>
                            ) : ciclosAgrupados.length > 0 ? (
                                ciclosAgrupados.map((ciclo, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 shadow-sm relative transition-all hover:border-orange-200 hover:shadow-md">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md">
                                                        {obtenerMesCiclo(ciclo.fecha_inicio_ciclo, ciclo.fecha_corte_ciclo)}
                                                    </span>
                                                    {/* 🔥 Nuevo: indicador de cuántos horarios semanales se fusionaron en esta tarjeta */}
                                                    {ciclo.cantidadHorarios > 1 && (
                                                        <span className="flex items-center gap-1 text-[8px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded-md border border-indigo-100 uppercase">
                                                            <Layers size={9} /> x{ciclo.cantidadHorarios} horarios
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1.5 mt-2">
                                                    <MapPin size={10} className="text-orange-500 shrink-0" />
                                                    <span className="truncate">{ciclo.sede}</span>
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                                                    <User size={10} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">{ciclo.nivel} {ciclo.profesor ? `· ${ciclo.profesor}` : ''}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${getEstadoPagoBadge(ciclo.estado_pago_mes)}`}>
                                                    PAGO: {ciclo.estado_pago_mes}
                                                </span>
                                                <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${getEstadoInscripcionBadge(ciclo.estado_inscripcion)}`}>
                                                    INSC: {ciclo.estado_inscripcion}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Inicio</span>
                                                <span className="text-[10px] font-black text-slate-700">{formatearFecha(ciclo.fecha_inicio_ciclo)}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Corte</span>
                                                <span className="text-[10px] font-black text-slate-700">{ciclo.fecha_corte_ciclo ? formatearFecha(ciclo.fecha_corte_ciclo) : 'N/A'}</span>
                                            </div>
                                            {/* 🔥 Nuevo: monto del ciclo, útil ahora que ya no está duplicado */}
                                            {ciclo.montoTotal > 0 && (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">Monto</span>
                                                    <span className="text-[10px] font-black text-emerald-600 flex items-center gap-0.5">
                                                        <DollarSign size={10} />{ciclo.montoTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
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
        </div>
    );
};

export default StudentDetails;