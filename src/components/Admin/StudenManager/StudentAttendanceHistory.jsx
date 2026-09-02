import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Calendar, Clock, MapPin, BadgeCheck, XCircle, HelpCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import apiFetch from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

const StudentAttendanceHistory = ({ alumno, onBack }) => {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorialAsistencias = async () => {
            try {
                setLoading(true);
                const response = await apiFetch.get(`${API_ROUTES.ASISTENCIAS.ALUMNO_HISTORIAL(alumno.id)}`);
                const result = await response.json();

                if (response.ok) {
                    setAsistencias([...(result.data || [])].reverse().slice(0, 30));
                } else {
                    toast.error("No se pudo obtener el historial");
                }
            } catch (error) {
                toast.error("Error al conectar con el servidor");
            } finally {
                setLoading(false);
            }
        };

        fetchHistorialAsistencias();
    }, [alumno.id]);

    const formatTimeString = (timeStr) => {
        if (!timeStr) return '';
        if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
        return timeStr.substring(0, 5);
    };

    const getEstadoAsistenciaBadge = (estado) => {
        switch (estado?.toUpperCase()) {
            case 'PRESENTE':
                return { bg: 'bg-green-50 text-green-600 border-green-200', icon: <BadgeCheck size={14} />, text: 'ASISTIÓ' };
            case 'FALTA':
                return { bg: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={14} />, text: 'FALTA' };
            case 'PROGRAMADA':
                return { bg: 'bg-blue-50 text-blue-600 border-blue-200', icon: <Clock size={14} />, text: 'PROGRAMADA' };
            default:
                return { bg: 'bg-slate-50 text-slate-600 border-slate-200', icon: <HelpCircle size={14} />, text: estado };
        }
    };

    const totalClases = asistencias.length;
    const asistidas = asistencias.filter(a => ['PRESENTE'].includes(a.estado?.toUpperCase())).length;
    const faltas = asistencias.filter(a => ['FALTA'].includes(a.estado?.toUpperCase())).length;

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
            <p className="font-black text-[#1e3a8a] text-xs uppercase italic tracking-widest animate-pulse">Sincronizando Asistencias...</p>
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
                            Historial de <span className="text-[#1e3a8a]">Asistencias</span>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clases Totales</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">{totalClases}</h3>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asistencias</p>
                        <h3 className="text-2xl font-black text-green-500 mt-1">{asistidas}</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><BadgeCheck size={20} /></div>
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inasistencias</p>
                        <h3 className="text-2xl font-black text-red-500 mt-1">{faltas}</h3>
                    </div>
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><XCircle size={20} /></div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/70 border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha y Hora</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede y Nivel</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Coordinador</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Clase</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inscripción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {asistencias.length > 0 ? (
                                asistencias.map((clase) => {
                                    const insc = clase.inscripciones || {};
                                    const hc = insc.horarios_clases || {};
                                    const coord = hc.coordinadores?.usuarios || {};

                                    const fechaFormateada = clase.fecha
                                        ? format(parseISO(clase.fecha.slice(0, 10)), "eeee dd 'de' MMMM", { locale: es })
                                        : "S/F";

                                    const horaTexto = hc.hora_inicio && hc.hora_fin
                                        ? `${formatTimeString(hc.hora_inicio)} - ${formatTimeString(hc.hora_fin)}`
                                        : '---';

                                    const badgeAsistencia = getEstadoAsistenciaBadge(clase.estado);

                                    return (
                                        <tr key={clase.id} className="hover:bg-slate-50/50 transition-colors group">

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-900 uppercase tracking-wide group-hover:text-[#1e3a8a] transition-colors">
                                                        {fechaFormateada}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                                                        <Clock size={10} /> {horaTexto}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-[#1e3a8a] uppercase tracking-wide flex items-center gap-1">
                                                        <MapPin size={12} className="text-slate-400" />
                                                        Sede {hc.canchas?.sedes?.nombre || 'S/D'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest mt-1 pl-4">
                                                        {hc.niveles_entrenamiento?.nombre || 'SIN NIVEL'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-xs font-bold text-slate-600 uppercase">
                                                    {coord.nombres ? `${coord.nombres} ${coord.apellidos}` : 'No asignado'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${badgeAsistencia.bg}`}>
                                                    {badgeAsistencia.icon}
                                                    {badgeAsistencia.text}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-black border ${insc.estado === 'ACTIVO'
                                                        ? 'bg-green-100 border-green-200 text-green-700'
                                                        : 'bg-slate-100 border-slate-200 text-slate-600'
                                                        }`}>
                                                        {insc.estado || 'DESCONOCIDO'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-400 tracking-wider">
                                                        TIPO: {insc.tipo_inscripcion || 'REGULAR'}
                                                    </span>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="max-w-xs mx-auto flex flex-col items-center justify-center">
                                            <Calendar size={36} className="text-slate-300 mb-2" />
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">
                                                No se registran asistencias ni programaciones previas para este alumno.
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