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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 md:p-4 bg-[#0f172a]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white w-full ${esEfectivo ? 'max-w-md' : 'max-w-4xl'} max-h-[95vh] overflow-y-auto rounded-[2.5rem] md:rounded-[4rem] shadow-2xl transition-all duration-500 ease-in-out flex flex-col md:flex-row border border-white/20 custom-scrollbar`}>

        {/* LADO IZQUIERDO: Formulario (Compacto y Ajustable) */}
        <div className="flex-[1.2] flex flex-col min-w-full md:min-w-[350px]">
          <div className="bg-[#1e3a8a] p-6 md:p-8 text-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 md:hidden text-white/50 hover:text-white">
              <X size={24} />
            </button>
            <div className="relative z-10">
              <h3 className="font-black uppercase italic text-xl md:text-2xl tracking-tighter leading-none">Reportar <span className="text-orange-500">Pago</span></h3>
              <p className="text-[9px] font-black opacity-50 uppercase tracking-[0.2em] mt-1 italic">Gema Student Elite</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 flex-1 bg-white">
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
                <div className="space-y-1.5 animate-in slide-in-from-right-2 duration-300">
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

            {!esEfectivo ? (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Comprobante</label>
                <input type="file" accept="image/*" className="hidden" id="voucher-input" onChange={(e) => { if (e.target.files[0]) { setVoucherFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} />
                <label htmlFor="voucher-input" className="block bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] py-24 text-center cursor-pointer hover:bg-orange-50 transition-all group overflow-hidden">
                  {previewUrl ? <img src={previewUrl} className="h-28 mx-auto rounded-xl shadow-lg" alt="Voucher" /> :
                    <div className="py-1"><Upload size={32} className="mx-auto text-slate-300 mb-2 group-hover:text-orange-500 transition-colors" /><p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-none">Subir Imagen</p></div>}
                </label>
              </div>
            ) : (
              <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 flex gap-4 items-center">
                <div className="bg-blue-500 p-3 rounded-xl text-white shadow-lg shadow-blue-200"><Info size={24} /></div>
                <p className="text-[10px] font-black text-blue-700 leading-tight uppercase italic">Acércate a la oficina principal para validar tu pago.</p>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button onClick={onClose} type="button" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-500 font-black py-4 rounded-2xl transition-all uppercase italic text-[10px] tracking-widest active:scale-95">
                Cancelar
              </button>
              <button disabled={loading} className="flex-[2] bg-[#1e3a8a] hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                <span className="uppercase italic tracking-tighter text-xs leading-none">{loading ? "..." : "CONFIRMAR REGISTRO"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* LADO DERECHO: QR (Responsivo para Celular) */}
        {!esEfectivo && (
          <div className="flex-1 bg-[#f8fafc] p-8 flex flex-col items-center justify-center relative animate-in slide-in-from-bottom md:slide-in-from-right duration-700 border-t md:border-t-0 md:border-l border-slate-100 pb-12 md:pb-8">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-[#1e3a8a] hidden md:block"><QrCode size={250} /></div>

            <div className="text-center space-y-6 md:space-y-8 w-full max-w-[280px] relative z-10">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-md border border-slate-100">
                  <Smartphone size={14} className="text-orange-500" />
                  <span className="text-[9px] font-black text-[#1e3a8a] uppercase tracking-widest italic">Recaudación Segura</span>
                </div>
                <h4 className="text-2xl md:text-3xl font-black text-[#1e3a8a] uppercase italic tracking-tighter leading-none">Paga con <span className="text-orange-500">QR</span></h4>
              </div>

              {/* QR Compacto */}
              <div className="bg-white p-4 rounded-[3rem] shadow-xl border-4 border-white group relative">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GEMA_STUDENT_PAOLO_15" alt="QR Gema" className="w-full h-auto rounded-[2.5rem] mb-4 shadow-inner" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pb-1 italic opacity-70 leading-none">Escanea Yape / Plin</p>
              </div>

              {/* Botón de Copiado */}
              <div className="bg-[#1e3a8a] p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border border-white/10">
                <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mb-3 italic leading-none">Titular: Club Gema S.A.C.</p>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10">
                  <span className="flex-1 font-black text-white tracking-tighter text-xl ml-3 leading-none">{CLUB_PHONE}</span>
                  <button type="button" onClick={handleCopy}
                    className={`p-3.5 rounded-xl transition-all duration-500 shadow-xl ${copied ? 'bg-green-500 scale-110' : 'bg-orange-500 hover:bg-white hover:text-orange-500 text-white'}`}>
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                <p className="text-[8px] font-black text-white/30 mt-4 uppercase tracking-[0.4em] leading-none">Toca para copiar número</p>
              </div>
              {/* NUEVO: Caja de Cuentas BCP */}
              <div className="bg-white p-5 rounded-[2rem] shadow-lg border border-slate-200 relative overflow-hidden text-left">
                {/* Acento visual izquierdo */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>

                <div className="flex items-center gap-2 mb-3 pl-2">
                  <Landmark size={14} className="text-[#1e3a8a]" />
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic mt-0.5">
                    ¿No puedes Plinear / Yapear? <br></br> Te brindamos nuestras cuentas:
                  </p>
                </div>

                <div className="space-y-3 pl-2">
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CCI (BCP)</p>
                    <p className="text-sm font-black text-[#1e3a8a] tracking-wider font-mono">19411410110063</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CCI (Interbancaria)</p>
                    <p className="text-sm font-black text-[#1e3a8a] tracking-wider font-mono">00219411141011006392</p>
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