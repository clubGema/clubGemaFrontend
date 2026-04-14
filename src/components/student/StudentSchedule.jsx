import React, { useMemo } from 'react';
import { Clock, MapPin, User, Star, Zap, CheckCircle2, CircleDashed, Calendar, RefreshCw, CalendarX, ArrowRight, Sparkles, History, AlertCircle } from 'lucide-react';

const StudentSchedule = ({ attendance = [], filtroMes, filtroAnio }) => {
  const diasSemana = ["DOM", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB"];
  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  /**
   * ✅ CORRECCIÓN FECHAS: Normaliza la zona horaria para evitar el "día anterior".
   * Ajusta el objeto Date local sumando el offset para que 00:00 UTC sea 00:00 Local.
   */
  const parseLocalDate = (fechaString) => {
    if (!fechaString) return new Date();
    const date = new Date(fechaString);
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date;
  };

  /**
   * ✅ CORRECCIÓN 1970: Extrae solo HH:mm.
   * Evita que el navegador asigne el año 1970 a los strings de hora que vienen de la DB.
   */
  const formatTimeDirect = (timeSource) => {
    if (!timeSource) return '--:--';
    if (typeof timeSource === 'string') {
      const match = timeSource.match(/(\d{2}:\d{2})/);
      return match ? match[1] : timeSource.substring(0, 5);
    }
    return new Date(timeSource).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // 1. FILTRADO TÉCNICO Y ORDENAMIENTO
  const sesionesFiltradas = useMemo(() => {
    return attendance
      .filter(s => {
        if (s.comentario && s.comentario.includes('[RECUPERACION]')) {
          return false;
        }

        const fechaBase = s.fecha || s.fecha_programada;
        if (!fechaBase) return false;

        const fechaSesion = parseLocalDate(s.fecha);
        const matchMes = filtroMes === "TODOS" || fechaSesion.getMonth().toString() === filtroMes;
        const matchAnio = fechaSesion.getFullYear().toString() === filtroAnio;
        const tieneHorario = s?.inscripciones?.horarios_clases || s?.horarios_clases;

        return tieneHorario && matchMes && matchAnio;
      })
      .sort((a, b) => {
        const fechaA = new Date(a.fecha || a.fecha_programada);
        const fechaB = new Date(b.fecha || b.fecha_programada);
        return fechaA - fechaB;
      });
  }, [attendance, filtroMes, filtroAnio]);

  // 2. AGRUPACIÓN POR MES PARA LA VISTA
  const sesionesPorMes = useMemo(() => {
    return sesionesFiltradas.reduce((acc, sesion) => {
      const fecha = parseLocalDate(sesion.fecha);
      const mesAnio = `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
      if (!acc[mesAnio]) acc[mesAnio] = [];
      acc[mesAnio].push(sesion);
      return acc;
    }, {});
  }, [sesionesFiltradas]);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col h-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden animate-fade-in">
      {/* HEADER */}
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#1e3a8a] rounded-full"></div>
          <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-lg italic">Mi Plan de Entrenamiento</h2>
        </div>
        <Zap size={20} className="text-orange-500 fill-orange-500/20" />
      </div>

      <div className="p-6 space-y-8 flex-grow overflow-y-auto max-h-[750px] custom-scrollbar bg-slate-50/30">
        {Object.keys(sesionesPorMes).length > 0 ? Object.entries(sesionesPorMes).map(([mes, items]) => (
          <div key={mes} className="space-y-4">
            <div className="flex items-center gap-4 py-2">
              <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] whitespace-nowrap italic">{mes}</span>
              <div className="h-px w-full bg-slate-200"></div>
            </div>

            {items.map((sesion) => {
              const horario = sesion?.inscripciones?.horarios_clases || sesion?.horarios_clases;

              // Detectamos si es un ticket de recuperación
              const esRecuperacion = sesion.horario_destino_id || sesion.isRecuperacion;

              // Normalizamos el estado
              const estadoReal = sesion.estado === 'COMPLETADA_PRESENTE' ? 'PRESENTE' :
                sesion.estado === 'COMPLETADA_FALTA' ? 'FALTA' :
                  sesion.estado;

              const coordinatorData = horario?.coordinadores?.usuarios;
              const nombreLider = coordinatorData
                ? `${coordinatorData.nombres.trim()} ${coordinatorData.apellidos.trim()}`
                : 'COORDINATOR GEMA';

              // 🔥 EXTRACT TIME OVERRIDE FOR REPROGRAMMED SESSIONS
              const horaInicioMostrar = sesion.reprogramaciones_clases
                ? sesion.reprogramaciones_clases.hora_inicio_destino + ":00"
                : horario?.hora_inicio;

              const fechaObj = parseLocalDate(sesion.fecha || sesion.fecha_programada);

              const fechaSesionFinDia = new Date(fechaObj);
              fechaSesionFinDia.setHours(23, 59, 59, 0);
              const esPasada = fechaSesionFinDia < hoy && estadoReal === 'PROGRAMADA';

              const esPresente = estadoReal === 'PRESENTE';
              const esFalta = estadoReal === 'FALTA';
              const esReprogramado = estadoReal === 'REPROGRAMADO';

              return (
                <div key={esRecuperacion ? `recu-${sesion.id}` : `asist-${sesion.id}`} className={`group relative rounded-[2rem] border transition-all duration-300 ${esPresente ? 'bg-green-50/50 border-green-200 shadow-sm' :
                  esFalta ? 'bg-red-50/50 border-red-200 shadow-sm' :
                    esReprogramado ? 'bg-slate-50/30 border-slate-200 border-dashed opacity-60 grayscale-[0.5]' :
                      sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION' ? 'bg-gradient-to-br from-violet-50/80 to-indigo-50/80 border-violet-200 shadow-md hover:shadow-indigo-100' :
                        'bg-white border-slate-100 hover:border-blue-300 hover:shadow-2xl'
                  }`}>

                  {/* ✨ INDICADOR DE SESIÓN DE REPOSICIÓN (NUEVA) */}
                  {(sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') && !esReprogramado && (
                    <div className="absolute -top-2 -left-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white p-1.5 rounded-full shadow-lg border-2 border-white z-20 animate-bounce-slow">
                      <Sparkles size={12} />
                    </div>
                  )}
                  {/* 🔥 BADGE VISUAL DE RECUPERACIÓN */}
                  {(esRecuperacion || sesion.tipo_sesion === 'RECUPERACION') && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white flex items-center gap-1 text-[8px] font-black px-4 py-1.5 rounded-bl-2xl italic tracking-tighter z-10">
                      <RefreshCw size={10} /> RECUPERACIÓN
                    </div>
                  )}
                  <div className="p-5 flex flex-col md:flex-row items-center gap-6">

                    {/* INDICADOR DE FECHA DEPORTIVO */}
                    <div className="flex items-center gap-4 min-w-[140px]">
                      <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl font-black shadow-md ${esPresente ? 'bg-green-600 text-white' :
                        esFalta ? 'bg-red-600 text-white' :
                          esReprogramado ? 'bg-slate-400 text-white' :
                            'bg-[#1e3a8a] text-white'
                        }`}>
                        <span className="text-[9px] opacity-70 uppercase italic">{diasSemana[fechaObj.getDay()]}</span>
                        <span className="text-2xl leading-none">{fechaObj.getDate()}</span>
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1 text-orange-500 font-black">
                          <Clock size={12} />
                          <span className="text-[10px] uppercase tracking-tighter">
                            {formatTimeDirect(horaInicioMostrar)}
                          </span>
                        </div>
                        <h4 className="flex items-center gap-1.5 text-[11px] font-black text-[#1e3a8a] uppercase italic leading-tight">
                          {esReprogramado ? (
                            <>
                              Clase Movida <ArrowRight size={10} className="text-slate-400" />
                            </>
                          ) : (sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') ? 'Reposición de Clase' : 'Sesión Regular'}
                        </h4>
                        {esReprogramado && sesion.comentario && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="bg-slate-100 text-slate-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase italic border border-slate-200">
                              {sesion.comentario.split(' al ')[1] ? `Hacia el ${sesion.comentario.split(' al ')[1].split(' por ')[0]}` : 'Fecha Modificada'}
                            </span>
                          </div>
                        )}
                        {(sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') && !esReprogramado && (
                          <div className="mt-1 flex items-center gap-1.5 text-indigo-600">
                            <History size={10} />
                            <span className="text-[8px] font-black italic uppercase tracking-tighter">
                              Original: {parseLocalDate(sesion.fecha_original || sesion.fecha).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* DATOS DE LA SESIÓN */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 flex-1 w-full border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-4 md:pt-0">
                      <div className="space-y-1 text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cancha / Sede</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase italic">
                          <MapPin size={12} className="text-blue-500" />
                          {horario?.canchas?.nombre || 'T1'}
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Nivel Pro</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase italic">
                          <Star size={12} className="text-yellow-500 fill-yellow-500" />
                          {horario?.niveles_entrenamiento?.nombre || 'Formativo'}
                        </div>
                      </div>

                      {/* NOMBRE DEL LÍDER TÉCNICO DINÁMICO */}
                      <div className="space-y-1 hidden lg:block text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Líder Técnico</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-[#1e3a8a] uppercase italic">
                          <User size={12} className="text-indigo-500" />
                          <span>{nombreLider}</span>
                        </div>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className={`shrink-0 flex items-center justify-center min-w-[100px] gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic shadow-sm border ${esPresente ? 'bg-green-100 text-green-700 border-green-200' :
                      esFalta ? 'bg-red-100 text-red-700 border-red-200' :
                        esReprogramado ? 'bg-slate-200 text-slate-500 border-slate-300' :
                          sesion.fecha_original ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>
                      {esPresente ? <CheckCircle2 size={14} strokeWidth={3} /> :
                        esReprogramado ? <CalendarX size={14} strokeWidth={3} /> :
                          esPasada ? <AlertCircle size={14} strokeWidth={2} /> :
                            (sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') ? <RefreshCw size={14} className="animate-pulse" /> :
                              <CircleDashed size={14} className={sesion.estado === 'PROGRAMADA' ? "animate-spin-slow" : ""} />}
                      {esReprogramado ? 'MOVIDA' :
                        esPasada ? 'PASADA' :
                          (sesion.fecha_original || sesion.tipo_sesion === 'REPOSICION') ? 'REPOSICIÓN' :
                            sesion.estado === 'PROGRAMADA' ? 'PRÓXIMA' : sesion.estado}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )) : (
          <div className="py-32 text-center space-y-4">
            <Calendar className="mx-auto text-slate-200" size={60} strokeWidth={1} />
            <p className="text-slate-400 font-black uppercase italic tracking-[0.3em] text-xs">No se encontraron sesiones programadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;