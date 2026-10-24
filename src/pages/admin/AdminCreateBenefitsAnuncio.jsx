import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader2, RefreshCcw, Users, HeartPulse, Gift, Sparkles, Zap, Star, Trophy, Power, PowerOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import ConfirmModal from '../../components/shared/ConfirmModal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

// 🎨 Mapeo de Iconos Disponibles
const IconOptions = {
  RefreshCcw, Users, HeartPulse, Gift, Sparkles, Zap, Star, Trophy
};

// 🎨 Gradientes Predefinidos (paleta Imperio 7). Los id se mantienen por compatibilidad.
const GradientesOptions = [
  { id: 'blue', class: 'from-brand-primary to-brand-primary-light', label: 'Vinotinto Imperial' },
  { id: 'orange', class: 'from-brand-accent-dark to-brand-accent', label: 'Oro Imperial' },
  { id: 'red', class: 'from-red-600 to-red-400', label: 'Rojo Lesión' },
  { id: 'green', class: 'from-emerald-600 to-emerald-400', label: 'Verde Éxito' },
  { id: 'purple', class: 'from-brand-primary-dark to-brand-primary', label: 'Obsidiana Real' },
];

const AdminCreateBenefitsAnuncio = () => {
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const formInicial = {
    id: null,
    tipo: '',
    titulo: '',
    descripcion: '',
    icono: 'Gift',
    gradiente: 'from-brand-primary to-brand-primary',
    badge: '',
    activo: true,
    orden: 0
  };
  
  const [formData, setFormData] = useState(formInicial);

  // 1. CARGAR DATOS
  const fetchAnuncios = async () => {
    try {
      setLoading(true);
      // Asume que tu ruta base es /api/anuncios-beneficios
      const response = await apiFetch.get(API_ROUTES.ANUNCIOS_BENEFICIOS.BASE); 
      const result = await response.json();
      if (response.ok) {
        setAnuncios(result.data);
      } else {
        toast.error('Error al cargar anuncios');
      }
    } catch (error) {
        console.error('Error en fetchAnuncios:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnuncios();
  }, []);

  // 2. MANEJAR FORMULARIO
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openModal = (anuncio = null) => {
    if (anuncio) {
      setFormData(anuncio);
    } else {
      setFormData(formInicial);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Convertir orden a número
    const payload = { ...formData, orden: Number(formData.orden) };

    try {
      const isEdit = payload.id !== null;
      const url = isEdit ? API_ROUTES.ANUNCIOS_BENEFICIOS.BY_ID(payload.id) : API_ROUTES.ANUNCIOS_BENEFICIOS.BASE;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await apiFetch(url, {
        method: method,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(isEdit ? '¡Anuncio actualizado!' : '¡Anuncio creado!');
        setIsModalOpen(false);
        fetchAnuncios();
      } else {
        const res = await response.json();
        toast.error(res.message || 'Error al guardar');
      }
    } catch (error) {
        console.error('Error en handleSubmit:', error);
      toast.error('Error de red');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. ELIMINAR
  const handleDelete = (id) => {
    setDeleteTargetId(id);
  };

  const executeDelete = async () => {
    const id = deleteTargetId;
    setDeleteTargetId(null);
    try {
      const response = await apiFetch.delete(API_ROUTES.ANUNCIOS_BENEFICIOS.BY_ID(id));
      if (response.ok) {
        toast.success('Anuncio eliminado');
        fetchAnuncios();
      } else {
        toast.error('Error al eliminar');
      }
    } catch (error) {
        console.error('Error en executeDelete:', error);
      toast.error('Error de conexión');
    }
  };

  // 4. TOGGLE ACTIVO/INACTIVO RÁPIDO
  const toggleActivo = async (anuncio) => {
    try {
      const response = await apiFetch.patch(API_ROUTES.ANUNCIOS_BENEFICIOS.BY_ID(anuncio.id), {
        activo: !anuncio.activo
      });
      if (response.ok) {
        toast.success(anuncio.activo ? 'Anuncio Apagado' : 'Anuncio Encendido');
        fetchAnuncios();
      }
    } catch (error) {
        console.error('Error en toggleActivo:', error);
      toast.error('Error de conexión');
    }
  };

  if (loading) return <LoadingSpinner className="flex h-screen items-center justify-center bg-brand-bg" colorClassName="text-brand-accent" size={48} />;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen bg-brand-bg">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter">
            Anuncios y <span className="text-brand-accent">Beneficios</span>
          </h1>
          <p className="text-[11px] font-black text-brand-muted uppercase tracking-[0.2em] mt-2">
            Gestiona el carrusel de estudiantes
          </p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="bg-brand-accent text-white px-6 py-3 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-brand-accent-dark transition-all flex items-center gap-2 shadow-lg shadow-brand-accent/30"
        >
          <Plus size={18} /> Crear Nuevo
        </button>
      </div>

      {/* GRID DE TARJETAS (Previsualización Real) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {anuncios.map((anuncio) => {
          const IconComponent = IconOptions[anuncio.icono] || Gift;
          
          return (
            <div key={anuncio.id} className={`relative rounded-[2.5rem] overflow-hidden shadow-xl border-4 ${anuncio.activo ? 'border-white' : 'border-slate-300 opacity-70 grayscale-[0.3]'} transition-all`}>
              
              {/* Overlay de Controles Admin */}
              <div className="absolute top-4 right-4 z-30 flex gap-2">
                <button onClick={() => toggleActivo(anuncio)} className={`p-2 rounded-full backdrop-blur-md border border-white/20 text-white transition-colors ${anuncio.activo ? 'bg-emerald-500/80 hover:bg-emerald-500' : 'bg-red-500/80 hover:bg-red-500'}`} title={anuncio.activo ? "Apagar" : "Encender"}>
                  {anuncio.activo ? <Power size={14} /> : <PowerOff size={14} />}
                </button>
                <button onClick={() => openModal(anuncio)} className="p-2 bg-brand-primary/80 hover:bg-brand-primary backdrop-blur-md rounded-full text-white border border-white/20 transition-colors">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(anuncio.id)} className="p-2 bg-red-600/80 hover:bg-red-600 backdrop-blur-md rounded-full text-white border border-white/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Tag de Orden */}
              <div className="absolute top-4 left-4 z-30 bg-black/40 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black border border-white/20">
                ORDEN: {anuncio.orden}
              </div>

              {/* PREVISUALIZACIÓN IDENTICA AL FRONTEND DEL ALUMNO */}
              <div className="relative h-56">
                <div className={`absolute inset-0 bg-gradient-to-r ${anuncio.gradiente}`}></div>
                <div className="relative z-10 p-6 pt-16 text-white flex flex-col justify-end h-full">
                  <span className="text-[9px] font-black bg-white/20 px-2.5 py-1 rounded-lg w-fit mb-2 tracking-widest uppercase">
                    {anuncio.badge}
                  </span>
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0 mt-1">
                      <IconComponent size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic uppercase leading-none mb-1 tracking-tighter drop-shadow-md">
                        {anuncio.titulo}
                      </h3>
                      <p className="text-[10px] font-medium opacity-90 leading-snug line-clamp-2 drop-shadow-sm">
                        {anuncio.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {anuncios.length === 0 && (
          <EmptyState
            className="col-span-full py-20 text-center border-2 border-dashed border-slate-300 rounded-[3rem]"
            icon={Gift}
            iconSize={48}
            iconClassName="mx-auto text-slate-300 mb-4"
            message="No hay anuncios configurados"
            messageClassName="text-brand-muted font-black uppercase tracking-widest text-sm"
          />
        )}
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-brand-primary-dark/80 backdrop-blur-sm p-4">
          <div className="bg-brand-surface w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-brand-border-soft flex justify-between items-center bg-brand-bg">
              <h2 className="text-2xl font-black text-brand-primary uppercase italic">
                {formData.id ? 'Editar Anuncio' : 'Nuevo Anuncio'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-brand-muted hover:text-red-500 font-black text-xl">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Título Principal</label>
                  <input required type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej: Trae a un amigo" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary font-bold text-sm outline-none focus:border-brand-accent transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Tipo (Interno)</label>
                  <input required type="text" name="tipo" value={formData.tipo} onChange={handleChange} placeholder="Ej: REFERIDOS" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary font-bold text-sm outline-none focus:border-brand-accent transition-colors uppercase" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Descripción</label>
                  <textarea required name="descripcion" value={formData.descripcion} onChange={handleChange} rows="2" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary font-medium text-xs outline-none focus:border-brand-accent transition-colors resize-none"></textarea>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Etiqueta (Badge)</label>
                  <input required type="text" name="badge" value={formData.badge} onChange={handleChange} placeholder="Ej: PROMO" className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary font-bold text-sm outline-none focus:border-brand-accent transition-colors uppercase" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Orden de Aparición</label>
                  <input required type="number" min="0" name="orden" value={formData.orden} onChange={handleChange} className="w-full p-3 rounded-xl border border-brand-border bg-brand-bg text-brand-primary font-bold text-sm outline-none focus:border-brand-accent transition-colors" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block">Icono</label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.keys(IconOptions).map(iconName => {
                      const Icono = IconOptions[iconName];
                      return (
                        <button type="button" key={iconName} onClick={() => setFormData({...formData, icono: iconName})} className={`p-3 rounded-xl border flex justify-center items-center transition-all ${formData.icono === iconName ? 'bg-brand-primary border-brand-primary text-white' : 'bg-brand-bg border-brand-border text-brand-muted hover:border-brand-primary'}`}>
                          <Icono size={20} />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 block">Color (Gradiente)</label>
                  <div className="space-y-2">
                    {GradientesOptions.map(grad => (
                      <button type="button" key={grad.id} onClick={() => setFormData({...formData, gradiente: grad.class})} className={`w-full flex items-center justify-between p-2 rounded-xl border transition-all ${formData.gradiente === grad.class ? 'border-brand-accent bg-brand-accent-soft' : 'border-brand-border bg-brand-bg hover:border-slate-300'}`}>
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{grad.label}</span>
                        <div className={`w-8 h-4 rounded-full bg-gradient-to-r ${grad.class}`}></div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 pt-4 border-t border-brand-border-soft flex items-center gap-3">
                  <input type="checkbox" id="activo" name="activo" checked={formData.activo} onChange={handleChange} className="w-5 h-5 accent-brand-accent" />
                  <label htmlFor="activo" className="text-sm font-black text-brand-primary uppercase italic cursor-pointer">Publicar Inmediatamente</label>
                </div>

              </div>

              <div className="mt-8 flex gap-4">
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-brand-accent text-white py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-brand-accent-dark transition-all shadow-lg flex justify-center items-center">
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Guardar Anuncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={executeDelete}
        title="¿Eliminar Anuncio?"
        message="Esta acción no se puede deshacer."
        iconType="danger"
        confirmText="Sí, eliminar"
      />
    </div>
  );
};

export default AdminCreateBenefitsAnuncio;