import React, { useState, useEffect } from 'react';
import { CalendarCheck, History, Loader2 } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import { useAuth } from '../../context/AuthContext';

const StudentStats = () => {
  const { userId } = useAuth();
  const [stats, setStats] = useState({
    porcentaje: 0,
    faltas: 0,
    loading: true
  });

  useEffect(() => {
    const getStats = async () => {
      if (!userId) return;
      try {
        const res = await apiFetch.get(API_ROUTES.ASISTENCIAS.ALUMNO_ESTADISTICAS(userId));
        const result = await res.json();

        if (res.ok && result.data) {
          setStats({
            // Usamos || 0 para asegurar que siempre se vea un número
            porcentaje: result.data.porcentaje_asistencia_real || 0,
            faltas: result.data.detalle?.FALTA?.cantidad || 0,
            loading: false
          });
        } else {
          setStats(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error al cargar stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    getStats();
  }, [userId]);

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-28 bg-white/50 animate-pulse rounded-[2rem] border border-brand-border-soft flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-300" />
        </div>
        <div className="h-28 bg-white/50 animate-pulse rounded-[2rem] border border-brand-border-soft flex items-center justify-center">
          <Loader2 className="animate-spin text-slate-300" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Tarjeta de Asistencia Real */}
      <div className="bg-brand-surface p-6 rounded-[2rem] border border-brand-border-soft shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className="w-14 h-14 bg-brand-primary-soft rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
          <CalendarCheck size={28} />
        </div>
        <div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1">
            Asistencia Real
          </p>
          <h3 className={`text-3xl font-black italic ${stats.porcentaje < 50 ? 'text-rose-500' : 'text-brand-primary'}`}>
            {stats.porcentaje}%
          </h3>
        </div>
      </div>

      {/* Tarjeta de Faltas Recuperables */}
      <div className="bg-brand-surface p-6 rounded-[2rem] border border-brand-border-soft shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
        <div className="w-14 h-14 bg-brand-accent-soft rounded-2xl flex items-center justify-center text-brand-accent-dark shadow-inner">
          <History size={28} />
        </div>
        <div>
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest leading-none mb-1">
            Faltas Totales
          </p>
          <div className="flex items-end gap-2">
            <h3 className="text-3xl font-black text-brand-primary italic">
              {stats.faltas}
            </h3>
            <span className="text-[10px] font-bold text-brand-accent uppercase mb-1.5 italic">
              Sesiones perdidas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStats;