import React, { useState, useEffect } from "react";
import { X, Send, Loader2, Banknote, Upload, Info, Coins, Copy, CheckCircle2, QrCode, Smartphone, Calendar, Landmark } from "lucide-react";
import apiFetch from "../../../interceptors/api.js";
import toast from "react-hot-toast";
import { API_ROUTES } from "../../../constants/apiRoutes.js";

const ReportPaymentModal = ({ isOpen, onClose, debt, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [voucherFile, setVoucherFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    metodo_pago: "YAPE",
    codigo_operacion: "",
    monto: ""
  });

  const CLUB_PHONE = "902 585 995";
  const esEfectivo = formData.metodo_pago === "EFECTIVO";

  const handleCopy = () => {
    navigator.clipboard.writeText(CLUB_PHONE);
    setCopied(true);
    toast.success("Número copiado");
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (debt) {
      const montoSugerido = debt.saldoRestante !== undefined ? debt.saldoRestante : debt.monto_final;
      setFormData(prev => ({ ...prev, monto: montoSugerido }));
    }
  }, [debt]);

  if (!isOpen || !debt) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.monto || parseFloat(formData.monto) <= 0) return toast.error("Ingresa un monto válido");
    if (!esEfectivo) {
      if (!formData.codigo_operacion.trim()) return toast.error("Código requerido");
      if (!voucherFile) return toast.error("Sube el voucher");
    }

    setLoading(true);
    try {
      const paymentData = new FormData();
      paymentData.append('deuda_id', parseInt(debt.id));
      paymentData.append('monto', parseFloat(formData.monto));
      paymentData.append('metodo_pago', formData.metodo_pago);
      paymentData.append('codigo_operacion', esEfectivo ? 'PAGO_PRESENCIAL' : formData.codigo_operacion);
      if (voucherFile && !esEfectivo) paymentData.append('voucher', voucherFile);

      const response = await apiFetch.post(API_ROUTES.PAGOS.REPORTAR, paymentData);
      if (!response.ok) {
        // Intentamos leer el JSON que nos mandó tu backend (donde está el textazo)
        const errorData = await response.json();

        // Lanzamos el error usando el texto del backend (o uno genérico si falla)
        throw new Error(errorData.message || "Error al reportar el pago.");
      }

      toast.success("¡Pago reportado!");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error) {
      // Ahora error.message contendrá tu mensaje "⛔ PAGO DENEGADO..."
      toast.error(error.message, {
        duration: 5000,
        style: { maxWidth: '500px' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white w-full ${esEfectivo ? 'max-w-md' : 'max-w-5xl'} 
        /* 1. LIMITAMOS EL ALTO EN PC */
        max-h-[95vh] md:max-h-[90vh] 
        /* 2. EVITAMOS EL SCROLL GLOBAL DEL MODAL */
        overflow-hidden 
        rounded-[2.5rem] md:rounded-[4rem] shadow-2xl transition-all duration-500 flex flex-col md:flex-row border border-white/20`}>

        {/* LADO IZQUIERDO: Formulario (Ahora con scroll independiente si es necesario) */}
        <div className="flex-[1.2] flex flex-col min-w-full md:min-w-[400px] overflow-y-auto custom-scrollbar">
          <div className="bg-[#1e3a8a] p-6 md:p-10 text-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 md:hidden text-white/50 hover:text-white">
              <X size={24} />
            </button>
            <div className="relative z-10">
              <h3 className="font-black uppercase italic text-xl md:text-3xl tracking-tighter leading-none">Reportar <span className="text-orange-500">Pago</span></h3>
              <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.2em] mt-1 italic">Gema Student Elite</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 flex-1 bg-white">
            {/* ... (campos del formulario iguales) */}
            <div className="space-y-1.5">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                 <Banknote size={12} className="text-orange-500" /> Monto a Reportar (S/)
               </label>
               <input type="number" step="0.01" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-3.5 text-xl font-black text-[#1e3a8a] outline-none focus:border-orange-500 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Método</label>
                <select value={formData.metodo_pago} onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-[10px] font-black outline-none cursor-pointer focus:border-[#1e3a8a] appearance-none uppercase italic">
                  <option value="YAPE">YAPE</option>
                  <option value="PLIN">PLIN</option>
                  <option value="TRANSFERENCIA">TRANSF.</option>
                  <option value="EFECTIVO">EFECTIVO</option>
                </select>
              </div>
              {!esEfectivo ? (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Operación</label>
                  <input type="text" placeholder="000000" value={formData.codigo_operacion} onChange={(e) => setFormData({ ...formData, codigo_operacion: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3.5 text-xs font-black outline-none focus:border-[#1e3a8a]" />
                </div>
              ) : (
                <div className="bg-orange-50 rounded-xl p-2 flex flex-col items-center justify-center border border-orange-100">
                  <Coins size={20} className="text-orange-500 mb-0.5" />
                  <p className="text-[8px] font-black text-orange-600 uppercase italic">Pago Sede</p>
                </div>
              )}
            </div>

            {!esEfectivo && (
               <div className="space-y-1.5">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Comprobante</label>
                 <input type="file" accept="image/*" className="hidden" id="voucher-input" onChange={(e) => { if (e.target.files[0]) { setVoucherFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} />
                 <label htmlFor="voucher-input" className="block bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-16 text-center cursor-pointer hover:bg-orange-50 transition-all group overflow-hidden">
                   {previewUrl ? <img src={previewUrl} className="h-32 mx-auto rounded-xl shadow-lg" alt="Voucher" /> :
                     <div className="py-1"><Upload size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-orange-500 transition-colors" /><p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-none">Subir Imagen</p></div>}
                 </label>
               </div>
            )}

            <div className="pt-4 flex gap-3 pb-2">
              <button onClick={onClose} type="button" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all uppercase italic text-[10px] tracking-widest">
                Cancelar
              </button>
              <button disabled={loading} className="flex-[2] bg-[#1e3a8a] hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span className="uppercase italic tracking-tighter text-xs">{loading ? "..." : "CONFIRMAR REGISTRO"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LADO DERECHO: QR (Fijo y con scroll propio si la pantalla es muy pequeña) */}
        {!esEfectivo && (
          <div className="flex-1 bg-[#f8fafc] p-8 md:p-12 flex flex-col items-center justify-start md:justify-center overflow-y-auto custom-scrollbar border-t md:border-t-0 md:border-l border-slate-100">
            <div className="text-center space-y-6 w-full max-w-[320px] py-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-md border border-slate-100">
                  <Smartphone size={14} className="text-orange-500" />
                  <span className="text-[9px] font-black text-[#1e3a8a] uppercase tracking-widest italic">Recaudación Segura</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">Paga con <span className="text-orange-500">QR</span></h4>
              </div>

              {/* QR */}
              <div className="bg-white p-4 rounded-[3rem] shadow-xl border-4 border-white">
                <img src="/QrYapeGema.PNG" alt="QR Gema" className="w-full h-auto rounded-[2.5rem] mb-4" />
                <div className="bg-[#1e3a8a]/5 py-2 rounded-2xl mx-4">
                  <p className="text-[9px] font-black text-[#1e3a8a] uppercase tracking-[0.3em] italic">Escanea Yape / Plin</p>
                </div>
              </div>

              {/* Número Copiable */}
              <div className="bg-[#1e3a8a] p-6 rounded-[2.5rem] shadow-xl border border-white/10">
                <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mb-3 italic">¿No puedes escanear?</p>
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl">
                  <span className="flex-1 font-black text-white text-xl ml-3">{CLUB_PHONE}</span>
                  <button type="button" onClick={handleCopy} className="p-3 bg-orange-500 text-white rounded-xl hover:bg-white hover:text-orange-500 transition-all">
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Cuentas Bancarias */}
              <div className="bg-white p-5 rounded-[2.5rem] shadow-lg border border-slate-200 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={14} className="text-orange-500" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Cuentas Bancarias</p>
                </div>
                <div className="space-y-3 bg-slate-50 p-3 rounded-2xl">
                   <div>
                     <p className="text-[7px] font-bold text-slate-400 uppercase mb-0.5">BCP Directo</p>
                     <p className="text-xs font-black text-[#1e3a8a] font-mono">19411410110063</p>
                   </div>
                   <div className="pt-2 border-t border-slate-200">
                     <p className="text-[7px] font-bold text-slate-400 uppercase mb-0.5">Interbancaria (CCI)</p>
                     <p className="text-xs font-black text-[#1e3a8a] font-mono">00219411141011006392</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPaymentModal;