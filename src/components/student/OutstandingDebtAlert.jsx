import React from 'react';
import { AlertCircle, CreditCard, ArrowRight, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OutstandingDebtAlert = ({ pendingPayment }) => {
  const navigate = useNavigate();

  // Si no hay deuda, el componente no renderiza nada
  if (!pendingPayment) return null;

  return (
    <div className="mb-10 bg-gradient-to-r from-[#f97316] to-[#ea580c] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-orange-200/50 animate-fade-in-up border-b-4 border-orange-700/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Información de la Deuda */}
        <div className="flex items-center gap-6 text-center md:text-left flex-col md:flex-row">
          <div className="bg-white/15 p-4 rounded-[1.8rem] backdrop-blur-md border border-white/20 shadow-inner flex items-center justify-center">
            <Banknote size={38} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <AlertCircle size={14} className="animate-pulse" />
                <span className="text-orange-100 font-black uppercase text-[10px] tracking-[0.3em]">
                    Atención: Pago Requerido
                </span>
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
              {pendingPayment.catalogo_conceptos?.nombre || 'Cuenta por Pagar'}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                <p className="text-white text-2xl font-black italic">
                  S/ {pendingPayment.monto_final}
                </p>
                <span className="h-4 w-px bg-white/30"></span>
                <p className="text-orange-100 text-xs font-bold uppercase italic">
                    Vence: {new Date(pendingPayment.fecha_vencimiento).toLocaleDateString()}
                </p>
            </div>
          </div>
        </div>
        
        {/* Acción */}
        <button 
          onClick={() => navigate('/dashboard/student/payments')}
          className="bg-[#1e3a8a] text-white px-10 py-5 rounded-2xl font-black uppercase italic text-sm flex items-center gap-3 hover:bg-[#0f172a] hover:scale-105 transition-all duration-300 shadow-xl group border-b-4 border-blue-900"
        >
          <CreditCard size={20} /> 
          Ir a mis Pagos 
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default OutstandingDebtAlert;