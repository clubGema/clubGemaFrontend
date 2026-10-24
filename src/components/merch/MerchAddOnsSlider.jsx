import React from 'react';
import { Gift } from 'lucide-react';
import { formatSoles } from '../../utils/formatSoles';
import { maxQty } from '../../utils/merchCart';
import MerchImage from './MerchImage';
import QuantitySelector from './QuantitySelector';

// Slider horizontal "Añade a tu plan": cantidades controladas por el padre.
// `quantities` = { [merchId]: cantidad }. `ownedCounts` = { [merchId]: unidades que ya tiene }.
const MerchAddOnsSlider = ({ items, quantities, onQtyChange, ownedCounts = {} }) => {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift size={18} className="text-brand-gold" />
        <h3 className="text-sm font-black text-brand-primary uppercase italic tracking-widest">Añade a tu plan</h3>
      </div>
      <p className="text-[11px] font-bold text-brand-muted -mt-2">
        Coleccionables IMPERIO 7, opcionales. Se suman al total de tu matrícula.
      </p>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 [scrollbar-width:thin]">
        {items.map((item) => {
          const qty = quantities[item.id] || 0;
          const agotado = item.stock != null && Number(item.stock) <= 0;
          const owned = ownedCounts[item.id] || 0;
          return (
            <div
              key={item.id}
              className={`snap-start shrink-0 w-48 bg-brand-surface rounded-[1.5rem] border-2 overflow-hidden transition-all ${qty > 0 ? 'border-brand-gold shadow-lg' : 'border-brand-border'} ${agotado ? 'opacity-50' : ''}`}
            >
              <div className="relative h-28 overflow-hidden">
                <MerchImage item={item} iconSize={40} />
                {owned > 0 && (
                  <span className="absolute top-2 left-2 rounded-full bg-brand-gold text-brand-primary-dark text-[8px] font-black uppercase tracking-widest px-2 py-1">
                    Ya tienes {owned}
                  </span>
                )}
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[11px] font-black text-brand-heading uppercase italic leading-tight line-clamp-2 min-h-[2rem]">{item.nombre}</p>
                <p className="text-sm font-black text-brand-primary">
                  {agotado
                    ? <span className="text-[10px] text-brand-gold-dark uppercase tracking-widest">Agotado</span>
                    : `+ ${formatSoles(item.precio)}`}
                </p>
                {!agotado && (
                  <QuantitySelector value={qty} max={maxQty(item)} onChange={(n) => onQtyChange(item.id, n)} label={`Cantidad de ${item.nombre}`} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default MerchAddOnsSlider;
