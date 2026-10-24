import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/shared/ConfirmModal';

// Servicios y Utils
import recuperacionService from '../../services/recuperacion.service';
import horarioService from '../../services/horario.service';
import { calcularSlotsDisponibles } from './recoveries/slotFiltering';

// Componentes
import RecoveryTicketList from '../../components/student/Recoveries/RecoveryTicketList';
import AvailableSlotsGrid from '../../components/student/Recoveries/AvailableSlotsGrid';
import RecoveryHistoryList from '../../components/student/Recoveries/RecoveryHistoryList';
import RecoveryStatsCards from './recoveries/RecoveryStatsCards';
import RecoveryTabs from './recoveries/RecoveryTabs';
import RecoveryConfirmToast from './recoveries/RecoveryConfirmToast';
import { BRAND_COLORS } from "../../config/themeColors.js";

const StudentRecoveries = () => {
    const { userId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('agendar');

    // Data
    const [tickets, setTickets] = useState([]);
    const [horariosPatron, setHorariosPatron] = useState([]);
    const [historial, setHistorial] = useState([]);

    // Stats para detalle de recuperaciones del alumno
    const [stats, setStats] = useState({
        normalesUsadas: 0,
        normalesLimite: 2,
        lesionUsadas: 0
    });

    // Interacción
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [filtroSede, setFiltroSede] = useState('');
    const [cancelTargetId, setCancelTargetId] = useState(null);

    // 1. Cargar datos iniciales
    const loadData = async () => {
        try {
            setLoading(true);

            // 🔥 FIX: Blindamos cada petición individualmente para que un 404 no rompa toda la página
            const [ticketsData, horariosData, historialData] = await Promise.all([
                recuperacionService.obtenerPendientes().catch(e => {
                    console.warn("No se pudieron cargar tickets:", e);
                    return { stats: {}, data: [] }; // Estructura de fallback
                }),
                // 🛡️ ESCUDO AQUÍ: Si no tiene inscripción vigente, devolvemos [] y la app sobrevive
                horarioService.obtenerDisponiblesPorNivel().catch(err => {
                    console.warn("Aviso: El alumno no tiene inscripción vigente para buscar nivel.", err);
                    return [];
                }),
                recuperacionService.obtenerHistorial().catch(e => {
                    console.warn("No se pudo cargar el historial:", e);
                    return [];
                })
            ]);

            // Asignamos la data (asegurando que si viene undefined, sea un array)
            setTickets(ticketsData.data || ticketsData || []);
            setHorariosPatron(horariosData || []);
            setHistorial(historialData || []);

            if (ticketsData.stats) {
                setStats(ticketsData.stats);
            }

        } catch (error) {
            toast.error("Error crítico cargando información de recuperaciones");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) loadData();
    }, [userId]);

    // 2. Cuando selecciono un ticket, calculo los horarios disponibles
    useEffect(() => {
        setFiltroSede('');
        if (selectedTicket && horariosPatron.length > 0) {
            const slotsLimpios = calcularSlotsDisponibles(horariosPatron, historial, stats);
            setAvailableSlots(slotsLimpios);
            toast.success("Horarios disponibles cargados 👇", { id: 'slots-loaded' });
        } else {
            setAvailableSlots([]);
        }
    }, [selectedTicket, horariosPatron, historial, stats]);

    const confirmarRecuperacion = (slot) => {
        toast((t) => (
            <RecoveryConfirmToast t={t} slot={slot} onConfirm={() => ejecutarReserva(slot)} />
        ), {
            duration: 6000,
            position: 'bottom-center',
            style: {
                minWidth: '320px',
                borderRadius: '24px',
                border: `1px solid ${BRAND_COLORS['border-soft']}`,
                padding: '16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
            },
        });
    };

    const ejecutarReserva = async (slot) => {
        try {
            const promise = recuperacionService.agendar({
                alumnoId: userId,
                recuperacionId: selectedTicket.id,
                horarioDestinoId: slot.horarioData.id,
                fechaProgramada: new Date(slot.fecha).toISOString(),
            });

            await toast.promise(promise, {
                loading: 'Procesando canje...',
                success: '¡Clase agendada exitosamente! 🎉',
                error: (err) => err.message || "Error al agendar"
            });

            setSelectedTicket(null);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSlotClick = async (slot) => {
        if (!selectedTicket) return;
        confirmarRecuperacion(slot);
    };

    const handleCancelRecovery = (recuperacionId) => {
        setCancelTargetId(recuperacionId);
    };

    const executeCancelRecovery = async () => {
        const recuperacionId = cancelTargetId;
        setCancelTargetId(null);

        try {
            const promise = recuperacionService.cancelar(recuperacionId);

            await toast.promise(promise, {
                loading: 'Cancelando recuperación...',
                success: 'Recuperación cancelada. Tienes un ticket pendiente de nuevo.',
                error: (err) => err.message
            });

            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const alLimite = stats.recuperacion_usadas >= stats.limite_permitido;

    const sedesUnicas = [...new Set(availableSlots.map(slot => slot.horarioData?.cancha?.sede?.nombre).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const slotsFiltrados = availableSlots.filter(slot => {
        if (filtroSede === '') return true;
        const nombreSede = slot.horarioData?.cancha?.sede?.nombre;
        return nombreSede === filtroSede;
    });

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-all mb-4 text-[10px] font-black uppercase tracking-widest italic">
                <ArrowLeft size={14} /> Volver
            </Link>

            <div className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter">
                            Centro de <span className="text-brand-accent">Recuperación</span>
                        </h1>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors border border-brand-border text-brand-muted">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <RecoveryStatsCards stats={stats} alLimite={alLimite} />

            <RecoveryTabs activeTab={activeTab} onChange={setActiveTab} />

            {activeTab === 'agendar' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Alerta si no hay paquete activo */}
                    {horariosPatron.length === 0 && !loading && (
                        <div className="mb-8 p-6 bg-brand-accent-soft border border-brand-accent/30 rounded-[2rem] flex items-center gap-4">
                            <AlertCircle className="text-brand-accent shrink-0" size={32} />
                            <div>
                                <h4 className="text-brand-primary font-black uppercase italic text-sm tracking-widest">Atención</h4>
                                <p className="text-brand-body font-medium text-xs">No tienes una inscripción vigente. Para agendar una recuperación, necesitas tener un paquete activo.</p>
                            </div>
                        </div>
                    )}

                    <div className="mb-10">
                        <h3 className="text-brand-accent-dark font-black uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                            1. Selecciona una falta pendiente
                        </h3>
                        <RecoveryTicketList
                            tickets={tickets.data || tickets} // Manejo seguro
                            selectedTicket={selectedTicket}
                            onSelect={setSelectedTicket}
                        />
                    </div>

                    {selectedTicket && horariosPatron.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 border-t border-brand-border pt-8 gap-4">
                                <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    2. Elige tu nueva clase
                                </h3>
                                {availableSlots.length > 0 && (
                                    <div className="flex items-center gap-2 bg-brand-bg px-3 py-2 rounded-xl border border-brand-border">
                                        <Filter size={14} className="text-brand-muted" />
                                        <select
                                            value={filtroSede}
                                            onChange={(e) => setFiltroSede(e.target.value)}
                                            className="bg-transparent border-none text-brand-primary text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                                        >
                                            <option value="">TODAS LAS SEDES</option>
                                            {sedesUnicas.map((sede, idx) => (
                                                <option key={idx} value={sede}>{sede}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {slotsFiltrados.length > 0 ? (
                                <AvailableSlotsGrid
                                    slots={slotsFiltrados}
                                    onSlotClick={handleSlotClick}
                                    loading={false}
                                />
                            ) : (
                                <div className="p-8 rounded-3xl border border-dashed border-slate-300 text-center text-brand-muted text-[10px] font-black uppercase tracking-widest italic bg-brand-surface">
                                    No hay horarios disponibles en esta sede o nivel.
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedTicket && (tickets.data?.length > 0 || tickets.length > 0) && horariosPatron.length > 0 && (
                        <div className="mt-8 p-6 rounded-3xl border border-dashed border-slate-300 text-center text-brand-muted bg-brand-surface">
                            <AlertCircle className="mx-auto mb-3 opacity-50" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Selecciona un ticket arriba para ver dónde puedes recuperar.</span>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <RecoveryHistoryList
                        historial={historial}
                        onCancel={handleCancelRecovery}
                    />
                </div>
            )}

            <ConfirmModal
                isOpen={!!cancelTargetId}
                onClose={() => setCancelTargetId(null)}
                onConfirm={executeCancelRecovery}
                title="¿Cancelar recuperación?"
                message="El ticket volverá a tus pendientes."
                iconType="danger"
                confirmText="Sí, cancelar"
            />
        </div>
    );
};

export default StudentRecoveries;
