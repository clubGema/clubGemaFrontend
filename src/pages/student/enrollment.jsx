import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, AlertCircle, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { enrollmentService } from '../../services/enrollment.service';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';

import EnrollmentStepper from '../../components/student/enrollment/EnrollmentStepper';
import ReportPaymentModal from "../../components/student/Payments/ReportPaymentModal";
import ConfirmModal from "../../components/shared/ConfirmModal";

const Enrollment = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  // Al terminar una matrícula se cambia la key para remontar el asistente vacío.
  const [stepperKey, setStepperKey] = useState(0);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedDebtForPay, setSelectedDebtForPay] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cuentaIdToCancel, setCuentaIdToCancel] = useState(null);

  const { data: pendingPayment, refetch: refetchDeuda } = useFetch(
    () => (userId ? enrollmentService.deudaPendiente(userId) : null),
    [userId],
    { errorMessage: 'Error de sincronización Imperio 7' }
  );

  const handleOpenPayment = (debt) => {
    setSelectedDebtForPay(debt);
    setIsPayModalOpen(true);
  };

  // Abrir modal de confirmación nativo del aplicativo
  const handleRequestCancel = (cuentaId) => {
    setCuentaIdToCancel(cuentaId);
    setCancelModalOpen(true);
  };

  // Confirmar y anular la reserva
  const handleConfirmCancel = async () => {
    if (!cuentaIdToCancel) return;
    setIsCancelling(true);
    try {
      const response = await apiFetch.delete(`/inscripciones/paquete/${cuentaIdToCancel}`);
      if (response.ok) {
        toast.success("Reserva anulada con éxito");
        setIsPayModalOpen(false);
        setSelectedDebtForPay(null);
        await refetchDeuda();
        setStepperKey(k => k + 1);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data.message || "No se pudo anular la reserva");
      }
    } catch (e) {
      console.error("Error al anular reserva:", e);
      toast.error("Error de conexión al anular la reserva");
    } finally {
      setIsCancelling(false);
      setCancelModalOpen(false);
      setCuentaIdToCancel(null);
    }
  };

  // Al finalizar la matrícula, se obtiene la deuda generada y se abre DIRECTAMENTE el modal de pago
  const handleEnrolled = async () => {
    try {
      const deuda = await enrollmentService.deudaPendiente(userId);
      if (deuda) {
        setSelectedDebtForPay(deuda);
        setIsPayModalOpen(true);
      }
    } catch (e) {
      console.error('Error al abrir pago inmediato:', e);
    } finally {
      refetchDeuda();
      setStepperKey(k => k + 1);
    }
  };

  const montoPendiente = pendingPayment
    ? Number(pendingPayment.saldoRestante ?? pendingPayment.monto_final).toFixed(2)
    : null;

  return (
    <div className="relative min-h-screen bg-brand-bg overflow-x-hidden">
      {/* CONTENIDO PRINCIPAL */}
      <div className="px-4 sm:px-6 md:px-8 transition-all duration-700">
        <div className="max-w-5xl mx-auto py-8">
          
          {/* HEADER LIMPIO */}
          <header className="mb-8">
            <Link to="/dashboard/student" className="inline-flex items-center gap-1.5 text-brand-muted hover:text-brand-primary mb-3 text-[10px] font-black uppercase italic tracking-widest transition-colors">
              <ArrowLeft size={13} /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-black text-brand-primary italic uppercase tracking-tighter leading-none">
              Matrícula <span className="text-brand-accent">Imperio 7</span>
            </h1>
          </header>

          {/* 🌟 BANNER DESTACADO Y VISIBLE DE MATRÍCULA PENDIENTE (CON OPCIÓN DE ANULAR SI SE ARREPIENTE) */}
          {pendingPayment && (
            <div className="mb-10 bg-gradient-to-br from-brand-primary via-[#480d19] to-brand-primary-dark border-2 border-brand-accent rounded-[2rem] p-6 md:p-8 shadow-2xl text-white relative overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <CreditCard size={180} />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-brand-accent text-brand-primary-dark">
                    <AlertCircle size={13} />
                    <span>Matrícula en Espera de Pago</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight leading-tight text-white">
                    Tienes una matrícula pendiente · S/ {montoPendiente}
                  </h2>
                  <p className="text-xs font-bold text-amber-200/90 max-w-xl">
                    Reporta tu comprobante para que el club active tu membresía, o anula esta reserva directamente si deseas elegir otros horarios o no deseas continuar.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleRequestCancel(pendingPayment.id)}
                    disabled={isCancelling}
                    className="px-5 py-3.5 rounded-xl border border-white/20 hover:bg-rose-500/20 text-white/90 hover:text-white text-xs font-black uppercase italic tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    {isCancelling ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} className="text-rose-400" />}
                    <span>Anular Reserva</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPayment(pendingPayment)}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-brand-accent via-amber-400 to-brand-accent-dark hover:brightness-110 text-brand-primary-dark text-xs font-black uppercase italic tracking-wider shadow-xl shadow-brand-accent/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
                  >
                    <CreditCard size={18} />
                    <span>Reportar Pago Ahora</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ASISTENTE DE MATRÍCULA */}
          <EnrollmentStepper key={stepperKey} userId={userId} onSuccess={handleEnrolled} />
        </div>
      </div>

      {/* MODAL DE PAGO (Z-INDEX 1000) */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-[1000]">
          <ReportPaymentModal
            isOpen={isPayModalOpen}
            onClose={() => setIsPayModalOpen(false)}
            debt={selectedDebtForPay}
            monto={selectedDebtForPay?.saldoRestante ?? selectedDebtForPay?.monto_final}
            onCancelReservation={handleRequestCancel}
            onSuccess={() => {
              setIsPayModalOpen(false);
              refetchDeuda();
              navigate('/dashboard/student');
            }}
          />
        </div>
      )}

      {/* 🛡️ MODAL DE CONFIRMACIÓN PROPIO DEL SISTEMA (EN LUGAR DEL WINDOW.CONFIRM NATIVO) */}
      <ConfirmModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setCuentaIdToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        title="¿Anular reserva de matrícula?"
        message="Tus horarios quedarán liberados inmediatamente para que puedas elegir una nueva sede, días u horarios. Esta acción descartará la reserva pendiente."
        iconType="danger"
        confirmText={isCancelling ? "Anulando..." : "Sí, Anular Reserva"}
      />
    </div>
  );
};

export default Enrollment;
