import React, { useEffect, useState } from 'react';
import { X, Loader2, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../shared/Modal';
import MerchImage from './MerchImage';
import { validateImageFile } from '../../utils/imageUpload';

const EMPTY = { nombre: '', descripcion: '', precio: '', stock: '0', estado: 'ACTIVO' };

const toForm = (producto) => producto
  ? {
    nombre: producto.nombre ?? '',
    descripcion: producto.descripcion ?? '',
    precio: String(producto.precio ?? ''),
    stock: String(producto.stock ?? 0),
    estado: producto.estado ?? 'ACTIVO',
  }
  : EMPTY;

const inputClass = 'w-full bg-brand-bg border border-brand-border-soft rounded-xl px-4 py-3 text-xs font-bold text-brand-heading outline-none focus:ring-2 focus:ring-brand-gold/30';
const labelClass = 'block text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1.5';

// Alta (producto = null) y edición de un producto del catálogo. `onSubmit` recibe un
// FormData (multipart): el backend sube la imagen a Cloudinary. Devuelve una promesa.
const MerchFormModal = ({ producto = null, onClose, onSubmit }) => {
  const [form, setForm] = useState(() => toForm(producto));
  const [saving, setSaving] = useState(false);
  // Archivo elegido (File ya validado). null = la imagen no cambia.
  const [nuevaImagen, setNuevaImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // true = el admin quitó la imagen actual sin subir otra.
  const [quitarImagen, setQuitarImagen] = useState(false);
  const esEdicion = Boolean(producto);

  // Vista previa local del archivo; se libera al cambiarlo o cerrar el modal.
  useEffect(() => {
    if (!nuevaImagen) { setPreviewUrl(null); return undefined; }
    const url = URL.createObjectURL(nuevaImagen);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [nuevaImagen]);

  const set = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }));

  const handleImagen = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file) return;
    try {
      setNuevaImagen(validateImageFile(file));
      setQuitarImagen(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleQuitarImagen = () => {
    setNuevaImagen(null);
    setQuitarImagen(Boolean(producto?.imagen_url));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('nombre', form.nombre.trim());
      data.append('descripcion', form.descripcion.trim()); // vacío = sin descripción (el backend lo guarda como null)
      data.append('precio', form.precio);
      data.append('stock', form.stock);
      data.append('estado', form.estado);
      // En edición solo se envía la imagen si cambió o se quitó.
      if (nuevaImagen) data.append('imagen', nuevaImagen);
      else if (quitarImagen) data.append('eliminar_imagen', 'true');
      await onSubmit(data);
    } finally {
      setSaving(false);
    }
  };

  const imagenActual = quitarImagen ? null : producto?.imagen_url;
  const hayImagen = Boolean(nuevaImagen || imagenActual);

  return (
    <Modal onBackdropClick={saving ? undefined : onClose}>
      <form onSubmit={handleSubmit} className="p-8 space-y-5">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-black text-brand-heading uppercase italic tracking-tight">
            {esEdicion ? 'Editar' : 'Añadir nuevo'} <span className="text-brand-gold">merch</span>
          </h3>
          <button type="button" onClick={onClose} disabled={saving} className="p-2 rounded-full text-brand-muted hover:bg-brand-surface-alt">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className={labelClass}>Nombre</label>
          <input required minLength={2} maxLength={150} value={form.nombre} onChange={set('nombre')} className={inputClass} placeholder="Polo oficial IMPERIO 7" />
        </div>

        <div>
          <label className={labelClass}>Descripción</label>
          <textarea rows={2} maxLength={2000} value={form.descripcion} onChange={set('descripcion')} className={`${inputClass} resize-none`} placeholder="Opcional" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Precio (S/)</label>
            <input required type="number" min="0" step="0.01" value={form.precio} onChange={set('precio')} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Stock</label>
            <input required type="number" min="0" step="1" value={form.stock} onChange={set('stock')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Imagen</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" id="merch-imagen" className="hidden" onChange={handleImagen} />
          <label htmlFor="merch-imagen" className="flex items-center gap-4 bg-brand-bg border-2 border-dashed border-brand-border rounded-2xl p-3 cursor-pointer hover:border-brand-gold transition-colors">
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
              <MerchImage item={{ nombre: form.nombre, imagen_url: previewUrl ?? imagenActual }} iconSize={24} />
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase italic text-brand-primary"><Upload size={14} /> {hayImagen ? 'Cambiar imagen' : 'Seleccionar imagen'}</p>
              <p className="text-[9px] font-bold text-brand-muted">JPG, PNG o WEBP · máx. 5 MB. Sin imagen se usa un placeholder.</p>
            </div>
          </label>
          {hayImagen && (
            <button type="button" onClick={handleQuitarImagen} className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-600">
              <Trash2 size={12} /> Quitar imagen
            </button>
          )}
        </div>

        {esEdicion && (
          <div>
            <label className={labelClass}>Estado</label>
            <select value={form.estado} onChange={set('estado')} className={inputClass}>
              <option value="ACTIVO">Activo (visible en la tienda)</option>
              <option value="INACTIVO">Dado de baja</option>
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-6 py-3.5 rounded-2xl bg-brand-surface-alt text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="flex-[2] flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all disabled:opacity-60">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default MerchFormModal;
