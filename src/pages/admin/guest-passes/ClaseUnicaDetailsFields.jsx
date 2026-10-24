import React from 'react';
import { Calendar, CreditCard, DollarSign } from 'lucide-react';

const ClaseUnicaDetailsFields = ({
    fecha, onFechaChange,
    metodoPago, onMetodoPagoChange, metodosPago,
    monto, onMontoChange,
    disabled,
}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <Calendar size={12} /> Fecha de Clase Única
            </label>
            <input
                type="date"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl px-5 py-4 text-sm font-black text-brand-primary focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all text-left dynamic-date-input"
                value={fecha || ''}
                onChange={(e) => onFechaChange(e.target.value)}
            />
        </div>

        <div>
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <CreditCard size={12} /> Método de Pago
            </label>
            <select
                disabled={disabled}
                className="w-full bg-brand-bg border border-brand-border rounded-2xl px-5 py-4 text-sm font-bold text-brand-primary focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all uppercase cursor-pointer disabled:border-green-500 disabled:text-brand-primary disabled:opacity-100 disabled:bg-green-50 disabled:cursor-not-allowed"
                value={metodoPago}
                onChange={(e) => onMetodoPagoChange(e.target.value)}
            >
                <option value="">SELECCIONAR MÉTODO</option>
                {metodosPago.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <DollarSign size={12} /> Monto
            </label>
            <input
                disabled={disabled}
                type="text"
                placeholder="Ej. 25"
                className="w-full bg-brand-bg border border-brand-border rounded-2xl px-5 py-4 text-sm font-black text-brand-primary focus:ring-4 focus:ring-brand-accent/20 focus:border-brand-accent outline-none transition-all placeholder:text-slate-300 placeholder:font-bold disabled:border-green-500 disabled:text-brand-primary disabled:bg-green-50 disabled:cursor-not-allowed"
                value={monto}
                onChange={(e) => onMontoChange(e.target.value)}
            />
        </div>
    </div>
);

export default ClaseUnicaDetailsFields;
