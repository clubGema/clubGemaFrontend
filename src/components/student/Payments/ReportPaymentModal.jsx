import React, { useState, useEffect } from "react";
import { X, Send, Loader2, Banknote, Upload, Info, Coins, Copy, CheckCircle2, Landmark } from "lucide-react";
import apiFetch from "../../../interceptors/api.js";
import toast from "react-hot-toast";
import { API_ROUTES } from "../../../constants/apiRoutes.js";

const ReportPaymentModal = ({ isOpen, onClose, debt, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [voucherFile, setVoucherFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [copiedField, setCopiedField] = useState("");
  const [formData, setFormData] = useState({
    metodo_pago: "YAPE",
    codigo_operacion: "",
    monto: ""
  });

  const CLUB_PHONE = "902585995";
  const BCP_CUENTA = "19411410110063";
  const CCI_CUENTA = "00219411141011006392";
  const esEfectivo = formData.metodo_pago === "EFECTIVO";

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedField(""), 2000);
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
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al reportar el pago.");
      }

      toast.success("¡Pago reportado!");
      if (onSuccess) await onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message, { duration: 5000, style: { maxWidth: '500px' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-6 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white w-full ${esEfectivo ? 'max-w-md' : 'max-w-5xl'} 
        /* ✅ CORRECCIÓN 1: Scroll habilitado para el padre en móvil */
        max-h-[95vh] overflow-y-auto md:overflow-hidden rounded-[2.5rem] md:rounded-[4rem] shadow-2xl flex flex-col md:flex-row border border-white/20 custom-scrollbar`}>

        {/* LADO IZQUIERDO: Formulario */}
        <div className="flex-[1.1] flex flex-col min-w-full md:min-w-[380px] bg-white border-b md:border-b-0">
          <div className="bg-[#1e3a8a] p-5 md:p-8 text-white relative">
            <button onClick={onClose} className="absolute top-5 right-6 md:hidden text-white/50 hover:text-white"><X size={24} /></button>
            <h3 className="font-black uppercase italic text-lg md:text-2xl tracking-tighter leading-none">Reportar <span className="text-orange-500">Pago</span></h3>
            <p className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em] mt-1 italic">Gema Student Elite</p>
          </div>

          {/* ✅ CORRECCIÓN 2: Quitamos overflow-y-auto aquí en móvil (md: solamente) */}
          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-4 md:space-y-6 flex-1 md:overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
               <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                 <Banknote size={12} className="text-orange-500" /> Monto (S/)
               </label>
               <input type="number" step="0.01" value={formData.monto} onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                 className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 text-lg font-black text-[#1e3a8a] outline-none focus:border-orange-500 transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Método</label>
                <select value={formData.metodo_pago} onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-[10px] font-black outline-none cursor-pointer focus:border-[#1e3a8a] appearance-none uppercase italic">
                  <option value="YAPE">YAPE</option>
                  <option value="PLIN">PLIN</option>
                  <option value="TRANSFERENCIA">TRANSF.</option>
                  <option value="EFECTIVO">EFECTIVO</option>
                </select>
              </div>
              {!esEfectivo ? (
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Operación</label>
                  <input type="text" placeholder="000000" value={formData.codigo_operacion} onChange={(e) => setFormData({ ...formData, codigo_operacion: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-3 py-3 text-xs font-black outline-none focus:border-[#1e3a8a]" />
                </div>
              ) : (
                <div className="bg-orange-50 rounded-xl p-1 flex flex-col items-center justify-center border border-orange-100">
                  <Coins size={18} className="text-orange-500" /><p className="text-[7px] font-black text-orange-600 uppercase italic">Sede</p>
                </div>
              )}
            </div>

            {!esEfectivo && (
               <div className="space-y-1">
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Voucher</label>
                 <input type="file" accept="image/*" className="hidden" id="voucher-input" onChange={(e) => { if (e.target.files[0]) { setVoucherFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} />
                 <label htmlFor="voucher-input" className="block bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-8 md:py-12 text-center cursor-pointer hover:bg-orange-50 transition-all group overflow-hidden">
                   {previewUrl ? <img src={previewUrl} className="h-20 md:h-28 mx-auto rounded-lg shadow-md" alt="Voucher" /> :
                     <div className="py-1"><Upload size={28} className="mx-auto text-slate-300 mb-1 group-hover:text-orange-500 transition-colors" /><p className="text-[9px] font-black text-slate-400 uppercase italic leading-none">Subir Imagen</p></div>}
                 </label>
               </div>
            )}

            <div className="pt-2 flex gap-2 pb-2">
              <button onClick={onClose} type="button" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-3 rounded-xl transition-all uppercase italic text-[9px] tracking-widest active:scale-95">Cancelar</button>
              <button disabled={loading} className="flex-[2] bg-[#1e3a8a] hover:bg-orange-600 text-white font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                <span className="uppercase italic tracking-tighter text-[10px]">{loading ? "..." : "REGISTRAR PAGO"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LADO DERECHO: QR e Info */}
        {!esEfectivo && (
          <div className="flex-1 bg-[#f8fafc] p-6 md:p-8 flex flex-col items-center justify-start md:justify-center md:overflow-y-auto custom-scrollbar border-t md:border-t-0 md:border-l border-slate-100">
            <div className="text-center space-y-4 w-full max-w-[260px] pb-10 md:pb-0">
              
              {/* QR Compacto */}
              <div className="bg-white p-2.5 rounded-[2rem] shadow-lg border-2 border-white">
                <img src="/QrYapeGema.PNG" alt="QR Gema" className="w-36 md:w-44 mx-auto h-auto rounded-[1.5rem] mb-2" />
                <div className="bg-[#1e3a8a]/5 py-1 rounded-lg"><p className="text-[8px] font-black text-[#1e3a8a] uppercase italic">Yape / Plin</p></div>
              </div>

              {/* Número */}
              <div className="bg-[#1e3a8a] p-4 rounded-2xl shadow-md">
                <p className="text-[8px] font-bold text-blue-300 uppercase mb-2 italic">Número Oficial</p>
                <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-lg">
                  <span className="flex-1 font-black text-white text-lg leading-none">902 585 995</span>
                  <button type="button" onClick={() => handleCopy(CLUB_PHONE, "cel")} className="p-2 bg-orange-500 text-white rounded-lg active:scale-90 transition-all">
                    {copiedField === "cel" ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Cuentas */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Landmark size={12} className="text-orange-500" />
                  <p className="text-[8px] font-black text-slate-500 uppercase italic">¿No Yape? Usa cuentas:</p>
                </div>
                <div className="space-y-2">
                   <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-bold text-slate-400 uppercase">BCP</span>
                        <span className="text-[10px] font-black text-[#1e3a8a] font-mono tracking-tighter">19411410110063</span>
                     </div>
                     <button onClick={() => handleCopy(BCP_CUENTA, "bcp")} className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors">
                        {copiedField === "bcp" ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                     </button>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-100">
                     <div className="flex flex-col">
                        <span className="text-[7px] font-bold text-slate-400 uppercase">CCI</span>
                        <span className="text-[10px] font-black text-[#1e3a8a] font-mono tracking-tighter">00219411141011006392</span>
                     </div>
                     <button onClick={() => handleCopy(CCI_CUENTA, "cci")} className="p-1.5 text-slate-400 hover:text-orange-500 transition-colors">
                        {copiedField === "cci" ? <CheckCircle2 size={12} className="text-green-500" /> : <Copy size={12} />}
                     </button>
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