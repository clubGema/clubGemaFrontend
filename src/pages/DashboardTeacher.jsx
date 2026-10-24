import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Clock, MapPin, CheckCircle, Calendar as CalendarIcon, 
  Loader2, ChevronRight, ChevronLeft, AlertTriangle, CheckCheck, 
  RefreshCw, ShieldAlert, CalendarDays, ListFilter, Sparkles, AlertCircle 
} from 'lucide-react';
import AttendanceModal from '../components/teacher/AttendanceModal';
import { useAuth } from '../context/AuthContext';
import { asistenciaService } from '../services/asistencia.service';
import toast from 'react-hot-toast';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, isToday, addMonths, subMonths, getDay, 
  parseISO, isPast, isFuture, startOfToday 
} from 'date-fns';
import { es } from 'date-fns/locale';

const DashboardTeacher = () => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fecha seleccionada en el calendario (por defecto hoy en hora local)
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [currentMonth, setCurrentMonth] = useState(startOfToday());
  const [vistaModo, setVistaModo] = useState('dia'); // 'dia' | 'todas'

  const { user } = useAuth();
  const coordinatorFullName = user?.user 
    ? `${user.user.nombres} ${user.user.apellidos}` 
    : user?.nombres 
    ? `${user.nombres} ${user.apellidos}` 
    : 'Coordinador Gema';

  // 1. Cargar agenda desde el backend
  const fetchAgenda = useCallback(async () => {
    try {
      setLoading(true);
      const data = await asistenciaService.getAgenda();
      const todasLasSesiones = [];
      const hoyLimaStr = new Date(Date.now() - (5 * 60 * 60 * 1000)).toISOString().split('T')[0];

      const fechasUnicas = {};

      (data || []).forEach(horario => {
        const baseTimeRange = `${horario.hora_inicio || ''} - ${horario.hora_fin || ''}`;

        (horario.inscripciones || []).forEach(ins => {
          (ins.registros_asistencia || []).forEach(reg => {
            if (!reg.fecha) return;
            const fechaKey = reg.fecha.split('T')[0];

            let timeRange = baseTimeRange;
            let reprogramacionData = null;

            if (reg.reprogramaciones_clases) {
              timeRange = `${reg.reprogramaciones_clases.hora_inicio_destino || ''} - ${reg.reprogramaciones_clases.hora_fin_destino || ''}`;
              reprogramacionData = reg.reprogramaciones_clases;
            }

            const globalKey = `${fechaKey}-${timeRange}-${horario.id}`;

            if (!fechasUnicas[globalKey]) {
              const fechaDate = new Date(reg.fecha);
              fechasUnicas[globalKey] = {
                id: globalKey,
                horarioId: horario.id,
                title: horario.niveles_entrenamiento?.nombre || 'BÁSICO',
                timeRange,
                reprogramacionData,
                court: horario.canchas?.nombre || 'Cancha Principal',
                sede: horario.canchas?.sedes?.nombre || 'Sede Gema',
                level: horario.niveles_entrenamiento?.nombre || 'Nivel Regular',
                fechaKey,
                fechaReal: reg.fecha,
                fechaObj: fechaDate,
                isToday: fechaKey === hoyLimaStr,
                isPast: fechaKey < hoyLimaStr,
                isFuture: fechaKey > hoyLimaStr,
                dateFormatted: format(new Date(`${fechaKey}T12:00:00`), "EEEE dd 'de' MMMM", { locale: es }).toUpperCase(),
                dateShort: format(new Date(`${fechaKey}T12:00:00`), 'dd MMM', { locale: es }).toUpperCase(),
                inscripcionesEnEstaFecha: []
              };
            }
            fechasUnicas[globalKey].inscripcionesEnEstaFecha.push({ 
              ...ins, 
              registro_especifico: reg 
            });
          });
        });
      });

      // Procesar estados y métricas por cada sesión
      Object.values(fechasUnicas).forEach(sesion => {
        const inscripciones = Array.from(
          new Map(sesion.inscripcionesEnEstaFecha.map(i => [i.alumno_id, i])).values()
        );

        const esReprogramadaTotal = inscripciones.length > 0 && inscripciones.every(al => al.tipo_sesion === 'REPROGRAMADO');
        const esReposicionTotal = inscripciones.length > 0 && inscripciones.every(al => al.tipo_sesion === 'REPOSICION');
        const tieneRecuperadores = inscripciones.some(al => al.tipo_sesion === 'RECUPERACION');

        // Contar presentes, faltas y pendientes de registrar
        const presentesCount = inscripciones.filter(al => al.registro_especifico?.estado === 'PRESENTE').length;
        const faltasCount = inscripciones.filter(al => al.registro_especifico?.estado === 'FALTA').length;
        const justificadosCount = inscripciones.filter(al => al.registro_especifico?.estado === 'JUSTIFICADO_LESION').length;
        const pendientesCount = inscripciones.filter(al => {
          const est = al.registro_especifico?.estado;
          return est === 'PROGRAMADA' || est === 'PENDIENTE' || !est;
        }).length;

        const completada = inscripciones.length > 0 && pendientesCount === 0;

        todasLasSesiones.push({
          ...sesion,
          inscripcionesEnEstaFecha: inscripciones,
          totalStudents: inscripciones.length,
          presentesCount,
          faltasCount,
          justificadosCount,
          pendientesCount,
          attended: completada && !esReprogramadaTotal,
          // Requiere atención urgente si la clase es de hoy o del pasado y todavía tiene alumnos sin marcar
          requiereAtencion: (sesion.isToday || sesion.isPast) && pendientesCount > 0 && !esReprogramadaTotal,
          isReprogramada: esReprogramadaTotal,
          isReposicion: esReposicionTotal,
          tieneRecuperadores
        });
      });

      todasLasSesiones.sort((a, b) => new Date(a.fechaReal) - new Date(b.fechaReal));
      setClases(todasLasSesiones);

    } catch (error) {
      console.error('DashboardTeacher error:', error);
      toast.error('Error al cargar la agenda de entrenamientos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  // Días del mes actual para la cuadrícula del calendario
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  // Mapa de fechas que tienen clases: 'YYYY-MM-DD' => sesiones[]
  const sesionesPorFechaMap = useMemo(() => {
    const map = new Map();
    clases.forEach(clase => {
      const key = clase.fechaKey;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(clase);
    });
    return map;
  }, [clases]);

  // Sesiones del día seleccionado
  const selectedDateKey = useMemo(() => format(selectedDate, 'yyyy-MM-dd'), [selectedDate]);
  const sesionesDelDia = useMemo(() => {
    return sesionesPorFechaMap.get(selectedDateKey) || [];
  }, [sesionesPorFechaMap, selectedDateKey]);

  // Clases que requieren atención urgente en todo el sistema (Hoy o Pasadas con pendientes)
  const clasesPendientesCierre = useMemo(() => {
    return clases.filter(c => c.requiereAtencion);
  }, [clases]);

  // Total de alumnos sin marcar en sesiones pendientes
  const totalAlumnosSinMarcar = useMemo(() => {
    return clasesPendientesCierre.reduce((acc, c) => acc + c.pendientesCount, 0);
  }, [clasesPendientesCierre]);

  // Sesiones de hoy
  const hoyKey = useMemo(() => format(startOfToday(), 'yyyy-MM-dd'), []);
  const sesionesHoy = useMemo(() => {
    return sesionesPorFechaMap.get(hoyKey) || [];
  }, [sesionesPorFechaMap, hoyKey]);

  // Navegación del calendario
  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleIrAHoy = () => {
    const hoy = startOfToday();
    setCurrentMonth(hoy);
    setSelectedDate(hoy);
  };

  // Ir a una clase con pendientes
  const handleIrAClasePendiente = (clase) => {
    const fecha = parseISO(clase.fechaKey);
    setCurrentMonth(fecha);
    setSelectedDate(fecha);
    setVistaModo('dia');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-brand-primary" size={48} />
        <p className="font-black text-brand-primary uppercase italic text-xs tracking-widest text-center">
          Sincronizando agenda del coordinador...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-12 px-2 sm:px-4">

      {/* HEADER DE BIENVENIDA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-gradient-to-r from-brand-primary via-[#1e3a8a] to-brand-primary-dark p-6 sm:p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-2 bg-brand-accent text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-widest shadow-xs">
            <Sparkles size={12} /> Portal del Coordinador
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight italic leading-none text-white">
            Hola, <span className="text-orange-400">{coordinatorFullName}</span> 👋
          </h1>
          <p className="text-blue-100/70 text-xs sm:text-sm font-medium">
            Gestiona tus entrenamientos, verifica la asistencia diaria y supervisa los integrantes de cada clase.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-wider text-blue-100">
          <CalendarIcon size={18} className="text-brand-accent" />
          <span>{format(startOfToday(), "EEEE dd 'de' MMMM", { locale: es })}</span>
        </div>
      </div>

      {/* BANNER DE ALERTA: INTEGRANTES SIN ASISTENCIA / FALTA */}
      {clasesPendientesCierre.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-rose-500/10 border-2 border-brand-accent/40 rounded-3xl p-5 sm:p-6 shadow-lg shadow-orange-900/5 relative overflow-hidden animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-brand-accent text-white rounded-2xl shadow-md shadow-brand-accent/30 shrink-0 mt-0.5">
                <AlertTriangle size={24} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <span>¡Alerta de Asistencias Pendientes!</span>
                  <span className="bg-brand-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {totalAlumnosSinMarcar} alumnos
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                  Tienes <strong className="text-brand-accent-dark font-black">{clasesPendientesCierre.length} sesión(es)</strong> con alumnos en estado pendiente. Registra si asistieron o faltaron para cerrar el reporte oficial.
                </p>
              </div>
            </div>

            {/* Acciones rápidas para resolver pendientes */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto self-end sm:self-center">
              {clasesPendientesCierre.slice(0, 2).map((c, idx) => (
                <button
                  key={c.id || idx}
                  onClick={() => handleIrAClasePendiente(c)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-brand-primary hover:bg-brand-accent text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{c.dateShort} ({c.timeRange.split(' - ')[0]})</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MÉTRICAS RÁPIDAS DEL COORDINADOR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sesiones hoy */}
        <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CalendarIcon size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesiones Hoy</p>
            <p className="text-xl sm:text-2xl font-black text-brand-primary tracking-tight">
              {sesionesHoy.length}
            </p>
          </div>
        </div>

        {/* Atletas programados hoy */}
        <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atletas Hoy</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {sesionesHoy.reduce((acc, s) => acc + s.totalStudents, 0)}
            </p>
          </div>
        </div>

        {/* Sesiones con asistencia cerrada */}
        <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3 sm:gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <CheckCheck size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cerradas al 100%</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight">
              {clases.filter(c => c.attended).length}
            </p>
          </div>
        </div>

        {/* Sin marcar (Alertas) */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs flex items-center gap-3 sm:gap-4 ${
          totalAlumnosSinMarcar > 0 
            ? 'bg-amber-50/80 border-amber-200' 
            : 'bg-brand-surface border-brand-border'
        }`}>
          <div className={`p-3 rounded-xl ${
            totalAlumnosSinMarcar > 0 
              ? 'bg-amber-500 text-white shadow-xs' 
              : 'bg-slate-100 text-slate-400'
          }`}>
            <AlertCircle size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sin Marcar</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight ${
              totalAlumnosSinMarcar > 0 ? 'text-amber-700' : 'text-slate-600'
            }`}>
              {totalAlumnosSinMarcar}
            </p>
          </div>
        </div>
      </div>

      {/* SELECTOR DE MODO: VISTA CALENDARIO / DÍA vs LISTA COMPLETA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border-soft pb-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-7 bg-brand-accent rounded-full"></div>
          <h2 className="text-lg sm:text-xl font-black text-brand-primary uppercase italic tracking-tight">
            Distribución de la Agenda
          </h2>
        </div>

        <div className="inline-flex bg-brand-surface p-1 rounded-2xl border border-brand-border shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setVistaModo('dia')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              vistaModo === 'dia'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-brand-primary hover:bg-slate-50'
            }`}
          >
            <CalendarDays size={15} />
            <span>Vista Calendario / Día</span>
          </button>
          <button
            onClick={() => setVistaModo('todas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              vistaModo === 'todas'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-brand-primary hover:bg-slate-50'
            }`}
          >
            <ListFilter size={15} />
            <span>Ver Toda la Temporada</span>
          </button>
        </div>
      </div>

      {/* MODO A: CALENDARIO INTERACTIVO + RESUMEN DEL DÍA */}
      {vistaModo === 'dia' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* CALENDARIO INTERACTIVO (Lado Izquierdo) */}
          <div className="lg:col-span-5 bg-brand-surface rounded-[2rem] p-5 sm:p-6 border border-brand-border shadow-lg space-y-5">
            {/* Cabecera del Mes + Navegación */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-black uppercase text-brand-primary tracking-tight">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Toca un día para ver su resumen
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleIrAHoy}
                  className="text-[10px] font-black uppercase text-brand-accent hover:text-brand-accent-dark px-2.5 py-1.5 rounded-lg border border-brand-accent/20 hover:bg-orange-50 transition-colors"
                >
                  Hoy
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                  aria-label="Mes anterior"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                  aria-label="Mes siguiente"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase tracking-wider pb-1">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Matriz de días del mes */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {/* Espacios vacíos al inicio del mes */}
              {Array.from({ length: (getDay(startOfMonth(currentMonth)) + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl" />
              ))}

              {/* Días del mes */}
              {calendarDays.map(day => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const sesionesDelEsteDia = sesionesPorFechaMap.get(dayKey) || [];
                const tieneClases = sesionesDelEsteDia.length > 0;
                const estaSeleccionado = isSameDay(day, selectedDate);
                const esHoy = isToday(day);

                // Estado de las clases en este día
                const tienePendientes = sesionesDelEsteDia.some(s => s.requiereAtencion);
                const todasCerradas = tieneClases && sesionesDelEsteDia.every(s => s.attended);

                return (
                  <button
                    key={dayKey}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`h-11 sm:h-13 rounded-2xl flex flex-col items-center justify-center p-1 relative transition-all active:scale-95 ${
                      estaSeleccionado
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/30 ring-2 ring-brand-accent'
                        : esHoy
                        ? 'bg-orange-50 text-brand-accent-dark font-black border-2 border-brand-accent/50'
                        : tieneClases
                        ? 'bg-slate-50 hover:bg-blue-50/70 text-slate-800 font-bold border border-slate-200/80'
                        : 'text-slate-400 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="text-xs sm:text-sm leading-none font-bold">
                      {format(day, 'd')}
                    </span>

                    {/* Indicador de clases */}
                    {tieneClases && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {tienePendientes ? (
                          <span className="w-2 h-2 rounded-full bg-brand-accent shadow-xs animate-pulse" title="Asistencia pendiente" />
                        ) : todasCerradas ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Asistencia completa" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${estaSeleccionado ? 'bg-orange-300' : 'bg-blue-600'}`} />
                        )}
                        <span className={`text-[8px] font-black leading-none ${estaSeleccionado ? 'text-white/80' : 'text-slate-500'}`}>
                          {sesionesDelEsteDia.length}
                        </span>
                      </div>
                    )}

                    {esHoy && !estaSeleccionado && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brand-accent rounded-full border-2 border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Leyenda del Calendario */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Cerrada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-accent" /> Pendiente
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" /> Programada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-brand-accent bg-orange-100" /> Hoy
              </span>
            </div>
          </div>

          {/* RESUMEN DEL DÍA SELECCIONADO (Lado Derecho) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Título de la fecha seleccionada */}
            <div className="bg-brand-surface p-5 sm:p-6 rounded-[2rem] border border-brand-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase text-brand-accent tracking-widest">
                  Resumen de la Jornada
                </span>
                <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-brand-primary">
                  {format(selectedDate, "EEEE dd 'de' MMMM", { locale: es })}
                </h3>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="bg-blue-50 text-brand-primary text-xs font-black px-3.5 py-1.5 rounded-xl border border-blue-100">
                  {sesionesDelDia.length} {sesionesDelDia.length === 1 ? 'Sesión' : 'Sesiones'}
                </span>
                {isToday(selectedDate) && (
                  <span className="bg-brand-accent text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl">
                    HOY
                  </span>
                )}
              </div>
            </div>

            {/* Lista de clases de ese día */}
            {sesionesDelDia.length === 0 ? (
              <div className="bg-brand-surface p-10 sm:p-14 rounded-[2rem] border-2 border-dashed border-brand-border text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center mx-auto">
                  <CalendarDays size={32} />
                </div>
                <h4 className="text-base font-black text-slate-700 uppercase tracking-tight">
                  Día sin clases programadas
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                  No tienes entrenamientos agendados para esta fecha. Puedes seleccionar otro día en el calendario para consultar tu agenda.
                </p>
                <button
                  type="button"
                  onClick={handleIrAHoy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-brand-primary text-xs font-black uppercase rounded-xl transition-colors mt-2"
                >
                  <span>Volver a la fecha de hoy</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sesionesDelDia.map(claseItem => (
                  <div
                    key={claseItem.id}
                    className={`bg-brand-surface rounded-[2rem] p-5 sm:p-7 border-2 transition-all shadow-md hover:shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${
                      claseItem.requiereAtencion
                        ? 'border-brand-accent bg-gradient-to-r from-orange-50/40 via-white to-white'
                        : claseItem.attended
                        ? 'border-emerald-200 bg-white'
                        : 'border-brand-border bg-white'
                    }`}
                  >
                    {/* Alerta de live session o pendiente */}
                    {claseItem.requiereAtencion && (
                      <div className="absolute top-0 right-0 bg-brand-accent text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1 shadow-xs">
                        <AlertTriangle size={11} /> Faltan {claseItem.pendientesCount} por marcar
                      </div>
                    )}

                    {claseItem.attended && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider flex items-center gap-1">
                        <CheckCheck size={11} /> Asistencia Completa
                      </div>
                    )}

                    {/* Contenido Izquierdo */}
                    <div className="space-y-3 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-brand-primary text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-wider">
                          {claseItem.level}
                        </span>

                        {claseItem.isReprogramada && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                            Sesión Movida
                          </span>
                        )}
                        {claseItem.isReposicion && (
                          <span className="bg-purple-50 text-purple-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                            Reposición
                          </span>
                        )}
                        {claseItem.tieneRecuperadores && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase flex items-center gap-1">
                            <RefreshCw size={11} /> Recuperadores
                          </span>
                        )}
                      </div>

                      <h4 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-brand-primary leading-tight">
                        {claseItem.title}
                      </h4>

                      {/* Detalles técnicos */}
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-slate-500 uppercase">
                        <span className="flex items-center gap-1.5 text-slate-700 font-black">
                          <Clock size={15} className="text-brand-accent" /> {claseItem.timeRange} HRS
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-blue-500" /> {claseItem.court} ({claseItem.sede})
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={15} className="text-blue-500" /> {claseItem.totalStudents} Atletas
                        </span>
                      </div>

                      {/* Resumen del registro de asistencia */}
                      <div className="flex items-center gap-2 pt-1 text-[11px] font-black uppercase">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {claseItem.presentesCount} Presentes
                        </span>
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                          {claseItem.faltasCount} Faltas
                        </span>
                        {claseItem.pendientesCount > 0 && (
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                            {claseItem.pendientesCount} Pendientes
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón Tomar / Ver Asistencia */}
                    <div className="self-stretch sm:self-center shrink-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => !claseItem.isFuture && setSelectedClass(claseItem)}
                        disabled={claseItem.isFuture}
                        className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 italic ${
                          claseItem.isFuture
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            : claseItem.requiereAtencion
                            ? 'bg-brand-accent hover:bg-brand-accent-dark text-white shadow-brand-accent/30 ring-2 ring-orange-400'
                            : claseItem.attended
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-brand-primary hover:bg-[#152a63] text-white shadow-brand-primary/20'
                        }`}
                      >
                        <span>
                          {claseItem.isFuture
                            ? 'Sesión Futura'
                            : claseItem.requiereAtencion
                            ? '¡Completar Asistencia!'
                            : claseItem.attended
                            ? 'Ver / Editar'
                            : 'Tomar Asistencia'}
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODO B: LISTADO COMPLETO CRONOLÓGICO */}
      {vistaModo === 'todas' && (
        <div className="space-y-4">
          <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border flex items-center justify-between">
            <p className="text-xs font-black uppercase text-slate-600 tracking-wider">
              Mostrando todas las {clases.length} sesiones de la temporada
            </p>
            <button
              onClick={() => setVistaModo('dia')}
              className="text-xs font-black uppercase text-brand-accent hover:underline"
            >
              Volver a vista por día
            </button>
          </div>

          <div className="grid gap-4">
            {clases.map(item => (
              <div
                key={item.id}
                className={`bg-brand-surface rounded-[2rem] p-5 sm:p-6 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-sm ${
                  item.requiereAtencion
                    ? 'border-brand-accent bg-orange-50/20'
                    : item.isToday
                    ? 'border-brand-primary bg-blue-50/20'
                    : 'border-brand-border'
                }`}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    item.isToday 
                      ? 'bg-brand-accent text-white shadow-md' 
                      : item.attended
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-primary text-white'
                  }`}>
                    <span className="text-lg leading-none">{item.dateShort.split(' ')[0]}</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-80">{item.dateShort.split(' ')[1]}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {item.level}
                      </span>
                      {item.isToday && (
                        <span className="text-[9px] font-black uppercase bg-orange-100 text-brand-accent-dark px-2 py-0.5 rounded">
                          Hoy
                        </span>
                      )}
                      {item.requiereAtencion && (
                        <span className="text-[9px] font-black uppercase bg-rose-100 text-rose-700 px-2 py-0.5 rounded">
                          Faltan {item.pendientesCount}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-black uppercase text-brand-primary">{item.title}</h4>
                    <p className="text-xs font-bold text-slate-500">
                      {item.timeRange} HRS · {item.court} · {item.totalStudents} Atletas
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !item.isFuture && setSelectedClass(item)}
                  disabled={item.isFuture}
                  className={`px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all self-stretch md:self-center flex items-center justify-center gap-2 ${
                    item.isFuture
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : item.requiereAtencion
                      ? 'bg-brand-accent text-white hover:bg-brand-accent-dark'
                      : 'bg-brand-primary text-white hover:bg-[#152a63]'
                  }`}
                >
                  <span>{item.isFuture ? 'Futura' : 'Asistencia'}</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE ASISTENCIA */}
      {selectedClass && (
        <AttendanceModal
          clase={selectedClass}
          onClose={() => setSelectedClass(null)}
          onRefresh={fetchAgenda}
        />
      )}
    </div>
  );
};

export default DashboardTeacher;