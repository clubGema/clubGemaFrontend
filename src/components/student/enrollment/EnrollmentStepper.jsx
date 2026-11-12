import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCatalogos } from '../../../hooks/useCatalogos';
import { useFetch } from '../../../hooks/useFetch';
import { useEnrollmentWizard, MODALIDAD } from '../../../hooks/useEnrollmentWizard';
import { catalogoService } from '../../../services/catalogo.service';
import { feriadoService } from '../../../services/feriado.service';
import { enrollmentService } from '../../../services/enrollment.service';
import { merchService } from '../../../services/merch.service';
import { ESTADO_COLECCION } from '../../../config/merch';
import { qtyMapToIds, cartLines, esCamisetaMerch, withQty } from '../../../utils/merchCart';
import { precioClaseUnica, precioMensual } from '../../../utils/enrollmentPricing';
import LoadingSpinner from '../../shared/LoadingSpinner';
import StepIndicator from './StepIndicator';
import StepModalidadSede from './steps/StepModalidadSede';
import StepHorarioFechas from './steps/StepHorarioFechas';
import StepCheckout from './steps/StepCheckout';
import alumnoService from '../../../services/alumno.service';

const EnrollmentStepper = ({ userId, onSuccess, beneficios }) => {
  const { horarios: horariosRaw, sedes, loading: loadingHorarios } = useCatalogos(['horarios', 'sedes']);
  const horarios = useMemo(() => horariosRaw.filter(h => h.activo), [horariosRaw]);

  const { state, actions, derived } = useEnrollmentWizard(horarios);

  // Extras (merch elegido en "Añade a tu plan"): estado propio, FUERA del wizard,
  // para que el módulo de Merch evolucione sin tocar la matrícula.
  // merchQty = { [merchId]: cantidad } · sedeId = sede de recojo elegida (null = la de la matrícula).
  const [extras, setExtras] = useState({ merchQty: {}, sedeId: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const { data: feriados } = useFetch(
    async () => ((await feriadoService.listarTodos()).data || []).map(f => f.fecha),
    [],
    { initialData: [] }
  );
  const { data: planes } = useFetch(
    async () => (await catalogoService.getVigentes()).data || [],
    [],
    { initialData: [], errorMessage: 'No se pudieron cargar los precios' }
  );
  const { data: planesLegacy } = useFetch(
    async () => (await catalogoService.getLegacy()).data || [],
    [],
    { initialData: [], errorMessage: 'No se pudieron cargar los precios' }
  );
  const { data: esAntiguo } = useFetch(
    async () => await alumnoService.verificarAntiguedad(),
    [],
    { initialData: false }
  )
  // Si el merch falla al cargar, la matrícula sigue funcionando sin el slider.
  const { data: catalogoMerch } = useFetch(
    () => merchService.getCatalogo(),
    [],
    { initialData: [], errorMessage: 'No se pudo cargar el catálogo de merch' }
  );
  const { data: coleccionMerch } = useFetch(
    () => (userId ? merchService.getColeccion(userId) : []),
    [userId],
    { initialData: [] }
  );
  const ownedMerchCounts = useMemo(
    () => coleccionMerch
      .filter(c => c.estado !== ESTADO_COLECCION.PERDIDO)
      .reduce((acc, c) => ({ ...acc, [c.merch_id]: (acc[c.merch_id] || 0) + 1 }), {}),
    [coleccionMerch]
  );

  // Camisetas Oficiales (todas las tallas) para ofrecerlas justo después de previsualizar los días del ciclo.
  const camisetasOficiales = useMemo(
    () => catalogoMerch.filter(esCamisetaMerch),
    [catalogoMerch]
  );

  // Al elegir una talla en el Paso 2 se limpia cualquier otra talla previa y se asigna la cantidad a la talla elegida.
  const handleSelectCamiseta = (merchId, qty) => {
    setExtras((prev) => {
      const nextQty = { ...prev.merchQty };
      camisetasOficiales.forEach((c) => {
        delete nextQty[c.id];
      });
      return {
        ...prev,
        merchQty: withQty(nextQty, merchId, qty),
      };
    });
  };

  const handleClearCamisetas = () => {
    setExtras((prev) => {
      const nextQty = { ...prev.merchQty };
      camisetasOficiales.forEach((c) => {
        delete nextQty[c.id];
      });
      return { ...prev, merchQty: nextQty };
    });
  };

  // Sede de recojo: toma la sede elegida explícitamente o la primera sede de los horarios seleccionados
  const sedesHorariosNombres = useMemo(
    () => [...new Set(derived.horariosElegidos.map((h) => h.cancha?.sede?.nombre).filter(Boolean))],
    [derived.horariosElegidos]
  );
  const sedePrincipalNombre = sedesHorariosNombres[0] || state.sedesElegidas?.[0] || state.sede;
  const sedeRecojoId = extras.sedeId
    ?? sedes.find(s => s.nombre === sedePrincipalNombre)?.id
    ?? sedes.find(s => s.nombre?.toLowerCase() === sedePrincipalNombre?.toLowerCase())?.id
    ?? null;
  const faltaSedeRecojo = false;

  let precioUnitario;
  if (esAntiguo) {
    precioUnitario = state.modalidad === MODALIDAD.MENSUAL
      ? precioMensual(planesLegacy, derived.horariosElegidos.length)
      : precioClaseUnica(planesLegacy);
  } else {
    precioUnitario = state.modalidad === MODALIDAD.MENSUAL
      ? precioMensual(planes, derived.horariosElegidos.length)
      : precioClaseUnica(planes);
  }

  const mesesMultiplicador = state.modalidad === MODALIDAD.MENSUAL ? (state.mensual.meses || 1) : 1;
  const precioBase = precioUnitario != null ? precioUnitario * mesesMultiplicador : null;

  const totalMerch = useMemo(() => {
    return cartLines(catalogoMerch, extras.merchQty).reduce((acc, line) => acc + line.subtotal, 0);
  }, [catalogoMerch, extras.merchQty]);
  const totalAPagar = precioBase != null ? precioBase + totalMerch : null;

  const volver = () => {
    // Tras un rechazo la fecha única elegida ya no sirve: se descarta al volver
    // (no antes, porque el resumen del checkout todavía la muestra).
    if (submitError && state.modalidad === MODALIDAD.UNICA) actions.setFechaUnica(null, null);
    setSubmitError(null);
    actions.back();
  };

  const confirmar = async () => {
    setSubmitting(true);
    setSubmitError(null);
    const esMensual = state.modalidad === MODALIDAD.MENSUAL;
    try {
      if (esMensual) {
        const fnInscribir = (state.mensual.meses > 1)
          ? enrollmentService.inscribirMesesAdelantados
          : enrollmentService.inscribirMensual;

        await fnInscribir({
          alumnoId: userId,
          horarioIds: state.mensual.horarioIds,
          fechaInicio: state.mensual.fechaInicio,
          meses: state.mensual.meses || 1,
          extras: { ...extras, sedeId: sedeRecojoId },
        });
      } else {
        await enrollmentService.inscribirUnica({
          alumnoId: userId,
          horarioId: state.unica.horarioId,
          fecha: state.unica.fecha,
        });
      }
      toast.success('¡Reserva generada!');
      onSuccess?.();
    } catch (error) {
      console.error('Error en confirmar matrícula:', error);
      if (error.status === 400) {
        // Rechazo de negocio: típicamente el cupo se llenó entre que el alumno
        // vio el calendario y confirmó. Se explica en el checkout, no solo en un toast.
        setSubmitError(esMensual
          ? error.message
          : `Es posible que el cupo de esa fecha se haya llenado hace un instante. ${error.message || ''}`.trim());
      } else {
        toast.error(error.message || 'Error al procesar');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingHorarios) return <LoadingSpinner size={48} />;

  return (
    <div className="pb-48">
      <StepIndicator current={state.step} />

      {state.step === 1 && <StepModalidadSede state={state} derived={derived} actions={actions} />}
      {state.step === 2 && (
        <StepHorarioFechas
          state={state}
          derived={derived}
          actions={actions}
          userId={userId}
          feriados={feriados}
          precioUnitario={precioUnitario}
          camisetasOficiales={camisetasOficiales}
          merchQty={extras.merchQty}
          onSelectCamiseta={handleSelectCamiseta}
          onClearCamisetas={handleClearCamisetas}
        />
      )}
      {state.step === 3 && (
        <StepCheckout
          state={state}
          derived={derived}
          extras={extras}
          onExtrasChange={setExtras}
          catalogoMerch={catalogoMerch}
          ownedMerchCounts={ownedMerchCounts}
          sedes={sedes}
          sedeRecojoId={sedeRecojoId}
          precioBase={precioBase}
          beneficios={beneficios}
          submitError={submitError}
          onBack={volver}
        />
      )}

      <div className="fixed bottom-10 inset-x-0 flex justify-center gap-3 z-[150] px-4 pointer-events-none">
        {state.step > 1 && (
          <button
            type="button"
            onClick={volver}
            disabled={submitting}
            className="pointer-events-auto flex items-center justify-center gap-3 px-8 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl bg-brand-surface text-brand-primary hover:scale-105 active:scale-95 border-4 border-white"
          >
            <ArrowLeft size={20} />
            <span className="tracking-widest text-[12px]">Atrás</span>
          </button>
        )}

        {state.step < 3 ? (
          <button
            type="button"
            onClick={actions.next}
            disabled={!derived.canAdvance}
            className="pointer-events-auto flex items-center justify-center gap-4 px-12 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl bg-brand-accent text-white hover:scale-105 active:scale-95 border-4 border-white w-full max-w-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <span className="tracking-widest text-[12px]">Siguiente</span>
            <ArrowRight size={20} />
          </button>
        ) : (
          <button
            type="button"
            onClick={confirmar}
            disabled={submitting || faltaSedeRecojo}
            className="pointer-events-auto flex items-center justify-center gap-4 px-10 py-5 rounded-full font-black uppercase italic transition-all duration-500 shadow-2xl bg-brand-accent text-white hover:scale-105 active:scale-95 border-4 border-white w-full max-w-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            <span className="tracking-widest text-[12px]">
              {submitting
                ? 'Procesando...'
                : totalAPagar != null
                  ? `Confirmar matrícula · S/ ${totalAPagar.toFixed(2)}`
                  : 'Confirmar matrícula'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EnrollmentStepper;
