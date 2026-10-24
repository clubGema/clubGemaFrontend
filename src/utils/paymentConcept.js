const TIPOS_MERCH = ['MERCH', 'MIXTO'];
const PREFIJO_MERCH = /^Merch:/i;

/**
 * Qué se está pagando en un pago (para que el admin sepa qué aprueba).
 * `requiereDetalle` = es merch o la cuenta no tiene plan regular (sin concepto del
 * catálogo ni inscripciones vinculadas): ahí el detalle_adicional es la única pista.
 */
export const getPaymentConcept = (pago) => {
  const cuenta = pago?.cuentas_por_cobrar;
  const detalle = cuenta?.detalle_adicional?.trim() || null;
  const plan = cuenta?.catalogo_conceptos?.nombre || null;
  // El listado del admin no trae inscripciones_deudas_link, solo el detalle maestro:
  // sin ese dato no se puede afirmar que la cuenta carezca de plan regular.
  const inscripciones = cuenta?.inscripciones_deudas_link;
  const sinInscripciones = Array.isArray(inscripciones) && inscripciones.length === 0;

  const esMerch = TIPOS_MERCH.includes(pago?.tipo_transaccion) || PREFIJO_MERCH.test(detalle || '');
  const sinPlanRegular = !plan && sinInscripciones;

  return {
    detalle,
    // "Merch: Polo IMPERIO 7 x1" → "Orden Merch: Polo IMPERIO 7 x1". Una cuenta mixta ("… | Merch: …") va tal cual.
    titulo: detalle && PREFIJO_MERCH.test(detalle) ? `Orden ${detalle}` : detalle,
    plan,
    esMerch,
    sinInscripciones,
    requiereDetalle: esMerch || sinPlanRegular,
  };
};
