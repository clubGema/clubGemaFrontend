import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Loader2, Calendar, MapPin, BadgeCheck, XCircle, CircleDollarSign, HelpCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import apiFetch from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const StudentAttendanceHistory = ({ alumno, onBack }) => {
    const [ciclos, setCiclos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorialCiclos = async () => {
            try {
                setLoading(true);
                // 🔥 Nuevo endpoint: historial de ciclos/meses de inscripción (con estado de pago)
                // Nota: agregar esta ruta a API_ROUTES si aún no existe:
                // ASISTENCIAS.HISTORIAL_CICLOS: (id) => `/inscripciones/alumno/${id}/historial-ciclos`
                const response = await apiFetch.get(API_ROUTES.ASISTENCIAS.HISTORIAL_CICLOS(alumno.id));
                const result = await response.json();

                if (response.ok) {
                    setCiclos(result.data || []);
                } else {
                    toast.error("No se pudo obtener el historial de ciclos");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorialCiclos();
    }, [alumno.id]);

    // 🔥 FIX: el backend devuelve una fila por cada horario semanal de la
    // inscripción (join contra horarios_clases), así que un ciclo con 2 clases
    // por semana aparece 2 veces con el mismo mes/sede/nivel/pago. Agrupamos
    // por todo lo que identifica al CICLO real (sede + nivel + mes + fechas +
    // estado de pago), no por inscripcion_id, y guardamos los ids agrupados
    // solo por si se necesitan luego (ej. para un detalle o acción).
    const gruposCiclos = useMemo(() => {
        const mapa = new Map();

        ciclos.forEach((c) => {
            const key = [
                c.sede,
                c.nivel,
                c.profesor,
                c.numero_mes_ciclo,
                c.fecha_inicio_ciclo,
                c.fecha_corte_ciclo,
                c.estado_inscripcion,
                c.estado_pago_mes,
                c.monto_mes,
            ].join('__');

            if (!mapa.has(key)) {
                mapa.set(key, { ...c, inscripcion_ids: [c.inscripcion_id] });
            } else {
                mapa.get(key).inscripcion_ids.push(c.inscripcion_id);
            }
        });

        // Orden: ciclo más reciente primero
        return Array.from(mapa.values()).sort((a, b) => {
            const fa = a.fecha_inicio_ciclo ? new Date(a.fecha_inicio_ciclo) : 0;
            const fb = b.fecha_inicio_ciclo ? new Date(b.fecha_inicio_ciclo) : 0;
            return fb - fa;
        });
    }, [ciclos]);

    const getEstadoPagoBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'PAGADA':
                return { bg: 'bg-green-50 text-green-600 border-green-200', icon: <BadgeCheck size={14} />, text: 'PAGADA' };
            case 'PENDIENTE':
                return { bg: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={14} />, text: 'PENDIENTE' };
            case 'SIN_CUENTA':
                return { bg: 'bg-slate-50 text-slate-500 border-slate-200', icon: <HelpCircle size={14} />, text: 'SIN CUENTA' };
            default:
                return { bg: 'bg-slate-50 text-slate-600 border-slate-200', icon: <HelpCircle size={14} />, text: estado || 'DESCONOCIDO' };
        }
    };

    const totalCiclos = gruposCiclos.length;
    const pagados = gruposCiclos.filter(c => c.estado_pago_mes?.toUpperCase() === 'PAGADA').length;
    const pendientes = gruposCiclos.filter(c => c.estado_pago_mes?.toUpperCase() === 'PENDIENTE').length;

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
            <p className="font-black text-[#1e3a8a] text-xs uppercase italic tracking-widest animate-pulse">Sincronizando Ciclos...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up p-1">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                            Historial de <span className="text-[#1e3a8a]">Ciclos</span>
                        </h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                            ALUMNO: <span className="text-slate-700 font-black">{alumno.full_name}</span> | DNI: {alumno.dni}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ciclos Totales</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCiclos}</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pagados</p>
                        <h3 className="text-2xl font-black text-green-500 mt-1">{pagados}</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><BadgeCheck size={20} /></div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pendientes</p>
                        <h3 className="text-2xl font-black text-red-500 mt-1">{pendientes}</h3>
                    </div>
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><CircleDollarSign size={20} /></div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ciclo</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede y Nivel</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profesor</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscripción</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha de Corte</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Pago</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {gruposCiclos.length > 0 ? (
                                gruposCiclos.map((c) => {
                                    const badgePago = getEstadoPagoBadge(c.estado_pago_mes);
                                    const fechaCorte = c.fecha_corte_ciclo
                                        ? format(parseISO(c.fecha_corte_ciclo.slice(0, 10)), "dd MMM yyyy", { locale: es })
                                        : '---';

                                    return (
                                        <tr key={`${c.inscripcion_ids.join('-')}`} className="hover:bg-slate-50/50 transition-colors group">

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide group-hover:text-[#1e3a8a] transition-colors">
                                                        Mes {c.numero_mes_ciclo}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {c.fecha_inicio_ciclo ? format(parseISO(c.fecha_inicio_ciclo.slice(0, 10)), "dd MMM yyyy", { locale: es }) : 'S/F'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1">
                                                        <MapPin size={12} className="text-slate-400" />
                                                        Sede {c.sede || 'S/D'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1 pl-4">
                                                        {c.nivel || 'SIN NIVEL'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-slate-600 uppercase">
                                                    {c.profesor || 'No asignado'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${c.estado_inscripcion === 'ACTIVO'
                                                        ? 'bg-green-100 border-green-200 text-green-700'
                                                        : 'bg-slate-100 border-slate-200 text-slate-600'
                                                        }`}>
                                                        {c.estado_inscripcion || 'DESCONOCIDO'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                                                        TIPO: {c.tipo_inscripcion || 'REGULAR'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="text-xs font-bold text-slate-700 uppercase">
                                                    {fechaCorte}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${badgePago.bg}`}>
                                                        {badgePago.icon}
                                                        {badgePago.text}
                                                    </span>
                                                    {c.monto_mes > 0 && (
                                                        <span className="text-[10px] font-black text-slate-500">S/ {Number(c.monto_mes).toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                                            <Calendar size={36} className="text-slate-300 mb-2" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">
                                                No se registran ciclos de inscripción para este alumno.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendanceHistory;