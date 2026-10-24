import React from 'react';
import { Receipt, Calendar, Ticket } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { parseDateOnly, esFechaValida } from '../../utils/enrollmentCycle';

// Cabecera de la tarjeta de "Mis Clases". Se adapta al tipo de paquete:
// MENSUAL (contrato + rango de ciclo) o INDIVIDUAL (clase única + fecha exacta).
const PackageHeader = ({ pkg }) => {
  if (pkg.tipo === 'INDIVIDUAL') {
    return (
      <div className="p-5 bg-brand-bg/50 border-b border-brand-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-8">
        <span className="text-[11px] font-black text-brand-accent-dark uppercase italic tracking-widest bg-brand-accent-soft px-4 py-2 rounded-full border border-brand-accent flex items-center gap-2">
          <Ticket size={14} className="text-brand-accent" />
          CLASE ÚNICA
        </span>
        <span className="text-[10px] font-bold text-slate-500 bg-brand-surface px-4 py-2 rounded-full border border-brand-border shadow-sm flex items-center gap-2 capitalize">
          <Calendar size={12} className="text-brand-primary" />
          {format(parseDateOnly(pkg.fecha_clase),"EEEE dd 'de' MMMM, yyyy", { locale: es })}
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 bg-brand-bg/50 border-b border-brand-border-soft flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-8">
      <div className="flex items-center gap-3">
        <Receipt size={16} className="text-brand-accent" />
        <span className="text-[11px] font-black text-brand-primary uppercase italic tracking-tighter">CONTRATO: {pkg.id.slice(0, 10)}...</span>
      </div>
      <div>
        <span className="text-[10px] font-bold text-slate-500 bg-brand-surface px-4 py-2 rounded-full border border-brand-border shadow-sm flex items-center gap-2">
          <Calendar size={12} className="text-brand-primary" />
          Inicio: {format(parseDateOnly(pkg.fecha_inicio), 'dd MMM, yyyy', { locale: es })}
        </span>
        <span className="text-[10px] font-bold text-slate-500 bg-brand-surface px-4 py-2 rounded-full border border-brand-border shadow-sm flex items-center gap-2 mt-1">
          <Calendar size={12} className="text-brand-primary" />
          Fin:{' '}
          {esFechaValida(pkg.fecha_fin)
            ? format(parseDateOnly(pkg.fecha_fin), 'dd MMM, yyyy', { locale: es })
            : <span className="italic text-brand-muted">Por confirmar</span>}
        </span>
      </div>
    </div>
  );
};

export default PackageHeader;
