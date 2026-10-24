import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { FINANCE_LEVEL } from '../../../utils/financeAlert';

const TONES = {
  [FINANCE_LEVEL.OK]: {
    Icon: CheckCircle2,
    box: 'bg-brand-surface border-brand-border-soft',
    icon: 'text-emerald-500',
    text: 'text-slate-500',
  },
  [FINANCE_LEVEL.PENDING]: {
    Icon: AlertCircle,
    box: 'bg-brand-accent-soft/50 border-brand-accent/30',
    icon: 'text-brand-accent',
    text: 'text-brand-accent-dark',
  },
  [FINANCE_LEVEL.REVIEW]: {
    Icon: Clock,
    box: 'bg-brand-primary-soft/50 border-brand-primary/20',
    icon: 'text-brand-primary',
    text: 'text-brand-primary',
  },
};

const mensaje = (level, pendingCount) => {
  if (level === FINANCE_LEVEL.PENDING) {
    return pendingCount === 1 ? 'Tienes 1 pago pendiente' : `Tienes ${pendingCount} pagos pendientes`;
  }
  if (level === FINANCE_LEVEL.REVIEW) return 'Tu pago está en revisión';
  return 'Tus pagos están al día';
};

/**
 * Una línea con el estado de pagos. El detalle vive en /student/payments; el
 * dashboard solo interrumpe con FinanceAlertBanner cuando algo es crítico.
 */
const FinanceSummaryStrip = ({ level, pendingCount }) => {
  // CRITICAL ya se muestra arriba como banner.
  const tone = TONES[level];
  if (!tone) return null;
  const { Icon } = tone;

  return (
    <Link
      to="/dashboard/student/payments"
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-sm hover:shadow-md transition-all ${tone.box}`}
    >
      <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${tone.text}`}>
        <Icon size={16} className={tone.icon} />
        {mensaje(level, pendingCount)}
      </span>
      <span className="flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-brand-muted">
        Ver pagos <ChevronRight size={12} />
      </span>
    </Link>
  );
};

export default FinanceSummaryStrip;
