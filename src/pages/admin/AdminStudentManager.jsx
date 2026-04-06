import React, { useState, useEffect } from 'react';
import { Search, Phone, ShieldAlert, ChevronRight, ArrowLeft, Heart, Mail, Calendar, User, Fingerprint, Activity, Info, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import ChangeLevelStudent from '../../components/Admin/changeLevelStudent';

const AdminStudentsManager = () => {
    const [view, setView] = useState('list');
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sedes, setSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Cargar alumnos desde el Backend
    const fetchAlumnos = async () => {
        try {
            setLoading(true);
            const url = selectedSede
                ? `${API_ROUTES.USUARIOS.ALUMNOS}?sede_id=${selectedSede}`
                : API_ROUTES.USUARIOS.ALUMNOS;
            const response = await apiFetch.get(url);
            const result = await response.json();

            if (response.ok) {
                const formattedData = result.data.map(user => {
                    // 🛡️ Extraemos con seguridad el objeto alumnos
                    const alumnoData = user.alumnos || {};
                    const contactos = alumnoData.alumnos_contactos || [];

                    return {
                        id: user.id,
                        nombres: user.nombres || "Sin Nombre",
                        apellidos: user.apellidos || "Sin Apellido",
                        email: user.email,
                        tipo_documento_id: user.tipo_documento_id || 'DNI',
                        numero_documento: user.numero_documento || "---",
                        telefono_personal: user.telefono_personal || 'No registrado',
                        fecha_nacimiento: user.fecha_nacimiento ? new Date(user.fecha_nacimiento).toLocaleDateString() : '---',
                        genero: user.genero,
                        // 🛡️ Acceso seguro a contactos de emergencia
                        contacto_emergencia: contactos[0]?.telefono ?? 'S/N',
                        parentesco: contactos[0]?.relacion ?? 'S/N',
                        datosRolEspecifico: {
                            condiciones_medicas: alumnoData.condiciones_medicas || 'Ninguna conocida',
                            seguro_medico: alumnoData.seguro_medico || 'No especificado',
                            grupo_sanguineo: alumnoData.grupo_sanguineo || 'S/N'
                        }
                    };
                });
                setAlumnos(formattedData);
            }
        } catch (error) {
            toast.error("Error al conectar con el servidor");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSedes = async () => {
        try {
            const response = await apiFetch.get(API_ROUTES.SEDES.ACTIVOS);
            const result = await response.json();
            if (response.ok) {
                setSedes(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching sedes:", error);
        }
    };

    useEffect(() => {
        fetchAlumnos();
    }, [selectedSede]);

    useEffect(() => {
        fetchSedes();
    }, []);

    // 2. Filtrado en tiempo real
    const filteredAlumnos = alumnos.filter(alum =>
        alum.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.numero_documento?.includes(searchTerm)
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlumnos = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    const handleViewDetails = (alumno) => {
        setSelectedAlumno(alumno);
        setView('details');
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={40} />
            <p className="font-bold italic animate-pulse">Sincronizando expedientes...</p>
        </div>
    );

    if (view === 'details' && selectedAlumno) {
        return (
            <div className="space-y-6 animate-fade-in-up p-1">
                {/* Header Expediente */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setView('list')}
                        className="group flex items-center justify-center w-10 h-10 bg-white border border-slate-200 rounded-xl hover:border-[#1e3a8a] transition-all shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <div className="h-5 w-1 bg-orange-500 rounded-full"></div>
                            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                Expediente <span className="text-[#1e3a8a]">Académico</span>
                            </h1>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide ml-3">
                            Perfil completo del <span className="text-orange-500">Deportista</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                                    <div className="w-20 h-20 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white rounded-3xl flex items-center justify-center font-black text-3xl uppercase italic shadow-lg shadow-blue-900/20">
                                        {selectedAlumno.nombres.charAt(0)}{selectedAlumno.apellidos.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter">
                                                {selectedAlumno.nombres} {selectedAlumno.apellidos}
                                            </h2>
                                            <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200">Activo</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Fingerprint size={16} className="text-blue-500" />
                                                <span className="text-xs font-bold uppercase">{selectedAlumno.tipo_documento_id}: {selectedAlumno.numero_documento}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar size={16} className="text-blue-500" />
                                                <span className="text-xs font-bold uppercase">Nacimiento: {selectedAlumno.fecha_nacimiento}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Género</span>
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <User size={14} className="text-slate-400" />
                                            <span>{selectedAlumno.genero === 'M' ? 'Masculino' : 'Femenino'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="text-sm lowercase truncate max-w-[150px]">{selectedAlumno.email}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Teléfono</span>
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <Phone size={14} className="text-slate-400" />
                                            <span>{selectedAlumno.telefono_personal}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Contacto de Emergencia</span>
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <Phone size={14} className="text-slate-400" />
                                            <span>{selectedAlumno.contacto_emergencia}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Parentesco</span>
                                        <div className="flex items-center gap-2 font-bold text-slate-700">
                                            <User size={14} className="text-slate-400" />
                                            <span className='uppercase'>{selectedAlumno.parentesco}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-red-50/50 border-b border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-red-600">
                                    <Heart size={20} fill="currentColor" className="opacity-80" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Protocolo de Salud Deportiva</span>
                                </div>
                                <Activity size={18} className="text-red-300" />
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <ShieldAlert size={16} className="text-red-500" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Condiciones / Alergias:</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                                        {selectedAlumno.datosRolEspecifico.condiciones_medicas}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Seguro Médico</span>
                                            <span className="text-sm font-black text-[#1e3a8a] uppercase italic">{selectedAlumno.datosRolEspecifico.seguro_medico}</span>
                                        </div>
                                        <Info size={16} className="text-slate-300" />
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase">Tipo de Sangre</span>
                                            <span className="text-sm font-black text-red-600">{selectedAlumno.datosRolEspecifico.grupo_sanguineo}</span>
                                        </div>
                                        <Heart size={16} className="text-red-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-[#0f172a] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                            <h4 className="font-black uppercase italic tracking-tighter text-lg mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div>
                                Resumen de Rol
                            </h4>
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Rol del Sistema</span>
                                    <p className="text-sm font-bold uppercase italic text-white/90">Deportista Académico</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'cambio_nivel' && selectedAlumno) {
        return (
            <ChangeLevelStudent
                alumno={selectedAlumno}
                sedeId={selectedSede}
                onBack={() => setView('list')}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-orange-500 rounded-full"></div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                            Base de <span className="text-[#1e3a8a]">Alumnos</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Consulta y supervisa la información de los deportistas.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative group flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e3a8a]" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="BUSCAR POR NOMBRE O DOCUMENTO..."
                        className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                </div>
                <div className="relative min-w-[250px]">
                    <select
                        value={selectedSede}
                        onChange={(e) => setSelectedSede(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="">TODAS LAS SEDES</option>
                        {sedes.map((sede) => (
                            <option key={sede.id} value={sede.id}>
                                SEDE {sede.nombre}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight size={16} className="rotate-90" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Alumno</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Teléfono</th>
                                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {currentAlumnos.length > 0 ? currentAlumnos.map((alum) => (
                                <tr key={alum.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-100 text-[#1e3a8a] rounded-lg flex items-center justify-center font-black text-xs uppercase italic group-hover:bg-[#1e3a8a] group-hover:text-white transition-all">
                                                {alum.nombres.charAt(0)}
                                            </div>
                                            <span className="text-sm font-black text-slate-700 uppercase italic tracking-tighter">{alum.nombres} {alum.apellidos}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs font-bold text-slate-500">{alum.numero_documento}</td>
                                    <td className="p-4 text-xs font-bold text-slate-500">{alum.telefono_personal}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleViewDetails(alum)}
                                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            Ver Perfil
                                            <ChevronRight size={14} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedAlumno(alum);
                                                setView('cambio_nivel');
                                            }}
                                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-orange-500 hover:text-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            Cambiar Nivel
                                            <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic">
                                        No se encontraron alumnos con esos criterios.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 mt-4 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                        Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredAlumnos.length)} de {filteredAlumnos.length}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all bg-slate-100 text-slate-600 hover:bg-[#1e3a8a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all bg-slate-100 text-slate-600 hover:bg-[#1e3a8a] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudentsManager;