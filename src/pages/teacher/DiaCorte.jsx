import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, AlertCircle, Loader2, Info, UserCircle, CalendarClock, 
  AlertTriangle, CheckCircle, Clock, ShieldAlert, Sparkles, Filter, 
  MapPin, Copy, Check 
} from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import { format, isPast, isToday, differenceInDays, addDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const DiaCorte = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('todos'); // 'todos' | 'vence_pronto' | 'vencidos' | 'al_dia' | 'individual'
  const [copiedDni, setCopiedDni] = useState(null);

  useEffect(() => {
    fetchAlumnosCorte();
  }, []);

  const fetchAlumnosCorte = async () => {
    try {
      setLoading(true);
      const response = await apiFetch.get(API_ROUTES.ALUMNOS.DIA_CORTE_COORDINADOR);
      const json = await response.json();
      setAlumnos(json.data || []);
    } catch (error) {
      console.error('Error en fetchAlumnosCorte:', error);
      toast.error('Error al cargar la lista de días de corte');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyDni = (dni) => {
    if (!dni) return;
    navigator.clipboard.writeText(dni);
    setCopiedDni(dni);
    toast.success(`DNI ${dni} copiado`, { duration: 1500 });
    setTimeout(() => setCopiedDni(null), 2000);
  };

  // Procesamiento y cálculo de estado para cada alumno
  const alumnosProcesados = useMemo(() => {
    const hoy = startOfToday();

    return alumnos.map(alumno => {
      const principal = alumno.contratos?.[0] || null;
      const esIndividual = principal?.esIndividual === true;
      const fechaCorteRaw = alumno.fecha_corte_principal;
      const fechaCorte = fechaCorteRaw ? new Date(fechaCorteRaw) : null;

      let estadoCiclo = 'AL_DIA';
      let diasRestantes = null;
      let etiquetaTiempo = '';

      if (esIndividual) {
        estadoCiclo = 'INDIVIDUAL';
        etiquetaTiempo = 'Clase Única';
      } else if (fechaCorte) {
        const diff = differenceInDays(fechaCorte, hoy);
        diasRestantes = diff;

        if (isToday(fechaCorte)) {
          estadoCiclo = 'VENCE_HOY';
          etiquetaTiempo = '¡Vence Hoy!';
        } else if (diff < 0) {
          estadoCiclo = 'VENCIDO';
          etiquetaTiempo = `Venció hace ${Math.abs(diff)} día(s)`;
        } else if (diff <= 7) {
          estadoCiclo = 'VENCE_PRONTO';
          etiquetaTiempo = `Vence en ${diff} día(s)`;
        } else {
          estadoCiclo = 'AL_DIA';
          etiquetaTiempo = `${diff} días restantes`;
        }
      }

      return {
        ...alumno,
        principal,
        esIndividual,
        fechaCorte,
        estadoCiclo,
        diasRestantes,
        etiquetaTiempo
      };
    });
  }, [alumnos]);

  // Contadores para las pestañas y métricas
  const metricas = useMemo(() => {
    return {
      total: alumnosProcesados.length,
      vencePronto: alumnosProcesados.filter(a => a.estadoCiclo === 'VENCE_HOY' || a.estadoCiclo === 'VENCE_PRONTO').length,
      vencidos: alumnosProcesados.filter(a => a.estadoCiclo === 'VENCIDO').length,
      alDia: alumnosProcesados.filter(a => a.estadoCiclo === 'AL_DIA').length,
      individuales: alumnosProcesados.filter(a => a.estadoCiclo === 'INDIVIDUAL').length,
    };
  }, [alumnosProcesados]);

  // Filtrado y búsqueda
  const filteredAlumnos = useMemo(() => {
    const searchClean = searchTerm.trim().toLowerCase();
    const palabrasBusqueda = searchClean ? searchClean.split(/\s+/) : [];

    return alumnosProcesados
      .filter(alumno => {
        // Filtro de búsqueda
        if (palabrasBusqueda.length > 0) {
          const nombreCompleto = (alumno.nombre_completo || '').toLowerCase();
          const dni = (alumno.dni || '').toString();
          const sede = (alumno.principal?.sede || '').toLowerCase();
          const horario = (alumno.principal?.horario || '').toLowerCase();

          const coincide = palabrasBusqueda.every(p =>
            nombreCompleto.includes(p) || dni.includes(p) || sede.includes(p) || horario.includes(p)
          );
          if (!coincide) return false;
        }

        // Filtro por pestaña
        if (filterTab === 'vence_pronto') {
          return alumno.estadoCiclo === 'VENCE_HOY' || alumno.estadoCiclo === 'VENCE_PRONTO';
        }
        if (filterTab === 'vencidos') {
          return alumno.estadoCiclo === 'VENCIDO';
        }
        if (filterTab === 'al_dia') {
          return alumno.estadoCiclo === 'AL_DIA';
        }
        if (filterTab === 'individual') {
          return alumno.estadoCiclo === 'INDIVIDUAL';
        }
        return true; // 'todos'
      })
      .sort((a, b) => {
        // Orden de prioridad: Vencen hoy primero, luego los que vencen pronto, luego vencidos, luego al día
        const ordenPrioridad = { VENCE_HOY: 1, VENCE_PRONTO: 2, VENCIDO: 3, AL_DIA: 4, INDIVIDUAL: 5 };
        const prioA = ordenPrioridad[a.estadoCiclo] || 99;
        const prioB = ordenPrioridad[b.estadoCiclo] || 99;

        if (prioA !== prioB) return prioA - prioB;
        if (a.diasRestantes !== null && b.diasRestantes !== null) {
          return a.diasRestantes - b.diasRestantes;
        }
        return (a.nombre_completo || '').localeCompare(b.nombre_completo || '');
      });
  }, [alumnosProcesados, searchTerm, filterTab]);

  if (loading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-3">
        <Loader2 className="animate-spin text-brand-primary" size={44} />
        <p className="text-xs font-black text-brand-primary uppercase tracking-widest italic">
          Cargando radar de días de corte...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12 px-2 sm:px-4">

      {/* HEADER PRINCIPAL */}
      <div className="bg-gradient-to-r from-brand-primary via-brand-primary-light to-brand-primary-dark rounded-[2rem] p-6 sm:p-8 shadow-xl text-white flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center gap-2 bg-brand-accent text-white text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-widest">
            <CalendarClock size={12} /> Control de Membresías y Vigencia
          </span>
          <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight italic text-white leading-none">
            Días de Corte de Alumnos
          </h1>
          <p className="text-brand-primary-soft/70 text-xs sm:text-sm font-medium max-w-2xl">
            Supervisa el estado de ciclo de cada integrante de tus clases. Identifica a tiempo quiénes vencen pronto para recordarles la renovación de su matrícula.
          </p>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs font-black uppercase tracking-wider text-brand-primary-soft flex items-center gap-2 shrink-0">
          <Clock size={16} className="text-brand-accent" />
          <span>Ciclo estándar: 4 clases / 30 días</span>
        </div>
      </div>

      {/* TARJETAS DE MÉTRICAS RÁPIDAS (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total alumnos */}
        <button
          type="button"
          onClick={() => setFilterTab('todos')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'todos'
              ? 'bg-brand-primary-soft/70 border-brand-primary ring-2 ring-brand-primary/20 shadow-sm'
              : 'bg-brand-surface border-brand-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Alumnos</span>
            <UserCircle size={18} className="text-brand-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-brand-primary mt-1">{metricas.total}</p>
          <span className="text-[10px] text-slate-400 font-bold uppercase">En tus horarios</span>
        </button>

        {/* Vencen Pronto / Hoy (Alerta) */}
        <button
          type="button"
          onClick={() => setFilterTab('vence_pronto')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'vence_pronto'
              ? 'bg-brand-accent-soft border-brand-accent ring-2 ring-brand-accent/30 shadow-sm'
              : metricas.vencePronto > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-brand-accent'
              : 'bg-brand-surface border-brand-border'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Vencen Pronto / Hoy</span>
            <AlertTriangle size={18} className="text-brand-accent animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-brand-accent-dark mt-1">{metricas.vencePronto}</p>
          <span className="text-[10px] text-amber-700 font-bold uppercase">Requieren aviso de renovación</span>
        </button>

        {/* Ciclo Vencido */}
        <button
          type="button"
          onClick={() => setFilterTab('vencidos')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'vencidos'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-brand-surface border-brand-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-800">Ciclo Vencido</span>
            <AlertCircle size={18} className="text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">{metricas.vencidos}</p>
          <span className="text-[10px] text-rose-600 font-bold uppercase">Membresía caducada</span>
        </button>

        {/* Ciclo al Día */}
        <button
          type="button"
          onClick={() => setFilterTab('al_dia')}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer ${
            filterTab === 'al_dia'
              ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20 shadow-sm'
              : 'bg-brand-surface border-brand-border hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Al Día</span>
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">{metricas.alDia}</p>
          <span className="text-[10px] text-emerald-600 font-bold uppercase">Ciclos activos normales</span>
        </button>
      </div>

      {/* BANNER ORIENTATIVO DEL COORDINADOR */}
      <div className="bg-gradient-to-r from-brand-primary-soft to-brand-primary-soft/50 border border-brand-primary/20 p-4 sm:p-5 rounded-2xl flex items-start gap-3 shadow-xs">
        <Info size={20} className="text-brand-primary shrink-0 mt-0.5" />
        <div className="text-xs text-brand-primary-dark leading-relaxed font-medium">
          <strong className="font-black text-brand-heading uppercase tracking-wide">Sentido del Radar de Corte:</strong>{' '}
          Los alumnos con etiqueta <span className="bg-brand-accent-soft text-brand-accent-dark font-black px-1.5 py-0.5 rounded">VENCE HOY</span> o{' '}
          <span className="bg-amber-100 text-amber-800 font-black px-1.5 py-0.5 rounded">VENCE PRONTO</span> están cursando su última semana de ciclo. Recuerda informarles en la cancha que deben renovar su matrícula en la plataforma para asegurar su lugar en el siguiente mes.
        </div>
      </div>

      {/* BARRA DE HERRAMIENTAS: BÚSQUEDA Y PESTAÑAS DE FILTRO */}
      <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Buscador en tiempo real */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Buscar por Nombre, DNI, Sede u Horario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-brand-primary outline-none transition-all"
          />
        </div>

        {/* Pestañas de filtrado (Scroll horizontal en móvil) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          <button
            type="button"
            onClick={() => setFilterTab('todos')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              filterTab === 'todos'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({metricas.total})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('vence_pronto')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              filterTab === 'vence_pronto'
                ? 'bg-brand-accent text-white shadow-xs'
                : 'bg-brand-accent-soft text-brand-accent-dark hover:bg-brand-accent-soft'
            }`}
          >
            Por Vencer ({metricas.vencePronto})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('vencidos')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              filterTab === 'vencidos'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Vencidos ({metricas.vencidos})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('al_dia')}
            className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
              filterTab === 'al_dia'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Al Día ({metricas.alDia})
          </button>

          {metricas.individuales > 0 && (
            <button
              type="button"
              onClick={() => setFilterTab('individual')}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                filterTab === 'individual'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Individuales ({metricas.individuales})
            </button>
          )}
        </div>
      </div>

      {/* CONTENIDO: RESPONSIVE (Tarjetas en móvil, Tabla en desktop) */}
      <div className="bg-brand-surface rounded-[2rem] border border-brand-border shadow-md overflow-hidden">

        {/* VISTA MÓVIL (Cards elegantes para pantallas pequeñas) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredAlumnos.map(alumno => {
            const principal = alumno.principal;

            return (
              <div key={alumno.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-brand-primary uppercase text-sm leading-tight">
                      {alumno.nombre_completo}
                    </h4>
                    <button
                      type="button"
                      onClick={() => handleCopyDni(alumno.dni)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-bold mt-0.5 hover:text-brand-primary"
                    >
                      <span>DNI: {alumno.dni || 'S/D'}</span>
                      {copiedDni === alumno.dni ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    </button>
                  </div>

                  {/* Badge de Estado */}
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                      alumno.estadoCiclo === 'VENCE_HOY'
                        ? 'bg-brand-accent text-white shadow-xs animate-pulse'
                        : alumno.estadoCiclo === 'VENCE_PRONTO'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : alumno.estadoCiclo === 'VENCIDO'
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : alumno.estadoCiclo === 'INDIVIDUAL'
                        ? 'bg-brand-primary-soft text-brand-primary-dark'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {alumno.etiquetaTiempo}
                  </span>
                </div>

                {/* Sede y Horarios */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-bold text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-black">
                    <MapPin size={13} className="text-brand-accent" />
                    <span>{principal?.sede || 'Sede no especificada'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold pl-4">
                    {alumno.contratos?.map((c, i) => c.horario).filter(Boolean).join(' • ') || 'Sin horario asignado'}
                  </div>
                </div>

                {/* Fecha de corte */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Fecha de Corte:</span>
                  <span className={`font-black ${alumno.estadoCiclo === 'VENCIDO' ? 'text-rose-600' : 'text-brand-primary'}`}>
                    {alumno.esIndividual
                      ? 'No aplica (Clase Única)'
                      : alumno.fechaCorte
                      ? format(alumno.fechaCorte, "dd 'de' MMMM, yyyy", { locale: es })
                      : '---'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* VISTA DESKTOP (Tabla espaciosa y pulida) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-brand-border-soft text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                <th className="px-6 py-4">Atleta</th>
                <th className="px-6 py-4 text-center">Documento</th>
                <th className="px-6 py-4">Sede y Horarios Asignados</th>
                <th className="px-6 py-4 text-center">Fecha Límite (Corte)</th>
                <th className="px-6 py-4 text-center">Estado del Ciclo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAlumnos.map((alumno) => {
                const principal = alumno.principal;

                return (
                  <tr key={alumno.id} className="hover:bg-brand-primary-soft/30 transition-colors group">
                    {/* Alumno */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-primary to-brand-primary text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                          {alumno.nombre_completo ? alumno.nombre_completo.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <p className="font-black text-brand-primary uppercase text-xs group-hover:text-brand-primary transition-colors">
                            {alumno.nombre_completo}
                          </p>
                          <span className="text-[10px] text-slate-400 font-bold">
                            ID Alumno #{alumno.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* DNI con botón de copiar */}
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleCopyDni(alumno.dni)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                        title="Clic para copiar DNI"
                      >
                        <span>{alumno.dni || 'S/D'}</span>
                        {copiedDni === alumno.dni ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} className="text-slate-400 group-hover:text-slate-600" />
                        )}
                      </button>
                    </td>

                    {/* Sede y Horarios */}
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <span className="inline-block text-[11px] font-black text-slate-800 uppercase">
                          {principal?.sede || 'Sede no asignada'}
                        </span>
                        <div className="text-[10px] text-slate-500 font-bold flex flex-wrap gap-1">
                          {alumno.contratos && alumno.contratos.length > 0 ? (
                            alumno.contratos
                              .map(c => c.horario)
                              .filter(Boolean)
                              .filter((h, i, arr) => arr.indexOf(h) === i)
                              .map((horario, index) => (
                                <span key={index} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                                  {horario}
                                </span>
                              ))
                          ) : (
                            <span>Sin horarios registrados</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Fecha de corte */}
                    <td className="px-6 py-4 text-center">
                      {alumno.esIndividual ? (
                        <span className="text-[11px] font-bold text-slate-400 italic">
                          Clase Única
                        </span>
                      ) : alumno.fechaCorte ? (
                        <div className="inline-flex flex-col items-center">
                          <span className={`font-black text-xs ${
                            alumno.estadoCiclo === 'VENCIDO'
                              ? 'text-rose-600'
                              : alumno.estadoCiclo === 'VENCE_HOY'
                              ? 'text-brand-accent-dark font-black'
                              : 'text-slate-800'
                          }`}>
                            {format(alumno.fechaCorte, "dd 'de' MMMM", { locale: es })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold">
                            {format(alumno.fechaCorte, 'yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>

                    {/* Estado del ciclo con badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                          alumno.estadoCiclo === 'VENCE_HOY'
                            ? 'bg-brand-accent text-white shadow-xs animate-pulse'
                            : alumno.estadoCiclo === 'VENCE_PRONTO'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : alumno.estadoCiclo === 'VENCIDO'
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : alumno.estadoCiclo === 'INDIVIDUAL'
                            ? 'bg-brand-primary-soft text-brand-primary-dark'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {alumno.etiquetaTiempo}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ESTADO VACÍO */}
        {filteredAlumnos.length === 0 && (
          <div className="text-center py-20 px-4 space-y-3">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h4 className="text-base font-black text-slate-700 uppercase tracking-tight">
              No se encontraron alumnos
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              No hay atletas que coincidan con el filtro <strong className="text-brand-primary font-black uppercase">"{filterTab}"</strong> o con el término de búsqueda actual.
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs font-black uppercase text-brand-accent hover:underline pt-2"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default DiaCorte;