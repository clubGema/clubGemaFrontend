import React, { useState, useEffect } from 'react';
import { TicketPercent, Plus, Save, Edit2, Trash2, Loader2, Info, X, Check, Percent, Banknote, RotateCcw, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const AdminCreateBenefits = () => {
    const [beneficios, setBeneficios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        es_porcentaje: false,
        valor_por_defecto: ''
    });

    // 1. Carga de datos asegurando que el Backend traiga TODO (activos y no activos)
    const fetchBeneficios = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.TIPOS_BENEFICIO.BASE);
            const result = await response.json();
            // Asegúrate de que tu backend NO filtre por activo:true en el GET global
            if (response.ok) setBeneficios(result.data || result);
        } catch (error) {
            console.error('Error en fetchBeneficios:', error);
            toast.error("Error al conectar con el catálogo");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBeneficios(); }, []);

    // Separación lógica para las dos tablas
    const activos = beneficios.filter(b => b.activo === true || b.activo === 1);
    const inactivos = beneficios.filter(b => b.activo === false || b.activo === 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nombre || !formData.valor_por_defecto) return toast.error("Completa los campos obligatorios");

        try {
            setSubmitting(true);
            const method = editingId ? 'PUT' : 'POST';
            const url = editingId ? API_ROUTES.TIPOS_BENEFICIO.BY_ID(editingId) : API_ROUTES.TIPOS_BENEFICIO.BASE;

            const response = await apiFetch[method.toLowerCase()](url, {
                ...formData,
                valor_por_defecto: parseFloat(formData.valor_por_defecto)
            });

            if (response.ok) {
                toast.success(editingId ? "Beneficio actualizado correctamente" : "Nuevo beneficio registrado");
                setFormData({ nombre: '', es_porcentaje: false, valor_por_defecto: '' });
                setEditingId(null);
                fetchBeneficios();
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            toast.error("Error al procesar la solicitud");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStatusChange = async (id, nuevoEstado) => {
        try {
            const response = await apiFetch.put(API_ROUTES.TIPOS_BENEFICIO.BY_ID(id), { activo: nuevoEstado });
            if (response.ok) {
                toast.success(nuevoEstado ? "Beneficio reactivado" : "Beneficio enviado al archivo");
                fetchBeneficios();
            }
        } catch (error) {
            console.error('Error en handleStatusChange:', error);
            toast.error("Error al cambiar el estado");
        }
    };

    const handleEdit = (beneficio) => {
        setEditingId(beneficio.id);
        setFormData({
            nombre: beneficio.nombre,
            es_porcentaje: beneficio.es_porcentaje,
            valor_por_defecto: beneficio.valor_por_defecto
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) return (
        <LoadingSpinner
            className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3"
            label="Sincronizando Catálogo Imperio 7..."
            labelClassName="font-black italic animate-pulse tracking-widest uppercase"
        />
    );

    return (
        <div className="space-y-8 animate-fade-in-up p-1">
            {/* Header principal */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-brand-accent rounded-full"></div>
                        <h1 className="text-2xl font-black text-brand-heading uppercase tracking-tight">
                            Gestión del <span className="text-brand-primary">Catálogo de Becas</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-70 italic">Control maestro de incentivos económicos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel de Registro (Izquierda) */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-brand-surface rounded-[2rem] border border-brand-border shadow-sm overflow-hidden sticky top-6">
                        <div className="p-6 bg-brand-primary-dark text-white">
                            <h2 className="text-sm font-black uppercase italic tracking-tighter flex items-center gap-2">
                                {editingId ? <Edit2 size={16} className="text-brand-accent" /> : <Plus size={18} className="text-brand-accent" />}
                                {editingId ? 'Modificar Registro' : 'Nuevo Tipo de Beneficio'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <input
                                    type="text"
                                    placeholder="EJ. BECA EXCELENCIA..."
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
                                    className="w-full bg-brand-bg border border-brand-border rounded-2xl px-4 py-3 text-xs font-bold uppercase outline-none focus:ring-2 focus:ring-brand-accent/10 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest ml-1">Tipo de Cálculo</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, es_porcentaje: true })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${formData.es_porcentaje ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface text-brand-muted border-brand-border hover:border-slate-300'}`}
                                    >
                                        <Percent size={14} /> Porcentaje
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, es_porcentaje: false })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase transition-all border ${!formData.es_porcentaje ? 'bg-brand-primary text-white border-brand-primary' : 'bg-brand-surface text-brand-muted border-brand-border hover:border-slate-300'}`}
                                    >
                                        <Banknote size={14} /> Monto Fijo
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-brand-muted uppercase tracking-widest ml-1">Valor por Defecto</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.valor_por_defecto}
                                    onChange={(e) => setFormData({ ...formData, valor_por_defecto: e.target.value })}
                                    className="w-full bg-brand-bg border border-brand-border rounded-2xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/10 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                {editingId ? 'Guardar Cambios' : 'Registrar Beneficio'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Listados (Derecha) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* TABLA: BENEFICIOS VIGENTES */}
                    <div className="bg-brand-surface rounded-[2rem] border border-brand-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-brand-primary-soft/50 border-b border-brand-primary/10 flex items-center gap-2">
                            <Check className="text-brand-primary" size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-brand-primary">Beneficios Vigentes</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-brand-border-soft">
                                    {activos.length > 0 ? activos.map((b) => (
                                        <tr key={b.id} className="hover:bg-brand-bg/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-brand-surface-alt text-brand-primary rounded-xl flex items-center justify-center font-black group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm">
                                                        {b.es_porcentaje ? <Percent size={16} /> : <Banknote size={16} />}
                                                    </div>
                                                    <span className="text-xs font-black text-brand-body uppercase italic tracking-tight">{b.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase italic ${b.es_porcentaje ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-green-50 text-green-600 border border-green-100'}`}>
                                                    {b.es_porcentaje ? `${b.valor_por_defecto}% dcto.` : `S/ ${b.valor_por_defecto} menos`}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(b)} className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary-soft rounded-lg transition-all">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleStatusChange(b.id, false)} className="p-2 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                        <EyeOff size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td className="p-10 text-center text-brand-muted font-bold italic text-xs uppercase">No hay beneficios activos</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* TABLA: ARCHIVO (INACTIVOS) */}
                    <div className="bg-brand-bg rounded-[2rem] border border-brand-border shadow-sm overflow-hidden border-dashed">
                        <div className="px-6 py-4 bg-slate-200/50 border-b border-brand-border flex items-center gap-2">
                            <EyeOff className="text-slate-500" size={18} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">Archivo de Beneficios (Deshabilitados)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-brand-border">
                                    {inactivos.length > 0 ? inactivos.map((b) => (
                                        <tr key={b.id} className="grayscale hover:grayscale-0 transition-all group bg-brand-surface-alt/30">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-8 h-8 bg-slate-200 text-brand-muted rounded-lg flex items-center justify-center font-black">
                                                        {b.es_porcentaje ? '%' : '$'}
                                                    </div>
                                                    <span className="text-xs font-black text-slate-500 uppercase italic line-through decoration-slate-300">{b.nombre}</span>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className="text-[9px] font-black text-brand-muted uppercase italic">
                                                    {b.es_porcentaje ? `${b.valor_por_defecto}%` : `S/ ${b.valor_por_defecto}`}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => handleStatusChange(b.id, true)}
                                                    className="inline-flex items-center gap-2 bg-brand-surface border border-brand-border px-4 py-2 rounded-xl text-[9px] font-black uppercase text-slate-500 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm"
                                                >
                                                    <RotateCcw size={12} /> Reactivar
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td className="p-10 text-center text-slate-300 font-bold italic text-[10px] uppercase">El archivo está vacío</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreateBenefits;