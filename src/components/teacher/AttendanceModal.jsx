import React, { useState } from 'react';
import { 
  X, Check, UserMinus, Loader2, ShieldAlert, RefreshCw, Baby, 
  AlertTriangle, CheckCheck, UserCheck, HelpCircle, Calendar 
} from 'lucide-react';
import { asistenciaService } from '../../services/asistencia.service';
import toast from 'react-hot-toast';
import { format, addDays, isPast, isToday, differenceInYears, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const AttendanceModal = ({ clase, onClose, onRefresh }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [mostrarConfirmacionPendientes, setMostrarConfirmacionPendientes] = useState(false);

  // Inicialización de la lista de asistencia
  const [listaAsistencia, setListaAsistencia] = useState(
    clase.inscripcionesEnEstaFecha?.map(ins => {
      const fechaInscripcion = ins.fecha_inscripcion ? new Date(ins.fecha_inscripcion) : null;
      const fechaCorte = fechaInscripcion ? addDays(fechaInscripcion, 29) : null;
      const fNac = ins.alumnos?.usuarios?.fecha_nacimiento;

      return {
        asistenciaId: ins.registro_especifico?.id,
        alumnoId: ins.alumno_id,
        nombreCompleto: `${ins.alumnos?.usuarios?.nombres || ''} ${ins.alumnos?.usuarios?.apellidos || ''}`.trim() || 'Alumno',
        dni: ins.alumnos?.usuarios?.numero_documento || 'S/D',
        fechaNacimiento: fNac ? format(parseISO(fNac.slice(0, 10)), 'dd/MM/yyyy') : 'N/A',
        edad: fNac ? differenceInYears(new Date(), new Date(fNac)) : null,
        estado: ins.registro_especifico?.estado || 'PROGRAMADA',
        esRecuperacion: ins.tipo_sesion === 'RECUPERACION' || ins.estado === 'RECUPERACION',
        esReposicion: ins.tipo_sesion === 'REPOSICION' || ins.registro_especifico?.fecha_original != null,
        esLesion: ins.registro_especifico?.estado === 'JUSTIFICADO_LESION',
        fechaCorte,
        vencido: fechaCorte && isPast(fechaCorte) && !isToday(fechaCorte),
        esHoyCorte: fechaCorte && isToday(fechaCorte),
        esClaseUnica: ins.tipo_inscripcion === 'INDIVIDUAL'
      };
    }) || []
  );

  // Conteo de estados
  const totalAlumnos = listaAsistencia.length;
  const presentes = listaAsistencia.filter(a => a.estado === 'PRESENTE').length;
  const faltas = listaAsistencia.filter(a => a.estado === 'FALTA').length;
  const justificados = listaAsistencia.filter(a => a.esLesion || a.estado === 'JUSTIFICADO_LESION').length;
  const pendientes = listaAsistencia.filter(a => 
    !a.esLesion && a.estado !== 'PRESENTE' && a.estado !== 'FALTA' && a.estado !== 'JUSTIFICADO_LESION'
  ).length;

  const porcentajeRegistrado = totalAlumnos > 0 
    ? Math.round(((totalAlumnos - pendientes) / totalAlumnos) * 100) 
    : 100;

  // Actualizar estado local individual
  const handleLocalUpdate = (asistenciaId, nuevoEstado) => {
    setListaAsistencia(prev =>
      prev.map(item =>
        item.asistenciaId === asistenciaId ? { ...item, estado: nuevoEstado } : item
      )
    );
  };

  // Marcar todos los disponibles como PRESENTE
  const handleMarcarTodosPresentes = () => {
    setListaAsistencia(prev =>
      prev.map(item => {
        if (item.esLesion) return item;
        return { ...item, estado: 'PRESENTE' };
      })
    );
    toast.success('Todos marcados como Presente', { icon: '✅' });
  };

  // Marcar todos los pendientes como FALTA
  const handleMarcarPendientesComoFalta = () => {
    setListaAsistencia(prev =>
      prev.map(item => {
        if (item.esLesion || item.estado === 'PRESENTE') return item;
        return { ...item, estado: 'FALTA' };
      })
    );
    setMostrarConfirmacionPendientes(false);
    toast.success('Pendientes marcados como Falta', { icon: '⚠️' });
  };

  // Guardar en Backend
  const ejecutarGuardado = async (listaAGuardar = listaAsistencia) => {
    if (listaAGuardar.length === 0) return;

    const payload = listaAGuardar.map(item => ({
      id: item.asistenciaId,
      estado: item.estado,
      comentario: ''
    }));

    try {
      setIsSaving(true);
      await asistenciaService.marcarAsistenciaMasiva(payload);
      toast.success('¡Asistencia guardada exitosamente!', { duration: 3000 });
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error en handleSaveAll:', error);
      toast.error('Error al guardar asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  // Verificación antes de guardar
  const handlePreSave = () => {
    if (pendientes > 0) {
      setMostrarConfirmacionPendientes(true);
    } else {
      ejecutarGuardado();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-brand-surface w-full max-w-2xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-brand-primary via-[#1e3a8a] to-brand-primary-dark p-6 sm:p-7 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-brand-accent text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider">
                {clase.level || 'CLASE'}
              </span>
              {clase.court && (
                <span className="bg-white/10 text-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {clase.court}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none pt-1">
              Control de Asistencia
            </h2>
            <p className="text-blue-200/80 text-xs font-semibold flex items-center gap-2 pt-0.5">
              <Calendar size={13} className="text-brand-accent" />
              <span>{clase.dateFormatted}</span>
              <span>•</span>
              <span>{clase.timeRange} HRS</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95 shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* BARRA DE ESTADO / ALERTAS DE PENDIENTES */}
        <div className="bg-slate-50 border-b border-brand-border-soft px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Métricas rápidas */}
          <div className="flex items-center gap-2.5 text-xs font-black uppercase">
            <span className="text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Check size={13} strokeWidth={3} /> {presentes} Presentes
            </span>
            <span className="text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <UserMinus size={13} strokeWidth={3} /> {faltas} Faltas
            </span>
            {pendientes > 0 ? (
              <span className="text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-xl flex items-center gap-1 animate-pulse">
                <AlertTriangle size={13} strokeWidth={2.5} /> {pendientes} Pendientes
              </span>
            ) : (
              <span className="text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <CheckCheck size={13} strokeWidth={2.5} /> 100% Completo
              </span>
            )}
          </div>

          {/* Botón rápido para marcar todos */}
          {totalAlumnos > 0 && (
            <button
              onClick={handleMarcarTodosPresentes}
              className="text-[11px] font-black uppercase text-brand-primary hover:text-brand-accent flex items-center gap-1.5 self-start sm:self-auto transition-colors bg-white hover:bg-orange-50 border border-brand-border-soft px-3 py-1.5 rounded-xl shadow-xs"
            >
              <CheckCheck size={14} className="text-brand-accent" />
              <span>Marcar Todos Presentes</span>
            </button>
          )}
        </div>

        {/* ALERTA VISUAL DESTACADA SI HAY ALUMNOS SIN MARCAR */}
        {pendientes > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2.5 text-amber-900 text-xs font-bold animate-fade-in">
            <AlertTriangle size={16} className="text-brand-accent shrink-0" />
            <p className="leading-tight">
              <strong className="font-black text-brand-accent-dark">¡Atención!</strong> Quedan{' '}
              <span className="underline decoration-brand-accent font-black">{pendientes} alumno(s)</span> sin registrar asistencia o falta.
            </p>
          </div>
        )}

        {/* LISTA DE ALUMNOS (Scroll) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-brand-surface-alt/40">
          {listaAsistencia.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-bold text-xs">
              No hay alumnos inscritos para esta sesión
            </div>
          ) : (
            listaAsistencia.map(alumno => {
              const estaPendiente = !alumno.esLesion && alumno.estado !== 'PRESENTE' && alumno.estado !== 'FALTA';

              return (
                <div
                  key={alumno.asistenciaId}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                    estaPendiente
                      ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/40'
                      : alumno.estado === 'PRESENTE'
                      ? 'bg-white border-emerald-200 hover:border-emerald-300'
                      : alumno.estado === 'FALTA'
                      ? 'bg-white border-rose-200 hover:border-rose-300'
                      : 'bg-white border-brand-border-soft'
                  }`}
                >
                  {/* Info Alumno */}
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-brand-primary uppercase text-sm sm:text-base tracking-tight leading-tight">
                        {alumno.nombreCompleto}
                      </p>
                      {alumno.esLesion && (
                        <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-rose-200 uppercase">
                          Justificado Médico
                        </span>
                      )}
                      {alumno.esRecuperacion && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-blue-200 uppercase flex items-center gap-1">
                          <RefreshCw size={10} /> Recuperación
                        </span>
                      )}
                      {alumno.esReposicion && (
                        <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-md border border-purple-200 uppercase">
                          Reposición
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-slate-500">
                      <span>DNI: <strong className="text-slate-700">{alumno.dni}</strong></span>

                      {alumno.fechaNacimiento !== 'N/A' && (
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          <Baby size={11} /> {alumno.fechaNacimiento} {alumno.edad ? `(${alumno.edad} años)` : ''}
                        </span>
                      )}

                      {alumno.esClaseUnica ? (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-black">
                          INDIVIDUAL
                        </span>
                      ) : alumno.fechaCorte ? (
                        <span
                          className={`px-2 py-0.5 rounded font-black ${
                            alumno.vencido
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : alumno.esHoyCorte
                              ? 'bg-orange-50 text-orange-700 border border-orange-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          Corte: {format(alumno.fechaCorte, 'dd/MM', { locale: es })}
                        </span>
                      ) : null}

                      {estaPendiente && (
                        <span className="text-amber-700 bg-amber-100/90 font-black px-2 py-0.5 rounded flex items-center gap-1">
                          <AlertTriangle size={10} /> Sin marcar
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de Marcación */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLocalUpdate(alumno.asistenciaId, 'PRESENTE')}
                      disabled={alumno.esLesion}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 ${
                        alumno.estado === 'PRESENTE'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500'
                          : alumno.esLesion
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                      }`}
                      title="Marcar Presente"
                    >
                      <Check size={16} strokeWidth={3} />
                      <span className="hidden sm:inline">Presente</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleLocalUpdate(alumno.asistenciaId, 'FALTA')}
                      disabled={alumno.esLesion}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 ${
                        alumno.estado === 'FALTA'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500'
                          : alumno.esLesion
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700 border border-slate-200'
                      }`}
                      title="Marcar Falta"
                    >
                      <UserMinus size={16} strokeWidth={3} />
                      <span className="hidden sm:inline">Falta</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL DE CONFIRMACIÓN SI HAY ALUMNOS PENDIENTES */}
        {mostrarConfirmacionPendientes && (
          <div className="p-5 bg-amber-50 border-t-2 border-amber-300 space-y-3 animate-fade-in">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-brand-accent shrink-0 mt-0.5" size={22} />
              <div>
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  ¿Guardar con {pendientes} alumno(s) sin registrar?
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Para mantener el récord deportivo impecable, cada integrante debe tener asistencia o falta confirmada.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleMarcarPendientesComoFalta}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
              >
                <UserMinus size={14} /> Marcar pendientes como Falta y guardar
              </button>

              <button
                type="button"
                onClick={() => {
                  setMostrarConfirmacionPendientes(false);
                  ejecutarGuardado();
                }}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase transition-all"
              >
                Guardar de todos modos
              </button>

              <button
                type="button"
                onClick={() => setMostrarConfirmacionPendientes(false)}
                className="bg-white border border-slate-300 text-slate-700 py-2.5 px-3 rounded-xl font-bold text-[11px] uppercase transition-all"
              >
                Seguir editando
              </button>
            </div>
          </div>
        )}

        {/* FOOTER BOTÓN GUARDAR */}
        {!mostrarConfirmacionPendientes && (
          <div className="p-4 sm:p-5 bg-white border-t border-brand-border-soft flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-semibold w-full sm:w-auto text-center sm:text-left">
              Progreso: <strong className="text-brand-primary">{totalAlumnos - pendientes}/{totalAlumnos}</strong> integrantes listos ({porcentajeRegistrado}%)
            </div>

            <button
              type="button"
              onClick={handlePreSave}
              disabled={isSaving || listaAsistencia.length === 0}
              className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-accent text-white rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2.5 disabled:bg-slate-300 disabled:shadow-none italic active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCheck size={18} />
                  <span>Guardar Asistencia del Grupo</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AttendanceModal;