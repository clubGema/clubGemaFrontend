// ─────────────────────────────────────────────────────────────────────────
// MOTOR DE REBRANDING — paleta de marca
//
// Única fuente de verdad de los colores de marca. La consumen DOS lados:
//   1. tailwind.config.js, que genera las utilidades brand-* y las sombras.
//   2. El código que necesita los colores como valores JS y no como clases
//      (p.ej. los estilos inline de react-hot-toast en App.jsx, o las
//      paletas de Recharts, que reciben el color por prop).
//
// Para rebrandear, cambiar SOLO los HEX de este archivo.
// El comentario de cada token indica su equivalente en la paleta por
// defecto de Tailwind, que es el valor que estaba hardcodeado por todo
// src/ antes de la migración. Cada HEX es el color exacto en producción.
//
// Nota: NO se usa resolveConfig de Tailwind para leer esto desde la app.
// Eso arrastraría el resolvedor de configuración de Tailwind al bundle del
// cliente. Un módulo plano es la dirección correcta de la dependencia: el
// config de Tailwind importa de aquí, no al revés.
// ─────────────────────────────────────────────────────────────────────────

export const BRAND_COLORS = {
  // Primario — Vinotinto Imperial / Sangre Real (según camiseta y escudo Imperio 7)
  primary: '#581220',        // Vinotinto noble profundo
  'primary-dark': '#0C0608', // Negro Obsidiana Imperial · hover, gradientes, backdrops
  'primary-light': '#7A1A2E',// Garnet imperial brillante
  'primary-soft': '#FDF2F4', // Blanco marfil con velo borgoña · fondos de aviso/info

  // Acento — Oro Real / Imperial Gold (Corona y detalles dorados)
  accent: '#D4AF37',         // Oro imperial heráldico (corona y espada)
  'accent-dark': '#A67C1E',  // Oro noble profundo · hover
  'accent-light': '#F5D77F', // Oro claro brillante
  'accent-soft': '#FCF8ED',  // Oro champagne suave · fondos de badge/pill

  // Dorado — Coleccionables / Tienda Merch Imperio 7
  gold: '#D4AF37',           // Oro metálico heráldico
  'gold-dark': '#8A6712',    // Oro profundo · texto sobre fondos claros
  'gold-soft': '#FCF7EA',    // Champagne perlado · fondos de badge/pill

  // Tonos Vinotinto complementarios
  wine: '#7A162B',           // Vinotinto vibrante
  'wine-dark': '#3D0A14',    // Borgoña de sombra
  'wine-soft': '#F7EBEF',    // Fondo vino sutil

  // Neutros estructurales
  bg: '#F8F9FA',             // Fondo de página
  surface: '#FFFFFF',        // Tarjetas, modales
  'surface-alt': '#F3F4F6',  // Botón neutro, chips
  border: '#E5E7EB',         // Divisor estándar
  'border-soft': '#F1F3F5',  // Divisor sutil

  // Tipografía
  heading: '#14080B',        // Títulos
  body: '#362E32',           // Cuerpo
  muted: '#888289',          // Secundario, placeholders
};


// ─────────────────────────────────────────────────────────────────────────
// DORADO PREMIUM — botón metálico y detalles de distinción Imperio 7
// ─────────────────────────────────────────────────────────────────────────
export const GOLD_PREMIUM = {
  start: '#BF953F', // Bronce dorado imperial
  mid: '#FCF6BA',   // Reflejo metálico de oro pulido
  end: '#B38728',   // Dorado regio profundo
};


// ─────────────────────────────────────────────────────────────────────────
// COLORES EXCLUSIVOS DEL LOGIN / AUTH
// ─────────────────────────────────────────────────────────────────────────
export const LOGIN_COLORS = {
  // Gradiente del panel izquierdo (Vinotinto Imperial -> Obsidiana)
  'grad-start': '#4E0F1A',
  'grad-mid': '#24060C',
  'grad-end': '#0A0305',

  // Textos decorativos del branding
  'highlight': '#F5E4B3',
  'slogan': '#E5B842',

  // Botón principal
  'btn': '#D4AF37',
  'btn-hover': '#B89326',
};







/**
 * Convierte un HEX de la paleta en rgba() con la opacidad dada.
 * alpha('#f97316', 0.4) -> 'rgba(249,115,22,0.4)'
 */
export const alpha = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
