import React, { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';

const WeeklyTimelineDashboard = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clasesProgramadas, setClasesProgramadas] = useState([]);

  // --- CONFIGURACIÓN EXACTA DEL PLANNER ---
  const START_HOUR = 8;  // Empieza a las 08:00
  const END_HOUR = 23;   // Termina a las 23:00
  const TOTAL_HOURS = END_HOUR - START_HOUR + 1;
  const ROW_HEIGHT = 60; // 1 Hora = 60 pixeles exactos

  // 1. FETCH INDEPENDIENTE (Trae la data real de la BD con fechas exactas)
  useEffect(() => {
    const fetchAsistenciasAlumno = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await apiFetch.get(API_ROUTES.ASISTENCIAS.ALUMNO_HISTORIAL(userId));
        const result = await res.json();
        if (res.ok && result.data) {
          setClasesProgramadas(result.data);
        }
      } catch (error) {
        console.error("Error al cargar agenda del estudiante:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistenciasAlumno();
  }, [userId]);

  // 2. CONFIGURACIÓN DE LOS DÍAS DE ESTA SEMANA
  const diasConFechas = useMemo(() => {
    const hoy = new Date();
    const lunes = new Date(hoy);
    const diff = hoy.getDay() === 0 ? 6 : hoy.getDay() - 1; 
    lunes.setDate(hoy.getDate() - diff);

    const getDia = (diasAumentar) => {
      const nuevaFecha = new Date(lunes);
      nuevaFecha.setDate(lunes.getDate() + diasAumentar);
      return nuevaFecha;
    };

    return [
      { id: 1, label: 'LUN', fecha: getDia(0) },
      { id: 2, label: 'MAR', fecha: getDia(1) },
      { id: 3, label: 'MIE', fecha: getDia(2) },
      { id: 4, label: 'JUE', fecha: getDia(3) },
      { id: 5, label: 'VIE', fecha: getDia(4) },
      { id: 6, label: 'SAB', fecha: getDia(5) },
      { id: 7, label: 'DOM', fecha: getDia(6) }
    ];
  }, []);

  // 3. MATEMÁTICAS DEL CALENDARIO
  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    if (timeStr.includes('T')) {
      const d = new Date(timeStr);
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    }
    return timeStr.slice(0, 5); 
  };

  const esMismaFecha = (fechaDbIso, fechaLocalCalendario) => {
    if (!fechaDbIso) return false;
    const fechaDbStr = fechaDbIso.split('T')[0]; 
    const year = fechaLocalCalendario.getFullYear();
    const month = String(fechaLocalCalendario.getMonth() + 1).padStart(2, '0');
    const day = String(fechaLocalCalendario.getDate()).padStart(2, '0');
    return fechaDbStr === `${year}-${month}-${day}`;
  };

  const getCardStyle = (horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return { top: 0, height: ROW_HEIGHT };
    
    const inicio = formatTime(horaInicio);
    const fin = formatTime(horaFin);
    const [hI, mI] = inicio.split(':').map(Number);
    const [hF, mF] = fin.split(':').map(Number);
    
    const topPx = ((hI - START_HOUR) * ROW_HEIGHT) + mI;
    const heightPx = ((hF * 60) + mF) - ((hI * 60) + mI);

    return { 
      top: `${topPx}px`, 
      height: `${Math.max(heightPx, 30)}px`
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl flex justify-center items-center h-48 border border-slate-100">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-xl border border-slate-100 flex flex-col">
      
      {/* HEADER TÍTULO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-base md:text-lg font-black italic uppercase tracking-[0.15em] text-orange-500">
            <CalendarCheck className="w-5 h-5" /> GEMA PLANNER
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
            Semana Completa // Sesiones Programadas
          </p>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL - 100% RESPONSIVO Y UNIFICADO */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm flex flex-col">
        
        {/* Scroll Horizontal que envuelve TANTO a la cabecera como al cuerpo */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          
          {/* El min-w mantiene el ancho obligado para móviles, garantizando que el Grid coincida perfecto */}
          <div className="min-w-[700px] flex flex-col">

            {/* Cabecera Fija de Días */}
            <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="w-14 border-r border-slate-200 shrink-0 bg-white"></div>
              <div className="flex-1 grid grid-cols-7">
                {diasConFechas.map(dia => {
                  const esHoy = new Date().toDateString() === dia.fecha.toDateString();
                  return (
                    <div key={dia.id} className="py-2 flex flex-col items-center justify-center border-r border-slate-200/50 last:border-r-0">
                      <span className={`text-[10px] font-black uppercase italic tracking-widest ${esHoy ? 'text-orange-500' : 'text-[#1e3a8a]'}`}>
                        {dia.label}
                      </span>
                      <span className={`mt-0.5 text-[9px] font-bold ${esHoy ? 'bg-orange-500 text-white px-2 py-0.5 rounded-full' : 'text-slate-400'}`}>
                        {dia.fecha.getDate()}/{dia.fecha.getMonth() + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cuerpo Scrollable Vertical del Calendario */}
            <div className="overflow-y-auto max-h-[400px] custom-scrollbar bg-slate-50/30">
              
              {/* mt-3 y mb-4 le dan el "respiro" para que no se corte el 8:00 AM */}
              <div className="mt-3 mb-4 relative flex" style={{ height: `${TOTAL_HOURS * ROW_HEIGHT}px` }}>
                
                {/* GRID DE LÍNEAS DE FONDO */}
                <div className="absolute inset-0 z-0 pointer-events-none ml-14"
                     style={{ 
                       backgroundImage: 'linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', 
                       backgroundSize: `100% ${ROW_HEIGHT}px` 
                     }} 
                />

                {/* Columna Izquierda: Etiquetas de Hora */}
                <div className="w-14 border-r border-slate-200 shrink-0 relative z-10">
                  {Array.from({ length: TOTAL_HOURS }).map((_, i) => (
                    <div key={i} className="absolute w-full text-right pr-2 text-[9px] font-bold text-slate-400"
                         style={{ top: `${(i * ROW_HEIGHT) - 6}px` }}>
                      {START_HOUR + i}:00
                    </div>
                  ))}
                </div>

                {/* Columnas de Días y Tarjetas */}
                <div className="flex-1 grid grid-cols-7 relative z-10">
                  {diasConFechas.map((dia) => {
                    const clasesDelDia = clasesProgramadas.filter(registro => esMismaFecha(registro.fecha, dia.fecha));
                    const esHoy = new Date().toDateString() === dia.fecha.toDateString();

                    return (
                      <div key={`col-${dia.id}`} className={`relative border-r border-slate-200/50 last:border-r-0 ${esHoy ? 'bg-orange-50/20' : ''}`}>
                        
                        {clasesDelDia.map((registroAsistencia, index) => {
                          const horario = registroAsistencia.inscripciones?.horarios_clases;
                          const cardStyle = getCardStyle(horario?.hora_inicio, horario?.hora_fin);

                          return (
                            <div 
                              key={index} 
                              className="absolute left-1 right-1 bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden flex transition-transform hover:scale-[1.02] hover:shadow-lg hover:z-20 cursor-pointer"
                              style={cardStyle}
                            >
                              <div className="w-1.5 bg-[#1e3a8a] h-full shrink-0"></div>
                              
                              <div className="flex-1 p-2 flex flex-col justify-center overflow-hidden">
                                <span className="text-[9px] font-black text-[#1e3a8a] uppercase italic tracking-tight leading-none truncate">
                                  {horario?.niveles_entrenamiento?.nombre || 'BÁSICO'}
                                </span>
                                
                                <div className="mt-1.5 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                    <span className="text-[9px] font-bold text-slate-600 leading-none">
                                      {formatTime(horario?.hora_inicio)}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></div>
                                    <span className="text-[9px] font-medium text-slate-400 leading-none">
                                      {formatTime(horario?.hora_fin)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeeklyTimelineDashboard;