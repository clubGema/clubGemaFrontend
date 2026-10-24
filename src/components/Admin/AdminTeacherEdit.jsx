import React, { useState } from 'react';
import { Save, User, Mail, GraduationCap, Phone, ArrowLeft, Loader2, ShieldCheck, Fingerprint } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';

const AdminTeacherEdit = ({ teacherData, onBack, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombres: teacherData.nombres || '',
        apellidos: teacherData.apellidos || '',
        email: teacherData.email || '',
        telefono_personal: teacherData.telefono_personal || '',
        especializacion: teacherData.datosRolEspecifico?.especializacion || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!formData.nombres || !formData.email) {
            return toast.error("Los campos principales son obligatorios.");
        }

        setLoading(true);
        try {
            // 🔥 Usamos la nueva ruta dinámica que configuramos
            const response = await apiFetch.patch(API_ROUTES.COORDINADORES.BY_ID(teacherData.id), formData);

            if (response.ok) {
                toast.success("¡Expediente técnico actualizado!");
                onSuccess(); // Refresca la lista y vuelve al inicio
            } else {
                const error = await response.json();
                toast.error(error.message || "Error al actualizar");
            }
        } catch (error) {
            console.error('Error en handleUpdate:', error);
            toast.error("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            {/* Header de Edición */}
            <div className="flex justify-between items-center bg-brand-surface p-4 rounded-3xl border border-brand-border shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-brand-bg rounded-xl transition-all">
                        <ArrowLeft size={20} className="text-brand-muted" />
                    </button>
                    <h1 className="text-lg font-black text-brand-heading uppercase italic">
                        Editar <span className="text-brand-accent">Expediente</span>
                    </h1>
                </div>
                <button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand-accent transition-all shadow-lg"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Guardar Cambios
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Datos Básicos */}
                    <div className="bg-brand-surface rounded-3xl border border-brand-border p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-4">
                            <User className="text-brand-primary" size={18} />
                            <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">Información Personal</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand-muted uppercase ml-1">Nombres</label>
                                <input name="nombres" value={formData.nombres} onChange={handleChange} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent/10" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand-muted uppercase ml-1">Apellidos</label>
                                <input name="apellidos" value={formData.apellidos} onChange={handleChange} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent/10" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand-muted uppercase ml-1">Email</label>
                                <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-brand-muted uppercase ml-1">Teléfono</label>
                                <input name="telefono_personal" value={formData.telefono_personal} onChange={handleChange} className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-3 text-sm font-bold outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Especialización */}
                <div className="space-y-6">
                    <div className="bg-brand-surface rounded-3xl border border-brand-border p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <GraduationCap className="text-brand-accent" size={20} />
                            <span className="text-[10px] font-black uppercase text-brand-muted tracking-widest">Área Técnica</span>
                        </div>
                        <textarea
                            name="especializacion"
                            value={formData.especializacion}
                            onChange={handleChange}
                            className="w-full bg-brand-bg border border-brand-border rounded-2xl p-4 text-sm font-bold outline-none h-40 resize-none focus:ring-2 focus:ring-brand-accent/10"
                            placeholder="Actualizar especialidad..."
                        />
                    </div>

                    <div className="bg-brand-primary-dark p-6 rounded-3xl text-white">
                        <ShieldCheck className="text-brand-accent mb-3" size={24} />
                        <h4 className="text-xs font-black uppercase italic tracking-tighter">Seguridad de Datos</h4>
                        <p className="text-[9px] text-brand-muted mt-2 leading-relaxed uppercase">
                            Cualquier cambio en el email afectará el inicio de sesión del coordinador. Use esta herramienta con precaución.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeacherEdit;