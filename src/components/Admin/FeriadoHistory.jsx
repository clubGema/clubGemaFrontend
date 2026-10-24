import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, Calendar as CalendarIcon, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { feriadoService } from '../../services/feriado.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ConfirmModal from '../shared/ConfirmModal';

const FeriadoHistory = ({ onClose }) => {
    const [feriados, setFeriados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newFeriado, setNewFeriado] = useState({ fecha: '', descripcion: '' });
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // 🛠️ FUNCIÓN CLAVE: Corrige el desfase de zona horaria (UTC vs Local)
    const parseLocalDate = (dateString) => {
        if (!dateString) return new Date();
        const date = new Date(dateString);
        // Ajustamos los minutos de diferencia para que no retroceda un día
        return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    };

    // Memoizar el ordenamiento: lo más reciente arriba
    const feriadosOrdenados = useMemo(() => {
        return [...feriados].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }, [feriados]);

    const fetchFeriados = useCallback(async () => {
        try {
            setLoading(true);
            const result = await feriadoService.listarTodos();
            setFeriados(result?.data || []);
        } catch (error) {
            console.error("Error cargando feriados:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeriados();
    }, [fetchFeriados]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newFeriado.fecha || !newFeriado.descripcion) return;
        
        try {
            setSubmitting(true);
            await feriadoService.crear(newFeriado);
            setNewFeriado({ fecha: '', descripcion: '' });
            await fetchFeriados(); 
        } catch (error) {
            console.error("Error al guardar:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEliminar = (id) => {
        setDeleteTargetId(id);
    };

    const executeEliminar = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);
        try {
            await feriadoService.eliminar(id);
            setFeriados(prev => prev.filter(f => f.id !== id));
        } catch (error) {
            console.error('Error en executeEliminar:', error);
            alert("No se pudo eliminar");
        }
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-brand-primary-dark/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-brand-surface w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-brand-border-soft flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-6 bg-brand-bg border-b border-brand-border-soft flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-accent rounded-xl text-white shadow-lg shadow-brand-accent/25">
                            <CalendarIcon size={20} />
                        </div>
                        <h2 className="font-black text-slate-800 uppercase tracking-tighter text-xl italic">
                            Feriados <span className="text-brand-accent">IMPERIO 7</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-brand-muted">
                        <X size={20} />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 bg-brand-surface border-b border-slate-50 shrink-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="date" 
                            required
                            value={newFeriado.fecha}
                            onChange={(e) => setNewFeriado({...newFeriado, fecha: e.target.value})}
                            className="bg-brand-surface-alt border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                        <input 
                            type="text" 
                            placeholder="Ej: Navidad" 
                            required
                            value={newFeriado.descripcion}
                            onChange={(e) => setNewFeriado({...newFeriado, descripcion: e.target.value})}
                            className="bg-brand-surface-alt border-none rounded-xl text-sm font-bold p-3 outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full bg-brand-primary-dark text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-brand-accent-dark active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
                    >
                        {submitting ? <Loader2 className="animate-spin" size={14}/> : <Plus size={14}/>}
                        Registrar Feriado
                    </button>
                </form>

                {/* Lista con Scroll */}
                <div className="flex-1 overflow-y-auto p-4 bg-brand-bg/50 custom-scrollbar">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 px-2">
                        Próximas fechas no laborables
                    </p>
                    
                    {loading ? (
                        <div className="py-20 flex flex-col items-center text-brand-muted">
                            <Loader2 className="animate-spin mb-2" size={24} />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Sincronizando...</span>
                        </div>
                    ) : feriadosOrdenados.length === 0 ? (
                        <div className="py-20 flex flex-col items-center text-slate-300">
                            <AlertCircle size={40} className="mb-2 opacity-20" />
                            <span className="text-[10px] uppercase font-bold tracking-widest">Sin registros</span>
                        </div>
                    ) : (
                        <div className="space-y-2 pb-4">
                            {feriadosOrdenados.map((f) => {
                                // 💡 Aplicamos la corrección aquí
                                const localDate = parseLocalDate(f.fecha);
                                return (
                                    <div key={f.id} className="bg-brand-surface p-3 rounded-2xl border border-brand-border-soft flex items-center justify-between group hover:border-brand-accent/30 transition-all shadow-sm hover:shadow-md">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-brand-surface-alt rounded-lg flex flex-col items-center justify-center text-[10px] font-black text-slate-600 shadow-sm border border-white">
                                                <span>{format(localDate, 'dd')}</span>
                                                <span className="uppercase text-brand-accent">{format(localDate, 'MMM', {locale: es})}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-brand-body leading-tight">{f.descripcion}</p>
                                                <p className="text-[9px] text-brand-muted font-medium uppercase tracking-tighter italic">
                                                    Ciclo {format(localDate, 'yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleEliminar(f.id)} 
                                            className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeEliminar}
                title="¿Eliminar este feriado?"
                message="Esta acción no se puede deshacer."
                iconType="danger"
                confirmText="Eliminar"
            />
        </div>
    );
};

export default FeriadoHistory;