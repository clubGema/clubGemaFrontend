import React, { useState } from 'react';
import { loginService } from '../services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toastId = toast.loading('Verificando credenciales...');

    try {
      const data = await loginService(identifier, password);

      if (!data || !data.user) {
        throw new Error("Respuesta del servidor incompleta");
      }

      login(data);

      const { rol, nombres, debeCompletarEmail } = data.user;

      toast.success(`¡Bienvenido, ${nombres}!`, { id: toastId });

      const routes = {
        'Administrador': '/dashboard/admin',
        'Coordinador': '/dashboard/teacher',
        'Alumno': '/dashboard/student'
      };

      const targetRoute = routes[rol] || '/login';

      if (debeCompletarEmail) {
        navigate(targetRoute);
      } else {
        navigate(targetRoute);
      }

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
        iconTheme: {
          primary: '#f97316',
          secondary: '#fff',
        },
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 font-sans relative overflow-x-hidden">

      {/* FONDO CON IMAGEN Y OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img
          src="/bg.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm"></div>
      </div>

      {/* BOTÓN VOLVER - Ajustado para móvil */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 md:gap-3 px-4 py-2 md:px-5 md:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl md:rounded-2xl hover:bg-white/10 hover:border-white/30 hover:scale-105 transition-all duration-300 z-50 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] shadow-2xl"
      >
        <ArrowLeft size={14} className="text-orange-500" />
        <span className="hidden xs:inline">Volver al inicio</span>
        <span className="xs:hidden">Volver</span>
      </button>

      {/* TARJETA PRINCIPAL */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row border border-white/10">

        {/* LADO IZQUIERDO: Branding - Altura adaptativa */}
        <div className="w-full md:w-1/2 bg-gradient-to-b from-blue-600 via-blue-800 to-indigo-950 p-8 md:p-10 text-white flex flex-col justify-between relative min-h-[320px] md:min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 w-40 h-40 md:w-64 md:h-64 bg-white/5 rounded-full"></div>
          </div>

          <div className="z-10 flex flex-col items-center text-center mt-6 md:mt-10">
            <div className="mb-2">
              <img
                src="/logo_diamante.jpeg"
                alt="Logo Club Gema"
                className="w-48 md:w-72 h-auto rounded-full filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
              />
            </div>
          </div>

          <div className="z-10 flex flex-col items-center mt-4">
            <div className="bg-transparent border-2 md:border-4 border-orange-500/40 backdrop-blur-md px-4 py-3 md:px-6 md:py-4 rounded-2xl w-full max-w-sm text-center">
              <div className="text-xs md:text-sm font-bold text-blue-200 mb-1">Ecosistema Deportivo Digital</div>
              <div className="text-[8px] md:text-[9px] text-blue-400 uppercase tracking-[0.2em] md:tracking-[0.3em] font-black">
                Constancia · Disciplina · Comunidad
              </div>
            </div>
          </div>
        </div>

        {/* LADO DERECHO: Formulario */}
        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8 md:mb-10 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-black text-[#1e3a8a] tracking-tighter uppercase italic">
              Bienvenido
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {/* Input Usuario */}
            <div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Usuario"
                className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400 font-medium text-sm md:text-base"
              />
            </div>

            {/* Bloque Contraseña */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full px-5 py-3.5 md:py-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl text-slate-700 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-400 pr-14 font-medium text-sm md:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1e3a8a] transition-colors p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 flex items-start gap-2 px-1">
                <AlertCircle size={12} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="text-[10px] text-slate-400 leading-tight italic font-medium">
                  Ingresa la contraseña de tu registro web.
                  <span className="block text-slate-500 not-italic mt-1">
                    Nota: Si no te registraste por la web, tu contraseña es tu mismo usuario.
                  </span>
                </div>
              </div>
            </div>

            {/* Botón Principal */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 text-xs md:text-sm uppercase tracking-widest"
            >
              Iniciar Sesión
            </button>

            <div className="text-center">
              <Link
                to="/forgot-password"
                className="text-[11px] md:text-xs font-bold text-slate-400 hover:text-orange-500 transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>

          {/* Sección Inferior */}
          <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-100 text-center flex flex-col items-center gap-4">
            <Link
              to="/register"
              className="group text-orange-500 font-black hover:text-orange-600 transition-all inline-flex items-center gap-2 text-[11px] md:text-xs uppercase tracking-widest"
            >
              Comienza tu inscripción hoy
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <span className="text-[9px] md:text-[10px] text-slate-400 block font-bold uppercase tracking-tight">
              Al registrarte aceptas nuestros Términos y Condiciones
            </span>
          </div>

          <p className="mt-8 md:mt-12 text-center text-[9px] md:text-[10px] text-slate-300 font-black uppercase tracking-[0.3em]">
            Club Gema | Desde 2023
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;