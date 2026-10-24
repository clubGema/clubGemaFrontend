import React, { useState, useEffect } from 'react';
import {
    Settings, Save, Loader2, Info, Edit3, X, Check,
    Database, ShieldCheck, Calendar, Bell, Wallet, Zap
} from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import PageTitle from '../../components/shared/PageTitle';

const AdminSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Función para asignar un ícono según la clave del parámetro
    const getSettingIcon = (clave) => {
        const key = clave.toUpperCase();
        if (key.includes('PAGO') || key.includes('PRECIO')) return <Wallet className="text-emerald-500" />;
        if (key.includes('TEMPORADA') || key.includes('FECHA')) return <Calendar className="text-brand-primary" />;
        if (key.includes('NOTIF') || key.includes('AVISO')) return <Bell className="text-brand-accent" />;
        if (key.includes('SEGURIDAD') || key.includes('AUTH')) return <ShieldCheck className="text-brand-primary" />;
        if (key.includes('SISTEMA') || key.includes('DB')) return <Database className="text-slate-500" />;
        return <Zap className="text-yellow-500" />;
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.PARAMETROS.BASE);
            const result = await response.json();
            if (response.ok) setSettings(result.data || []);
        } catch (error) {
            console.error('Error en fetchSettings:', error);
            toast.error("Error al sincronizar ajustes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSettings(); }, []);

    const handleSave = async (id) => {
        if (!editValue.trim()) return toast.error("El valor es obligatorio");
        try {
            setSubmitting(true);
            const response = await apiFetch(API_ROUTES.PARAMETROS.BY_ID(id), {
                method: 'PUT',
                body: JSON.stringify({ valor: editValue })
            });
            if (response.ok) {
                toast.success("Ajuste guardado correctamente");
                setEditingId(null);
                fetchSettings();
            }
        } catch (error) {
            console.error('Error en handleSave:', error);
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up p-1 pb-24">
            {/* Cabecera Estilo Dashboard */}
            <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border-soft shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20">
                        <Settings size={32} className="animate-spin-slow" />
                    </div>
                    <div>
                        <PageTitle title="Configuración del" accent="Sistema" subtitle="Panel de parámetros del sistema" />
                    </div>
                </div>
                <div className="bg-brand-bg px-6 py-3 rounded-2xl border border-brand-border-soft">
                    <span className="text-[10px] font-black text-brand-muted uppercase block leading-none mb-1">Estado del Sistema</span>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                        <span className="text-xs font-black text-brand-primary uppercase italic">Núcleo Activo</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingSpinner
                    className="flex flex-col items-center justify-center py-32 gap-4"
                    colorClassName="text-brand-accent"
                    size={48}
                    label="Cargando Parámetros..."
                    labelClassName="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em]"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {settings.map((item) => (
                        <div key={item.id} className={`group relative bg-brand-surface rounded-[2rem] border-2 transition-all duration-500 ${editingId === item.id ? 'border-brand-accent shadow-2xl scale-[1.02] z-10' : 'border-brand-border-soft hover:border-brand-primary/20 hover:shadow-xl shadow-slate-200/50'
                            }`}>
                            <div className="p-6">
                                {/* Badge de Clave Técnica */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl transition-colors ${editingId === item.id ? 'bg-brand-accent-soft' : 'bg-brand-bg group-hover:bg-brand-primary-soft'}`}>
                                        {getSettingIcon(item.clave)}
                                    </div>
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter bg-brand-bg px-2 py-1 rounded-md">
                                        ID: {item.id}
                                    </span>
                                </div>

                                {/* Título y Descripción */}
                                <div className="mb-6">
                                    <h3 className="text-xs font-black text-brand-muted uppercase tracking-widest mb-1">{item.clave}</h3>
                                    <p className="text-sm font-bold text-brand-body leading-tight">
                                        {item.descripcion || 'Sin descripción asignada.'}
                                    </p>
                                </div>

                                {/* Área de Valor */}
                                <div className={`rounded-2xl p-4 transition-all ${editingId === item.id ? 'bg-brand-accent-soft/50' : 'bg-brand-bg'}`}>
                                    <label className="text-[9px] font-black text-brand-muted uppercase block mb-2">Valor Actual</label>
                                    {editingId === item.id ? (
                                        <div className="flex flex-col gap-3">
                                            <input
                                                autoFocus
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-full bg-brand-surface border-2 border-brand-accent rounded-xl px-4 py-2.5 text-base font-black text-brand-accent-dark outline-none shadow-inner"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    disabled={submitting}
                                                    onClick={() => handleSave(item.id)}
                                                    className="flex-1 bg-brand-accent hover:bg-brand-accent-dark text-white py-2 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all"
                                                >
                                                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                                    Confirmar
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-600 py-2 rounded-xl font-black text-[10px] uppercase transition-all"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-xl font-black text-brand-primary italic tracking-tight">
                                                {item.valor}
                                            </span>
                                            <button
                                                onClick={() => { setEditingId(item.id); setEditValue(item.valor); }}
                                                className="p-2 bg-brand-surface text-brand-muted hover:text-brand-primary rounded-xl border border-brand-border hover:border-brand-primary/20 transition-all shadow-sm"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Decoración Inferior */}
                            <div className={`h-1.5 w-full absolute bottom-0 left-0 rounded-b-[2rem] transition-colors ${editingId === item.id ? 'bg-brand-accent' : 'bg-transparent group-hover:bg-brand-primary-light'}`}></div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-brand-primary-soft/50 p-6 rounded-[2rem] border border-brand-primary/10 flex items-start gap-4">
                <Info className="text-brand-primary shrink-0" size={20} />
                <p className="text-[11px] text-brand-primary font-bold leading-relaxed uppercase italic">
                    Atención: Los cambios en estos valores impactan directamente en el motor de cálculo del sistema (asistencias, pagos y penalizaciones). Procede con precaución.
                </p>
            </div>
        </div>
    );
};

export default AdminSettings;