import { BRAND_COLORS, GOLD_PREMIUM, LOGIN_COLORS, alpha } from './src/config/themeColors.js';

/** @type {import('tailwindcss').Config} */

// La paleta vive en src/config/themeColors.js porque también la consume el
// código que necesita los colores como valores JS (estilos inline de
// Rebranding Imperio 7 Club - Palette update
const ACCENT = BRAND_COLORS.accent;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: BRAND_COLORS,
        login: LOGIN_COLORS,
        'gold-premium': GOLD_PREMIUM, // border-gold-premium-end, etc.
      },

      // Dorado metálico del Club Merch: reflejo claro al centro, sombra en los extremos.
      backgroundImage: {
        'gold-premium': `linear-gradient(135deg, ${GOLD_PREMIUM.start} 0%, ${GOLD_PREMIUM.mid} 50%, ${GOLD_PREMIUM.end} 100%)`,
      },

      // ───────────────────────────────────────────────────────────────────
      // SOMBRAS DE MARCA
      // Las utilidades shadow-<color> de Tailwind no sirven aquí: estas
      // sombras codifican desplazamiento, difuminado Y color en un mismo
      // valor, así que antes vivían como shadow-[0_0_20px_rgba(...)] y
      // quedaban fuera del motor de rebranding.
      // Hay un token por geometría distinta, no uno por rol: dos sombras
      // que solo difieren en la opacidad son colores distintos y
      // unificarlas cambiaría el diseño.
      // ───────────────────────────────────────────────────────────────────
      boxShadow: {
        'accent-glow': `0 0 20px ${alpha(ACCENT, 0.4)}`,         // CTA destacado (sidebars, navbar móvil)
        'accent-glow-hover': `0 0 30px ${alpha(ACCENT, 0.6)}`,   // hover de ese CTA
        'accent-lift': `0 10px 20px -5px ${alpha(ACCENT, 0.4)}`, // botón de envío (auth)
        'accent-card': `0 20px 50px ${alpha(ACCENT, 0.1)}`,      // tarjeta de plan destacada
        'accent-dot': `0 0 10px ${alpha(ACCENT, 0.8)}`,          // punto de notificación
        'accent-dot-sm': `0 0 8px ${alpha(ACCENT, 0.6)}`,        // punto de aviso en lista
        'accent-bar': `0 0 15px ${alpha(ACCENT, 0.4)}`,          // barra decorativa
        'accent-bar-sm': `0 0 8px ${alpha(ACCENT, 0.5)}`,        // barra decorativa fina
        'gold-glow': `0 0 14px ${alpha(GOLD_PREMIUM.start, 0.35)}`,        // botón Club Merch
        'gold-glow-hover': `0 0 26px ${alpha(GOLD_PREMIUM.start, 0.65)}`,  // hover de ese botón
      },

      // ───────────────────────────────────────────────────────────────────
      // ESCALA DE APILAMIENTO (z-index)
      // Antes convivían 15 valores sueltos (z-50, z-[60], z-[100], z-[110],
      // z-[150], z-[200], z-[500], z-[1000], z-[9999]...) elegidos a ojo en
      // cada archivo. El resultado era un bug real: InscriptionsModal (z-50)
      // quedaba POR DEBAJO del ConfirmModal (z-[100]) que él mismo lanzaba,
      // mientras AdminCreateBenefitsAnuncio (z-[1000]) lo tapaba.
      //
      // El orden es el que importa, no los números:
      //   nav < dropdown < modal < modal-nested < confirm < toast
      // Un desplegable nunca debe tapar un diálogo, y el ConfirmModal debe
      // quedar siempre por encima del diálogo desde el que se abre.
      // ───────────────────────────────────────────────────────────────────
      zIndex: {
        nav: '60',            // drawers de navegación móvil
        dropdown: '900',      // popovers y filtros de cabecera de tabla
        modal: '1000',        // diálogos
        'modal-nested': '1100', // diálogo abierto desde otro diálogo
        confirm: '1200',      // ConfirmModal: por encima de lo que lo lanza
        toast: '1300',        // avisos
      },
    },
  },
  plugins: [],
}
