import React from 'react';
import { Sparkles, Lock, Unlock } from 'lucide-react';
import { formatSoles } from '../../utils/formatSoles';
import { maxQty } from '../../utils/merchCart';
import MerchImage from './MerchImage';
import QuantitySelector from './QuantitySelector';

const ULTIMAS_UNIDADES = 5;

// Tarjeta "desbloqueable" del catálogo. `ownedCount` = unidades que el alumno ya tiene;
// `qty` / `onQtyChange` controlan la cantidad a comprar (sin ellos la tarjeta es informativa).
const MerchCard = ({ item, ownedCount = 0, qty = 0, onQtyChange }) => {
  const stock = item.stock != null ? Number(item.stock) : null;
  const agotado = stock !== null && stock <= 0;
  const ultimas = stock !== null && stock > 0 && stock <= ULTIMAS_UNIDADES;
  const desbloqueado = ownedCount > 0;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-[2rem] border bg-gradient-to-b from-brand-primary to-brand-primary-dark text-white shadow-xl transition-all hover:-translate-y-1 ${desbloqueado ? 'border-brand-gold/70' : 'border-brand-gold/25 hover:border-brand-gold/60'}`}>
      <div className="relative h-48 overflow-hidden">
        <div className={`h-full w-full transition-transform duration-500 group-hover:scale-105 ${agotado ? 'grayscale opacity-60' : ''}`}>
          <MerchImage item={item} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-primary-dark via-transparent to-transparent" />

        {/* Un solo badge de estado sobre la imagen: nunca compite con otro por el ancho. */}
        <span className={`absolute top-3 left-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-widest backdrop-blur ${desbloqueado ? 'bg-brand-gold text-brand-primary-dark' : 'border border-brand-gold/40 bg-brand-primary-dark/70 text-brand-gold'}`}>
          {desbloqueado ? <Unlock size={11} className="shrink-0" /> : <Lock size={11} className="shrink-0" />}
          <span className="truncate">{desbloqueado ? (ownedCount > 1 ? `Tienes ${ownedCount}` : 'Desbloqueado') : 'Por desbloquear'}</span>
        </span>
        {(agotado || ultimas) && (
          <span className={`absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest ${agotado ? 'bg-white/90 text-brand-primary-dark' : 'bg-brand-accent text-white'}`}>
            {agotado ? 'Agotado' : `Últimas ${stock} unidades`}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex-1">
          <p className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-brand-gold">
            <Sparkles size={11} className="shrink-0" /> Edición limitada
          </p>
          <h3 className="text-sm font-black uppercase italic leading-tight text-white">{item.nombre}</h3>
          {item.descripcion && (
            <p className="mt-1 line-clamp-2 text-[11px] font-bold text-brand-primary-soft/60">{item.descripcion}</p>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xl font-black italic text-brand-gold">{formatSoles(item.precio)}</span>
          {onQtyChange && !agotado && (
            <QuantitySelector tone="dark" value={qty} max={maxQty(item)} onChange={(n) => onQtyChange(item.id, n)} label={`Cantidad de ${item.nombre}`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchCard;
