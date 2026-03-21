import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, ArrowLeft, MapPin, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

import StudentEnrollment from '../../components/student/StudentEnrollment';
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import WeeklyTimeline from '../../components/student/WeeklyTimelineEnrollment';

const Enrollment = () => {
  const { user, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [sedeFilter, setSedeFilter] = useState('TODAS');
  const [diaFilter, setDiaFilter] = useState(1);

  useEffect(() => { if (userId) fetchInitialData(); }, [userId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resH, resC] = await Promise.all([
        apiFetch.get(API_ROUTES.HORARIOS.BASE),
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.BASE)
      ]);

      const dataH = await resH.json();
      const dataC = await resC.json();

      if (resH.ok) setHorarios(dataH.data?.filter(h => h.activo) || []);

      if (resC.ok) {
        // 🔥 USAMOS == PARA EVITAR PROBLEMAS DE STRING VS NUMBER
        const deudaActiva = dataC.data?.find(c =>
          c.alumno_id == userId &&
          (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL') // El Liquidador Parcial también debe bloquear
        );
        setPendingPayment(deudaActiva);
      }
    } catch (e) {
      toast.error("Error de sincronización Gema");
    } finally {
      setLoading(false);
    }
  };

  const agendaSeleccionada = useMemo(() => horarios.filter(h => selectedIds.includes(h.id)), [horarios, selectedIds]);

  const toggleSelection = (id) => {
    const claseNueva = horarios.find(h => h.id === id);
    if (!selectedIds.includes(id)) {
      const choque = agendaSeleccionada.find(h => {
        return h.dia_semana === claseNueva.dia_semana && (
          (claseNueva.hora_inicio >= h.hora_inicio && claseNueva.hora_inicio < h.hora_fin) ||
          (claseNueva.hora_fin > h.hora_inicio && claseNueva.hora_fin <= h.hora_fin) ||
          (h.hora_inicio >= claseNueva.hora_inicio && h.hora_inicio < claseNueva.hora_fin)
        );
      });

      if (choque) {
        return toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#1e3a8a] shadow-2xl rounded-[2rem] pointer-events-auto flex ring-4 ring-orange-500`}>
            <div className="flex-1 p-6 flex items-start">
              <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="ml-4">
                <p className="text-xs font-black text-white uppercase italic">Cruce de horario</p>
                <p className="text-[10px] font-bold text-blue-100 uppercase mt-1">Ya elegiste {choque.nivel?.nombre} en este bloque.</p>
              </div>
            </div>
          </div>
        ));
      }
    }
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // ✅ MANEJO DE INSCRIPCIÓN CON ERROR DE SIMULTANEIDAD
  const handleEnrollment = async () => {
    if (selectedIds.length === 0) return toast.error("Selecciona tus clases");
    setSubmitting(true);

    try {
      const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.BASE, {
        alumno_id: userId,
        horario_ids: selectedIds
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("¡Inscripción Gema Completada!", {
          icon: '🏆',
          style: { borderRadius: '20px', background: '#1e3a8a', color: '#fff' }
        });
        await fetchInitialData();
        setSelectedIds([]);
      } else {
        // 🚨 DISEÑO PREMIUM PARA ERRORES GEMA
        toast.error(result.message || "Error al procesar", {
          duration: 5000,
          icon: null, // Quitamos el icono predeterminado para usar el nuestro personalizado
          style: {
            background: '#ffffff', // Fondo blanco para que el texto sea legible
            color: '#1e3a8a',      // Texto en Azul Gema
            fontWeight: '900',     // Peso extra para el estilo "Black"
            borderRadius: '1.5rem',
            padding: '16px 24px',
            borderLeft: '8px solid #f97316', // Solo una barra lateral naranja de advertencia
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            fontSize: '11px',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            maxWidth: '400px',
            italic: 'italic'
          }
        });
      }
    } catch (error) {
      toast.error("Error crítico: Verifica tu conexión con el Club");
    } finally {
      setSubmitting(false);
    }
  };

  const horariosFiltrados = useMemo(() => {
    return horarios.filter(h => (sedeFilter === 'TODAS' || h.cancha?.sede?.nombre === sedeFilter) && h.dia_semana === diaFilter);
  }, [horarios, sedeFilter, diaFilter]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-40 px-4 md:px-8">
      <div className="max-w-6xl mx-auto py-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] transition-all mb-4 text-[10px] font-black uppercase tracking-widest italic"><ArrowLeft size={14} /> Volver</Link>
            <h1 className="text-4xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">
              Inscripción <span className="text-orange-500 italic">Temporada</span>
            </h1>
          </div>
        </header>

        <WeeklyTimeline agendaSeleccionada={agendaSeleccionada} />
        <OutstandingDebtAlert pendingPayment={pendingPayment} />

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="flex bg-white p-2 rounded-full shadow-md border border-slate-100 overflow-x-auto w-full md:w-auto scrollbar-hide">
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <button key={d} onClick={() => setDiaFilter(d)} className={`px-8 py-3 rounded-full text-[10px] font-black transition-all uppercase italic flex-shrink-0 ${diaFilter === d ? 'bg-[#1e3a8a] text-white shadow-xl' : 'text-slate-400 hover:text-[#1e3a8a]'}`}>
                {['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'][d - 1]}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 bg-[#1e3a8a] px-6 py-3 rounded-full shadow-lg">
            <MapPin size={16} className="text-orange-500" />
            <select value={sedeFilter} onChange={(e) => setSedeFilter(e.target.value)} className="text-[10px] font-black uppercase outline-none bg-transparent text-white cursor-pointer">
              <option value="TODAS" className="bg-[#1e3a8a]">FILTRAR POR SEDE</option>
              {[...new Set(horarios.map(h => h.cancha?.sede?.nombre))].map(s => <option key={s} value={s} className="bg-[#1e3a8a]">{s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {horariosFiltrados.map((h) => (
            <StudentEnrollment key={h.id} schedule={h} isSelected={selectedIds.includes(h.id)} onSelect={toggleSelection} />
          ))}
        </div>

        {/* CONTENEDOR DEL BOTÓN AJUSTADO PARA MÓVIL */}
        {!pendingPayment && (
          <div className="fixed bottom-24 md:bottom-10 inset-x-0 flex justify-center z-[110] px-4 pointer-events-none">
            <button
              onClick={handleEnrollment}
              disabled={selectedIds.length === 0 || submitting}
              className={`pointer-events-auto flex items-center justify-center gap-4 px-10 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl w-full max-w-sm md:w-auto ${
                selectedIds.length > 0 
                ? 'bg-orange-500 text-white hover:scale-105 active:scale-95' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              <span className="tracking-widest text-xs">Confirmar Matrícula ({selectedIds.length})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Enrollment;