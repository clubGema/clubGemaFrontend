import React, { useState } from "react";
import { completarEmailService } from "../services/auth.service";
import { Mail, ArrowRight, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const CompletarEmailModal = ({ isOpen, onClose, onActionSuccess }) => {
  const [nuevoEmail, setNuevoEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { logout } = useAuth();

  if (!isOpen) return null;

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const loadingToast = toast.loading("Actualizando correo...");
    setIsSubmitting(true);

    try {
      const response = await completarEmailService(nuevoEmail);
      const updatedUser = {
        user: response?.data?.user ?? response?.user ?? response,
        email: nuevoEmail,
      };

      toast.success("¡Correo vinculado con éxito!", { id: loadingToast });

      if (onActionSuccess) {
        onActionSuccess(updatedUser);
      }

      // Cerramos el modal
      onClose();
    } catch (error) {
      toast.error(error.message || "Error al actualizar", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-brand-primary-dark/95 backdrop-blur-md">
      <div className="relative max-w-md w-full bg-brand-surface rounded-3xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-8">
          <div className="bg-brand-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-brand-accent/30">
            <Mail className="text-brand-accent" size={32} />
          </div>
          <h3 className="text-2xl font-black text-brand-heading uppercase italic">
            Vincula un correo electrónico para tu cuenta
          </h3>
          <p className="text-slate-500 text-sm mt-2">
            Vincula tu correo para poder recuperar tu cuenta en caso de olvido de contraseña.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="email"
            required
            disabled={isSubmitting}
            value={nuevoEmail}
            onChange={(e) => setNuevoEmail(e.target.value)}
            placeholder="tu-correo@ejemplo.com"
            className="w-full px-4 py-3.5 bg-brand-bg border border-brand-border rounded-xl focus:ring-4 focus:ring-brand-accent/10 outline-none transition-all"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand-primary text-white font-bold py-4 rounded-xl shadow-lg border border-brand-accent/40 hover:bg-brand-primary-light transition-all flex items-center justify-center gap-2 uppercase text-sm tracking-widest disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Finalizar Registro"}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>

          {/* NUEVO BOTÓN: CERRAR SESIÓN */}
          <button
            type="button"
            onClick={logout}
            className="w-full bg-brand-surface-alt text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-widest"
          >
            <LogOut size={14} />
            No quiero ingresar correo, cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompletarEmailModal;
