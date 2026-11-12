import React, { useMemo } from 'react';
import { Shirt, CheckCircle2, XCircle, Sparkles, Check } from 'lucide-react';
import { formatSoles } from '../../../../utils/formatSoles';
import { obtenerImagenMerch, IMAGEN_CAMISETA_OFICIAL } from '../../../../utils/merchCart';
import QuantitySelector from '../../../merch/QuantitySelector';

const ORDEN_TALLAS = { XS: 1, S: 2, M: 3, L: 4, XL: 5, XXL: 6 };

/**
 * Extrae la etiqueta de talla desde el nombre del producto
 * (ej. "CAMISETA OFICIAL ACADEMIA GEMA - TALLA L" -> { codigo: "L", label: "Talla L" }).
 */
const extraerTalla = (item, index) => {
  const nombre = String(item?.nombre ?? '');
  const matchTalla = nombre.match(/\btalla\s+([a-z0-9]+)\b/i);
  if (matchTalla) {
    const codigo = matchTalla[1].toUpperCase();
    return { codigo, label: `Talla ${codigo}`, orden: ORDEN_TALLAS[codigo] ?? 50 + index };
  }
  const partesGuion = nombre.split('-').map((s) => s.trim()).filter(Boolean);
  if (partesGuion.length > 1) {
    const sufijo = partesGuion[partesGuion.length - 1];
    return { codigo: sufijo.toUpperCase(), label: sufijo, orden: 50 + index };
  }
  return { codigo: nombre || `OPCIÓN ${index + 1}`, label: nombre || `Opción ${index + 1}`, orden: 50 + index };
};

const JerseyUpsellCard = ({ camisetas = [], merchQty = {}, onSelectCamiseta, onClearCamisetas }) => {
  const opcionesTalla = useMemo(
    () =>
      camisetas
        .map((item, idx) => ({ item, ...extraerTalla(item, idx) }))
        .sort((a, b) => a.orden - b.orden),
    [camisetas]
  );

  if (opcionesTalla.length === 0) return null;

  // Buscar cuál camiseta tiene cantidad > 0 actualmente
  const seleccionada = opcionesTalla.find(({ item }) => (merchQty[item.id] || 0) > 0) || null;
  const activa = seleccionada || opcionesTalla.find((o) => o.codigo === 'M') || opcionesTalla[0];
  const qty = seleccionada ? (merchQty[seleccionada.item.id] || 0) : 0;
  const incluyeCamiseta = qty > 0;

  const camisetaActual = activa.item;
  const precioUnitario = Number(camisetaActual.precio) || 45;
  const subtotal = precioUnitario * qty;
  const imagenSrc = obtenerImagenMerch(camisetaActual) || IMAGEN_CAMISETA_OFICIAL;

  const handleActivar = () => {
    if (!incluyeCamiseta) {
      onSelectCamiseta(camisetaActual.id, 1);
    }
  };

  const handleCambiarTalla = (nuevoItemId) => {
    const cantidadActual = qty > 0 ? qty : 1;
    onSelectCamiseta(nuevoItemId, cantidadActual);
  };

  const handleCambiarCantidad = (nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      onClearCamisetas();
    } else {
      onSelectCamiseta(camisetaActual.id, nuevaCantidad);
    }
  };

  return (
    <div
      className={`rounded-[2.5rem] p-6 md:p-8 border-2 transition-all duration-300 shadow-sm space-y-6 ${
        incluyeCamiseta
          ? 'bg-gradient-to-br from-brand-primary via-[#2C070F] to-brand-primary-dark border-brand-gold text-white shadow-xl'
          : 'bg-brand-surface border-brand-border-soft text-brand-heading'
      }`}
    >
      {/* Cabecera: Imagen, Pregunta y Botones Sí / No */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-brand-gold/40 bg-brand-primary-dark shrink-0 shadow-lg flex items-center justify-center">
            <img
              src={imagenSrc}
              alt={camisetaActual.nombre}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="w-full h-full object-cover"
            />
            <Shirt size={36} className="text-brand-gold hidden" />
          </div>

          <div className="space-y-2 max-w-md">
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                incluyeCamiseta
                  ? 'bg-brand-gold text-brand-primary-dark'
                  : 'bg-brand-gold-soft text-brand-gold-dark border border-brand-gold/30'
              }`}
            >
              <Sparkles size={11} />
              <span>Indumentaria Oficial Imperio 7</span>
            </div>

            <h3
              className={`text-lg md:text-xl font-black uppercase italic tracking-tight leading-tight ${
                incluyeCamiseta ? 'text-white' : 'text-brand-primary'
              }`}
            >
              ¿Deseas añadir una Camiseta Oficial Imperio 7 a tu compra?
            </h3>

            <p
              className={`text-xs font-bold leading-relaxed ${
                incluyeCamiseta ? 'text-amber-100/80' : 'text-slate-500'
              }`}
            >
              {camisetaActual.descripcion ||
                'Entrena con la armadura oficial del club. Se entregará directamente en la sede de tu matrícula.'}
            </p>

            <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span
                className={`text-base font-black italic ${
                  incluyeCamiseta ? 'text-brand-gold' : 'text-brand-primary'
                }`}
              >
                + {formatSoles(precioUnitario)} c/u
              </span>
              {incluyeCamiseta && (
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-white/10 text-amber-200 border border-white/15">
                  Subtotal: {formatSoles(subtotal)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Botones principales Sí / No */}
        <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
          <button
            type="button"
            onClick={handleActivar}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
              incluyeCamiseta
                ? 'bg-brand-gold text-brand-primary-dark shadow-lg shadow-brand-gold/25 ring-2 ring-white/40'
                : 'bg-brand-primary text-white hover:bg-brand-accent shadow-md'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>{incluyeCamiseta ? 'Camiseta añadida' : 'Sí, añadir'}</span>
          </button>

          <button
            type="button"
            onClick={onClearCamisetas}
            className={`px-6 py-4 rounded-2xl font-black text-xs uppercase italic tracking-wider flex items-center justify-center gap-2 transition-all border cursor-pointer active:scale-95 ${
              !incluyeCamiseta
                ? 'bg-brand-bg border-brand-primary text-brand-primary shadow-sm'
                : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
            }`}
          >
            <XCircle size={16} />
            <span>No, gracias</span>
          </button>
        </div>
      </div>

      {/* Panel visible e intuitivo para elegir / cambiar Talla y Cantidad */}
      <div
        className={`pt-5 border-t flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          incluyeCamiseta ? 'border-white/15' : 'border-brand-border-soft'
        }`}
      >
        <div className="space-y-2 flex-1">
          <p
            className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              incluyeCamiseta ? 'text-amber-200' : 'text-brand-muted'
            }`}
          >
            {incluyeCamiseta
              ? `Talla seleccionada: ${activa.label} (haz clic en otra para cambiarla)`
              : 'O haz clic directamente en tu talla para añadirla:'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {opcionesTalla.map(({ item, codigo, label }) => {
              const esTallaElegida = incluyeCamiseta && item.id === camisetaActual.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleCambiarTalla(item.id)}
                  className={`px-4 py-3 rounded-2xl font-black text-xs uppercase italic tracking-wider flex items-center justify-between gap-2 border-2 transition-all cursor-pointer active:scale-95 ${
                    esTallaElegida
                      ? 'bg-brand-gold border-white text-brand-primary-dark shadow-lg scale-[1.02]'
                      : incluyeCamiseta
                        ? 'bg-black/25 border-white/15 text-white hover:bg-white/15 hover:border-brand-gold/60'
                        : 'bg-brand-bg border-brand-border-soft text-brand-primary hover:border-brand-primary hover:bg-brand-primary-soft/40'
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${
                      esTallaElegida
                        ? 'bg-brand-primary-dark text-brand-gold'
                        : incluyeCamiseta
                          ? 'bg-white/10 text-white/60'
                          : 'bg-brand-surface border border-brand-border text-slate-400'
                    }`}
                  >
                    {esTallaElegida ? <Check size={12} strokeWidth={3} /> : codigo}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {incluyeCamiseta && (
          <div className="flex items-center justify-between md:justify-end gap-3 bg-black/30 border border-white/15 rounded-2xl px-4 py-3 shrink-0 self-stretch md:self-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-200">
              Cantidad:
            </span>
            <QuantitySelector
              tone="dark"
              value={qty}
              max={99}
              onChange={handleCambiarCantidad}
              label={`Cantidad de ${camisetaActual.nombre}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default JerseyUpsellCard;
