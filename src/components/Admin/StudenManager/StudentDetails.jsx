import React, { useState } from 'react';
import { ArrowLeft, Fingerprint, Phone, Mail, Calendar, User, MapPin, Stethoscope, ShieldAlert, Users, KeyRound } from 'lucide-react';
import ChangePasswordModal from '../../../components/shared/ChangePasswordModal'; // Ajusta la ruta si es necesario

const StudentDetails = ({ selectedAlumno, onBack, onStatusHistoryChange }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    if (!selectedAlumno) return null;

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-black uppercase italic text-slate-800 leading-none">Expediente <span className="text-[#1e3a8a]">Gema</span></h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ficha completa del Alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Perfil Principal */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
                        <div className="w-28 h-28 bg-[#1e3a8a] text-white rounded-3xl flex items-center justify-center font-black text-5xl italic shadow-2xl relative z-10 shrink-0">
                            {selectedAlumno.nombres.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-6 relative z-10 w-full">
                            <div className='flex items-center gap-4'>
                                <div className='flex-1'>
                                    <h3 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{selectedAlumno.full_name}</h3>
                                    <div className="flex gap-2 mt-2">
                                        {selectedAlumno.sedes.map((s, i) => (
                                            <span key={i} className="px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-[9px] font-black uppercase italic border border-orange-200">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => setIsPasswordModalOpen(true)} className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-black text-white px-6 md:px-8 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 active:scale-95 font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-slate-800 hover:border-white">
                                    <KeyRound size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    <span>Contraseña</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Fingerprint size={16} className="text-blue-500" /> {selectedAlumno.dni}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold lowercase">
                                    <Mail size={16} className="text-blue-500" /> {selectedAlumno.email}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Calendar size={16} className="text-blue-500" /> {selectedAlumno.cumpleanos}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-tighter">
                                    <Phone size={16} className="text-blue-500" /> {selectedAlumno.telefono}
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold tracking-tighter">
                                    <User size={16} className="text-blue-500" /> {selectedAlumno.username || 'Sin nombre de usuario'}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Dirección Registrada</p>
                                <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm font-black text-slate-700 uppercase italic leading-tight">
                                            {selectedAlumno.direccion.distrito} <span className="text-slate-300 font-normal mx-2">|</span> {selectedAlumno.direccion.completa}
                                        </p>
                                        {selectedAlumno.direccion.referencia && (
                                            <p className="text-[10px] text-slate-400 mt-1 font-bold italic tracking-wide">Ref: {selectedAlumno.direccion.referencia}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información Médica */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#1e3a8a]">
                                <Stethoscope size={20} />
                                <span className="text-[11px] font-black uppercase tracking-widest italic">Información de Salud</span>
                            </div>
                            <span className="bg-[#1e3a8a] text-white text-[8px] font-black px-2 py-1 rounded-md">GRUPO SANGUÍNEO: {selectedAlumno.salud.sangre}</span>
                        </div>
                        <div className="p-8 grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase mb-2 italic">Alergias / Condiciones:</p>
                                    <p className="text-sm font-bold text-slate-700 italic leading-relaxed">{selectedAlumno.salud.condiciones}</p>
                                </div>
                                <div className="flex justify-between p-5 bg-white border border-slate-100 rounded-3xl">
                                    <span className="text-[9px] font-black text-slate-400 uppercase">Seguro Médico:</span>
                                    <span className="text-sm font-black text-[#1e3a8a] italic uppercase">{selectedAlumno.salud.seguro}</span>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <User size={14} />
                                    <p className="text-[9px] font-black uppercase italic">Historial Deportivo:</p>
                                </div>
                                <select
                                    value={selectedAlumno.salud?.historial ?? 'Nuevo'}
                                    onChange={(e) => onStatusHistoryChange(e.target.value)}
                                    className="w-full text-[11px] font-medium text-slate-500 italic leading-relaxed bg-transparent border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                >
                                    <option value="Antiguo">Antiguo</option>
                                    <option value="Nuevo">Nuevo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contacto de Emergencia */}
                <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8 relative overflow-hidden h-fit">
                    <div className="absolute -right-4 -bottom-4 text-red-100 opacity-50">
                        <ShieldAlert size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-3 text-red-600">
                            <Users size={24} />
                            <span className="text-xs font-black uppercase tracking-widest italic">Contacto Emergencia</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-black text-red-400 uppercase mb-1">Responsable</p>
                                <p className="text-lg font-black text-red-900 leading-tight uppercase italic">{selectedAlumno.contactoEmergencia.nombre}</p>
                                <p className="text-[10px] font-bold text-red-600 uppercase italic mt-1">{selectedAlumno.contactoEmergencia.relacion}</p>
                            </div>
                            <div className="pt-4 border-t border-red-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-red-400 uppercase mb-1">Teléfono Directo</p>
                                    <p className="text-xl font-black text-red-900 tracking-tighter">{selectedAlumno.contactoEmergencia.telefono}</p>
                                </div>
                                <a href={`tel:${selectedAlumno.contactoEmergencia.telefono}`} className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95">
                                    <Phone size={20} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                userId={selectedAlumno.id}
            />
        </div>
    );
};

export default StudentDetails;