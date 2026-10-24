// ─────────────────────────────────────────────────────────────────────────
// MOTOR DE REBRANDING — imágenes maestras
//
// Única fuente de verdad de las rutas de logos e imágenes de marca.
// Para rebrandear, reemplazar los archivos en public/ y, si cambian de
// nombre, ajustar SOLO las rutas de este archivo.
//
// Las claves describen el ROL, no el archivo: dos roles pueden apuntar hoy
// a la misma imagen y divergir en un rebranding futuro sin volver a tocar
// los componentes.
// ─────────────────────────────────────────────────────────────────────────

export const THEME_ASSETS = {
  /** Marca principal. Cabecera de los layouts y favicon. */
  logo: '/logo.png',

  /**
   * Filigrana decorativa: espada con corona y 7 transparente de fondo,
   * rotada y a opacidad 0.03–0.06 (layouts, tarjetas de perfil y de pago).
   */
  logoWatermark: '/imperio7-sword.png',

  /** Logo emblema oficial para superficies oscuras: sidebars, navbars, footer. */
  logoFramed: '/imperio7-emblem.png',

  /** Marca del sitio público: navbar de landing, login y registro. */
  logoPublic: '/imperio7-emblem.png',

  /** Fotografía de fondo de las pantallas de login y registro: Arena Imperial. */
  authBackground: '/bg.jpg',

  /** Identidad adicional Imperio 7 */
  wordmark: '/imperio7-wordmark.png',
  sword: '/imperio7-sword.png',
  spartan: '/imperio7-spartan.png',
  crown: '/imperio7-crown.png',
  horizontal: '/imperio7-horizontal-logo.png',
  jersey: '/imperio7-jersey.jpg',
};

