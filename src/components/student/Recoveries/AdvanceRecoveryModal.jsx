import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CalendarPlus,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Sparkles,
  Filter,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import recuperacionService from '../../../services/recuperacion.service';
import horarioService from '../../../services/horario.service';
import { calcularSlotsDisponibles } from '../../../pages/student/recoveries/slotFiltering';

const DIAS_SEMANA = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
const MESES_CORTOS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

const parseFechaLocal = (fechaStr) => {
  const [y, m, d] = String(fechaStr).slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatFechaLegible = (fechaStr) => {
  if (!fechaStr) return '';
  const d = parseFechaLocal(fechaStr);
  return `${DIAS_SEMANA[d.getDay()]} ${String(d.getDate()).padStart(2, '0')} ${MESES_CORTOS[d.getMonth()]}`;
};

const AdvanceRecoveryModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [clases, setClases] = useState([]);
  const [stats, setStats] = useState({
    limite_permitido: 0,
    recuperacion_usadas: 0,
    disponibles: 0,
    bloqueado_por_deuda: false,
    fecha_fin_ciclo: null,
  });
  const [horariosPatron, setHorariosPatron] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [fechasRegulares, setFechasRegulares] = useState([]);

  const [selectedClase, setSelectedClase] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filtroSede, setFiltroSede] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [anticipadasRes, pendientesRes, horariosRes, historialRes] = await Promise.all([
        recuperacionService.obtenerClasesAnticipables().catch(() => ({ clases: [], stats: {} })),
        recuperacionService.obtenerPendientes().catch(() => ({ stats: {} })),
        horarioService.obtenerDisponiblesPorNivel().catch(() => []),
        recuperacionService.obtenerHistorial().catch(() => []),
      ]);

      setClases(anticipadasRes?.clases || []);
      if (anticipadasRes?.stats) {
        setStats(anticipadasRes.stats);
      }
      setFechasRegulares(pendientesRes?.stats?.fechas_clases_regulares || []);
      setHorariosPatron(horariosRes || []);
      setHistorial(historialRes || []);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar tus próximas clases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedClase(null);
      setSelectedSlot(null);
      setFiltroSede('');
      cargarDatos();
    }
  }, [isOpen]);

  // Al seleccionar una clase, el filtro por defecto es AUTOMÁTICAMENTE la sede de esa clase
  useEffect(() => {
    if (selectedClase?.sede) {
      setFiltroSede(selectedClase.sede);
      setSelectedSlot(null);
    }
  }, [selectedClase]);

  const availableSlots = useMemo(() => {
    if (!selectedClase || horariosPatron.length === 0) return [];
    return calcularSlotsDisponibles(
      horariosPatron,
      historial,
      { fechas_clases_regulares: fechasRegulares },
      stats.fecha_fin_ciclo
    );
  }, [selectedClase, horariosPatron, historial, fechasRegulares, stats.fecha_fin_ciclo]);

  const sedesUnicas = useMemo(
    () =>
      [...new Set(availableSlots.map((s) => s.horarioData?.cancha?.sede?.nombre).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b)
      ),
    [availableSlots]
  );

  const slotsFiltrados = useMemo(
    () =>
      availableSlots.filter((s) => {
        if (!filtroSede) return true;
        return s.horarioData?.cancha?.sede?.nombre === filtroSede;
      }),
    [availableSlots, filtroSede]
  );

  if (!isOpen) return null;

  const handleConfirmar = async () => {
    if (!selectedClase) return;
    if (!selectedSlot) {
      toast.error('Selecciona el horario donde deseas programar tu recuperación');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        registroId: selectedClase.registro_id,
        horarioDestinoId: selectedSlot.horarioData.id,
        // fix de zona horaria - Fecha plana YYYY-MM-DD sin distorsión por huso horario del navegador
        fechaProgramada: String(selectedSlot.fecha).slice(0, 10),
      };

      await recuperacionService.marcarFaltaAnticipada(payload);

      toast.success('¡Falta avisada y recuperación agendada exitosamente! 🎉');

      setSelectedClase(null);
      setSelectedSlot(null);
      await cargarDatos();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'No se pudo procesar la recuperación');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelarAviso = async (registroId) => {
    try {
      setSubmitting(true);
      await recuperacionService.cancelarFaltaAnticipada(registroId);
      toast.success('Aviso cancelado. Tu clase regular sigue activa.');
      if (selectedClase?.registro_id === registroId) {
        setSelectedClase(null);
        setSelectedSlot(null);
      }
      await cargarDatos();
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'No se pudo cancelar el aviso');
    } finally {
      setSubmitting(false);
    }
  };

  const sinCupo = stats.disponibles <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-brand-surface w-full max-w-3xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary-dark p-6 sm:p-7 text-white flex justify-between items-start">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-brand-accent text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
              <Sparkles size={12} />
              <span>Agenda Anticipada</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none pt-1">
              ¿No podrás asistir a alguna de tus clases?
            </h2>
            <p className="text-brand-primary-soft/90 text-xs font-semibold">
              Agenda anticipadamente tu recuperación dentro de tu ciclo activo y avisa al coordinador con tiempo.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all active:scale-95 shrink-0"
            aria-label="Cerrar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* BARRA DE CUPOS DEL PAQUETE */}
        <div className="bg-brand-bg border-b border-brand-border-soft px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-black uppercase">
            <span
              className={`px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                sinCupo
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-brand-primary-soft text-brand-primary'
              }`}
            >
              <Ticket size={14} />
              Cupo de tu paquete: {stats.recuperacion_usadas} / {stats.limite_permitido} usadas ({stats.disponibles}{' '}
              disponible{stats.disponibles === 1 ? '' : 's'})
            </span>

            {stats.fecha_fin_ciclo && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl flex items-center gap-1.5 text-[11px]">
                <Clock size={13} />
                Límite de tu ciclo: {formatFechaLegible(stats.fecha_fin_ciclo)}
              </span>
            )}
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 size={36} className="animate-spin text-brand-accent" />
              <p className="text-xs font-black uppercase tracking-widest text-brand-muted italic">
                Cargando información...
              </p>
            </div>
          ) : (
            <>
              {stats.bloqueado_por_deuda && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex items-center gap-3 text-amber-900 text-xs font-bold">
                  <AlertTriangle size={20} className="text-amber-600 shrink-0" />
                  <span>
                    Tienes un pago parcial pendiente. Completa el pago total de tu paquete para habilitar las
                    recuperaciones.
                  </span>
                </div>
              )}

              {/* PASO 1: SELECCIONAR CLASE */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] flex items-center justify-center">
                    1
                  </span>
                  Elige la clase a la que faltarás
                </h3>

                {clases.length === 0 ? (
                  <div className="p-8 rounded-3xl border border-dashed border-slate-300 text-center text-brand-muted text-xs font-bold bg-brand-bg">
                    No tienes clases regulares programadas en este momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clases.map((clase) => {
                      const d = parseFechaLocal(clase.fecha);
                      const isSelected = selectedClase?.registro_id === clase.registro_id;
                      const habilitada =
                        clase.puede_avisar && !sinCupo && !stats.bloqueado_por_deuda && !submitting;

                      return (
                        <div
                          key={clase.registro_id}
                          onClick={() => {
                            if (habilitada) {
                              setSelectedClase(isSelected ? null : clase);
                              setSelectedSlot(null);
                            }
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                            clase.falta_anticipada
                              ? 'bg-amber-50/70 border-amber-300'
                              : isSelected
                              ? 'bg-brand-accent-soft border-brand-accent shadow-md cursor-pointer'
                              : habilitada
                              ? 'bg-white border-brand-border-soft hover:border-brand-accent cursor-pointer'
                              : 'bg-slate-50 border-slate-200 opacity-65 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black text-white shrink-0 ${
                                  clase.falta_anticipada
                                    ? 'bg-amber-600'
                                    : isSelected
                                    ? 'bg-brand-accent-dark'
                                    : 'bg-brand-primary'
                                }`}
                              >
                                <span className="text-[9px] uppercase leading-none opacity-80">
                                  {DIAS_SEMANA[d.getDay()]}
                                </span>
                                <span className="text-lg leading-none italic">{String(d.getDate()).padStart(2, '0')}</span>
                                <span className="text-[8px] uppercase leading-none">{MESES_CORTOS[d.getMonth()]}</span>
                              </div>

                              <div>
                                <p className="text-xs font-black text-brand-primary uppercase italic">
                                  {clase.hora_inicio} - {clase.hora_fin}
                                </p>
                                <p className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1 mt-0.5">
                                  <MapPin size={11} className="text-brand-accent shrink-0" />
                                  {clase.sede} {clase.cancha ? `• ${clase.cancha}` : ''}
                                </p>
                                {clase.nivel && (
                                  <p className="text-[9px] font-black text-brand-muted uppercase mt-0.5">
                                    Nivel: {clase.nivel}
                                  </p>
                                )}
                              </div>
                            </div>

                            {clase.falta_anticipada ? (
                              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                                Falta Avisada
                              </span>
                            ) : isSelected ? (
                              <span className="bg-brand-accent text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0">
                                Seleccionada
                              </span>
                            ) : !clase.a_tiempo ? (
                              <span className="bg-slate-200 text-slate-600 text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
                                &lt; 1h
                              </span>
                            ) : null}
                          </div>

                          {clase.falta_anticipada && (
                            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-amber-900">
                                {clase.recuperacion?.estado === 'PROGRAMADA' && clase.recuperacion?.fecha_programada
                                  ? `Recuperas el ${formatFechaLegible(clase.recuperacion.fecha_programada)} (${
                                      clase.recuperacion.hora_inicio || ''
                                    })`
                                  : 'Ticket de recuperación registrado'}
                              </span>

                              {clase.puede_cancelar && (
                                <button
                                  type="button"
                                  disabled={submitting}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelarAviso(clase.registro_id);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-black uppercase transition-all"
                                >
                                  <RotateCcw size={11} />
                                  Cancelar aviso
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* PASO 2: AGENDAR DIRECTAMENTE LA RECUPERACIÓN */}
              {selectedClase && (
                <div className="space-y-4 pt-4 border-t-2 border-brand-border-soft animate-in fade-in duration-300">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[10px] flex items-center justify-center">
                        2
                      </span>
                      Selecciona cuándo recuperarás tu clase
                    </h3>

                    {/* Selector de Sede: por defecto en la sede de su clase */}
                    <div className="flex items-center gap-1.5 bg-brand-bg px-3 py-1.5 rounded-xl border border-brand-border">
                      <Filter size={12} className="text-brand-muted" />
                      <select
                        value={filtroSede}
                        onChange={(e) => setFiltroSede(e.target.value)}
                        className="bg-transparent border-none text-brand-primary text-[10px] font-black uppercase outline-none cursor-pointer"
                      >
                        {selectedClase.sede && (
                          <option value={selectedClase.sede}>
                            MI SEDE ({selectedClase.sede.toUpperCase()})
                          </option>
                        )}
                        <option value="">TODAS LAS SEDES (EXPLORAR OTRAS)</option>
                        {sedesUnicas
                          .filter((s) => s !== selectedClase.sede)
                          .map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {filtroSede && filtroSede === selectedClase.sede && (
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <MapPin size={12} className="text-brand-accent shrink-0" />
                      <span>
                        Mostrando horarios de tu sede <strong>{selectedClase.sede}</strong>. Puedes cambiar a &quot;Todas las sedes&quot; si deseas recuperar en otra sede.
                      </span>
                    </div>
                  )}

                  {slotsFiltrados.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-brand-muted text-xs font-bold bg-brand-bg">
                      No hay turnos disponibles para esta sede antes de tu fecha límite ({formatFechaLegible(stats.fecha_fin_ciclo)}). Prueba seleccionando otra sede en el filtro.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                      {slotsFiltrados.map((slot) => {
                        const h = slot.horarioData;
                        const fObj = new Date(slot.fecha);
                        const isSlotSelected = selectedSlot?.id === slot.id;
                        const hInicio = h.hora_inicio?.slice(0, 5);
                        const hFin = h.hora_fin?.slice(0, 5);
                        const sedeSlot = h.cancha?.sede?.nombre || h.canchas?.sedes?.nombre;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3 rounded-2xl border-2 text-left transition-all ${
                              isSlotSelected
                                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                : 'bg-white border-brand-border-soft hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-brand-primary uppercase italic">
                                {DIAS_SEMANA[fObj.getDay()]} {String(fObj.getDate()).padStart(2, '0')}{' '}
                                {MESES_CORTOS[fObj.getMonth()]}
                              </span>
                              {isSlotSelected && <CheckCircle2 size={15} className="text-emerald-600" />}
                            </div>
                            <p className="text-[11px] font-black text-brand-accent-dark mt-1">
                              {hInicio} {hFin ? `- ${hFin}` : ''}
                            </p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase truncate mt-0.5">
                              {sedeSlot} • {h.cancha?.nombre || h.canchas?.nombre}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 bg-white border-t border-brand-border-soft flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl font-black uppercase text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
          >
            Cerrar
          </button>

          {selectedClase && (
            <button
              type="button"
              onClick={handleConfirmar}
              disabled={submitting || !selectedSlot}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black uppercase italic tracking-wider text-xs bg-brand-accent hover:bg-brand-accent-dark text-white shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <CalendarPlus size={16} />
                  <span>Confirmar Falta y Agendar Recuperación</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvanceRecoveryModal;
