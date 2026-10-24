import {
  CheckCircle2, XCircle, CalendarX, Sparkles, RefreshCw, CircleDashed, AlertCircle, HeartPulse,
} from 'lucide-react';

/**
 * Apariencia de una sesión de clase según lo que le pasó.
 *
 * Antes esta decisión vivía en tres cadenas de ternarios dentro de
 * StudentSchedule (fondo de tarjeta, caja de fecha, badge) y en otra versión
 * dentro del calendario, y no coincidían entre sí. Aquí hay una sola entrada
 * por estado visual y las dos vistas la leen.
 *
 * Son colores de ESTADO, no de marca (ver statusColors.js): no deben seguir al
 * acento si la marca cambia. Las clases de PRESENTE/FALTA/MOVIDA/PROGRAMADA son
 * las que ya estaban en pantalla; no se unifican green/emerald aquí.
 */
export const SESSION_VISUAL = {
  PRESENTE: {
    label: 'Asististe',
    legend: 'Asististe',
    Icon: CheckCircle2,
    card: 'bg-green-50/50 border-green-200 shadow-sm',
    dateBox: 'bg-green-600 text-white',
    badge: 'bg-green-100 text-green-700 border-green-200',
    cell: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  },
  FALTA: {
    label: 'Faltaste',
    legend: 'Faltaste',
    Icon: XCircle,
    card: 'bg-red-50/50 border-red-200 shadow-sm',
    dateBox: 'bg-red-600 text-white',
    badge: 'bg-red-100 text-red-700 border-red-200',
    cell: 'border-rose-500 bg-rose-50 text-rose-700',
  },
  JUSTIFICADA: {
    label: 'Justificada',
    legend: 'Justificada (lesión)',
    Icon: HeartPulse,
    card: 'bg-amber-50/50 border-amber-200 shadow-sm',
    dateBox: 'bg-amber-500 text-white',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    cell: 'border-amber-500 bg-amber-50 text-amber-700',
  },
  MOVIDA: {
    label: 'Movida',
    legend: 'Movida',
    Icon: CalendarX,
    card: 'bg-brand-bg/30 border-brand-border border-dashed opacity-60 grayscale-[0.5]',
    dateBox: 'bg-slate-400 text-white',
    badge: 'bg-slate-200 text-slate-500 border-slate-300',
    cell: 'border-slate-300 bg-brand-surface-alt text-brand-muted opacity-60',
  },
  REPOSICION: {
    label: 'Reposición',
    legend: 'Reposición',
    Icon: Sparkles,
    card: 'bg-gradient-to-br from-violet-50/80 to-brand-primary-soft/80 border-violet-200 shadow-md',
    dateBox: 'bg-brand-primary text-white',
    badge: 'bg-brand-primary-soft text-brand-primary border-brand-primary/20',
    cell: 'border-violet-500 bg-violet-50 text-violet-700',
  },
  RECUPERACION: {
    label: 'Recuperación',
    legend: 'Recuperación',
    Icon: RefreshCw,
    card: 'bg-brand-surface border-brand-border-soft hover:border-brand-primary/40 hover:shadow-xl',
    dateBox: 'bg-brand-primary text-white',
    badge: 'bg-brand-primary-soft text-brand-primary border-brand-primary/20',
    cell: 'border-brand-primary bg-brand-primary-soft text-brand-primary',
  },
  PROGRAMADA: {
    label: 'Próxima',
    legend: 'Próxima clase',
    Icon: CircleDashed,
    card: 'bg-brand-surface border-brand-border-soft hover:border-brand-primary/40 hover:shadow-xl',
    dateBox: 'bg-brand-primary text-white',
    badge: 'bg-brand-primary-soft text-brand-primary border-brand-primary-soft',
    cell: 'border-brand-accent bg-brand-surface text-brand-primary',
  },
  // Clase programada cuya hora ya pasó y nadie registró asistencia.
  SIN_REGISTRO: {
    label: 'Pasada',
    legend: 'Sin registro',
    Icon: AlertCircle,
    card: 'bg-brand-surface border-brand-border-soft hover:border-brand-primary/40 hover:shadow-xl',
    dateBox: 'bg-brand-primary text-white',
    badge: 'bg-brand-primary-soft text-brand-primary border-brand-primary-soft',
    cell: 'border-brand-accent bg-brand-surface text-brand-primary',
  },
};

// Orden de la leyenda del calendario.
export const CALENDAR_LEGEND_KEYS = ['PRESENTE', 'FALTA', 'REPOSICION', 'RECUPERACION', 'PROGRAMADA', 'MOVIDA'];

/**
 * Clave visual de una sesión normalizada (ver utils/studentAgenda.js).
 * Lo que ya ocurrió (asistió/faltó/movida) manda sobre el tipo de clase: una
 * reposición a la que asististe se ve como "asististe".
 */
export const getSessionVisualKey = (sesion, now = new Date()) => {
  switch (sesion.estado) {
    case 'PRESENTE':
    case 'FALTA':
    case 'JUSTIFICADA':
    case 'MOVIDA':
      return sesion.estado;
    case 'PROGRAMADA':
      if (sesion.fin < now) return 'SIN_REGISTRO';
      if (sesion.tipo === 'REPOSICION') return 'REPOSICION';
      if (sesion.tipo === 'RECUPERACION') return 'RECUPERACION';
      return 'PROGRAMADA';
    default:
      return 'SIN_REGISTRO';
  }
};

export const getSessionVisual = (sesion, now = new Date()) =>
  SESSION_VISUAL[getSessionVisualKey(sesion, now)];
