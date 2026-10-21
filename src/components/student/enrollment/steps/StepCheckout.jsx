import React, { useState } from 'react';
import { AlertTriangle, ShoppingBag, Sparkles, CheckCircle2, Info } from 'lucide-react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';
import { cartLines, withQty, cartTotal } from '../../../../utils/merchCart';
import MerchAddOnsSlider from '../../../merch/MerchAddOnsSlider';
import PickupSedeSelect from '../../../merch/PickupSedeSelect';
import EnrollmentSummary from '../EnrollmentSummary';

const StepCheckout = ({ state, derived, extras, onExtrasChange, catalogoMerch, ownedMerchCounts, sedes, sedeRecojoId, precioBase, submitError, onBack }) => {
  const esMensual = state.modalidad === MODALIDAD.MENSUAL;
  const nivelNombre = derived.niveles.find(n => n.id === state.nivelId)?.nombre;
  const horarioUnico = derived.horariosFiltrados.find(h => h.id === state.unica.horarioId);

  // Líneas del carrito de merch
  const lineasMerch = esMensual ? cartLines(catalogoMerch, extras.merchQty) : [];
  const extrasElegidos = lineasMerch.map(({ item, qty, subtotal }) => ({
    label: qty > 1 ? `${item.nombre} × ${qty}` : item.nombre,
    price: subtotal,
  }));

  const esMerchSeleccionado = extrasElegidos.length > 0;
  const subtotalMerch = cartTotal(lineasMerch);

  // Estado interactivo para la pregunta explícita: ¿Deseas añadir productos?
  const [wantsMerch, setWantsMerch] = useState(() => Object.values(extras.merchQty || {}).some(q => q > 0));

  const changeQty = (id, qty) => onExtrasChange({ ...extras, merchQty: withQty(extras.merchQty, id, qty) });

  const handleChooseNoMerch = () => {
    setWantsMerch(false);
    onExtrasChange({ ...extras, merchQty: {}, sedeId: null });
  };

  const handleChooseYesMerch = () => {
    setWantsMerch(true);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter leading-none">
        Confirma tu <span className="text-brand-accent">matrícula</span>
      </h2>

      {submitError && (
        <div role="alert" className="flex items-start gap-4 bg-brand-accent-soft border-2 border-brand-accent rounded-[2rem] p-5">
          <AlertTriangle size={22} className="text-brand-accent-dark shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-xs font-black text-brand-primary uppercase italic">No pudimos reservar tu lugar</p>
            <p className="text-[11px] font-bold text-slate-600">{submitError}</p>
            <button
              type="button"
              onClick={onBack}
              className="text-[10px] font-black text-brand-accent-dark uppercase italic tracking-widest underline"
            >
              {esMensual ? 'Revisar mis horarios' : 'Elegir otra fecha'}
            </button>
          </div>
        </div>
      )}

      {/* Resumen del pedido con desglose visual de precios */}
      <EnrollmentSummary
        modalidad={state.modalidad}
        sede={state.sede}
        nivelNombre={nivelNombre}
        horarios={derived.horariosElegidos}
        fechaInicio={state.mensual.fechaInicio}
        fechaUnica={state.unica.fecha}
        horarioUnico={horarioUnico}
        precioBase={precioBase}
        extras={extrasElegidos}
      />

      {/* 🛍️ SECCIÓN EXPLÍCITA DE CLUB MERCH GEMA */}
      {esMensual && catalogoMerch?.length > 0 && (
        <section className="bg-brand-surface rounded-[2.5rem] p-6 md:p-8 border-2 border-brand-border shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-gold-soft text-brand-gold-dark border border-brand-gold/30">
              <ShoppingBag size={13} />
              <span>Club Merch Oficial · Opcional</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-brand-primary uppercase italic tracking-tight leading-tight">
              ¿Deseas añadir alguno de nuestros productos a tu matrícula?
            </h3>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              Equípate con indumentaria y accesorios oficiales de Academia Gema. Si agregas productos, 
              <strong className="text-slate-800"> su costo se sumará automáticamente al valor final a pagar de tu matrícula</strong> en una sola cuenta combinada.
            </p>
          </div>

          {/* Opciones de Decisión Explícita */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleChooseNoMerch}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                !wantsMerch
                  ? 'border-brand-primary bg-brand-primary-soft/50 shadow-md ring-2 ring-brand-primary/20'
                  : 'border-brand-border bg-brand-bg hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                !wantsMerch ? 'bg-brand-primary text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <CheckCircle2 size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase text-brand-primary italic">
                  No, solo mi plan de clases
                </p>
                <p className="text-[11px] font-bold text-slate-500">
                  Continuar únicamente con el servicio contratado, sin añadir productos.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleChooseYesMerch}
              className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 cursor-pointer ${
                wantsMerch
                  ? 'border-brand-gold bg-brand-gold-soft/50 shadow-md ring-2 ring-brand-gold/30'
                  : 'border-brand-border bg-brand-bg hover:border-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                wantsMerch ? 'bg-brand-gold text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                <Sparkles size={18} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-black uppercase text-brand-gold-dark italic">
                  ¡Sí, deseo añadir productos!
                </p>
                <p className="text-[11px] font-bold text-slate-500">
                  Ver catálogo y elegir artículos. El valor se sumará al total a pagar.
                </p>
              </div>
            </button>
          </div>

          {/* Despliegue interactivo del catálogo al seleccionar "Sí" */}
          {wantsMerch && (
            <div className="space-y-6 pt-4 border-t border-brand-border-soft animate-in fade-in duration-300">
              <div className="bg-brand-gold-soft/60 border border-brand-gold/30 rounded-2xl p-4 flex items-start gap-3 text-slate-700">
                <Info size={18} className="text-brand-gold-dark shrink-0 mt-0.5" />
                <div className="text-[11px] font-medium leading-relaxed">
                  <strong className="text-brand-gold-dark block uppercase font-black tracking-wider text-[10px] mb-0.5">
                    Información sobre tu compra combinada:
                  </strong>
                  Cada producto que selecciones incrementará el total de tu reserva. Realizarás un único depósito o transferencia por el monto total, y el administrador validará la membresía y programará la entrega física de tus productos.
                </div>
              </div>

              {/* Slider de productos con selector de cantidades */}
              <MerchAddOnsSlider
                items={catalogoMerch}
                quantities={extras.merchQty}
                onQtyChange={changeQty}
                ownedCounts={ownedMerchCounts}
              />

              {/* Sede de entrega física y validación */}
              {esMerchSeleccionado && (
                <div className="bg-slate-50 border-2 border-brand-border rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary">
                      📍 Sede de entrega de tus productos
                    </span>
                    <span className="text-xs font-black text-brand-gold-dark bg-brand-gold-soft px-3 py-1 rounded-full border border-brand-gold/30 self-start sm:self-auto">
                      Subtotal productos: + S/ {subtotalMerch.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-[11px] font-medium text-slate-600">
                    Indica en qué sede retirarás tus productos oficiales cuando asistas a tus clases:
                  </p>

                  <PickupSedeSelect
                    sedes={sedes}
                    value={sedeRecojoId}
                    onChange={(sedeId) => onExtrasChange({ ...extras, sedeId })}
                  />

                  {!sedeRecojoId && (
                    <div className="flex items-center gap-2 text-xs font-black text-brand-accent-dark bg-brand-accent-soft p-3 rounded-xl border border-brand-accent/30">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>Por favor selecciona la sede de recojo para poder confirmar tu matrícula con productos.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default StepCheckout;
