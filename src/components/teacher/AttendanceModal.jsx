import React, { useState } from 'react';
import { X, Check, UserMinus, Loader2, ShieldAlert, RefreshCw } from 'lucide-react';
import { asistenciaService } from '../../services/asistencia.service';
import toast from 'react-hot-toast';
import { format, addDays, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

const AttendanceModal = ({ clase, onClose, onRefresh }) => {
    const [isSaving, setIsSaving] = useState(false);

    // Inicialización basada en el desglose de fechas del Dashboard
    const [listaAsistencia, setListaAsistencia] = useState(
        clase.inscripcionesEnEstaFecha?.map(ins => {
            const fechaInscripcion = ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion) : null;
            const fechaCorte = fechaInscripcion ? addDays(fechaInscripcion, 30) : null;

            return {
                asistenciaId: ins.registro_especifico?.id,
                nombreCompleto: `${ins.alumnos.usuarios.nombres} ${ins.alumnos.usuarios.apellidos}`,
                dni: ins.alumnos.usuarios.numero_documento,
                estado: ins.registro_especifico?.estado || 'PROGRAMADA',
                esRecuperacion: ins.tipo_sesion === 'RECUPERACION' || ins.estado === 'RECUPERACION',
                esReposicion: ins.tipo_sesion === 'REPOSICION' || ins.registro_especifico?.fecha_original != null,
                esLesion: ins.registro_especifico?.estado === 'JUSTIFICADO_LESION',
                fechaCorte: fechaCorte,
                vencido: fechaCorte && isPast(fechaCorte) && !isToday(fechaCorte),
                esHoyCorte: fechaCorte && isToday(fechaCorte)
            };
        }) || []
    );

    const handleLocalUpdate = (asistenciaId, nuevoEstado) => {
        setListaAsistencia(prev =>
            prev.map(item => item.asistenciaId === asistenciaId
                ? { ...item, estado: nuevoEstado }
                : item
            )
        );
    };

    const handleSaveAll = async () => {
        const payload = listaAsistencia.map(item => ({
            id: item.asistenciaId,
            estado: item.estado,
            comentario: ""
        }));

        try {
            setIsSaving(true);
            await asistenciaService.marcarAsistenciaMasiva(payload);
            toast.success("Asistencia guardada con éxito");
            onRefresh();
            onClose();
        } catch (error) {
            toast.error("Error al guardar la asistencia");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-28 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-zoom-in">

                <div className="bg-[#1e3a8a] p-8 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black uppercase italic leading-none">
                            Control de Asistencia
                        </h2>
                        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mt-2 italic">
                            {clase.level} · {clase.dateFormatted} · {clase.timeRange}
                        </p>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    {listaAsistencia.map((alumno) => (
                        <div key={alumno.asistenciaId} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:border-blue-200">
                            <div>
                                <p className="font-black text-[#1e3a8a] uppercase text-sm tracking-tight leading-tight">
                                    {alumno.nombreCompleto}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                                    DNI: {alumno.dni}
                                    {alumno.fechaCorte && (
                                        <span className={`px-2 py-0.5 rounded-lg border font-black tracking-tighter ${alumno.vencido
                                            ? 'bg-red-50 text-red-600 border-red-100 animate-pulse'
                                            : alumno.esHoyCorte
                                                ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                            CORTE: {format(alumno.fechaCorte, "dd/MM", { locale: es })}
                                        </span>
                                    )}
                                </span>
                                <div className="flex gap-2">
                                    {alumno.esRecuperacion && (
                                        <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-blue-100 flex items-center gap-1 italic">
                                            <RefreshCw size={10} /> RECUPERACIÓN
                                        </span>
                                    )}
                                    {alumno.esReposicion && (
                                        <span className="bg-indigo-50 text-indigo-600 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-indigo-100 flex items-center gap-1 italic">
                                            <RefreshCw size={10} className="animate-spin-slow" /> REPOSICIÓN
                                        </span>
                                    )}
                                    {alumno.esLesion && (
                                        <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border border-orange-100 flex items-center gap-1 italic">
                                            <ShieldAlert size={10} /> JUSTIFICADO MÉD.
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleLocalUpdate(alumno.asistenciaId, 'PRESENTE')}
                                    disabled={alumno.esLesion}
                                    className={`p-3 rounded-2xl transition-all ${alumno.estado === 'PRESENTE'
                                        ? 'bg-green-500 text-white shadow-lg shadow-green-200' : alumno.esLesion
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100 hover:text-green-500'
                                        }`}
                                >
                                    <Check size={20} strokeWidth={3} />
                                </button>

                                <button
                                    onClick={() => handleLocalUpdate(alumno.asistenciaId, 'FALTA')}
                                    disabled={alumno.esLesion}
                                    className={`p-3 rounded-2xl transition-all ${alumno.estado === 'FALTA'
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-200' : alumno.esLesion
                                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                                            : 'bg-slate-50 text-slate-300 border border-slate-100 hover:text-red-500'
                                        }`}
                                >
                                    <UserMinus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 bg-white border-t border-slate-100">
                    <button
                        onClick={handleSaveAll}
                        disabled={isSaving || listaAsistencia.length === 0}
                        className="w-full bg-[#1e3a8a] hover:bg-orange-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none italic"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : "GUARDAR ASISTENCIA DEL GRUPO"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceModal;