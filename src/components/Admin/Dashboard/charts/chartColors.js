import { BRAND_COLORS } from "../../../../config/themeColors.js";

/**
 * Paleta categórica de las gráficas del dashboard. Recharts recibe el color
 * por prop, no por clase, así que no puede consumir las utilidades brand-*
 * de Tailwind: lee los valores desde BRAND_COLORS.
 *
 * Las tres primeras posiciones (las más visibles) siguen la marca. El resto
 * son tonos de relleno sin token de marca: existen para dar contraste entre
 * series cuando hay más de tres categorías, y un rebranding no los mueve.
 * Si llegan a necesitarlo, el sitio correcto sería un namespace propio
 * (p.ej. `chart-1..n`) en themeColors.js, no reutilizar tokens de marca.
 */
export const CHART_COLORS = [
  BRAND_COLORS.primary, // Vinotinto Imperial
  BRAND_COLORS.accent,  // Oro Imperial
  BRAND_COLORS['primary-light'], // Garnet Imperial
  BRAND_COLORS.muted,   // Gris noble
  '#cbd5e1',            // Slate sutil
  '#BF953F',            // Bronce dorado
];
