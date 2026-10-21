import React from 'react';
import { MapPin, Trophy, CalendarDays, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { MODALIDAD } from '../../../hooks/useEnrollmentWizard';

const DIAS_CORTOS = ['', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'];
const soles = (n) => `S/ ${Number(n).toFixed(2)}`;
const fechaLarga = (key) => format(parseISO(key), "EEEE d 'de' MMMM", { locale: es });

const Row = ({ icon: Icon, label, children }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-2xl bg-brand-primary-soft text-brand-primary flex items-center justify-center shrink-0">
      <Icon size={18} strokeWidth={2.5} />
    </div>
    <div className="text-left">
      <p className="text-[9px] text-brand-muted font-black uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xs font-black text-slate-800 leading-tight uppercase">{children}</p>
    </div>
  </div>
);

const EnrollmentSummary = ({ modalidad, sede, nivelNombre, horarios, fechaInicio, fechaUnica, horarioUnico, precioBase, extras }) => {
  const total = precioBase == null ? null : precioBase + extras.reduce((acc, e) => acc + e.price, 0);
  const esMensual = modalidad === MODALIDAD.MENSUAL;

  return (
    <div className="bg-brand-surface rounded-[2.5rem] p-8 border-2 border-brand-border-soft space-y-6">
      <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest bg-brand-accent text-white">
        {esMensual ? 'Matrícula mensual' : 'Clase única'}
      </span>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Row icon={MapPin} label="Sede">{sede}</Row>
        <Row icon={Trophy} label="Nivel">{nivelNombre}</Row>
        {esMensual ? (
          <>
            <Row icon={CalendarDays} label="Días">{horarios.map(h => DIAS_CORTOS[h.dia_semana]).join(' + ')}</Row>
            <Row icon={Clock} label="Empiezas">{fechaLarga(fechaInicio)}</Row>
          </>
        ) : (
          <>
            <Row icon={CalendarDays} label="Fecha">{fechaLarga(fechaUnica)}</Row>
            {horarioUnico && <Row icon={Clock} label="Horario">{horarioUnico.hora_inicio.slice(0, 5)} - {horarioUnico.hora_fin.slice(0, 5)}</Row>}
          </>
        )}
      </div>

      <div className="border-t border-brand-border-soft pt-5 space-y-3">
        {precioBase != null && (
          <div className="flex justify-between text-xs font-black uppercase italic text-slate-700">
            <span>{esMensual ? 'Servicio de clases (Mensual)' : 'Clase única'}</span>
            <span className="text-brand-primary">{soles(precioBase)}</span>
          </div>
        )}

        {extras.length > 0 && (
          <div className="bg-brand-gold-soft/60 border border-brand-gold/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-brand-gold-dark border-b border-brand-gold/20 pb-1.5">
              <span>🛍️ Productos oficiales añadidos</span>
              <span>Subtotal Merch</span>
            </div>
            {extras.map(e => (
              <div key={e.label} className="flex justify-between text-xs font-bold text-slate-800 pl-1">
                <span className="truncate pr-2">{e.label}</span>
                <span className="font-black text-brand-primary shrink-0">+ {soles(e.price)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-end pt-3 border-t-2 border-brand-border">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted block">
              Total final a pagar
            </span>
            {extras.length > 0 && (
              <span className="text-[9px] font-bold text-brand-gold-dark block">
                (Matrícula + Productos oficiales)
              </span>
            )}
          </div>
          <span className="text-3xl font-black italic text-brand-primary leading-none">
            {total == null ? 'Se confirma al generar' : soles(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentSummary;
