import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Clock, CheckCircle2, AlertCircle, XCircle, Trash2, 
  Loader2, Info, MapPin, Activity, Calendar, 
  Trophy, Star, Target, ArrowRight
} from 'lucide-react';
import apiFetch from '../../interceptors/api.js';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

// 1. IMPORTAMOS EL CONTEXTO DE AUTENTICACIÓN
import { useAuth } from '../../context/AuthContext';

const DIAS_NOMBRES = {
  1: "LUNES", 2: "MARTES", 3: "MIÉRCOLES", 4: "JUEVES", 5: "VIERNES", 6: "SÁBADO", 7: "DOMINGO", 0: "DOMINGO"
};

const MyRegistrations = () => {
  const { user, userId } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fullName = user?.user ? `${user.user.nombres} ${user.user.apellidos}` : "Alumno Gema";

  const fetchRegistrations = async () => {
    if (!userId) return; 

    try {
      setLoading(true);
      const res = await apiFetch.get(`/inscripciones/alumno/${userId}`);
      const resultInsc = await res.json();
      
      if (res.ok) {
        setRegistrations(resultInsc.data || []);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      toast.error("Error de comunicación con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchRegistrations(); 
  }, [userId]);

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    if (isoString.includes('T')) {
      const d = new Date(isoString);
      return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
    }
    return isoString.slice(0, 5);
  };

  // 🔥 LÓGICA MAESTRA: Maneja tanto la Finalización (Activos) como la Cancelación de Paquete (Pendientes)
  const handleAction = async (reg) => {
    const isPending = reg.estado === 'PENDIENTE_PAGO';
    
    const result = await Swal.fire({
      title: `<span class="italic font-black uppercase text-[#1e3a8a]">${isPending ? '¿CANCELAR PAQUETE?' : '¿FINALIZAR CICLO?'}</span>`,
      html: `
        <div class="text-left space-y-4 p-2">
          <div class="p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-2xl shadow-sm">
            <p class="text-[10px] font-black text-orange-700 uppercase italic mb-1">Aviso Importante:</p>
            <p class="text-sm text-orange-900 leading-relaxed">
              ${isPending 
                ? 'Esta reserva es parte de un paquete. Al cancelar, <b>se eliminarán todos los horarios</b> asociados para anular la deuda correctamente.' 
                : 'Tu salida es voluntaria. Las clases pagadas <b>se mantienen</b> hasta fin de mes, pero el cupo se liberará para nuevos atletas.'}
            </p>
          </div>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest text-center">¿Confirmas la operación?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: isPending ? '#ef4444' : '#f97316',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: isPending ? 'SÍ, ELIMINAR PAQUETE' : 'SÍ, FINALIZAR',
      cancelButtonText: 'MANTENER',
      customClass: { popup: 'rounded-[3rem] p-10 shadow-2xl border-4 border-white' }
    });

    if (result.isConfirmed) {
      try {
        // Determinamos el endpoint según si es cancelación total de deuda o retiro de clases pagadas
        const endpoint = isPending 
          ? `/inscripciones/${reg.id}/cancelar-reserva` 
          : `/inscripciones/${reg.id}/finalizar`;

        const res = await apiFetch.patch(endpoint);
        
        if (res.ok) {
          toast.success(isPending ? "Paquete y deuda eliminados" : "Ciclo finalizado correctamente");
          fetchRegistrations(); // Recargamos la lista
        } else {
          const errorData = await res.json();
          toast.error(errorData.message || "Error al procesar la solicitud");
        }
      } catch (error) { 
        toast.error("Error de conexión con el servidor"); 
      }
    }
  };

  const STATE_CONFIG = {
    ACTIVO: { label: 'En Curso', icon: <Target size={14} />, color: 'bg-green-500', bg: 'bg-green-50' },
    POR_VALIDAR: { label: 'Validando', icon: <Clock size={14} />, color: 'bg-yellow-500', bg: 'bg-yellow-50' },
    PENDIENTE_PAGO: { label: 'Por Pagar', icon: <Clock size={14} />, color: 'bg-orange-500', bg: 'bg-orange-50' },
    'PEN-RECU': { label: 'Liquidación', icon: <Activity size={14} />, color: 'bg-blue-500', bg: 'bg-blue-50' },
    FINALIZADO: { label: 'Historial', icon: <XCircle size={14} />, color: 'bg-slate-400', bg: 'bg-slate-50' }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 animate-fade-in-up pb-32">
      
      {/* HEADER DINÁMICO */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-8 mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">
            Mis <span className="text-orange-500">Inscripciones</span>
          </h2>
          <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.4em] mt-3 italic truncate">
            Expediente de Atleta Elite · {fullName} #{userId}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <StatBox icon={<Trophy className="text-orange-500" />} value={registrations.filter(r => r.estado === 'ACTIVO').length} label="Clases Activas" />
          <StatBox icon={<Star className="text-blue-500" />} value={registrations.length} label="Total Historial" />
        </div>
      </div>

      <div className="space-y-16">
        {Object.keys(STATE_CONFIG).map((status) => {
          const items = registrations.filter(r => r.estado === status);
          if (items.length === 0) return null;

          return (
            <section key={status} className="space-y-6 relative">
              <div className="flex items-center gap-4">
                <div className={`px-6 py-2 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white shadow-lg ${STATE_CONFIG[status].color}`}>
                  {STATE_CONFIG[status].icon} {STATE_CONFIG[status].label}
                </div>
                <div className="flex-1 h-[2px] bg-slate-100"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {items.map((reg) => (
                  <div key={reg.id} className="group relative">
                    <div className="absolute inset-0 bg-slate-200 rounded-[3rem] translate-y-2 translate-x-1 group-hover:translate-y-1 transition-transform opacity-20"></div>
                    <div className="bg-white rounded-[3rem] p-6 md:p-8 border border-slate-100 shadow-xl relative overflow-hidden transition-all duration-500 hover:border-orange-200 hover:-translate-y-1">
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
                        <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-[#1e3a8a] transition-all duration-500 shadow-inner">
                          <span className="text-[9px] font-black text-slate-400 uppercase group-hover:text-blue-200 italic mb-1">Día</span>
                          <Calendar size={28} className="text-[#1e3a8a] group-hover:text-white transition-colors" />
                        </div>

                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start w-full">
                            <div>
                              <h4 className="text-2xl md:text-3xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">
                                {DIAS_NOMBRES[reg.horarios_clases?.dia_semana] || 'HORARIO'}
                              </h4>
                              <div className="flex items-center gap-2 mt-3 text-slate-500">
                                <Clock size={14} className="text-orange-500" />
                                <span className="text-[10px] md:text-xs font-black uppercase italic tracking-widest">
                                  {formatTime(reg.horarios_clases?.hora_inicio)} - {formatTime(reg.horarios_clases?.hora_fin)}
                                </span>
                              </div>
                            </div>

                            {/* 🔥 BOTÓN DE ACCIÓN: Solo para Activos o Pendientes de Pago */}
                            {(status === 'ACTIVO' || status === 'PENDIENTE_PAGO') && (
                              <button 
                                onClick={() => handleAction(reg)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-[1.2rem] flex items-center justify-center transition-all shadow-sm border active:scale-95 shrink-0
                                  ${status === 'PENDIENTE_PAGO' 
                                    ? 'bg-orange-50 text-orange-500 border-orange-100 hover:bg-orange-500 hover:text-white' 
                                    : 'bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white'}`}
                              >
                                <Trash2 size={18} strokeWidth={2.5} />
                              </button>
                            )}
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2 md:gap-3">
                            <SmallBadge icon={<MapPin size={12} />} label={reg.horarios_clases?.canchas?.nombre} />
                            <SmallBadge icon={<Activity size={12} />} label={reg.horarios_clases?.niveles_entrenamiento?.nombre} />
                          </div>
                        </div>
                      </div>
                      
                      <img src="/logo.png" className="absolute -right-10 -bottom-10 w-40 opacity-[0.03] rotate-12 pointer-events-none group-hover:opacity-[0.06] transition-opacity" alt="" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {registrations.length === 0 && (
        <div className="bg-white p-12 md:p-24 rounded-[3rem] md:rounded-[4rem] text-center border-4 border-dashed border-slate-100 relative overflow-hidden mt-8">
          <div className="relative z-10">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg md:text-xl font-black text-slate-400 uppercase italic tracking-widest">Sin inscripciones activas</h3>
            <p className="text-[10px] md:text-xs text-slate-400 mt-2 mb-10 font-bold uppercase tracking-tighter">Tu historial de atleta está esperando por tu primer entrenamiento oficial.</p>
            <Link to="/dashboard/student/enrollment" className="inline-flex items-center gap-3 bg-[#1e3a8a] text-white px-8 py-4 rounded-full font-black italic text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-orange-500 transition-all shadow-xl shadow-blue-900/20">
              ¡Inscríbete Ahora! <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, value, label }) => (
  <div className="bg-white px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-3 md:gap-4 flex-1 md:flex-none min-w-[140px]">
    <div className="p-2.5 md:p-3 bg-slate-50 rounded-xl md:rounded-2xl">{icon}</div>
    <div>
      <p className="text-xl md:text-2xl font-black text-[#1e3a8a] leading-none">{value}</p>
      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  </div>
);

const SmallBadge = ({ icon, label }) => (
  <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 text-[9px] md:text-[10px] font-black text-slate-500 uppercase px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl border border-slate-100 italic tracking-tighter">
    <span className="text-orange-500">{icon}</span>
    <span className="truncate">{label || '---'}</span>
  </div>
);

export default MyRegistrations;