import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Send, ArrowLeft, MapPin, Building2, ChevronLeft, ChevronRight, Zap, Shirt, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

import StudentEnrollmentGroup from '../../components/student/StudentEnrollmentGroup';
import OutstandingDebtAlert from '../../components/student/OutstandingDebtAlert';
import WeeklyTimeline from '../../components/student/WeeklyTimelineEnrollment';
import EnrollmentDateModal from '../../components/student/EnrollmentDateModal';

const Enrollment = () => {
  const { userId } = useAuth();
  const scrollRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [incluyeCamiseta, setIncluyeCamiseta] = useState(false);
  const [pendingPayment, setPendingPayment] = useState(null);
  const [activeSede, setActiveSede] = useState(null);
  const [previewModal, setPreviewModal] = useState({ open: false, data: null });

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
      
      if (resH.ok) {
        const activos = dataH.data?.filter(h => h.activo) || [];
        setHorarios(activos);
        if (activos.length > 0) {
          const sedesUnicas = [...new Set(activos.map(h => h.cancha?.sede?.nombre))].sort();
          setActiveSede(sedesUnicas[0]);
        }
      }
      if (resC.ok) {
        const deuda = dataC.data?.find(c => c.alumno_id == userId && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL'));
        setPendingPayment(deuda);
      }
    } catch (e) { toast.error("Error de sincronización Gema"); } finally { setLoading(false); }
  };

  const scroll = (direction) => {
    const { current } = scrollRef;
    const amount = 300;
    current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const sedesDisponibles = useMemo(() => [...new Set(horarios.map(h => h.cancha?.sede?.nombre))].sort(), [horarios]);

  const gruposDeSedeActiva = useMemo(() => {
    if (!activeSede) return [];
    const grupos = {};
    horarios.filter(h => h.cancha?.sede?.nombre === activeSede).forEach(h => {
      const nivel = h.nivel?.nombre || "General";
      const bloque = `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`;
      const key = `${activeSede}-${nivel}-${bloque}`;
      if (!grupos[key]) {
        grupos[key] = { key, nivel, hora: bloque, cancha: h.cancha?.nombre || "Campo Principal", opciones: [] };
      }
      grupos[key].opciones.push(h);
    });
    return Object.values(grupos);
  }, [horarios, activeSede]);

  const agendaSeleccionada = useMemo(() => horarios.filter(h => selectedIds.includes(h.id)), [horarios, selectedIds]);

  const resumenMatricula = useMemo(() => {
    const resumen = {};
    const days = ["", "LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
    agendaSeleccionada.forEach(h => {
      const sede = h.cancha?.sede?.nombre;
      if (!resumen[sede]) resumen[sede] = [];
      resumen[sede].push(days[h.dia_semana]);
    });
    return resumen;
  }, [agendaSeleccionada]);

  const toggleSelection = (id) => {
    const claseNueva = horarios.find(h => h.id === id);
    if (!selectedIds.includes(id)) {
      const choque = agendaSeleccionada.find(h => 
        h.dia_semana === claseNueva.dia_semana && (
          (claseNueva.hora_inicio >= h.hora_inicio && claseNueva.hora_inicio < h.hora_fin) ||
          (claseNueva.hora_fin > h.hora_inicio && claseNueva.hora_fin <= h.hora_fin)
        )
      );
      if (choque) return toast.error("¡Cruce de horarios detectado!");
    }
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const iniciarProcesoMatricula = async () => {
    if (selectedIds.length === 0) return toast.error("Selecciona tus clases");
    setSubmitting(true);
    try {
      const diasSeleccionados = agendaSeleccionada.map(h => h.dia_semana);
      const response = await apiFetch.post(API_ROUTES.ASISTENCIAS.PREVISUALIZAR, { dia_semana: diasSeleccionados });
      const result = await response.json();
      if (response.ok) setPreviewModal({ open: true, data: result.data });
      else toast.error(result.message);
    } catch (e) { toast.error("Error de conexión"); } finally { setSubmitting(false); }
  };

  const confirmarMatriculaFinal = async (fechaElectiva) => {
    setPreviewModal({ open: false, data: null });
    setSubmitting(true);
    try {
      const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.BASE, { 
        alumno_id: userId, 
        horario_ids: selectedIds,
        fecha_inicio_electiva: fechaElectiva,
        incluye_camiseta: incluyeCamiseta
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Sede y Horario conforme", { 
          icon: <CheckCircle className="text-green-500" />,
          duration: 5000 
        });
        await fetchInitialData();
        setSelectedIds([]);
        setIncluyeCamiseta(false);
      } else {
        toast.error(result.message || "Error al procesar", { duration: 6000 });
      }
    } catch (error) { toast.error("Error de servidor"); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#1e3a8a]" size={48} /></div>;

  return (
    <div className={`min-h-screen bg-[#f8fafc] px-4 md:px-8 transition-all duration-500 ${selectedIds.length > 0 ? 'pb-96 md:pb-60' : 'pb-24'}`}>
      <div className="max-w-6xl mx-auto py-8">
        
        <header className="mb-8">
          <Link to="/dashboard/student" className="inline-flex items-center gap-1 text-slate-400 hover:text-[#1e3a8a] mb-4 text-[10px] font-black uppercase italic tracking-widest">
            <ArrowLeft size={12} /> Dashboard
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-[#1e3a8a] italic uppercase tracking-tighter leading-none">
            Matrícula <span className="text-orange-500">Gema</span>
          </h1>
        </header>

        <OutstandingDebtAlert pendingPayment={pendingPayment} />

        {/* NAVEGADOR DE SEDES */}
        <div className="relative mb-12 group">
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-[#1e3a8a] hover:text-white transition-all -ml-6 border border-slate-100">
            <ChevronLeft size={20} />
          </button>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-4 px-2 scroll-smooth">
            {sedesDisponibles.map(sede => (
              <button
                key={sede}
                onClick={() => setActiveSede(sede)}
                className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase italic transition-all duration-500 border-2 flex-shrink-0 flex items-center gap-3 ${
                  activeSede === sede ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <Building2 size={16} /> {sede}
              </button>
            ))}
          </div>
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white p-3 rounded-full shadow-xl hidden md:group-hover:flex hover:bg-[#1e3a8a] hover:text-white transition-all -mr-6 border border-slate-100">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* LISTADO DE CLASES */}
        <div className="space-y-6 mb-12">
          <div className="flex items-center gap-4 mb-8 px-2">
            <h2 className="text-[12px] font-black text-[#1e3a8a] uppercase tracking-[0.4em] italic flex items-center gap-3">
              <MapPin size={18} className="text-orange-500" /> Sedes: {activeSede}
            </h2>
            <div className="h-px bg-slate-200 flex-1"></div>
          </div>
          {gruposDeSedeActiva.map((grupo) => (
            <StudentEnrollmentGroup key={grupo.key} group={grupo} selectedIds={selectedIds} onToggle={toggleSelection} />
          ))}
        </div>

        {/* EL TIMELINE AHORA VA DEBAJO DE TODO */}
        <div className="mt-16">
           <div className="flex items-center gap-4 mb-8 px-2">
              <h2 className="text-[12px] font-black text-[#1e3a8a] uppercase tracking-[0.4em] italic flex items-center gap-3">
                <Zap size={18} className="text-orange-500" /> Tu Horario Semanal
              </h2>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>
           <WeeklyTimeline agendaSeleccionada={agendaSeleccionada} />
        </div>

        {/* FOOTER FLOTANTE */}
        {!pendingPayment && selectedIds.length > 0 && (
          <div className="fixed bottom-24 md:bottom-10 inset-x-0 flex flex-col items-center z-[50] px-4 pointer-events-none">
            
            {/* CHECKBOX CAMISETA: ¡QUIERO MI CAMISETA! */}
            <label className="pointer-events-auto flex items-center gap-4 bg-[#0f172a] text-white px-6 py-3.5 rounded-[1.8rem] mb-3 border-2 border-white/20 shadow-2xl animate-fade-in-up cursor-pointer hover:bg-slate-900 transition-all active:scale-95 group">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={incluyeCamiseta}
                  onChange={(e) => setIncluyeCamiseta(e.target.checked)}
                  className="peer appearance-none w-6 h-6 border-2 border-white/30 rounded-lg checked:bg-orange-500 checked:border-orange-500 transition-all"
                />
                <Shirt size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase italic leading-none group-hover:text-orange-400 transition-colors">¡Quiero mi camiseta!</span>
                <span className="text-[8px] font-bold text-blue-300 uppercase tracking-widest mt-1">+ S/ 50.00 ADICIONALES</span>
              </div>
            </label>

            {/* PANEL RESUMEN */}
            <div className="bg-[#1e3a8a] text-white p-4 rounded-[2rem] shadow-2xl border-4 border-white mb-3 pointer-events-auto flex gap-4 items-center animate-fade-in-up w-full max-w-md">
              <div className="bg-orange-500 p-2.5 rounded-xl shrink-0"><Zap size={20} fill="white" /></div>
              <div className="flex flex-1 gap-3 divide-x divide-white/10 overflow-hidden">
                {Object.entries(resumenMatricula).map(([sede, dias]) => (
                  <div key={sede} className="pl-3 first:pl-0 truncate">
                    <p className="text-[8px] font-black uppercase italic text-blue-300 truncate">{sede}</p>
                    <p className="text-[11px] font-black italic uppercase leading-none">{dias.join('+')}</p>
                  </div>
                ))}
              </div>
              <div className="pl-3 border-l border-white/10 text-center shrink-0">
                <p className="text-[8px] font-black uppercase text-orange-400">Total</p>
                <p className="text-xl font-black italic leading-none">{selectedIds.length}</p>
              </div>
            </div>

            {/* BOTÓN FINALIZAR */}
            <button
              onClick={iniciarProcesoMatricula}
              disabled={submitting}
              className="pointer-events-auto flex items-center justify-center gap-4 px-12 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl bg-orange-500 text-white hover:scale-105 active:scale-95 shadow-orange-500/40 border-4 border-white w-full max-w-sm"
            >
              {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
              <span className="tracking-widest text-[12px]">Finalizar Selección</span>
            </button>
          </div>
        )}

        <EnrollmentDateModal 
          isOpen={previewModal.open} previewData={previewModal.data} 
          onClose={() => setPreviewModal({ open: false, data: null })} 
          onConfirm={confirmarMatriculaFinal} 
        />
      </div>
    </div>
  );
};

export default Enrollment;