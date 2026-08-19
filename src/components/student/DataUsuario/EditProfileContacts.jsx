import React, { useState, useEffect } from 'react';
import { Phone, Plus, Star, Trash2, Pencil, Loader2, X, Check } from 'lucide-react';
import apiFetch from '../../../interceptors/api.js';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../../constants/apiRoutes.js';

const CONTACTO_VACIO = { nombre_completo: '', relacion: '', telefono: '', es_principal: false };

// Componente independiente: gestiona sus propios contactos vía API,
// se monta dentro de EditProfileModal como una sección más del formulario.
const EditProfileContacts = () => {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null); // null = no editando, 'new' = creando
  const [formContacto, setFormContacto] = useState(CONTACTO_VACIO);

  const cargarContactos = async () => {
    setLoading(true);
    try {
      const response = await apiFetch.get(API_ROUTES.ALUMNOS.CONTACTOS.BASE);
      const result = await response.json();
      if (response.ok) setContactos(result.data || []);
    } catch (error) {
      toast.error('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarContactos(); }, []);

  const abrirNuevo = () => {
    setFormContacto(CONTACTO_VACIO);
    setEditandoId('new');
  };

  const abrirEdicion = (contacto) => {
    setFormContacto({
      nombre_completo: contacto.nombre_completo,
      relacion: contacto.relacion,
      telefono: contacto.telefono,
      es_principal: contacto.es_principal,
    });
    setEditandoId(contacto.id);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setFormContacto(CONTACTO_VACIO);
  };

  const guardarContacto = async () => {
    if (!formContacto.nombre_completo.trim() || !formContacto.relacion.trim() || !formContacto.telefono.trim()) {
      toast.error('Completa nombre, relación y teléfono');
      return;
    }

    setGuardando(true);
    try {
      const esNuevo = editandoId === 'new';
      const response = esNuevo
        ? await apiFetch.post(API_ROUTES.ALUMNOS.CONTACTOS.BASE, formContacto)
        : await apiFetch.patch(API_ROUTES.ALUMNOS.CONTACTOS.BY_ID(editandoId), formContacto);

      const result = await response.json();
      if (!response.ok) throw new Error(result.errors ? result.errors[0].message : result.message);

      toast.success(esNuevo ? 'Contacto agregado' : 'Contacto actualizado');
      cancelarEdicion();
      cargarContactos();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const eliminarContacto = async (id) => {
    if (!window.confirm('¿Eliminar este contacto de emergencia?')) return;

    try {
      const response = await apiFetch.delete(API_ROUTES.ALUMNOS.CONTACTOS.BY_ID(id));
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      toast.success('Contacto eliminado');
      cargarContactos();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-3">
      <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Phone size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contactos de Emergencia</span>
        </div>
        {editandoId === null && (
          <button
            type="button"
            onClick={abrirNuevo}
            className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase hover:text-emerald-700 transition-colors"
          >
            <Plus size={14} /> Agregar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin text-slate-300" size={20} />
        </div>
      ) : (
        <div className="space-y-2">
          {contactos.length === 0 && editandoId === null && (
            <p className="text-[10px] font-bold text-slate-400 italic py-2">Sin contactos registrados aún.</p>
          )}

          {contactos.map((c) => (
            editandoId === c.id ? (
              <FormularioContacto
                key={c.id}
                formContacto={formContacto}
                setFormContacto={setFormContacto}
                onGuardar={guardarContacto}
                onCancelar={cancelarEdicion}
                guardando={guardando}
              />
            ) : (
              <div key={c.id} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-800 truncate">{c.nombre_completo}</h4>
                    {c.es_principal && <Star size={11} className="text-orange-500 fill-orange-500 shrink-0" />}
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">{c.relacion} · {c.telefono}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button type="button" onClick={() => abrirEdicion(c)} className="p-1.5 text-slate-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button type="button" onClick={() => eliminarContacto(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          ))}

          {editandoId === 'new' && (
            <FormularioContacto
              formContacto={formContacto}
              setFormContacto={setFormContacto}
              onGuardar={guardarContacto}
              onCancelar={cancelarEdicion}
              guardando={guardando}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Sub-formulario reutilizado tanto para crear como para editar un contacto
const FormularioContacto = ({ formContacto, setFormContacto, onGuardar, onCancelar, guardando }) => (
  <div className="bg-white border-2 border-emerald-200 rounded-xl p-3 space-y-2">
    <div className="grid grid-cols-2 gap-2">
      <input
        type="text"
        placeholder="Nombre completo"
        value={formContacto.nombre_completo}
        onChange={e => setFormContacto({ ...formContacto, nombre_completo: e.target.value })}
        className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
      />
      <input
        type="text"
        placeholder="Relación (Madre, Padre...)"
        value={formContacto.relacion}
        onChange={e => setFormContacto({ ...formContacto, relacion: e.target.value })}
        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={formContacto.telefono}
        onChange={e => setFormContacto({ ...formContacto, telefono: e.target.value })}
        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
      />
    </div>

    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={formContacto.es_principal}
        onChange={e => setFormContacto({ ...formContacto, es_principal: e.target.checked })}
        className="accent-orange-500 w-3.5 h-3.5"
      />
      <span className="text-[9px] font-black text-slate-500 uppercase">Marcar como principal</span>
    </label>

    <div className="flex items-center gap-2 pt-1">
      <button
        type="button"
        onClick={onGuardar}
        disabled={guardando}
        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase py-2 rounded-lg transition-colors"
      >
        {guardando ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
        Guardar
      </button>
      <button
        type="button"
        onClick={onCancelar}
        disabled={guardando}
        className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-black uppercase py-2 px-3 rounded-lg transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  </div>
);

export default EditProfileContacts;