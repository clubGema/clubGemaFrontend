import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CalendarDays, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';

const ChangeLevelStudent = ({ alumno, onBack, sedeId }) => {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedHorario, setSelectedHorario] = useState(null);

    useEffect(() => {
        const fetchHorarios = async () => {
            try {
                setLoading(true);
                // 🛡️ Ajusta esta ruta a tu endpoint real que traiga horarios por sede
                // Ejemplo: API_ROUTES.HORARIOS.POR_SEDE + `?sede_id=${sedeId || 1}`
                const response = await apiFetch.get(`/api/horarios?sede_id=${sedeId || ''}`);
                const result = await response.json();

                if (response.ok) {
                    setHorarios(result.data || []);
                }
            } catch (error) {
                toast.error("Error al cargar los horarios disponibles");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchHorarios();
    }, [sedeId]);

    const handleConfirmarCambio = async () => {
        if (!selectedHorario) {
            toast.error("Por favor selecciona un horario");
            return;
        }

        try {
            setSaving(true);
            // 🛡️ Ajusta este endpoint a tu ruta real de actualización
            const response = await apiFetch.put(`/api/alumnos/${alumno.id}/cambiar-horario`, {
                horario_id: selectedHorario.id
            });

            if (response.ok) {
                toast.success("Nivel/Horario actualizado correctamente");
                onBack(); // Regresa a la lista después del éxito
            } else {
                toast.error("Hubo un problema al procesar el cambio");
            }
        } catch (error) {
            toast.error("Error de conexión al guardar");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                <Loader2 className="animate-spin text-[#1e3a8a]" size={40} />
                <p className="font-bold italic animate-pulse">Buscando horarios en la sede...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="group flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:border-[#1e3a8a] transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} className="text-slate-600 group-hover:text-[#1e3a8a]" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                Cambio de <span className="text-[#1e3a8a]">Nivel</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide ml-3">
                            Reasignación de horario para: <span className="text-orange-500">{alumno.nombres} {alumno.apellidos}</span>
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleConfirmarCambio}
                    disabled={!selectedHorario || saving}
                    className="hidden sm:flex items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>

            {/* Listado de Horarios */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6 text-[#1e3a8a]">
                    <CalendarDays size={24} />
                    <h2 className="text-lg font-black uppercase italic tracking-tighter">
                        Horarios Disponibles en la Sede
                    </h2>
                </div>

                {horarios.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <AlertCircle size={40} className="text-slate-300 mb-3" />
                        <p className="text-slate-500 font-bold uppercase text-sm tracking-wide">No hay horarios disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {horarios.map((horario) => (
                            <div
                                key={horario.id}
                                onClick={() => setSelectedHorario(horario)}
                                className={`cursor-pointer border-2 rounded-2xl p-5 transition-all relative overflow-hidden group ${selectedHorario?.id === horario.id
                                    ? 'border-[#1e3a8a] bg-blue-50/30'
                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                    }`}
                            >
                                {selectedHorario?.id === horario.id && (
                                    <div className="absolute top-4 right-4 text-[#1e3a8a]">
                                        <CheckCircle2 size={24} fill="currentColor" className="text-white bg-[#1e3a8a] rounded-full" />
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${selectedHorario?.id === horario.id ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {horario.nivel_nombre || 'Nivel'}
                                    </span>

                                    <div>
                                        <h3 className="font-black text-slate-800 uppercase italic tracking-tight text-lg">
                                            {horario.dias || 'LUN - MIE - VIE'}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                                            <Clock size={14} />
                                            <span className="text-xs font-bold uppercase">{horario.hora_inicio} - {horario.hora_fin}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Botón flotante para móvil */}
            <div className="sm:hidden mt-6">
                <button
                    onClick={handleConfirmarCambio}
                    disabled={!selectedHorario || saving}
                    className="w-full flex justify-center items-center gap-2 bg-[#1e3a8a] hover:bg-blue-900 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Confirmar Cambio
                </button>
            </div>
        </div>
    );
};

export default ChangeLevelStudent;