import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertCircle, CalendarPlus, History, Activity, ShieldPlus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

// Servicios y Utils
import recuperacionService from '../../services/recuperacion.service';
import horarioService from '../../services/horario.service';
import { generarClasesDisponibles } from '../../utils/schedulerUtils';

// Componentes
import RecoveryTicketList from '../../components/student/Recoveries/RecoveryTicketList';
import AvailableSlotsGrid from '../../components/student/Recoveries/AvailableSlotsGrid';
import RecoveryHistoryList from '../../components/student/Recoveries/RecoveryHistoryList';

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

    // 1. Cargar datos iniciales
    const loadData = async () => {
        try {
            setLoading(true);
            const [ticketsData, horariosData, historialData] = await Promise.all([
                recuperacionService.obtenerPendientes(),
                horarioService.obtenerDisponiblesPorNivel(),
                recuperacionService.obtenerHistorial()
            ]);
            setTickets(ticketsData);
            setHorariosPatron(horariosData);
            setHistorial(historialData);

            setStats(ticketsData.stats);

        } catch (error) {
            toast.error("Error cargando información de recuperaciones");
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
            // Generamos clases para las próximas 3 semanas
            const rawSlots = generarClasesDisponibles(horariosPatron, 4);

            // Filtramos para quitar las que ya tiene ocupadas
            const slotsLimpios = rawSlots.filter(slot => {
                const fechaSlotTexto = slot.fecha.split('T')[0];
                const slotDate = new Date(slot.fecha);
                // Buscamos si el alumno ya tiene algo agendado ('PROGRAMADA') en este mismo día y a esta misma hora
                const yaLoTieneOcupado = historial.some(ticket => {
                    if (ticket.estado !== 'PROGRAMADA') return false;

                    // Comparamos si las fechas y el horario coinciden
                    const fechaTicketTexto = ticket.fecha_programada.split('T')[0];
                    const mismaFecha = fechaTicketTexto === fechaSlotTexto;
                    const mismoHorario = ticket.horario_destino_id === slot.horarioData.id;

                    return mismaFecha && mismoHorario;
                });

                //Verificamos ahora con el horario regular del alumno.
                let esHorarioRegularProtegido = false;

                // Si el ticket seleccionado NO es por lesión, aplicamos la regla de los 30 días
                if (stats.fin_ciclo_regular && stats.horarios_regulares) {
                    const finCicloDate = new Date(stats.fin_ciclo_regular);
                    finCicloDate.setHours(23, 59, 59);

                    // Si el slot que está viendo cae dentro de sus primeros 30 días
                    if (slotDate <= finCicloDate) {

                        // const indiceDiaSlot = (slotDate.getUTCDay() === 0) ? 7 : slotDate.getUTCDay();

                        // Comprobamos si el turno seleccionado corresponde con uno de sus horarios regulares.
                        esHorarioRegularProtegido = stats.horarios_regulares.includes(slot.horarioData.id);
                    }
                }


                // Si no lo tiene ocupado y no es parte de su horario regular, lo dejamos en la lista disponible
                return !yaLoTieneOcupado && !esHorarioRegularProtegido;
            });

            setAvailableSlots(slotsLimpios);
            toast.success("Horarios disponibles cargados 👇", { id: 'slots-loaded' });
        } else {
            setAvailableSlots([]);
        }
    }, [selectedTicket, horariosPatron, historial, stats]);

    const confirmarRecuperacion = (slot) => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-1">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmación de Reserva</span>
                    <p className="text-sm font-bold text-[#1e3a8a] leading-tight mt-1">
                        ¿Confirmas recuperar tu clase el <span className="text-orange-500">{new Date(slot.fecha).toLocaleDateString()}</span> a las <span className="text-orange-500">{slot.horarioData.hora_inicio.substring(0, 5)}</span>?
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            ejecutarReserva(slot);
                        }}
                        className="flex-1 bg-orange-500 text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="flex-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), {
            duration: 6000,
            position: 'bottom-center',
            style: {
                minWidth: '320px',
                borderRadius: '24px',
                border: '1px solid #f1f5f9',
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

            // Resetear y recargar
            setSelectedTicket(null);
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    // 3. Manejar el canje
    const handleSlotClick = async (slot) => {
        if (!selectedTicket) return;

        confirmarRecuperacion(slot);
    };

    // Manejar la cancelación
    const handleCancelRecovery = async (recuperacionId) => {
        if (!window.confirm("¿Estás seguro de cancelar esta recuperación? El ticket volverá a tus pendientes.")) {
            return;
        }

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

    // Helper para saber si ya llegó al límite visualmente
    const alLimite = stats.recuperacion_usadas >= stats.limite_permitido;

    const sedesUnicas = [...new Set(availableSlots.map(slot => slot.horarioData?.cancha?.sede?.nombre).filter(Boolean))].sort((a, b) => a.localeCompare(b));

    const slotsFiltrados = availableSlots.filter(slot => {
        if (filtroSede === '') return true;
        const nombreSede = slot.horarioData?.cancha?.sede?.nombre;
        return nombreSede === filtroSede;
    });

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen">
            <Link to="/dashboard/student" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#1e3a8a] transition-all mb-4 text-[10px] font-black uppercase tracking-widest italic">
                <ArrowLeft size={14} /> Volver
            </Link>
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl md:text-4xl font-black text-[#1e3a8a] italic uppercase tracking-tighter">
                            Centro de <span className="text-orange-500">Recuperación</span>
                        </h1>
                    </div>
                    <button onClick={loadData} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white transition-colors">
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Tarjetas de Estadísticas del Ciclo Actual */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {/* Tarjeta Normales */}
                <div className={`p-5 rounded-3xl border flex items-center justify-between ${alLimite ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${alLimite ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recuperaciones Normales</p>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-black ${alLimite ? 'text-orange-600' : 'text-slate-800'}`}>
                                    {stats.recuperacion_usadas}
                                </span>
                                <span className="text-sm font-bold text-slate-400">/ {stats.limite_permitido} usadas</span>
                            </div>
                        </div>
                    </div>
                    {alLimite && (
                        <span className="text-[10px] font-bold bg-orange-200 text-orange-700 px-3 py-1 rounded-full uppercase">Límite Alcanzado</span>
                    )}
                </div>

                {/* Tarjeta Lesiones */}
                <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-3xl flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                        <ShieldPlus size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recuperaciones por Lesión</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-sm font-bold text-emerald-500 uppercase text-[10px]">Sin límite</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-8 border-b border-gray-200 pb-px">
                <button
                    onClick={() => setActiveTab('agendar')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'agendar'
                        ? 'border-[#1e3a8a] text-[#1e3a8a]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <CalendarPlus size={18} /> Agendar Clase
                </button>
                <button
                    onClick={() => setActiveTab('historial')}
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'historial'
                        ? 'border-[#1e3a8a] text-[#1e3a8a]'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <History size={18} /> Mi Historial
                </button>
            </div>

            {/* Sección 1: Tus Tickets */}
            {activeTab === 'agendar' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-10">
                        <h3 className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                            1. Selecciona una falta pendiente
                        </h3>
                        <RecoveryTicketList
                            tickets={tickets}
                            selectedTicket={selectedTicket}
                            onSelect={setSelectedTicket}
                        />
                    </div>

                    {/* Sección 2: Calendario de Disponibilidad */}
                    {selectedTicket && (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            <div className="flex items-center justify-between mb-4 border-t border-white/10 pt-8">
                                <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    2. Elige tu nueva clase
                                </h3>
                                {availableSlots.length > 0 && (
                                    <div className="flex items-center gap-2 bg-slate-200 px-3 py-2 rounded-xl border border-slate-100">
                                        <Filter size={14} className="text-slate-400" />
                                        <select
                                            value={filtroSede}
                                            onChange={(e) => setFiltroSede(e.target.value)}
                                            className="bg-transparent border-none text-slate-600 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
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
                                <div className="p-8 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400 text-sm font-bold uppercase tracking-widest">
                                    No hay horarios disponibles en esta sede.
                                </div>
                            )}
                        </div>
                    )}

                    {!selectedTicket && tickets.length > 0 && (
                        <div className="mt-8 p-6 rounded-2xl border border-dashed border-white/10 text-center text-gray-500">
                            <AlertCircle className="mx-auto mb-2 opacity-50" />
                            Selecciona un ticket arriba para ver dónde puedes recuperar.
                        </div>
                    )}
                </div>
            ) : (
                < div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <RecoveryHistoryList
                        historial={historial}
                        onCancel={handleCancelRecovery}
                    />
                </div>
            )}
        </div>
    );
};

export default StudentRecoveries;