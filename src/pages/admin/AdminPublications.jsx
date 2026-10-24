import React, { useState, useEffect } from 'react';
import {
    Megaphone, Plus, ArrowLeft, Image as ImageIcon,
    CheckCircle, Loader2, Trash2, Calendar, User, AlertCircle
} from 'lucide-react';
import apiFetch from '../../interceptors/api'; // Interceptor que maneja FormData
import { useAuth } from '../../context/AuthContext'; // Contexto para el ID del Admin
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';
import ConfirmModal from '../../components/shared/ConfirmModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

const AdminPublications = () => {
    const { userId } = useAuth(); // ID del administrador logueado
    const [view, setView] = useState('list'); // Control de vistas: 'list' o 'create'
    const [publicaciones, setPublicaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // Estados del Formulario de Creación
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [imagenFile, setImagenFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Función para obtener las publicaciones del backend
    const fetchPublicaciones = async () => {
        setLoading(true);
        try {
            const response = await apiFetch.get(API_ROUTES.PUBLICACIONES.BASE);
            const result = await response.json();
            if (response.ok) {
                setPublicaciones(result.data || []);
            } else {
                toast.error("Error al cargar las publicaciones");
            }
        } catch (error) {
            console.error('Error en fetchPublicaciones:', error);
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicaciones();
    }, []);

    // Manejo de la imagen (Igual que en ReportPaymentModal)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                return toast.error("Por favor sube un archivo de imagen válido");
            }
            setImagenFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Envío del formulario usando FormData
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!titulo.trim() || !contenido.trim()) return toast.error("Completa los campos");

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('titulo', titulo);
            data.append('contenido', contenido);
            data.append('autor_id', parseInt(userId)); // Usamos el 13 que ya vimos que existe

            if (imagenFile) {
                // Asegúrate de que la llave sea 'imagen'
                data.append('imagen', imagenFile);
            }

            // 🚀 LLAMADA LIMPIA: No pases {} como tercer argumento si no es necesario
            const response = await apiFetch.post(API_ROUTES.PUBLICACIONES.BASE, data);

            if (response.ok) {
                toast.success("¡Publicado!");
                setView('list');
                fetchPublicaciones();
            } else {
                const errorRes = await response.json();
                console.error("Error Backend:", errorRes);
                toast.error(errorRes.message || "Error 500");
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setDeleteTargetId(id);
    };

    const executeDelete = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);
        try {
            const response = await apiFetch.delete(API_ROUTES.PUBLICACIONES.BY_ID(id));
            if (response.ok) {
                toast.success("Publicación eliminada");
                fetchPublicaciones();
            }
        } catch (error) {
            console.error('Error en executeDelete:', error);
            toast.error("Error al eliminar");
        }
    };

    // ==========================================
    // RENDER: FORMULARIO DE CREACIÓN
    // ==========================================
    if (view === 'create') {
        return (
            <div className="space-y-6 animate-fade-in-up p-1 pb-20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('list')} className="p-2.5 bg-brand-surface border border-brand-border rounded-xl hover:bg-brand-bg transition-all text-slate-600">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black italic uppercase tracking-tight text-brand-heading">
                                Nueva <span className="text-brand-primary">Publicación</span>
                            </h1>
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest italic">Anuncio para la comunidad Imperio 7</p>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-sm overflow-hidden max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Título del Anuncio</label>
                            <input
                                type="text"
                                value={titulo}
                                onChange={(e) => setTitulo(e.target.value)}
                                className="w-full bg-brand-bg border-2 border-brand-border-soft rounded-2xl px-5 py-4 text-sm font-black text-brand-primary outline-none focus:border-brand-accent transition-colors"
                                placeholder="EJ: ¡MAÑANA GRAN TORNEO!"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Contenido</label>
                            <textarea
                                value={contenido}
                                onChange={(e) => setContenido(e.target.value)}
                                className="w-full bg-brand-bg border-2 border-brand-border-soft rounded-2xl px-5 py-4 text-sm font-medium text-brand-body outline-none focus:border-brand-accent min-h-[180px] resize-none"
                                placeholder="Escribe los detalles aquí..."
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Imagen Destacada</label>
                            <input type="file" id="pub-image" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <label htmlFor="pub-image" className="block bg-brand-bg border-2 border-dashed border-brand-border rounded-[2rem] py-10 text-center cursor-pointer hover:bg-brand-accent-soft hover:border-brand-accent/30 transition-all">
                                {previewUrl ? (
                                    <img src={previewUrl} className="h-40 mx-auto rounded-2xl shadow-lg" alt="Preview" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <UploadIcon className="text-slate-300" size={40} />
                                        <p className="text-[10px] font-black text-brand-muted uppercase">Seleccionar Imagen</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-brand-primary hover:bg-brand-accent-dark text-white font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 disabled:bg-slate-300 shadow-xl shadow-brand-primary/10 active:scale-95"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Megaphone size={20} />}
                            {submitting ? "PROCESANDO..." : "PUBLICAR EN EL MURO"}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ==========================================
    // RENDER: LISTADO DE PUBLICACIONES
    // ==========================================
    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black italic uppercase tracking-tight text-brand-heading">
                        Muro de <span className="text-brand-primary">Publicaciones</span>
                    </h1>
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest italic">Anuncios y noticias del club</p>
                </div>
                <button
                    onClick={() => setView('create')}
                    className="bg-gradient-to-r from-brand-primary to-brand-primary-dark hover:from-brand-accent hover:to-brand-accent-dark text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 transition-all duration-300 shadow-xl"
                >
                    <Plus size={20} />
                    Crear Noticia
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : publicaciones.length === 0 ? (
                <EmptyState
                    className="bg-brand-surface rounded-3xl border border-brand-border p-16 text-center"
                    icon={Megaphone}
                    iconSize={60}
                    iconClassName="mx-auto text-slate-200 mb-4"
                    as="h3"
                    message="No hay publicaciones activas"
                    messageClassName="text-sm font-black text-brand-muted uppercase italic"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {publicaciones.map((pub) => (
                        <div key={pub.id} className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-sm overflow-hidden flex flex-col group">
                            {pub.imagen_url && (
                                <div className="h-48 overflow-hidden">
                                    <img src={pub.imagen_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="News" />
                                </div>
                            )}
                            <div className="p-7 flex-1 flex flex-col">
                                <h3 className="font-black text-brand-primary uppercase italic text-lg mb-3 line-clamp-2">{pub.titulo}</h3>
                                <p className="text-slate-600 text-sm font-medium line-clamp-4 flex-1">{pub.contenido}</p>

                                <div className="mt-6 pt-5 border-t border-brand-border-soft flex justify-between items-center">
                                    <div className="text-[9px] font-black text-brand-muted uppercase italic space-y-1">
                                        <div className="flex items-center gap-2"><Calendar size={12} /> {new Date(pub.creado_en).toLocaleDateString()}</div>
                                        <div className="flex items-center gap-2 text-brand-primary"><User size={12} /> {pub.administrador?.usuarios?.nombres || 'Admin'}</div>
                                    </div>
                                    <button onClick={() => handleDelete(pub.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeDelete}
                title="¿Eliminar noticia?"
                message="Esta acción no se puede deshacer."
                iconType="danger"
                confirmText="Eliminar"
            />
        </div>
    );
};

// Icono auxiliar para el diseño
const UploadIcon = ({ size, className }) => (
    <div className={`p-4 bg-brand-surface-alt rounded-full ${className}`}>
        <ImageIcon size={size} />
    </div>
);

export default AdminPublications;