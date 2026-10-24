import React, { useEffect, useState } from 'react';
import { loginService } from '../services/auth.service';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye, EyeOff, ArrowLeft, AlertCircle, KeyRound, Mail,
  MessageCircle, HelpCircle, Send, CheckCircle2, X, ExternalLink, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { THEME_ASSETS } from "../config/themeAssets.js";
import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSentSuccess, setResetSentSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  useEffect(() => {
    const prefillUsername = location.state?.prefillUsername;
    if (prefillUsername) {
      setIdentifier(prefillUsername);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Verificando credenciales...');
    try {
      const data = await loginService(identifier, password);
      if (!data || !data.user) throw new Error("Respuesta del servidor incompleta");
      login(data);
      const { rol, nombres } = data.user;
      toast.success(`¡Bienvenido, ${nombres}!`, { id: toastId });
      const routes = {
        'Administrador': '/dashboard/admin/payment-validation',
        'Coordinador': '/dashboard/teacher',
        'Alumno': '/dashboard/student'
      };
      const targetRoute = routes[rol] || '/login';
      navigate(targetRoute);
    } catch (error) {
      const serverMessage = error?.message || "Error de conexión";
      const cleanMessage = serverMessage.replace(/\x1B\[[0-9;]*m/g, "");
      toast.error(cleanMessage, {
        id: toastId,
        style: {
          border: '1px solid #fee2e2',
          padding: '16px',
          color: '#991b1b',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '12px',
          letterSpacing: '0.1em',
          borderRadius: '16px',
          background: '#fff',
        },
        iconTheme: { primary: '#D4AF37', secondary: '#fff' },
      });
    }
  };

  const handleSendReset = async (e) => {
    e.preventDefault();
    if (!recoveryUsername.trim()) {
      return toast.error("Ingresa tu nombre de usuario");
    }
    setIsSendingReset(true);
    try {
      const response = await apiFetch.post(API_ROUTES.AUTH.FORGOT_PASSWORD, {
        username: recoveryUsername.trim(),
      });
      if (response.ok) {
        toast.success("Si el usuario existe y tiene un correo vinculado, se ha enviado un enlace.");
        setResetSentSuccess(true);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error al solicitar recuperación");
      }
    } catch (error) {
      console.error("Error en handleSendReset:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center p-2 md:p-8 font-sans relative overflow-hidden">

      {/* FONDO */}
      <div className="absolute inset-0 z-0">
        <img src={THEME_ASSETS.authBackground} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-brand-primary-dark/80 backdrop-blur-sm"></div>
      </div>

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-3 left-3 md:top-8 md:left-8 flex items-center gap-2 px-3 py-1.5 md:px-5 md:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl z-50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"
      >
        <ArrowLeft size={14} className="text-brand-accent" />
        <span className="hidden xs:inline">Volver al inicio</span>
        <span className="xs:hidden">Volver</span>
      </button>

      {/* TARJETA PRINCIPAL */}
      <div className="relative z-10 w-full max-w-4xl max-h-full md:max-h-[90vh] bg-brand-surface rounded-[1.5rem] md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10">

        {/* LADO IZQUIERDO: Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-login-grad-start via-login-grad-mid to-login-grad-end p-6 md:p-10 text-white flex flex-col justify-between relative min-h-[140px] md:min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-brand-surface rounded-full"></div>
          </div>

          <div className="z-10 flex flex-col items-center text-center mt-2 md:mt-10">
            <img
              src={THEME_ASSETS.logoPublic}
              alt="Logo Imperio 7"
              className="w-24 md:w-64 h-auto rounded-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-2 border-brand-accent/40"
            />
          </div>

          <div className="z-10 flex flex-col items-center mt-2">
            <div className="bg-black/30 border border-brand-accent/40 backdrop-blur-md px-3 py-2 md:px-6 md:py-4 rounded-xl w-full max-w-sm text-center shadow-lg">
              <div className="text-[10px] md:text-sm font-black text-login-highlight uppercase tracking-wider">Imperio 7 Club</div>
              <div className="text-[7px] md:text-[9px] text-login-slogan uppercase tracking-[0.25em] font-black hidden md:block mt-1">
                Disciplina · Grandeza · Victoria
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="w-full md:w-1/2 p-6 md:p-14 flex flex-col bg-brand-surface overflow-y-auto scrollbar-hide">
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-black text-brand-primary tracking-tighter uppercase italic">
              Bienvenido
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Usuario o correo"
              className="w-full px-4 py-3 md:py-4 bg-brand-bg border border-brand-border rounded-xl md:rounded-2xl text-brand-body focus:border-brand-accent text-sm md:text-base outline-none transition-all"
            />

            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full px-4 py-3 md:py-4 bg-brand-bg border border-brand-border rounded-xl md:rounded-2xl text-brand-body focus:border-brand-accent pr-12 text-sm md:text-base outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* AVISO VISUAL AMIGABLE DE CONTRASEÑA */}
              <div className="bg-brand-primary-soft border border-brand-primary/20 rounded-xl p-3 flex items-start gap-2.5 text-left shadow-sm">
                <AlertCircle size={16} className="text-brand-accent mt-0.5 flex-shrink-0" />
                <div className="text-[11px] text-slate-600 leading-snug font-medium">
                  <span className="font-bold text-brand-primary block mb-0.5">
                    ¿No recuerdas tu contraseña?
                  </span>
                  Revisa tu correo con tus credenciales de bienvenida. Si te inscribieron presencialmente, tu contraseña inicial es tu usuario.
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-login-btn text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg hover:bg-login-btn-hover active:scale-[0.98] transition-all text-xs md:text-sm uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setRecoveryUsername(identifier);
                  setShowForgotModal(true);
                }}
                className="text-[11px] md:text-xs font-bold text-brand-accent hover:text-brand-accent-dark transition-colors inline-flex items-center gap-1.5 py-1"
              >
                <HelpCircle size={14} />
                <span>¿Problemas para ingresar o no recuerdas tu clave?</span>
              </button>
            </div>
          </form>

          {/* SECCIÓN INFERIOR */}
          <div className="mt-6 md:mt-12 pt-6 border-t border-brand-border-soft text-center flex flex-col items-center gap-4">
            <Link to="/register" className="text-brand-accent font-black hover:text-brand-accent-dark inline-flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
              Comienza tu inscripción hoy <span>→</span>
            </Link>

            <span className="text-[8px] md:text-[9px] text-brand-muted block font-bold uppercase tracking-tight">
              Al registrarte aceptas nuestros Términos y Condiciones
            </span>
          </div>

          <p className="mt-6 md:mt-12 text-center text-[9px] md:text-[10px] text-stone-300 font-black uppercase tracking-[0.3em] pb-4">
            Imperio 7 | Desde 2023
          </p>
        </div>
      </div>

      {/* MODAL MODERNO Y AMIGABLE DE RECUPERACIÓN / SOPORTE */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-brand-primary-dark/85 backdrop-blur-md animate-fade-in">
          <div className="bg-brand-surface w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-brand-primary via-[#3A0B14] to-brand-primary-dark p-5 md:p-6 text-white relative flex justify-between items-start shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-brand-accent border border-white/15 shadow-inner shrink-0">
                  <KeyRound size={22} />
                </div>
                <div className="text-left">
                  <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tight leading-tight">
                    ¿No recuerdas tu contraseña?
                  </h4>
                  <p className="text-[10px] md:text-xs text-amber-200 font-medium tracking-wide mt-0.5">
                    Te ayudamos a recuperar tu acceso en pocos pasos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSentSuccess(false);
                }}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-5 md:p-6 space-y-3.5 overflow-y-auto custom-scrollbar bg-brand-surface">
              
              {/* Paso 1: Revisa tu correo */}
              <div className="p-4 rounded-2xl bg-brand-primary-soft border border-brand-primary/10 flex items-start gap-3.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Mail size={18} />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs md:text-sm font-black text-brand-heading uppercase tracking-wide">
                    1. Revisa tu correo electrónico
                  </h5>
                  <p className="text-xs text-brand-body leading-relaxed font-medium">
                    Al momento de registrarte en Imperio 7, te enviamos tus credenciales oficiales de acceso (usuario y contraseña). Por favor verifica tu <b>Bandeja de entrada</b> o carpeta de <b>Spam / Correo no deseado</b>.
                  </p>
                </div>
              </div>

              {/* Paso 2: Inscripción presencial */}
              <div className="p-4 rounded-2xl bg-brand-accent-soft border border-brand-accent/20 flex items-start gap-3.5 text-left">
                <div className="w-9 h-9 rounded-xl bg-brand-accent text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <ShieldCheck size={18} />
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs md:text-sm font-black text-brand-primary-dark uppercase tracking-wide">
                    2. ¿Te inscribieron presencialmente?
                  </h5>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Si tu matrícula fue realizada por administración en sede y aún no has cambiado tu contraseña, tu clave inicial es tu <b>mismo nombre de usuario</b>.
                  </p>
                </div>
              </div>

              {/* Paso 3: Enviar enlace de restablecimiento */}
              <div className="p-4 rounded-2xl bg-brand-bg border border-brand-border-soft space-y-3 text-left">
                <div className="flex items-center gap-2 text-brand-primary">
                  <Send size={15} className="text-brand-accent" />
                  <h5 className="text-xs md:text-sm font-black uppercase tracking-wide">
                    3. Solicitar enlace de restauración
                  </h5>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Ingresa tu usuario y te enviaremos un correo para que puedas crear una contraseña nueva:
                </p>

                {resetSentSuccess ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>¡Solicitud enviada! Revisa tu bandeja de entrada o spam para restablecer tu clave.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSendReset} className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Tu usuario (ej: juan.perez123)"
                      value={recoveryUsername}
                      onChange={(e) => setRecoveryUsername(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 bg-brand-surface border border-brand-border rounded-xl text-xs font-semibold outline-none focus:border-brand-accent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isSendingReset}
                      className="px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md disabled:opacity-50 shrink-0"
                    >
                      {isSendingReset ? 'Enviando...' : 'Enviar Enlace'}
                    </button>
                  </form>
                )}
              </div>

              {/* Paso 4: Soporte en caso de pérdida de correos */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-brand-primary-dark text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg border border-white/10">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-brand-accent">
                    <MessageCircle size={16} />
                    <span className="text-[11px] font-black uppercase tracking-wider">
                      ¿Perdiste acceso a tu correo?
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    Si no recuerdas tu correo o no tienes acceso a él, contáctate con nuestro equipo de soporte para ayudarte a restablecer tu cuenta.
                  </p>
                </div>
                <a
                  href="https://wa.me/51999888777?text=Hola%20Imperio%207,%20necesito%20ayuda%20para%20recuperar%20el%20acceso%20a%20mi%20cuenta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <ExternalLink size={14} />
                  <span>Contactar Soporte</span>
                </a>
              </div>

            </div>

            {/* Footer del Modal */}
            <div className="p-4 bg-brand-bg border-t border-brand-border-soft flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetSentSuccess(false);
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
              >
                Entendido, volver al Login
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
