import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronRight, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { addDays, isPast, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

import { apiFetch } from '../../interceptors/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import alumnoService from '../../services/alumno.service';

// COMPONENTES MODULARIZADOS
import ChangeLevelStudent from '../../components/Admin/StudenManager/ChangeLevelStudent.jsx';
import StudentDetails from '../../components/Admin/StudenManager/StudentDetails.jsx';
import InscriptionsModal from '../../components/Admin/StudenManager/InscriptionsModal.jsx';
import StudentTable from '../../components/Admin/StudenManager/StudentTable.jsx';
import AdminStudents from './AdminStudents.jsx';
import StudentAttendanceHistory from '../../components/Admin/StudenManager/StudentAttendanceHistory.jsx';

const AdminStudentsManager = () => {
    const [view, setView] = useState('list'); // 'list' | 'details' | 'cambio_nivel'
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sedes, setSedes] = useState([]);
    const [selectedSede, setSelectedSede] = useState('');
    const [modalInscripciones, setModalInscripciones] = useState({ isOpen: false, data: null });
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;

    // --- CARGA Y PROCESAMIENTO DE DATOS ---
    const fetchAlumnos = async () => {
        try {
            setLoading(true);
            const url = selectedSede ? `${API_ROUTES.USUARIOS.ALUMNOS}?sede_id=${selectedSede}` : API_ROUTES.USUARIOS.ALUMNOS;
            const response = await apiFetch.get(url);
            const result = await response.json();

            if (response.ok) {
                const formattedData = result.data.map(user => {
                    const alumnoData = user.alumnos || {};
                    const contacto = alumnoData.alumnos_contactos?.[0] || {};
                    const inscripciones = alumnoData.inscripciones || [];
                    const dir = alumnoData.direcciones || {};

                    // 🔥 CÁLCULO DE DEUDA: Sumamos todas las cuentas por cobrar pendientes
                    const deudasPendientes = alumnoData.cuentas_por_cobrar || [];
                    const totalDeuda = deudasPendientes.reduce((acc, deuda) => acc + Number(deuda.monto_final || 0), 0);

                    // LÓGICA DE INSCRIPCIONES Y ESTADOS
                    const inscripcionesActivas = inscripciones.filter(i => i.estado === 'ACTIVO');
                    let inscripcionesAMostrar = [];
                    let estadoVisual = 'SIN INSCRIPCIÓN';

                    if (inscripcionesActivas.length > 0) {
                        inscripcionesAMostrar = inscripcionesActivas;
                        estadoVisual = 'ACTIVO';
                    } else if (inscripciones.length > 0) {
                        inscripcionesAMostrar = [inscripciones[0]];
                        estadoVisual = inscripciones[0].estado;
                    }

                    const sedesNombres = [...new Set(inscripcionesAMostrar.map(i => i.horarios_clases?.canchas?.sedes?.nombre).filter(Boolean))];
                    const nivelesNombres = [...new Set(inscripcionesAMostrar.map(i => i.horarios_clases?.niveles_entrenamiento?.nombre).filter(Boolean))];

                    const ultimaInsc = inscripcionesAMostrar[0];
                    const fCorte = ultimaInsc?.fecha_inscripcion ? addDays(new Date(ultimaInsc.fecha_inscripcion), 30) : null;

                    const historialInscripciones = inscripcionesAMostrar.map(insc => {
                        const fCorteCalculada = insc.fecha_inscripcion ? addDays(new Date(insc.fecha_inscripcion), 30) : null;
                        const hc = insc.horarios_clases || {};

                        const formatTime = (timeStr) => {
                            if (!timeStr) return '';
                            if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
                            return timeStr.substring(0, 5);
                        };

                        const mapaDias = { 0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' };
                        const nombreDia = hc.dia_semana !== undefined ? mapaDias[hc.dia_semana] : '';
                        const horaTexto = hc.hora_inicio && hc.hora_fin ? `${formatTime(hc.hora_inicio)} - ${formatTime(hc.hora_fin)}` : '';
                        const horarioCompleto = `${nombreDia} ${horaTexto}`.trim();

                        return {
                            estado: insc.estado,
                            sede: hc.canchas?.sedes?.nombre || 'S/D',
                            nivel: hc.niveles_entrenamiento?.nombre || 'SIN NIVEL',
                            horario: horarioCompleto,
                            fechaInscripcion: insc.fecha_inscripcion,
                            fechaCorte: fCorteCalculada,
                            estaVencido: fCorteCalculada ? isPast(fCorteCalculada) : false,
                        };
                    });

                    // RETORNO DEL OBJETO FORMATEADO PARA LA TABLA
                    return {
                        ...user,
                        full_name: `${user.nombres} ${user.apellidos}`,
                        dni: user.numero_documento || '---',
                        telefono: user.telefono_personal || 'S/N',
                        cumpleanos: user.fecha_nacimiento ? format(parseISO(user.fecha_nacimiento.slice(0, 10)), "dd 'de' MMM", { locale: es }) : 'S/D',

                        sedes: sedesNombres,
                        niveles: nivelesNombres,
                        fechaCorte: fCorte,
                        estaVencido: fCorte ? isPast(fCorte) : false,
                        estadoVisual: estadoVisual,
                        multiplesActivas: inscripcionesActivas.length > 1,
                        historialInscripciones: historialInscripciones,

                        // 🔥 Dato clave inyectado para la columna de Monto
                        monto_pendiente: totalDeuda,

                        direccion: {
                            completa: dir.direccion_completa || 'No registrada',
                            distrito: dir.distrito || 'S/D',
                            referencia: dir.referencia || ''
                        },
                        salud: {
                            condiciones: alumnoData.condiciones_medicas || 'Ninguna',
                            seguro: alumnoData.seguro_medico || 'S/N',
                            sangre: alumnoData.grupo_sanguineo || 'S/N',
                            historial: alumnoData.historial
                        },
                        contactoEmergencia: {
                            nombre: contacto.nombre_completo || 'No registrado',
                            telefono: contacto.telefono || 'S/N',
                            relacion: contacto.relacion || 'No especificada'
                        }
                    };
                });

                setAlumnos(formattedData);
            }
        } catch (error) {
            toast.error("Error al sincronizar Base Gema");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusHistory = async (estado) => {
        try {
            const result = await alumnoService.changeStatusHistory({ alumnoId: selectedAlumno.id, estado });
            toast.success(result.message);
            setSelectedAlumno((prev) => ({ ...prev, salud: { ...prev.salud, historial: estado } }));
            fetchAlumnos();
        } catch (e) {
            toast.error(e.message || 'Error al actualizar el historial');
        }
    };

    // --- EFECTOS ---
    useEffect(() => { fetchAlumnos(); }, [selectedSede]);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedSede]);
    useEffect(() => {
        const loadSedes = async () => {
            const res = await apiFetch.get(API_ROUTES.SEDES.ACTIVOS);
            const result = await res.json();
            if (res.ok) setSedes(result.data || []);
        };
        loadSedes();
    }, []);

    // --- FILTROS Y PAGINACIÓN ---
    const filteredAlumnos = alumnos.filter(alum =>
        alum.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alum.dni.includes(searchTerm)
    );
    const currentAlumnos = filteredAlumnos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    // --- RENDERIZADOS ---
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-[#1e3a8a]" size={48} />
            <p className="font-black text-[#1e3a8a] text-xs uppercase italic tracking-widest animate-pulse">Consultando Registros...</p>
        </div>
    );

    if (view === 'details' && selectedAlumno) {
        return <StudentDetails
            selectedAlumno={selectedAlumno}
            onBack={() => setView('list')}
            onStatusHistoryChange={handleStatusHistory}
        />;
    }

    if (view === 'cambio_nivel' && selectedAlumno) {
        return <ChangeLevelStudent alumno={selectedAlumno} onBack={() => { setView('list'); fetchAlumnos(); }} />;
    }

    if (view === 'create') {
        return <AdminStudents
            onBack={() => setView('list')}
            onFinish={(nuevoAlumno) => {
                setSelectedAlumno(nuevoAlumno);
                setView('details');
            }}
        />
    }

    if (view === 'attendanceHistory' && selectedAlumno) {
        return (
            <StudentAttendanceHistory
                alumno={selectedAlumno}
                onBack={() => setView('list')}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header y Filtros */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Gestión de <span className="text-[#1e3a8a]">Alumnos</span></h1>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Control Maestro de la Academia</p>
                </div>
                <button onClick={() => setView('create')} className="bg-[#1e3a8a] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-orange-500 shadow-lg">
                    <Plus size={20} /> Registrar Alumno
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="BUSCAR POR NOMBRE, APELLIDO O DNI..."
                        className="w-full bg-white border-2 border-slate-100 rounded-[1.8rem] pl-16 pr-8 py-5 font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-[#1e3a8a] transition-all shadow-sm"
                    />
                </div>
                <select value={selectedSede} onChange={(e) => setSelectedSede(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-blue-500">
                    <option value="">TODAS LAS SEDES</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>SEDE {s.nombre}</option>)}
                </select>
            </div>

            {/* TABLA PRINCIPAL MODULARIZADA */}
            <StudentTable
                currentAlumnos={currentAlumnos}
                onViewDetails={(alum) => { setSelectedAlumno(alum); setView('details'); }}
                onAttendanceHistory={(alum) => { setSelectedAlumno(alum); setView('attendanceHistory'); }}
                onOpenInscriptions={(alum) => setModalInscripciones({ isOpen: true, data: alum })}
                onChangeLevel={(alum) => { setSelectedAlumno(alum); setView('cambio_nivel'); }}
            />

            {/* Paginación */}
            <div className="bg-slate-50/50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Mostrando <span className="text-[#1e3a8a]">{currentAlumnos.length}</span> de <span className="text-slate-600">{filteredAlumnos.length}</span> alumnos
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => {
                            if (totalPages > 5 && Math.abs(i + 1 - currentPage) > 1 && i !== 0 && i !== totalPages - 1) {
                                if (Math.abs(i + 1 - currentPage) === 2) return <span key={i} className="text-slate-300 px-1">...</span>;
                                return null;
                            }
                            return (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1e3a8a] hover:text-white transition-all shadow-sm"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* MODAL DE INSCRIPCIONES MODULARIZADO */}
            <InscriptionsModal
                isOpen={modalInscripciones.isOpen}
                data={modalInscripciones.data}
                onClose={() => setModalInscripciones({ isOpen: false, data: null })}
            />
        </div>
    );
};

export default AdminStudentsManager;