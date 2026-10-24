import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, BadgeCheck, XCircle, HelpCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { asistenciaService } from '../../../services/asistencia.service';
import LoadingSpinner from '../../..//components/shared/LoadingSpinner';
import { STATUS_SUCCESS } from '../../../config/statusColors';

const StudentAttendanceHistory = ({ alumno, onBack }) => {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistorialAsistencias = async () => {
            try {
                setLoading(true);
                const data = await asistenciaService.getHistorialAlumno(alumno.id);
                setAsistencias([...data].reverse().slice(0, 30));
            } catch (error) {
                toast.error(error.message || "Error al conectar con el servidor");
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
                return { bg: STATUS_SUCCESS, icon: <BadgeCheck size={14} />, text: 'ASISTIÓ' };
            case 'FALTA':
                return { bg: 'bg-red-50 text-red-600 border-red-200', icon: <XCircle size={14} />, text: 'FALTA' };
            case 'PROGRAMADA':
                return { bg: 'bg-brand-primary-soft text-brand-primary border-brand-primary/20', icon: <Clock size={14} />, text: 'PROGRAMADA' };
            default:
                return { bg: 'bg-brand-bg text-slate-600 border-brand-border', icon: <HelpCircle size={14} />, text: estado };
        }
    };

    const totalClases = asistencias.length;
    const asistidas = asistencias.filter(a => ['PRESENTE'].includes(a.estado?.toUpperCase())).length;
    const faltas = asistencias.filter(a => ['FALTA'].includes(a.estado?.toUpperCase())).length;

    if (loading) return (
        <LoadingSpinner
            className="flex flex-col items-center justify-center h-96 gap-4"
            size={48}
            label="Sincronizando Asistencias..."
            labelClassName="font-black text-brand-primary text-xs uppercase italic tracking-widest animate-pulse"
        />
    );

    return (
        <div className="space-y-6 animate-fade-in-up p-1">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-brand-surface p-6 rounded-3xl border border-brand-border-soft shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="w-12 h-12 flex items-center justify-center rounded-xl bg-brand-bg border border-brand-border text-slate-600 hover:bg-brand-primary hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-brand-heading uppercase italic tracking-tighter leading-none">
                            Historial de <span className="text-brand-primary">Asistencias</span>
                        </h1>
                        <p className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                            ALUMNO: <span className="text-brand-body font-black">{alumno.full_name}</span> | DNI: {alumno.dni}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-brand-surface border border-brand-border-soft p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Clases Totales</p>
                        <h3 className="text-2xl font-black text-brand-heading mt-1">{totalClases}</h3>
                    </div>
                    <div className="w-10 h-10 bg-brand-primary-soft text-brand-primary rounded-xl flex items-center justify-center"><Calendar size={20} /></div>
                </div>
                <div className="bg-brand-surface border border-brand-border-soft p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Asistencias</p>
                        <h3 className="text-2xl font-black text-green-500 mt-1">{asistidas}</h3>
                    </div>
                    <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center"><BadgeCheck size={20} /></div>
                </div>
                <div className="bg-brand-surface border border-brand-border-soft p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Inasistencias</p>
                        <h3 className="text-2xl font-black text-red-500 mt-1">{faltas}</h3>
                    </div>
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><XCircle size={20} /></div>
                </div>
            </div>

            <div className="bg-brand-surface rounded-[2rem] shadow-xl border border-brand-border-soft overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-bg/70 border-b border-brand-border-soft">
                                <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Fecha y Hora</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Sede y Nivel</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Coordinador</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Clase</th>
                                <th className="px-6 py-4 text-[10px] font-black text-brand-muted uppercase tracking-widest">Inscripción</th>
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
                                        <tr key={clase.id} className="hover:bg-brand-bg/50 transition-colors group">

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-brand-heading uppercase tracking-wide group-hover:text-brand-primary transition-colors">
                                                        {fechaFormateada}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1 flex items-center gap-1">
                                                        <Clock size={10} /> {horaTexto}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-brand-primary uppercase tracking-wide flex items-center gap-1">
                                                        <MapPin size={12} className="text-brand-muted" />
                                                        Sede {hc.canchas?.sedes?.nombre || 'S/D'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest mt-1 pl-4">
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
                                                        : 'bg-brand-surface-alt border-brand-border text-slate-600'
                                                        }`}>
                                                        {insc.estado || 'DESCONOCIDO'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-brand-muted tracking-wider">
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
                                            <p className="text-xs font-black text-brand-muted uppercase tracking-widest italic">
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