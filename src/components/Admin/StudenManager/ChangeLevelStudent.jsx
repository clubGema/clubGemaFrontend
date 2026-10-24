import React, { useState, useMemo } from 'react';
import { ArrowLeft, AlertCircle, Loader2, Save, ArrowRightLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import horarioService from '../../../services/horario.service';
import { inscripcionService } from '../../../services/inscripcion.service';
import { useFetch } from '../../../hooks/useFetch';
import LoadingSpinner from '../../..//components/shared/LoadingSpinner';
import { useAuth } from '../../../context/AuthContext';
import CurrentScheduleCard from './schedule-change/CurrentScheduleCard';
import MonthlyTargetPanel from './schedule-change/MonthlyTargetPanel';
import SingleClassTargetPanel from './schedule-change/SingleClassTargetPanel';
import ChangeScheduleConfirmToast from './schedule-change/ChangeScheduleConfirmToast';
import { esClaseUnica, filtrarCambiables } from './schedule-change/scheduleChangeUtils';
import { BRAND_COLORS } from "../../../config/themeColors.js";

const UNICA_VACIA = { fecha: null, horarioId: null };

const ChangeLevelStudent = ({ alumno, onBack }) => {
    const [selectedHorarioActual, setSelectedHorarioActual] = useState(null);
    // Destino MENSUAL: un horario de la lista. Destino CLASE ÚNICA: fecha exacta + horario (misma forma que UnicaSchedule).
    const [selectedHorarioNuevo, setSelectedHorarioNuevo] = useState(null);
    const [unica, setUnica] = useState(UNICA_VACIA);
    const [saving, setSaving] = useState(false);
    const { user } = useAuth();

    const { data: inscripciones, loading: loadingActuales, refetch: refetchActuales } = useFetch(
        () => inscripcionService.listarNoFinalizadas(alumno.id),
        [alumno.id],
        { initialData: [], errorMessage: 'Error al cargar los horarios del alumno' }
    );

    const { data: horariosDisponibles, loading: loadingDisponibles } = useFetch(
        () => horarioService.obtenerDisponibles(),
        [],
        { initialData: [], errorMessage: 'Error al cargar los horarios disponibles' }
    );

    // Solo inscripciones ACTIVO / PENDIENTE_PAGO; las vencidas o anuladas no se pueden cambiar.
    const horariosActuales = useMemo(() => filtrarCambiables(inscripciones), [inscripciones]);

    // El modo de la columna derecha se deriva de la tarjeta elegida: no es estado, no puede desincronizarse.
    const modo = !selectedHorarioActual ? null : esClaseUnica(selectedHorarioActual) ? 'UNICA' : 'MENSUAL';

    const horarioUnicaElegido = modo === 'UNICA'
        ? horariosDisponibles.find(h => h.id === unica.horarioId) ?? null
        : null;
    const horarioDestino = modo === 'UNICA' ? horarioUnicaElegido : selectedHorarioNuevo;
    const destinoListo = modo === 'UNICA' ? Boolean(unica.fecha && horarioUnicaElegido) : Boolean(selectedHorarioNuevo);

    const handleSelectActual = (horario) => {
        setSelectedHorarioActual(horario);
        setSelectedHorarioNuevo(null);
        setUnica(UNICA_VACIA);
    };

    const handleSelectFechaUnica = (fecha, horarioId) => setUnica({ fecha, horarioId });
    const handleSelectHorarioUnica = (horarioId) => setUnica(prev => ({ ...prev, horarioId }));

    const handleConfirmarCambio = async () => {
        try {
            setSaving(true);
            const result = await inscripcionService.cambiarHorario({
                alumnoId: selectedHorarioActual.alumno_id,
                inscripcionId: selectedHorarioActual.id,
                horarioId: horarioDestino.id,
                fechaClase: modo === 'UNICA' ? unica.fecha : undefined,
                adminId: user.id,
            });
            toast.success(result.message || "Horario intercambiado correctamente");
            await refetchActuales();
            setSelectedHorarioActual(null);
            setSelectedHorarioNuevo(null);
            setUnica(UNICA_VACIA);
        } catch (error) {
            toast.error(error.message || "Error al procesar el cambio");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const confirmarRecuperacion = () => {
        if (!selectedHorarioActual) {
            toast.error("Por favor selecciona el horario actual que deseas cambiar");
            return;
        }
        if (!destinoListo) {
            toast.error(modo === 'UNICA' ? "Por favor selecciona la fecha y el horario destino" : "Por favor selecciona el horario destino");
            return;
        }
        toast((t) => (
            <ChangeScheduleConfirmToast
                t={t}
                selectedHorarioActual={selectedHorarioActual}
                selectedHorarioNuevo={horarioDestino}
                fechaDestino={modo === 'UNICA' ? unica.fecha : null}
                onConfirm={handleConfirmarCambio}
            />
        ), {
            duration: Infinity,
            position: 'top-center',
            style: {
                minWidth: '340px',
                borderRadius: '16px',
                border: `1px solid ${BRAND_COLORS.border}`,
                padding: '16px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            },
        });
    };

    if (loadingActuales || loadingDisponibles) {
        return (
            <LoadingSpinner
                className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3"
                label="Sincronizando información de horarios..."
                labelClassName="font-bold italic animate-pulse"
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="group flex items-center justify-center w-10 h-10 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-primary transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-slate-600 group-hover:text-brand-primary" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-brand-accent rounded-full"></div>
                            <h1 className="text-2xl font-black text-brand-heading uppercase tracking-tight">
                                Cambio de <span className="text-brand-primary">Horario</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide ml-3">
                            Reasignación para: <span className="text-brand-accent">{alumno.nombres} {alumno.apellidos}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={confirmarRecuperacion}
                    disabled={!selectedHorarioActual || !destinoListo || saving}
                    className="hidden sm:flex items-center gap-2 bg-brand-primary hover:bg-brand-primary text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Horarios Actuales del Alumno */}
                <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-sm overflow-hidden p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-brand-accent-soft text-brand-accent flex items-center justify-center font-black">1</div>
                        <div>
                            <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-800">
                                Horarios del Alumno
                            </h2>
                            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Seleccione el horario a cambiar</p>
                        </div>
                    </div>

                    {horariosActuales.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 bg-brand-bg rounded-2xl border border-brand-border-soft border-dashed">
                            <AlertCircle size={32} className="text-slate-300 mb-3" />
                            <p className="text-slate-500 font-bold uppercase text-xs text-center tracking-wide">El alumno no tiene horarios activos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {horariosActuales.map((horario) => (
                                <CurrentScheduleCard
                                    key={horario.id}
                                    horario={horario}
                                    isSelected={selectedHorarioActual?.id === horario.id}
                                    onSelect={() => handleSelectActual(horario)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Destino: depende del tipo de la inscripción elegida */}
                <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-sm overflow-hidden p-6 relative">
                    {!selectedHorarioActual && (
                        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                            <ArrowRightLeft size={40} className="text-slate-300 mb-4" />
                            <h3 className="text-slate-800 font-black uppercase tracking-widest text-sm mb-2">Seleccione un horario del alumno</h3>
                        </div>
                    )}

                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${selectedHorarioActual ? 'bg-brand-primary text-white' : 'bg-brand-surface-alt text-brand-muted'}`}>2</div>
                        <div>
                            <h2 className={`text-sm font-black uppercase italic tracking-tighter ${selectedHorarioActual ? 'text-brand-primary' : 'text-brand-muted'}`}>
                                {modo === 'UNICA' ? 'Nueva Fecha y Horario' : 'Horarios Disponibles'}
                            </h2>
                            <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">
                                {modo === 'UNICA' ? 'Seleccione la fecha exacta de la clase' : 'Seleccione el nuevo horario'}
                            </p>
                        </div>
                    </div>

                    {modo === 'UNICA' && (
                        <SingleClassTargetPanel
                            key={selectedHorarioActual.id}
                            inscripcionActual={selectedHorarioActual}
                            horariosDisponibles={horariosDisponibles}
                            unica={unica}
                            onSelectFecha={handleSelectFechaUnica}
                            onSelectHorario={handleSelectHorarioUnica}
                        />
                    )}
                    {modo !== 'UNICA' && (
                        <MonthlyTargetPanel
                            horariosDisponibles={horariosDisponibles}
                            selectedHorarioNuevo={selectedHorarioNuevo}
                            onSelect={setSelectedHorarioNuevo}
                        />
                    )}
                </div>
            </div>

            {/* Botón flotante para móvil */}
            <div className="sm:hidden mt-6">
                <button
                    onClick={confirmarRecuperacion}
                    disabled={!selectedHorarioActual || !destinoListo || saving}
                    className="w-full flex justify-center items-center gap-2 bg-brand-primary hover:bg-brand-primary text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>
        </div>
    );
};

export default ChangeLevelStudent;
