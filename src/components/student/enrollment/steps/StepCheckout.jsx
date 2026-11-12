import React, { useMemo } from 'react';
import { AlertTriangle, ShoppingBag } from 'lucide-react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';
import { cartLines, withQty, cartTotal, esCamisetaMerch } from '../../../../utils/merchCart';
import MerchAddOnsSlider from '../../../merch/MerchAddOnsSlider';
import EnrollmentSummary from '../EnrollmentSummary';

const StepCheckout = ({ state, derived, extras, onExtrasChange, catalogoMerch, ownedMerchCounts, sedes, sedeRecojoId, precioBase, submitError, onBack }) => {
  const esMensual = state.modalidad === MODALIDAD.MENSUAL;
  const nivelesElegidos = esMensual
    ? [...new Set((derived.horariosElegidos || []).map((h) => h.nivel?.nombre).filter(Boolean))]
    : [];
  const nivelNombre =
    nivelesElegidos.length > 0
      ? nivelesElegidos.join(' + ')
      : derived.niveles.find((n) => n.id === state.nivelId)?.nombre;
  const horarioUnico = derived.horariosFiltrados.find(h => h.id === state.unica.horarioId);

  // Líneas completas del carrito (incluye la camiseta elegida en el paso anterior + otros coleccionables)
  const lineasMerch = esMensual ? cartLines(catalogoMerch, extras.merchQty) : [];
  const extrasElegidos = lineasMerch.map(({ item, qty, subtotal }) => ({
    label: qty > 1 ? `${item.nombre} × ${qty}` : item.nombre,
    price: subtotal,
  }));

  // En el Paso 3 solo se ofrecen los demás productos de merch (las camisetas ya se ofrecieron en el Paso 2)
  const otrosMerch = useMemo(
    () => (catalogoMerch || []).filter((item) => !esCamisetaMerch(item)),
    [catalogoMerch]
  );

  const esMerchSeleccionado = extrasElegidos.length > 0;
  const subtotalMerch = cartTotal(lineasMerch);

  // Sedes donde el alumno tiene horarios seleccionados (para recojo de merch en caso de inter-sedes)
  const sedesMatricula = useMemo(() => {
    const nombres = [...new Set((derived.horariosElegidos || []).map((h) => h.cancha?.sede?.nombre).filter(Boolean))];
    return (sedes || []).filter((s) =>
      nombres.some((n) => n?.toLowerCase() === s.nombre?.toLowerCase())
    );
  }, [derived.horariosElegidos, sedes]);
  const sedeRecojoNombre =
    sedes?.find((s) => s.id === sedeRecojoId)?.nombre || state.sede;

  const changeQty = (id, qty) => onExtrasChange({ ...extras, merchQty: withQty(extras.merchQty, id, qty) });
  const changeSedeRecojo = (id) => onExtrasChange({ ...extras, sedeId: Number(id) });

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
        meses={state.mensual.meses || 1}
        fechaUnica={state.unica.fecha}
        horarioUnico={horarioUnico}
        precioBase={precioBase}
        extras={extrasElegidos}
      />

      {/* 🛍️ SECCIÓN DE ACCESORIOS ADICIONALES (EXCLUYE CAMISETAS YA OFRECIDAS EN EL PASO 2) */}
      {esMensual && (otrosMerch.length > 0 || esMerchSeleccionado) && (
        <section className="bg-brand-surface rounded-[2.5rem] p-6 md:p-8 border-2 border-brand-border shadow-sm space-y-6">
          {otrosMerch.length > 0 && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-gold-soft text-brand-gold-dark border border-brand-gold/30">
                    <ShoppingBag size={13} />
                    <span>Club Merch Oficial · Opcional</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-brand-primary uppercase italic tracking-tight leading-tight">
                    Completa tu equipamiento
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    Añade accesorios oficiales a tu matrícula. Si no deseas productos adicionales, puedes continuar directamente.
                  </p>
                </div>

                {esMerchSeleccionado && (
                  <span className="text-xs font-black text-brand-gold-dark bg-brand-gold-soft px-4 py-2 rounded-2xl border border-brand-gold/30 self-start sm:self-auto shrink-0 shadow-sm animate-in fade-in">
                    + S/ {subtotalMerch.toFixed(2)} en productos
                  </span>
                )}
              </div>

              {/* Slider directo solo de otros coleccionables (gorras, accesorios, etc.) */}
              <div className="pt-2">
                <MerchAddOnsSlider
                  items={otrosMerch}
                  quantities={extras.merchQty}
                  onQtyChange={changeQty}
                  ownedCounts={ownedMerchCounts}
                />
              </div>
            </>
          )}

          {/* Entrega directa en la sede de su matrícula */}
          {esMerchSeleccionado && (
            <div className="bg-brand-gold-soft/60 border border-brand-gold/30 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-gold/20 flex items-center justify-center shrink-0 text-brand-gold-dark">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold-dark block">
                      Entrega oficial en sede: {sedeRecojoNombre}
                    </span>
                    <p className="text-[11px] font-bold text-slate-600">
                      Tus productos oficiales se te entregarán directamente en tu sede al asistir a tus clases.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-brand-gold-dark bg-white px-3.5 py-1.5 rounded-xl border border-brand-gold/30 self-start sm:self-auto shrink-0 shadow-sm">
                  + S/ {subtotalMerch.toFixed(2)}
                </span>
              </div>

              {sedesMatricula.length > 1 && (
                <div className="pt-2 border-t border-brand-gold/20 flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-gold-dark mr-1">
                    ¿En cuál de tus sedes deseas recoger tu pedido?
                  </span>
                  {sedesMatricula.map((s) => {
                    const activa = Number(sedeRecojoId) === Number(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => changeSedeRecojo(s.id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all cursor-pointer ${
                          activa
                            ? 'bg-brand-primary text-white shadow-sm'
                            : 'bg-white text-brand-primary border border-brand-gold/40 hover:bg-brand-primary-soft'
                        }`}
                      >
                        {s.nombre}
                      </button>
                    );
                  })}
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
