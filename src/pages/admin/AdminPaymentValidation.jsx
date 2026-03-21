import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Eye, Loader2, DollarSign, User, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '../../interceptors/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminPaymentValidation = ({ onBack, paymentData, onSuccess }) => {
    const { userId } = useAuth(); // ID del admin logueado
    const [loading, setLoading] = useState(false);
    const [validationStatus, setValidationStatus] = useState(paymentData?.estado_validacion || 'PENDIENTE');
    const [notas, setNotas] = useState(paymentData?.notas_validacion || '');
    const [montoConfirmado, setMontoConfirmado] = useState(paymentData?.monto_pagado || 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    };

    const handleVerify = async () => {
        if (validationStatus === 'PENDIENTE') {
            return toast.error("Por favor cambia el estado a APROBADO o RECHAZADO");
        }

        setLoading(true);
        // Payload según la estructura requerida por tu backend
        const payload = {
            pago_id: paymentData.id,
            accion: validationStatus === 'APROBADO' ? 'APROBAR' : 'RECHAZAR',
            usuario_admin_id: userId,
            notas: notas,
            monto_real_confirmado: parseFloat(montoConfirmado)
        };

        try {
            const response = await apiFetch.post('/pagos/validar', payload);
            const result = await response.json();

            if (response.ok) {
                toast.success(result.message || "Validación procesada con éxito");
                if (onSuccess) onSuccess(); // Recarga la lista principal
                onBack();
            } else {
                // =================================================================
                // 🔥 AQUÍ ESTÁ EL CAMBIO PARA ATRAPAR EL ERROR DEL BACKEND 🔥
                // =================================================================
                toast.error(result.message || result.error || "Error al validar el pago", {
                    duration: 7000, // Lo dejamos 7 segundos para que el admin lo lea
                    style: { maxWidth: '500px', fontSize: '14px' } // Lo hacemos más ancho
                });
                // =================================================================
            }
        } catch (e) {
            toast.error("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    const alumno = paymentData?.cuentas_por_cobrar?.alumnos?.usuarios;

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-600">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tight text-slate-900">
                            Detalle de <span className="text-[#1e3a8a]">Validación</span>
                        </h1>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Op: #{paymentData?.codigo_operacion || paymentData?.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleVerify}
                    disabled={loading || validationStatus === 'PENDIENTE'}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0f172a] hover:from-orange-500 hover:to-orange-600 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-black uppercase italic text-xs flex items-center gap-2 transition-all duration-300 shadow-xl"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                    Finalizar Verificación
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tarjeta Alumno */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><User size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Emisor del Pago</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Alumno Gema</label>
                                <div className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 uppercase italic">
                                    {alumno?.nombres} {alumno?.apellidos}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Detalle Adicional</label>
                                <div className="text-sm font-bold text-[#1e3a8a] bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    {paymentData?.cuentas_por_cobrar?.detalle_adicional || 'Inscripción Estándar'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Voucher */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ImageIcon size={20} /></div>
                                <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Comprobante</h3>
                            </div>
                            {paymentData?.url_comprobante && (
                                <a href={paymentData.url_comprobante} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:underline">
                                    Abrir <ExternalLink size={12} />
                                </a>
                            )}
                        </div>
                        <div className="p-8 flex justify-center bg-slate-50/50">
                            {paymentData?.url_comprobante ? (
                                <div className="relative group rounded-2xl border-4 border-white shadow-2xl overflow-hidden max-w-sm">
                                    <img src={paymentData.url_comprobante} alt="Voucher" className="w-full h-auto max-h-[450px] object-contain" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white text-black px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                                            <Eye size={14} /> Vista Completa
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-20 text-slate-400 italic font-bold uppercase text-[10px]">No se cargó ninguna imagen</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar de Acciones */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 bg-[#f8fafc] flex items-center gap-3">
                            <div className="p-2 bg-blue-100 text-[#1e3a8a] rounded-lg"><CheckCircle size={20} /></div>
                            <h3 className="font-black text-[#1e3a8a] uppercase tracking-wider text-sm">Validar Operación</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setValidationStatus('APROBADO')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validationStatus === 'APROBADO' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                >
                                    <CheckCircle size={24} />
                                    <span className="text-[10px] font-black uppercase">Aprobar</span>
                                </button>
                                <button
                                    onClick={() => setValidationStatus('RECHAZADO')}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${validationStatus === 'RECHAZADO' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                >
                                    <XCircle size={24} />
                                    <span className="text-[10px] font-black uppercase">Rechazar</span>
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Monto Real Confirmado (S/)</label>
                                <input
                                    type="number"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 outline-none"
                                    value={montoConfirmado}
                                    onChange={(e) => setMontoConfirmado(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase">Notas Administrativas</label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold outline-none min-h-[120px] resize-none focus:ring-2 focus:ring-[#1e3a8a]/20"
                                    placeholder="Motivo o comentario interno..."
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0f172a] p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl">
                        <div className="relative z-10">
                            <h4 className="font-black uppercase italic tracking-tighter text-xl mb-4 text-orange-500">Resumen</h4>
                            <div className="space-y-3 opacity-90 text-[11px] font-bold uppercase italic">
                                <p className="flex justify-between border-b border-white/10 pb-2 text-white/70">Monto Reportado: <span className="text-white text-sm">{formatCurrency(paymentData.monto_pagado)}</span></p>
                                <p className="flex justify-between border-b border-white/10 pb-2 text-white/70">Método Pago: <span className="text-white">{paymentData.metodos_pago?.nombre}</span></p>
                                <p className="flex justify-between text-white/70">Fecha: <span className="text-white">{new Date(paymentData.fecha_pago).toLocaleDateString()}</span></p>
                            </div>
                        </div>
                        <DollarSign size={100} className="absolute -right-4 -bottom-4 opacity-5 rotate-12" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPaymentValidation;