import React, { useState, useRef } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { useStudentAgenda } from "../hooks/useStudentAgenda";
import { useStudentFinance } from "../hooks/useStudentFinance";
import { useStudentNotifications } from "../hooks/useStudentNotifications";
import { anuncioService } from "../services/anuncio.service";
import { FINANCE_LEVEL } from "../utils/financeAlert";

import LoadingSpinner from "../components/shared/LoadingSpinner";
import MonthlyCalendarDashboard from "../components/student/MonthlyCalendarDashboard";
import DashboardHeader from "../components/student/dashboard/DashboardHeader";
import BenefitsCarousel from "../components/student/dashboard/BenefitsCarousel";
import NextClassHero from "../components/student/dashboard/NextClassHero";
import UpcomingAgenda from "../components/student/dashboard/UpcomingAgenda";
import FinanceAlertBanner from "../components/student/dashboard/FinanceAlertBanner";
import FinanceSummaryStrip from "../components/student/dashboard/FinanceSummaryStrip";

// Orden de lectura: qué sigue -> qué viene -> cómo me fue -> (al final) pagos.
// La lógica de fechas y estados vive en hooks/utils; esta página solo compone.
const DashboardEstudiante = () => {
  const { user, userId } = useAuth();
  // Cerrado por defecto: lo primero que se lee es la lista de próximas clases;
  // el calendario se abre a demanda con el botón naranja.
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const handleVerCalendario = () => {
    setShowCalendar(true);
    calendarRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { sesiones, proximas, pasadas, nextClass, now, loading } = useStudentAgenda(userId);
  const finance = useStudentFinance(userId);
  const { notifications, unreadCount, markAsRead } = useStudentNotifications(userId);

  // Los beneficios son decorativos: si fallan, el dashboard sigue sin ellos.
  const { data: benefits } = useFetch(
    () => anuncioService.listarActivos().catch(() => []),
    [],
    { initialData: [] },
  );

  const firstName = user?.user?.nombres?.split(' ')[0] || "Campeón";

  if (loading) return (
    <LoadingSpinner
      size={48}
      className="min-h-screen flex flex-col items-center justify-center bg-brand-surface-alt"
      colorClassName="text-brand-accent mb-4"
      label="Sincronizando Imperio 7..."
      labelClassName="font-black text-brand-primary uppercase italic text-[10px] tracking-widest text-center animate-pulse"
    />
  );

  return (
    <div className="min-h-screen bg-brand-bg flex justify-center relative overflow-hidden">
      <div className="w-full max-w-lg md:max-w-6xl p-4 pb-28 relative z-10">

        <DashboardHeader
          firstName={firstName}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
        />

        {finance.level === FINANCE_LEVEL.CRITICAL && (
          <FinanceAlertBanner debt={finance.debt} rejected={finance.rejected} />
        )}

        <NextClassHero nextClass={nextClass} now={now} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2 space-y-6">
            {/* El calendario va ARRIBA de la lista: abierto, es lo que manda en pantalla. */}
            <div ref={calendarRef} className="relative z-0 scroll-mt-4">
              <div className="flex items-center justify-between gap-3 px-1">
                <h2 className="font-black uppercase tracking-widest text-[9px] italic text-slate-500">Mi Calendario</h2>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  aria-expanded={showCalendar}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${showCalendar ? 'bg-brand-surface text-brand-primary border-2 border-brand-primary shadow-sm' : 'bg-gradient-to-r from-brand-primary to-brand-primary-light text-white border border-brand-accent/50 shadow-lg hover:border-brand-accent hover:brightness-110'}`}
                >
                  <CalendarDays size={16} className="text-brand-accent" />
                  {showCalendar ? 'Ocultar calendario' : 'Ver calendario'}
                  <ChevronDown size={14} className={`transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {showCalendar && (
                <div className="mt-4 animate-in fade-in zoom-in-95 duration-300">
                  <MonthlyCalendarDashboard sesiones={sesiones} now={now} />
                </div>
              )}
            </div>

            <UpcomingAgenda proximas={proximas} pasadas={pasadas} now={now} onVerCalendario={handleVerCalendario} />
          </div>

          <div className="space-y-6">
            <BenefitsCarousel anuncios={benefits || []} />
            {!finance.loading && (
              <FinanceSummaryStrip level={finance.level} pendingCount={finance.pendingCount} />
            )}
          </div>

        </div>

        <p className="mt-12 text-center text-[8px] text-slate-300 font-black uppercase tracking-[0.4em] opacity-60 italic">
          IMPERIO 7 CLUB | DESDE 2023
        </p>
      </div>
    </div>
  );
};

export default DashboardEstudiante;
