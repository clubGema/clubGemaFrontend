import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Edit2, ArrowLeft, HeartPulse, Shield, Calendar, Activity, Loader2, Users, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';
import apiFetch from '../../interceptors/api.js';
import { API_ROUTES } from '../../constants/apiRoutes.js';
import EditProfileModal from '../../components/student/DataUsuario/EditProfileModal.jsx';
import ChangePasswordModal from '../../components/shared/ChangePasswordModal.jsx';
import { KeyRound } from 'lucide-react';
import { THEME_ASSETS } from "../../config/themeAssets.js";

const Profile = () => {
  const { updateUserData } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 NUEVO: contactos de emergencia del alumno
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(true);

  // 🔄 SINCRONIZACIÓN TOTAL: Trae usuarios + alumnos + direcciones
  const fetchProfile = async () => {
    try {
      const response = await apiFetch.get(API_ROUTES.ALUMNOS.MI_PERFIL);
      const result = await response.json();
      if (response.ok) setProfileData(result.data);
    } catch (error) {
      console.error("Error cargando expediente:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NUEVO: trae los contactos de emergencia registrados
  const fetchContactos = async () => {
    setLoadingContactos(true);
    try {
      const response = await apiFetch.get(API_ROUTES.ALUMNOS.CONTACTOS.BASE);
      const result = await response.json();
      if (response.ok) setContactos(result.data || []);
    } catch (error) {
      console.error("Error cargando contactos:", error);
    } finally {
      setLoadingContactos(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchContactos();
  }, []);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-brand-accent" size={40} />
    </div>
  );

  const user = profileData || {};
  const alumnosData = user.alumnos || {};
  const direccionesData = alumnosData.direcciones || {};

  const fullName = `${user.nombres || ''} ${user.apellidos || ''}`.trim() || 'Atleta Imperio 7';
  const userInitial = user.nombres?.charAt(0).toUpperCase() || 'I';

  const userBirth = user.fecha_nacimiento
    ? new Date(user.fecha_nacimiento).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })
    : 'No registrada';

  const handleProfileUpdate = (newData) => {
    fetchProfile();
    fetchContactos(); // 🔥 refresca contactos también, por si se editaron en el modal
    if (updateUserData) updateUserData(newData);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-10 animate-fade-in pb-32">
      {/* Navegación Superior */}
      <div className="flex justify-between items-center mb-6">
        <Link to="/dashboard/student" className="flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-all group">
          <div className="bg-brand-surface p-2 rounded-xl shadow-sm border border-brand-border-soft group-hover:border-brand-accent/40">
            <ArrowLeft size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest italic">Volver al Panel</span>
        </Link>
      </div>

      {/* Hero Card Premium */}
      <div className="relative mb-8 md:mb-12">
        <div className="bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-[2rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
          <img src={THEME_ASSETS.logoWatermark} className="absolute -right-10 -bottom-10 md:-right-20 md:-bottom-20 w-64 md:w-80 opacity-[0.06] rotate-12 pointer-events-none" alt="" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 relative z-10">
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-[2rem] md:rounded-[3.5rem] bg-brand-surface p-1 shadow-2xl transform rotate-3">
                <div className="w-full h-full rounded-[1.7rem] sm:rounded-[2.2rem] md:rounded-[2.8rem] bg-brand-surface-alt flex items-center justify-center text-5xl md:text-6xl font-black text-brand-primary italic">
                  {userInitial}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-brand-accent p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl border-4 border-brand-primary">
                <Shield size={18} className="sm:w-[20px] sm:h-[20px]" fill="white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="space-y-2">
                  <p className="text-brand-accent font-black uppercase tracking-[0.4em] text-[10px] italic">Expediente Oficial Imperio 7</p>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight break-words">
                    {fullName}
                  </h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-3 mt-3 sm:mt-4">
                    <Badge label={`ID: #${user.id}`} />
                    <Badge label="Atleta Elite" active />
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-2 md:mt-0">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 bg-brand-accent hover:bg-brand-surface hover:text-brand-accent text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 shadow-xl active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-transparent hover:border-brand-accent w-full"
                  >
                    <Edit2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Editar Perfil</span>
                  </button>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-3 bg-white/10 hover:bg-brand-surface text-white hover:text-brand-primary px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-white/20 hover:border-white w-full"
                  >
                    <KeyRound size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Contraseña</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Datos: Diseño Horizontal y Robusto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

        {/* Columna Izquierda: Contacto */}
        <section className="space-y-6">
          <SectionHeader icon={<Activity />} title="Datos de Contacto" />
          <InfoCard icon={<Mail />} label="Email Principal" value={user.email} color="blue" />
          <InfoCard icon={<Phone />} label="Celular / WhatsApp" value={user.telefono_personal} color="orange" />
          <InfoCard icon={<Calendar />} label="Fecha de Nacimiento" value={userBirth} color="indigo" />
        </section>

        {/* Columna Derecha: Seguridad y Salud (TARJETAS GRANDES) */}
        <section className="space-y-6">
          <SectionHeader icon={<Shield />} title="Seguridad y Salud" />
          <InfoCard
            icon={<MapPin />}
            label="Dirección Actual"
            value={direccionesData.direccion_completa}
            subText={direccionesData.distrito ? `Distrito: ${direccionesData.distrito}` : null}
            color="blue"
            isLarge
          />
          <InfoCard
            icon={<HeartPulse />}
            label="Condición Médica"
            value={alumnosData.condiciones_medicas || 'Atleta Saludable'}
            color="rose"
            isLarge
            footer={`GS: ${alumnosData.grupo_sanguineo || 'N/A'} | Seguro: ${alumnosData.seguro_medico || 'Particular'}`}
          />
        </section>
      </div>

      {/* 🔥 NUEVA SECCIÓN: Contactos de Emergencia (ancho completo, debajo del grid) */}
      <div className="mt-6 md:mt-8">
        <SectionHeader icon={<Users />} title="Contactos de Emergencia" />

        {loadingContactos ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-slate-300" size={28} />
          </div>
        ) : contactos.length === 0 ? (
          <div className="bg-brand-surface p-6 sm:p-8 rounded-[2rem] border border-dashed border-brand-border text-center">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-wide">
              Sin contactos de emergencia registrados
            </p>
            <p className="text-[10px] font-bold text-slate-300 mt-1">
              Agrégalos desde "Editar Perfil"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {contactos.map((contacto) => (
              <ContactCard key={contacto.id} contacto={contacto} />
            ))}
          </div>
        )}
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={user} // Pasamos el objeto completo para pre-llenar
        onSuccess={handleProfileUpdate}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userId={null}
      />
    </div>
  );
};

/* --- Componentes UI Atómicos --- */

const SectionHeader = ({ icon, title }) => (
  <div className="flex items-center gap-3 px-6 mb-2">
    <div className="text-brand-accent">{icon}</div>
    <h3 className="text-[11px] font-black text-brand-muted uppercase tracking-[0.3em] italic">{title}</h3>
  </div>
);

const Badge = ({ label, active }) => (
  <span className={`text-[10px] font-bold px-5 py-2 rounded-full uppercase tracking-widest ${active ? 'bg-brand-accent shadow-lg shadow-brand-accent/20' : 'bg-white/10 border border-white/20'}`}>
    {label}
  </span>
);

const InfoCard = ({ icon, label, value, color, footer, subText, isLarge }) => {
  const styles = {
    blue: "bg-brand-primary-soft text-brand-primary",
    orange: "bg-brand-accent-soft text-brand-accent-dark",
    indigo: "bg-brand-primary-soft text-brand-primary",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className={`bg-brand-surface p-5 sm:p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-brand-border-soft shadow-xl shadow-slate-200/40 group transition-all duration-300 ${isLarge ? 'border-brand-accent-soft ring-2 sm:ring-4 ring-brand-accent-soft/50' : ''}`}>
      <div className="flex items-center sm:items-start gap-4 sm:gap-6">
        <div className={`shrink-0 p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl transition-all group-hover:bg-brand-accent group-hover:text-white ${styles[color]}`}>
          {React.cloneElement(icon, { size: isLarge ? 24 : 20, className: isLarge ? 'sm:w-[28px] sm:h-[28px]' : 'sm:w-[22px] sm:h-[22px]', strokeWidth: 2.5 })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 sm:mb-1 italic">{label}</p>
          <p className={`font-black text-brand-primary tracking-tight break-words ${isLarge ? 'text-base sm:text-lg md:text-xl' : 'text-xs sm:text-sm'}`}>
            {value || 'Pendiente de registro'}
          </p>
          {subText && <p className="text-[10px] sm:text-[11px] font-bold text-brand-muted mt-1 uppercase tracking-tighter italic">{subText}</p>}
        </div>
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-brand-accent uppercase italic tracking-widest relative z-10">
          {footer}
        </div>
      )}
    </div>
  );
};

// 🔥 NUEVO: tarjeta de contacto de emergencia — misma familia visual que InfoCard,
// pero con badge "Principal" cuando corresponde y sin subText/footer genéricos.
const ContactCard = ({ contacto }) => (
  <div className={`bg-brand-surface p-5 sm:p-6 rounded-[2rem] border shadow-xl shadow-slate-200/40 group transition-all duration-300 relative ${contacto.es_principal ? 'border-brand-accent-soft ring-2 sm:ring-4 ring-brand-accent-soft/50' : 'border-brand-border-soft'}`}>
    <div className="flex items-start gap-4 sm:gap-5">
      <div className="shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all group-hover:bg-brand-accent group-hover:text-white bg-emerald-50 text-emerald-600">
        <Phone size={20} className="sm:w-[22px] sm:h-[22px]" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-black text-brand-primary tracking-tight text-sm sm:text-base break-words">
            {contacto.nombre_completo}
          </p>
          {contacto.es_principal && (
            <span className="flex items-center gap-1 bg-brand-accent text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">
              <Star size={9} fill="white" /> Principal
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] font-bold text-brand-muted uppercase tracking-widest mt-0.5 italic">
          {contacto.relacion}
        </p>
        <p className="text-xs sm:text-sm font-black text-slate-600 mt-2">
          {contacto.telefono}
        </p>
      </div>
    </div>
  </div>
);

export default Profile;