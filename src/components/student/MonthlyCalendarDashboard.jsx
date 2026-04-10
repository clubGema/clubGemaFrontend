import React, { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Loader2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';

const MonthlyCalendarDashboard = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clasesProgramadas, setClasesProgramadas] = useState([]);
  const [fechaReferencia, setFechaReferencia] = useState(new Date());

  // 1. FETCH DE DATOS (Misma lógica que el StudentSchedule)
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
        console.error("Error al cargar agenda:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistenciasAlumno();
  }, [userId]);

  // 2. LÓGICA DE CALENDARIO (Mantenida)
  const { diasCalendario, mesActual, anioActual } = useMemo(() => {
    const year = fechaReferencia.getFullYear();
    const month = fechaReferencia.getMonth();
    const primerDiaMes = new Date(year, month, 1);
    let startOffset = primerDiaMes.getDay() === 0 ? 6 : primerDiaMes.getDay() - 1;
    const dias = [];
    const fechaInicio = new Date(primerDiaMes);
    fechaInicio.setDate(fechaInicio.getDate() - startOffset);
    for (let i = 0; i < 42; i++) {
      dias.push(new Date(fechaInicio));
      fechaInicio.setDate(fechaInicio.getDate() + 1);
    }
    return { diasCalendario: dias, mesActual: month, anioActual: year };
  }, [fechaReferencia]);

  // 3. UTILIDADES DE FORMATO Y ESTADO
  const esHoy = (date) => new Date().toDateString() === date.toDateString();
  const esMismoMes = (date) => date.getMonth() === mesActual;

  const formatTime = (timeStr) => {
    if (!timeStr) return '--:--';
    const match = timeStr.match(/(\d{2}:\d{2})/);
    return match ? match[1] : timeStr.slice(0, 5);
  };

  // ✅ UNIFICACIÓN DE LÓGICA DE ESTADOS
  const getEstadoInfo = (sesion) => {
    const estadoLimpio = sesion.estado?.toUpperCase();
    const esPresente = estadoLimpio === 'PRESENTE' || estadoLimpio === 'COMPLETADA_PRESENTE';
    const esFalta = estadoLimpio === 'FALTA' || estadoLimpio === 'COMPLETADA_FALTA';
    const esReprogramado = estadoLimpio === 'REPROGRAMADO';

    if (esPresente) return { color: 'border-emerald-500 bg-emerald-50 text-emerald-700', icon: <CheckCircle2 size={8} /> };
    if (esFalta) return { color: 'border-rose-500 bg-rose-50 text-rose-700', icon: <XCircle size={8} /> };
    if (esReprogramado) return { color: 'border-slate-300 bg-slate-100 text-slate-400 opacity-60', icon: null };

    // Default / Programada
    return { color: 'border-orange-500 bg-white text-[#1e3a8a]', icon: <Clock size={8} /> };
  };

  const getClasesDia = (fechaCalendario) => {
    const target = `${fechaCalendario.getFullYear()}-${String(fechaCalendario.getMonth() + 1).padStart(2, '0')}-${String(fechaCalendario.getDate()).padStart(2, '0')}`;
    return clasesProgramadas.filter(reg => {
      if (!reg.fecha) return false;
      const fechaDB = reg.fecha.includes('T') ? reg.fecha.split('T')[0] : reg.fecha;
      return fechaDB === target;
    });
  };

  if (loading) return (
    <div className="bg-white rounded-[2rem] p-8 shadow-2xl flex justify-center items-center h-48 border border-slate-100">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-xl border border-slate-100 flex flex-col">
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-base md:text-lg font-black italic uppercase tracking-[0.15em] text-orange-500">
            <CalendarDays className="w-5 h-5" /> GEMA PLANNER
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
            Vista Mensual // {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(anioActual, mesActual)).toUpperCase()} {anioActual}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button onClick={() => setFechaReferencia(new Date(anioActual, mesActual - 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronLeft size={18} /></button>
          <span className="text-[10px] font-black px-3 text-[#1e3a8a] min-w-[100px] text-center italic uppercase">
            {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(new Date(anioActual, mesActual))}
          </span>
          <button onClick={() => setFechaReferencia(new Date(anioActual, mesActual + 1))} className="p-2 hover:bg-white rounded-xl transition-all shadow-sm"><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* GRID */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(d => (
            <div key={d} className="py-3 text-center text-[10px] font-black text-[#1e3a8a] italic tracking-widest">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 grid-rows-6 min-h-[550px]">
          {diasCalendario.map((dia, idx) => {
            const clases = getClasesDia(dia);
            const hoy = esHoy(dia);
            const mismoMes = esMismoMes(dia);

            return (
              <div key={idx} className={`min-h-[110px] border-r border-b border-slate-100 p-1 transition-colors ${!mismoMes ? 'bg-slate-50/50 opacity-40' : 'bg-white'}`}>
                <div className="flex justify-end mb-1">
                  <span className={`text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full ${hoy ? 'bg-orange-500 text-white shadow-md' : 'text-slate-400'}`}>
                    {dia.getDate()}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {clases.map((clase, i) => {
                    const info = getEstadoInfo(clase);
                    const hora = clase.reprogramaciones_clases ? clase.reprogramaciones_clases.hora_inicio_destino : clase.inscripciones?.horarios_clases?.hora_inicio;

                    return (
                      <div key={i} className={`border-l-2 shadow-sm p-1.5 rounded-r-md hover:scale-[1.02] transition-transform cursor-pointer ${info.color}`}>
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[7px] font-black truncate uppercase italic leading-none">
                            {clase.inscripciones?.horarios_clases?.niveles_entrenamiento?.nombre || 'CLASE'}
                          </p>
                          {info.icon}
                        </div>
                        <p className="text-[7px] font-bold opacity-70 mt-0.5">
                          {formatTime(hora)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MonthlyCalendarDashboard;