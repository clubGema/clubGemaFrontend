import React, { useState, useEffect, useMemo } from 'react';
import { CalendarCheck, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';

const MONTH_NAMES = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE',
];

const DAY_LABELS = ['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];

const toDateKey = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthMatrix = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Convertimos a semana iniciando en lunes: 0..6 (lun..dom)
  const mondayIndex = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayIndex + totalDays) / 7) * 7;
  const matrix = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNumber = i - mondayIndex + 1;
    if (dayNumber < 1 || dayNumber > totalDays) {
      matrix.push(null);
      continue;
    }

    matrix.push(new Date(year, month, dayNumber));
  }

  return matrix;
};

const formatTime = (timeStr) => {
  if (!timeStr) return '--:--';
  if (typeof timeStr === 'string' && timeStr.includes('T')) {
    const d = new Date(timeStr);
    return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
  }
  return String(timeStr).slice(0, 5);
};

const getMondayDayLabel = (dateObj) => {
  const mondayIndex = (dateObj.getDay() + 6) % 7;
  return DAY_LABELS[mondayIndex];
};

const WeeklyTimelineDashboard = () => {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clasesProgramadas, setClasesProgramadas] = useState([]);
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  useEffect(() => {
    const fetchAsistenciasAlumno = async () => {
      if (!userId) {
        setClasesProgramadas([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await apiFetch.get(API_ROUTES.ASISTENCIAS.ALUMNO_HISTORIAL(userId));
        const result = await res.json();
        if (res.ok && result.data) {
          setClasesProgramadas(result.data);
        } else {
          setClasesProgramadas([]);
        }
      } catch (error) {
        console.error('Error al cargar agenda del estudiante:', error);
        setClasesProgramadas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAsistenciasAlumno();
  }, [userId]);

  const clasesPorFecha = useMemo(() => {
    const grouped = new Map();

    for (const registro of clasesProgramadas) {
      if (!registro?.fecha) continue;
      const key = String(registro.fecha).split('T')[0];
      const current = grouped.get(key) || [];
      current.push(registro);
      grouped.set(key, current);
    }

    return grouped;
  }, [clasesProgramadas]);

  const monthGrid = useMemo(() => getMonthMatrix(monthCursor), [monthCursor]);
  const monthDays = useMemo(() => monthGrid.filter(Boolean), [monthGrid]);
  const todayKey = toDateKey(new Date());
  const currentMonthLabel = `${MONTH_NAMES[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;

  const changeMonth = (direction) => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  const classesThisMonth = useMemo(() => {
    const year = monthCursor.getFullYear();
    const month = String(monthCursor.getMonth() + 1).padStart(2, '0');
    let count = 0;

    for (const [dateKey, items] of clasesPorFecha.entries()) {
      if (dateKey.startsWith(`${year}-${month}`)) count += items.length;
    }

    return count;
  }, [clasesPorFecha, monthCursor]);

  const daysWithClassesThisMonth = useMemo(() => {
    let count = 0;

    for (const dayDate of monthDays) {
      const dateKey = toDateKey(dayDate);
      if ((clasesPorFecha.get(dateKey) || []).length > 0) count += 1;
    }

    return count;
  }, [monthDays, clasesPorFecha]);

  if (loading) {
    return (
      <div className="bg-white rounded-[2rem] p-8 shadow-2xl flex justify-center items-center h-48 border border-slate-100">
        <Loader2 className="animate-spin text-orange-500" size={32} />
      </div>
    );
  }

  return (
    <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-4 md:p-6 shadow-xl border border-slate-100 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base md:text-lg font-black italic uppercase tracking-[0.15em] text-orange-500">
            <CalendarCheck className="w-5 h-5" /> GEMA PLANNER
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">
            Mes Completo // Sesiones Programadas
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/30 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="text-center min-w-[170px]">
            <p className="text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">{currentMonthLabel}</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">{classesThisMonth} sesiones</p>
          </div>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full border border-slate-200 bg-white text-slate-500 hover:text-[#1e3a8a] hover:border-[#1e3a8a]/30 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="md:hidden border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#1e3a8a]">Vista movil</p>
          <p className="text-[9px] font-black uppercase tracking-wide text-slate-500">
            {daysWithClassesThisMonth} dias con clase
          </p>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2 space-y-2">
          {monthDays.map((dayDate) => {
            const dateKey = toDateKey(dayDate);
            const clasesDelDia = clasesPorFecha.get(dateKey) || [];
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`rounded-xl border p-3 flex flex-col gap-2 ${
                  isToday ? 'bg-orange-50/40 border-orange-300' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#1e3a8a]">
                      {getMondayDayLabel(dayDate)}
                    </span>
                    <span
                      className={`text-[11px] font-black ${
                        isToday ? 'bg-orange-500 text-white px-2 py-0.5 rounded-full' : 'text-slate-500'
                      }`}
                    >
                      {dayDate.getDate()}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-black uppercase tracking-wide ${
                      clasesDelDia.length > 0 ? 'text-orange-500' : 'text-slate-400'
                    }`}
                  >
                    {clasesDelDia.length > 0
                      ? `${clasesDelDia.length} ${clasesDelDia.length === 1 ? 'sesion' : 'sesiones'}`
                      : 'libre'}
                  </span>
                </div>

                {clasesDelDia.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {clasesDelDia.slice(0, 2).map((registro, i) => {
                      const horario = registro?.inscripciones?.horarios_clases;
                      const inicio = formatTime(horario?.hora_inicio);
                      const fin = formatTime(horario?.hora_fin);
                      const nivel = horario?.niveles_entrenamiento?.nombre || 'CLASE';

                      return (
                        <div
                          key={`${dateKey}-${i}`}
                          className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[9px] leading-tight"
                        >
                          <p className="font-black text-[#1e3a8a] uppercase italic truncate">{nivel}</p>
                          <p className="font-bold text-slate-500">
                            {inicio} - {fin}
                          </p>
                        </div>
                      );
                    })}

                    {clasesDelDia.length > 2 && (
                      <p className="text-[9px] font-black text-slate-400 uppercase italic">
                        +{clasesDelDia.length - 2} mas
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-300 italic">
                    Sin sesiones programadas
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden md:block border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {DAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-[10px] font-black uppercase italic tracking-widest text-[#1e3a8a] border-r border-slate-200/50 last:border-r-0"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {monthGrid.map((dayDate, idx) => {
            if (!dayDate) {
              return <div key={`empty-${idx}`} className="min-h-[115px] border-r border-b border-slate-100 bg-slate-50/40" />;
            }

            const dateKey = toDateKey(dayDate);
            const clasesDelDia = clasesPorFecha.get(dateKey) || [];
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`min-h-[115px] p-2 border-r border-b border-slate-100 last:border-r-0 flex flex-col gap-1 ${
                  isToday ? 'bg-orange-50/40' : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-black ${
                      isToday ? 'bg-orange-500 text-white px-2 py-0.5 rounded-full' : 'text-slate-500'
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                  {clasesDelDia.length > 0 && (
                    <span className="text-[9px] font-black text-orange-500 uppercase">{clasesDelDia.length}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {clasesDelDia.slice(0, 3).map((registro, i) => {
                    const horario = registro?.inscripciones?.horarios_clases;
                    const inicio = formatTime(horario?.hora_inicio);
                    const fin = formatTime(horario?.hora_fin);
                    const nivel = horario?.niveles_entrenamiento?.nombre || 'CLASE';

                    return (
                      <div
                        key={`${dateKey}-${i}`}
                        className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-50 text-[9px] leading-tight"
                      >
                        <p className="font-black text-[#1e3a8a] uppercase italic truncate">{nivel}</p>
                        <p className="font-bold text-slate-500">
                          {inicio} - {fin}
                        </p>
                      </div>
                    );
                  })}

                  {clasesDelDia.length > 3 && (
                    <p className="text-[9px] font-black text-slate-400 uppercase italic">
                      +{clasesDelDia.length - 3} mas
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WeeklyTimelineDashboard;
