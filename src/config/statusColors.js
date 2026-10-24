/**
 * Colores de ESTADO (no de marca).
 *
 * Igual que el naranja del toast de error en App.jsx, estos colores codifican
 * un estado semántico (éxito, error, aviso) y no deben seguir al acento de
 * marca: si mañana la marca cambia a verde, "aprobado" no puede volverse
 * indistinguible del resto de la interfaz. Por eso viven aquí como clases de
 * Tailwind y no en themeColors.js.
 *
 * Lo que sí era un problema: el estado de éxito/activo estaba escrito a mano en
 * 7 sitios con 4 combinaciones distintas (`green-100/600`, `green-50/600`,
 * `green-100/700`, `emerald-50/600`, `emerald-100/600`). El mismo significado
 * se pintaba de cuatro formas. Aquí hay una sola definición.
 *
 * El estándar es emerald con fondo claro y texto oscuro.
 */

/** Pill de estado: éxito / activo / aprobado / pagado / presente. */
export const STATUS_SUCCESS = 'bg-emerald-50 text-emerald-600 border-emerald-200';

/**
 * Variante de relleno sólido, para controles seleccionados donde el texto va en
 * blanco (botones de APROBAR, toggles sobre imagen). Mismo tono, distinto peso:
 * no se puede usar la pill clara porque ahí el contraste lo da el blanco.
 */
export const STATUS_SUCCESS_SOLID = 'bg-emerald-600 border-emerald-600 text-white';

// PENDIENTE: los estados de error y aviso siguen dispersos con varias
// combinaciones (`bg-red-100 text-red-600`, `bg-red-50 text-red-600`,
// `bg-amber-100`, `bg-brand-accent-soft`...). Unificarlos cambia más píxeles en
// pantalla y merece la misma decisión explícita que se tomó para el verde.
