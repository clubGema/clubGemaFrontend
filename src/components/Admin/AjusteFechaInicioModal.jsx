import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import apiFetch from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import Modal from '../shared/Modal';

// Parsea 'YYYY-MM-DD' sin desfase de zona horaria. Devuelve 1=Lunes ... 7=Domingo.
const diaISO = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return dow === 0 ? 7 : dow;
};

const fmt = (ymd) => {
  if (!ymd) return '---';
  const [y, m, d] = String(ymd).split('T')[0].split('-');
  return `${d}/${m}/${y}`;
};

const AjusteFechaInicioModal = ({ cuentaId, onClose, onSuccess }) => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState('');
  const [motivo, setMotivo] = useState('');
  const [resultado, setResultado] = useState(null);

  const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Lima' });

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await apiFetch.get(API_ROUTES.INSCRIPCIONES.AJUSTE_FECHA(cuentaId));
        const json = await res.json();
        if (cancel) return;
        if (res.ok) setInfo(json.data);
        else { toast.error(json.message || json.error || 'No se pudo consultar el ajuste'); onClose(); }
      } catch (e) {
        console.error('Error cargando ajuste de fecha:', e);
        if (!cancel) { toast.error('Error de red'); onClose(); }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [cuentaId]); // eslint-disable-line react-hooks/exhaustive-deps

  const diasPermitidos = info?.dias_permitidos || [];
  const errorDia = nuevaFecha && diasPermitidos.length > 0 && !diasPermitidos.includes(diaISO(nuevaFecha))
    ? `La fecha debe caer en: ${(info.dias_permitidos_nombres || []).join(', ')}.`
    : null;
  const fechaPasada = nuevaFecha && nuevaFecha < hoy;
  const puedeConfirmar = info?.puede_ajustar && nuevaFecha && !errorDia && !fechaPasada && !saving;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      const body = { nueva_fecha: nuevaFecha };
      if (motivo.trim()) body.motivo = motivo.trim();
      const res = await apiFetch.patch(API_ROUTES.INSCRIPCIONES.AJUSTE_FECHA(cuentaId), body);
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Fecha de inicio ajustada');
        setResultado(json.data);
        if (onSuccess) onSuccess();
      } else {
        toast.error(json.message || json.error || 'No se pudo ajustar la fecha');
      }
    } catch (e) {
      console.error('Error ajustando fecha:', e);
      toast.error('Error de red');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal boxClassName="bg-brand-surface w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl border border-brand-border-soft">
      <div className="p-8 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-accent-soft w-12 h-12 rounded-2xl text-brand-accent-dark flex items-center justify-center"><Calendar size={24} /></div>
            <h3 className="text-lg font-black uppercase italic text-brand-primary leading-tight">Ajustar fecha de inicio</h3>
          </div>
          <button onClick={onClose} className="p-2 text-brand-muted hover:text-brand-primary"><X size={18} /></button>
        </div>

        {loading && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-brand-accent" size={32} /></div>}

        {!loading && info && resultado && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700 font-black text-sm"><CheckCircle size={18} /> Fecha ajustada a {fmt(resultado.fecha_inicio)}</div>
            <p className="text-xs font-bold text-brand-body">Clases eliminadas: {resultado.clases_eliminadas} · Clases generadas: {resultado.clases_generadas}</p>
            {resultado.fechas?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resultado.fechas.map(f => <span key={f} className="px-2 py-1 bg-brand-bg border border-brand-border-soft rounded-lg text-[10px] font-black text-brand-primary">{fmt(f)}</span>)}
              </div>
            )}
            {resultado.advertencias?.length > 0 && (
              <div className="bg-brand-accent-soft border border-brand-accent/30 rounded-2xl p-4 space-y-1">
                {resultado.advertencias.map((a, i) => (
                  <p key={i} className="text-[11px] font-bold text-brand-accent-dark flex gap-2"><AlertTriangle size={14} className="shrink-0 mt-0.5" /> {a}</p>
                ))}
              </div>
            )}
            <button onClick={onClose} className="w-full bg-brand-primary text-white py-3 rounded-2xl font-black uppercase italic text-xs">Cerrar</button>
          </div>
        )}

        {!loading && info && !resultado && (
          <div className="space-y-4">
            {!info.puede_ajustar && (
              <div className="bg-brand-accent-soft border border-brand-accent/30 rounded-2xl p-4 flex gap-2 text-[11px] font-bold text-brand-accent-dark">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{info.motivo_bloqueo || 'No es posible ajustar la fecha de este paquete.'}</span>
              </div>
            )}
            <div className="bg-brand-bg rounded-2xl p-4 space-y-1.5 text-[11px] font-bold text-brand-body">
              <p>Tipo: <span className="font-black text-brand-primary">{info.tipo}</span></p>
              <p>Fecha de inicio actual: <span className="font-black text-brand-primary">{fmt(info.fecha_inicio_actual)}</span></p>
              <p>Primera clase: <span className="font-black text-brand-primary">{fmt(info.primera_clase)}</span></p>
              <p>Días del paquete: <span className="font-black text-brand-primary">{(info.dias_permitidos_nombres || []).join(', ') || '---'}</span></p>
              <p>Se regenerarán <span className="font-black text-brand-primary">{info.clases_a_regenerar}</span> clases</p>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-brand-muted uppercase ml-2 tracking-widest">Nueva fecha de inicio</label>
              <input
                type="date"
                min={hoy}
                value={nuevaFecha}
                disabled={!info.puede_ajustar}
                onChange={(e) => setNuevaFecha(e.target.value)}
                className="w-full bg-brand-bg border-2 border-brand-border-soft rounded-2xl px-4 py-3 font-black text-brand-primary outline-none focus:border-brand-accent disabled:opacity-50"
              />
              {errorDia && <p className="text-[10px] font-bold text-red-600 ml-2">{errorDia}</p>}
              {fechaPasada && <p className="text-[10px] font-bold text-red-600 ml-2">La fecha no puede ser anterior a hoy.</p>}
            </div>

            <textarea
              value={motivo}
              disabled={!info.puede_ajustar}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo del ajuste (opcional)"
              className="w-full bg-brand-bg border-2 border-brand-border-soft rounded-xl p-3 text-[11px] font-bold min-h-[80px] resize-none outline-none focus:border-brand-accent disabled:opacity-50"
            />

            <div className="grid grid-cols-2 gap-3">
              <button onClick={onClose} className="py-3 rounded-2xl text-[10px] font-black uppercase text-brand-muted bg-brand-bg">Cancelar</button>
              <button
                onClick={handleConfirm}
                disabled={!puedeConfirmar}
                className="py-3 rounded-2xl text-[10px] font-black uppercase italic bg-brand-accent text-white disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={14} />} Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AjusteFechaInicioModal;
