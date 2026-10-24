import React, { useState, useEffect } from 'react';
import { Eye, X, Activity, RefreshCw, ClipboardCheck, User, Calendar, FileText, Fingerprint } from 'lucide-react';
import toast from 'react-hot-toast';
import lesionService from '../../services/lesion.service';
import InjuryEvaluationModal from '../../components/Admin/Injuries/InjuryEvaluationModal';

const AdminInjuriesManager = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [evidenceViewerOpen, setEvidenceViewerOpen] = useState(false);
    const [evidenceUrl, setEvidenceUrl] = useState('');

    const fetchPendientes = async () => {
        try {
            setLoading(true);
            const data = await lesionService.obtenerPendientes();
            setSolicitudes(data);
        } catch (error) {
            console.error('Error en fetchPendientes:', error);
            toast.error('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendientes();
    }, []);

    const openEvaluateModal = (sol) => {
        setSelectedSolicitud(sol);
        setModalOpen(true);
    };

    const openEvidenceViewer = (url) => {
        setEvidenceUrl(url);
        setEvidenceViewerOpen(true);
    };

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen bg-brand-bg/50">
            {/* 1. HEADER ADAPTATIVO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl text-white shadow-xl shadow-brand-primary/20 transform -rotate-2">
                        <Activity size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-brand-heading uppercase italic tracking-tighter leading-none">
                            Control de <span className="text-brand-accent">Lesiones</span>
                        </h1>
                        <p className="text-[9px] md:text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mt-1 ml-1">
                            Staff Imperio 7 • Gestión Administrativa
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchPendientes}
                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-brand-surface px-6 py-3 rounded-2xl border border-brand-border text-[10px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    Sincronizar
                </button>
            </div>

            {/* 2. CONTENEDOR PRINCIPAL (Móvil: Grid / Desktop: Tabla) */}
            <div className="bg-transparent md:bg-brand-surface md:rounded-[2.5rem] md:border md:border-brand-border/60 md:overflow-hidden md:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
                
                {/* --- VISTA DESKTOP (TABLA) --- */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-brand-bg/80 border-b border-brand-border-soft">
                                <th className="px-8 py-7 text-left text-[10px] font-black uppercase tracking-widest text-brand-muted">Alumno</th>
                                <th className="px-8 py-7 text-left text-[10px] font-black uppercase tracking-widest text-brand-muted">Motivo</th>
                                <th className="px-8 py-7 text-center text-[10px] font-black uppercase tracking-widest text-brand-muted">Adjunto</th>
                                <th className="px-8 py-7 text-center text-[10px] font-black uppercase tracking-widest text-brand-muted">Fecha</th>
                                <th className="px-8 py-7 text-center text-[10px] font-black uppercase tracking-widest text-brand-muted">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {solicitudes.map((sol) => (
                                <tr key={sol.id} className="hover:bg-brand-bg/50 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-brand-primary-soft rounded-xl flex items-center justify-center text-brand-primary font-black italic shadow-inner">{sol.alumnos.usuarios.nombres[0]}</div>
                                            <div>
                                                <div className="font-black text-slate-800 uppercase italic tracking-tighter text-sm">{sol.alumnos.usuarios.nombres} {sol.alumnos.usuarios.apellidos}</div>
                                                <div className="text-[9px] font-bold text-brand-muted">DNI {sol.alumnos.usuarios.numero_documento}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-slate-500 font-semibold italic max-w-xs truncate">"{sol.descripcion_lesion}"</td>
                                    <td className="px-8 py-6 text-center">
                                        <button onClick={() => openEvidenceViewer(sol.url_evidencia_medica)} className="p-2.5 rounded-2xl bg-brand-surface border border-brand-border text-brand-primary hover:bg-brand-primary hover:text-white transition-all shadow-sm"><Eye size={18} /></button>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-[10px] font-black text-slate-600 bg-brand-surface-alt px-3 py-1.5 rounded-full uppercase italic">
                                            {new Date(sol.fecha_solicitud).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <button onClick={() => openEvaluateModal(sol)} className="bg-brand-accent hover:bg-brand-primary-dark text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-accent/20 transition-all active:scale-95">Evaluar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* --- VISTA MÓVIL (CARDS) --- */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                    ) : solicitudes.length === 0 ? (
                        <div className="bg-brand-surface p-10 rounded-[2.5rem] text-center shadow-sm border border-brand-border-soft">
                            <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-brand-muted font-black uppercase text-[10px] tracking-widest italic">Bandeja de Entrada Vacía</p>
                        </div>
                    ) : (
                        solicitudes.map((sol) => (
                            <div key={sol.id} className="bg-brand-surface p-6 rounded-[2.5rem] border border-brand-border-soft shadow-sm relative overflow-hidden group">
                                <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 bg-brand-primary text-white rounded-2xl flex items-center justify-center font-black italic text-lg shadow-lg shadow-brand-primary/20">{sol.alumnos.usuarios.nombres[0]}</div>
                                        <div>
                                            <h3 className="font-black text-brand-primary uppercase italic text-sm">{sol.alumnos.usuarios.nombres}</h3>
                                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mt-0.5">{sol.alumnos.usuarios.apellidos}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-black text-brand-muted bg-brand-bg px-3 py-1.5 rounded-full border border-brand-border-soft italic">
                                        {new Date(sol.fecha_solicitud).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                                    </span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="flex items-start gap-3 bg-brand-bg/50 p-4 rounded-2xl border border-brand-border-soft">
                                        <FileText size={14} className="text-brand-accent mt-0.5 shrink-0" />
                                        <p className="text-xs text-slate-600 font-semibold italic leading-relaxed">"{sol.descripcion_lesion}"</p>
                                    </div>
                                    <div className="flex items-center gap-2 px-1">
                                        <Fingerprint size={12} className="text-slate-300" />
                                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Identidad: {sol.alumnos.usuarios.numero_documento}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-6">
                                    <button onClick={() => openEvidenceViewer(sol.url_evidencia_medica)} className="flex items-center justify-center gap-2 bg-brand-primary-soft text-brand-primary py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"><Eye size={16}/> Evidencia</button>
                                    <button onClick={() => openEvaluateModal(sol)} className="bg-brand-accent text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/20 active:scale-95 transition-all">Evaluar</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MODALES Y VISOR (Lógica de Negocio intacta) */}
            <InjuryEvaluationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} solicitud={selectedSolicitud} onEvaluateSuccess={fetchPendientes} />
            {evidenceViewerOpen && (
                <div className="fixed inset-0 z-modal-nested flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setEvidenceViewerOpen(false)}>
                    <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setEvidenceViewerOpen(false)} className="absolute -top-16 right-0 p-3 text-white/40 hover:text-brand-accent transition-all bg-white/5 rounded-2xl border border-white/5"><X size={24} /></button>
                        <div className="bg-brand-surface p-2 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/20">
                            <img src={evidenceUrl} alt="Evidencia" className="max-w-full max-h-[75vh] object-contain rounded-[2rem]" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInjuriesManager;