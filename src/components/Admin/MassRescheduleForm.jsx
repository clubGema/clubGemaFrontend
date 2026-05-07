import React, { useState, useEffect } from 'react';
import {
    CalendarRange,
    Send,
    AlertTriangle,
    Loader2,
    Search,
    Filter,
    Clock,
    ClipboardList,
    Layers,
    ShieldAlert
} from 'lucide-react';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import toast from 'react-hot-toast';
import ConfirmModal from './ConfirmModal.jsx'; 

const MassRescheduleForm = ({ onSuccess }) => {
    const [horarios, setHorarios] = useState([]);
    const [isLoadingHorarios, setIsLoadingHorarios] = useState(true);
    const [fechasDisponibles, setFechasDisponibles] = useState([]);
    const [isLoadingFechas, setIsLoadingFechas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalStep, setModalStep] = useState(0); 

    const [formData, setFormData] = useState({
        horario_origen_id: '',
        fecha_origen: '',
        motivo: ''
    });

    const [filterDay, setFilterDay] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHorarios();
    }, []);

    useEffect(() => {
        if (formData.horario_origen_id) {
            fetchFechasDisponibles(formData.horario_origen_id);
        } else {
            setFechasDisponibles([]);
            setFormData(prev => ({ ...prev, fecha_origen: '' }));
        }
    }, [formData.horario_origen_id, horarios]);

    const fetchHorarios = async () => {
        try {
            const response = await apiFetch.get(API_ROUTES.HORARIOS.ACTIVOS);
            const json = await response.json();
            setHorarios(json.data || json || []);
        } catch (error) {
            toast.error('No se pudieron cargar los horarios.');
        } finally {
            setIsLoadingHorarios(false);
        }
    };

    const fetchFechasDisponibles = async (horarioId) => {
        setIsLoadingFechas(true);
        try {
            const response = await apiFetch.get(`/clases/${horarioId}/fechas-disponibles`);
            const json = await response.json();
            setFechasDisponibles(json.data || json || []);
        } catch (error) {
            setFechasDisponibles([]);
        } finally {
            setIsLoadingFechas(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.horario_origen_id || !formData.fecha_origen || !formData.motivo) {
            toast.error("Por favor completa todos los campos.");
            return;
        }
        setModalStep(1); 
    };

    const executeReschedule = async () => {
        setModalStep(0);
        setIsSubmitting(true);

        try {
            const response = await apiFetch.post(API_ROUTES.CLASES.REPROGRAMAR_MASIVO, {
                horario_origen_id: Number.parseInt(formData.horario_origen_id),
                fecha_origen: formData.fecha_origen,
                motivo: formData.motivo
            });

            if (response.ok) {
                toast.success('Reprogramación masiva exitosa.', { duration: 5000, icon: '🚀' });
                setFormData({ horario_origen_id: '', fecha_origen: '', motivo: '' });
                
                // 🔥 AQUÍ SE DISPARA LA MAGIA:
                if (onSuccess) onSuccess(); 
            } else {
                throw new Error('Error al procesar.');
            }

        } catch (error) {
            toast.error(error.message || 'Error al ejecutar.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const diasSemana = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };

    const getFechaOrigenPlaceholder = () => {
        if (!formData.horario_origen_id) return "Esperando horario...";
        if (isLoadingFechas) return "Buscando fechas...";
        return "Elige el día que falló";
    };

    const filteredHorarios = horarios.filter(h => {
        const matchesDay = filterDay === '' || h.dia_semana.toString() === filterDay;
        const searchLower = searchTerm.toLowerCase();
        return matchesDay && (searchTerm === '' || 
            diasSemana[h.dia_semana].toLowerCase().includes(searchLower) ||
            h.nivel?.nombre?.toLowerCase().includes(searchLower) ||
            h.cancha?.nombre?.toLowerCase().includes(searchLower));
    });

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl shadow-inner">
                        <CalendarRange size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase italic">REPROGRAMACIÓN MASIVA</h2>
                        <p className="text-slate-500 text-sm font-medium">Club Gema - Control de Contingencias</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filteredHorarios.length} ACTIVOS</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-6 rounded-r-2xl shadow-sm">
                    <div className="flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-orange-500 shrink-0" />
                        <div>
                            <h4 className="text-sm font-black text-orange-800 uppercase tracking-wider mb-1">Advertencia Crítica</h4>
                            <p className="text-xs text-orange-700 font-bold leading-relaxed italic">
                                Esta acción modificará permanentemente las asistencias y notificará a todos los alumnos.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/60 flex flex-col md:flex-row gap-4">
                        <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)} className="flex-1 p-3 rounded-xl border-none shadow-sm text-xs font-bold uppercase">
                            <option value="">Todos los días</option>
                            {Object.entries(diasSemana).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                        </select>
                        <input type="text" placeholder="BUSCAR..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-[2] p-3 rounded-xl border-none shadow-sm text-xs font-bold uppercase" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Horario Afectado</label>
                            <select name="horario_origen_id" value={formData.horario_origen_id} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-orange-500 transition-all font-black text-slate-700 text-xs uppercase" required>
                                <option value="">Selecciona el horario</option>
                                {filteredHorarios.map(h => (
                                    <option key={h.id} value={h.id}>{`[${diasSemana[h.dia_semana]}] ${h.hora_inicio} | ${h.nivel?.nombre} | ${h.cancha?.nombre}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fecha a Cancelar</label>
                            <select name="fecha_origen" value={formData.fecha_origen} onChange={handleChange} className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:border-orange-500 transition-all font-black text-slate-700 text-xs uppercase" disabled={!formData.horario_origen_id || isLoadingFechas} required>
                                <option value="">{getFechaOrigenPlaceholder()}</option>
                                {fechasDisponibles.map(fecha => <option key={fecha} value={fecha}>{fecha}</option>)}
                            </select>
                        </div>

                        <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-center text-center">
                            <h4 className="text-[10px] font-black text-indigo-800 uppercase italic mb-1">Algoritmo Gema V2</h4>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase">Reposición Individual x Próximo Día</p>
                        </div>

                        <div className="col-span-full space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Motivo Institucional</label>
                            <textarea name="motivo" value={formData.motivo} onChange={handleChange} rows="3" className="w-full p-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 focus:border-orange-500 transition-all text-xs font-bold text-slate-600 italic" placeholder="Ej: Mantenimiento Preventivo de Canchas, Indisposición técnica..." required></textarea>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-500 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                            <ShieldAlert size={14} /> <span>Calculando próximo día x alumno</span>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-[1.03] disabled:grayscale">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "EJECUTAR REPROGRAMACIÓN"}
                        </button>
                    </div>
                </div>
            </form>

            <ConfirmModal 
                isOpen={modalStep === 1}
                onClose={() => setModalStep(0)}
                onConfirm={() => setModalStep(2)}
                title="¿Reprogramar bloque?"
                message="El sistema buscará el próximo día de clase disponible para cada alumno individualmente. ¿Deseas continuar?"
                confirmText="Sí, continuar"
            />

            <ConfirmModal 
                isOpen={modalStep === 2}
                onClose={() => setModalStep(0)}
                onConfirm={executeReschedule}
                title="🛑 ¡ACCIÓN MASIVA!"
                message="Se crearán reposiciones automáticas y se ajustarán las fechas de pago proporcionalmente al desfase. ¿Confirmas?"
                iconType="danger"
                confirmText="EJECUTAR AHORA"
            />
        </div>
    );
};

export default MassRescheduleForm;