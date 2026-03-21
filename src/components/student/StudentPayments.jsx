import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle, Clock, CheckCircle2, ChevronRight,
  Loader2, Receipt, CreditCard, MessageSquare, ExternalLink
} from 'lucide-react';
import { apiFetch } from '../../interceptors/api.js';
import { useAuth } from "../../context/AuthContext";
import ReportPaymentModal from './Payments/ReportPaymentModal.jsx';
import { API_ROUTES } from "../../constants/apiRoutes";

const StudentPayments = () => {
  const { userId } = useAuth();
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);

  const fetchPaymentData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [resDebts, resPay] = await Promise.all([
        apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.BASE),
        apiFetch.get(API_ROUTES.PAGOS.ALUMNO_HISTORIAL(userId)),
      ]);

      const dataDebts = await resDebts.json();
      const dataPay = await resPay.json();

      setDebts((dataDebts.data || []).filter((d) => d.alumno_id === userId));
      setPayments(dataPay.data || []);
    } catch (error) {
      console.error("Error al cargar datos financieros:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPaymentData();
  }, [fetchPaymentData]);

  const handleOpenModal = (debt) => {
    setSelectedDebt(debt);
    setIsModalOpen(true);
  };

  const pendientes = debts.filter(d => d.estado === 'PENDIENTE');
  const enValidacion = payments.filter(p => p.estado_validacion === 'PENDIENTE');
  const aprobados = payments.filter(p => p.estado_validacion === 'APROBADO');

  if (loading) return (
    <div className="flex justify-center py-8">
      <Loader2 className="animate-spin text-orange-500" size={32} />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* 1. DEUDAS POR PAGAR */}
      {pendientes.map(deuda => (
        <div
          key={deuda.id}
          className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-all group"
          onClick={() => handleOpenModal(deuda)}
        >
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-xl text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#1e3a8a] uppercase leading-none">
                {deuda.catalogo_conceptos?.nombre || "Concepto Pendiente"}
              </p>
              <p className="text-[8px] text-orange-600 font-bold uppercase mt-1 italic flex items-center gap-1">
                Pagar S/ {deuda.monto_final} ahora <ChevronRight size={10} />
              </p>
            </div>
          </div>
          <span className="font-black text-[#1e3a8a] text-sm italic">S/ {deuda.monto_final}</span>
        </div>
      ))}

      {/* 2. PAGOS EN VALIDACIÓN (Con más info) */}
      {enValidacion.map(pago => (
        <div key={pago.id} className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-500">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-[#1e3a8a] uppercase leading-none italic">Esperando Validación</p>
                <p className="text-[9px] text-blue-600 font-bold uppercase mt-1">
                  {pago.cuentas_por_cobrar?.detalle_adicional || "Mensualidad"}
                </p>
              </div>
            </div>
            <span className="font-black text-blue-700 text-sm italic">S/ {pago.monto_pagado}</span>
          </div>

          <div className="flex items-center gap-4 pt-2 border-t border-blue-100/50">
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
              <CreditCard size={12} className="text-blue-400" /> {pago.metodos_pago?.nombre}
            </div>
            <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
              <Receipt size={12} className="text-blue-400" /> ID: {pago.codigo_operacion}
            </div>
          </div>
        </div>
      ))}

      {/* 3. HISTORIAL DE PAGOS APROBADOS (Con notas del Admin) */}
      {aprobados.map(pago => (
        <div key={pago.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-700 uppercase leading-none">Pago Confirmado</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">
                  {new Date(pago.fecha_pago).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })} • {pago.metodos_pago?.nombre}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-black text-[#1e3a8a] text-sm italic block leading-none">S/ {pago.monto_pagado}</span>
              <a
                href={pago.url_comprobante}
                target="_blank"
                rel="noreferrer"
                className="text-[7px] text-orange-500 font-black uppercase flex items-center justify-end gap-0.5 mt-1 hover:underline"
              >
                Ver Voucher <ExternalLink size={8} />
              </a>
            </div>
          </div>

          {/* Notas de validación (Si el admin escribió algo) */}
          {pago.notas_validacion && (
            <div className="bg-slate-50 rounded-xl p-2.5 flex gap-2 items-start border border-slate-100">
              <MessageSquare size={12} className="text-slate-400 mt-0.5" />
              <p className="text-[9px] text-slate-500 font-medium leading-tight">
                <span className="font-bold text-slate-700 uppercase text-[8px]">Nota de Gema:</span><br />
                {pago.notas_validacion}
              </p>
            </div>
          )}

          <div className="text-[7px] font-bold text-slate-300 uppercase tracking-widest pt-1">
            Op: {pago.codigo_operacion}
          </div>
        </div>
      ))}

      {/* ESTADO VACÍO */}
      {!pendientes.length && !enValidacion.length && !aprobados.length && (
        <div className="flex flex-col items-center justify-center py-10 opacity-40">
          <Receipt className="text-slate-300 mb-2" size={40} />
          <p className="text-[10px] text-slate-400 font-black uppercase text-center italic tracking-widest leading-relaxed">
            No hay movimientos recientes<br />¡Todo en orden! 💎
          </p>
        </div>
      )}

      {isModalOpen && selectedDebt && (
        <ReportPaymentModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDebt(null); }}
          debt={selectedDebt}
          onSuccess={fetchPaymentData}
        />
      )}
    </div>
  );
};

export default StudentPayments;