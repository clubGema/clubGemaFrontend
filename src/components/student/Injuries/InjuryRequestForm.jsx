import React, { useState } from 'react';
import { Upload, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import lesionService from '../../../services/lesion.service';

const InjuryRequestForm = ({ onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ descripcion: '', evidencia: null, fechaInicio: new Date().toISOString().split('T')[0], fechaFin: '' });
    const [previewUrl, setPreviewUrl] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.evidencia) {
            toast.error('Debes adjuntar una imagen de tu certificado médico.');
            return;
        }

        try {
            setLoading(true);

            const payload = new FormData();
            payload.append('descripcion', formData.descripcion);
            payload.append('evidencia', formData.evidencia);
            payload.append('fechaInicio', formData.fechaInicio);
            payload.append('fechaFin', formData.fechaFin);

            await lesionService.crearSolicitud(payload);

            toast.success('Solicitud enviada correctamente');
            setFormData({ descripcion: '', evidencia: null });
            setPreviewUrl(null);

            e.target.reset();

            if (onSuccess) onSuccess();

        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-brand-primary to-[#142857] backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-brand-accent" /> Detalle de la Lesión
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-brand-primary-soft uppercase mb-2">Descripción del problema</label>
                    <textarea
                        required
                        rows="4"
                        className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-accent transition-colors"
                        placeholder="Explica brevemente qué te pasó..."
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-primary-soft uppercase tracking-widest ml-1">Periodo de descanso</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Desde</label>
                            <input type="date" required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-4 py-3 text-brand-body text-xs focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all font-bold shadow-sm" value={formData.fechaInicio} onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Hasta</label>
                            <input type="date" required className="w-full bg-brand-bg border border-brand-border rounded-2xl px-4 py-3 text-brand-body text-xs focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all font-bold shadow-sm" value={formData.fechaFin} onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-primary-soft uppercase tracking-widest ml-1">Evidencia Médica</label>
                    <p className="text-[10px] text-gray-400 mt-2 ml-1">* Subir imagen (JPG, JPEG o PNG).</p>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="evidencia-input"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (e.target.files[0]) {
                                setFormData({ ...formData, evidencia: file });
                                setPreviewUrl(URL.createObjectURL(file));
                            }
                        }}
                    />
                    <label htmlFor="evidencia-input" className="block bg-black/20 border-2 border-dashed border-white/10 rounded-3xl py-8 text-center cursor-pointer hover:bg-gray-500 hover:border-gray-400 transition-all">
                        {previewUrl ? (
                            <img src={previewUrl} className="h-32 mx-auto rounded-2xl shadow-md" alt="Evidencia médica" />
                        ) : (
                            <>
                                <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-[10px] font-black text-brand-muted uppercase">Subir Foto</p>
                            </>
                        )}
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white font-black py-4 rounded-xl shadow-lg shadow-brand-primary-dark/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
                >
                    {loading ? 'Subiendo Evidencia...' : 'ENVIAR SOLICITUD'}
                </button>
            </form>
        </div>
    );
};

export default InjuryRequestForm;