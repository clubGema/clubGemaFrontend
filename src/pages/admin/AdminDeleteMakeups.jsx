import React, { useState, useEffect, useMemo } from 'react';
import {
    Trash2, User, Calendar, AlertTriangle,
    Filter, History, MapPin, ChevronDown, Stethoscope, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, addMinutes } from 'date-fns';
import ConfirmModal from '../../components/shared/ConfirmModal';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import recuperacionService from '../../services/recuperacion.service';
import { STATUS_SUCCESS } from '../../config/statusColors';

const AdminDeleteMakeups = () => {
    const [recuperaciones, setRecuperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSections, setOpenSections] = useState({}); // Para Sedes
    const [openAlumnos, setOpenAlumnos] = useState({});   // Para Alumnos
    const [deleteTarget, setDeleteTarget] = useState(null); // { id, nombre }

    useEffect(() => { fetchRecuperaciones(); }, []);

    const fetchRecuperaciones = async () => {
        try {
            setLoading(true);
            setRecuperaciones(await recuperacionService.listarDepuracion());
        } catch (error) {
            toast.error(error.message || "Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    const formatLocalDate = (dateString) => {
        if (!dateString) return '---';
        const date = new Date(dateString);
        const adjustedDate = addMinutes(date, date.getTimezoneOffset());
        return format(adjustedDate, 'dd/MM/yyyy');
    };

    const handleDelete = (id, nombre) => {
        setDeleteTarget({ id, nombre });
    };

    const executeDelete = async () => {
        const { id } = deleteTarget;
        setDeleteTarget(null);
        try {
            await recuperacionService.eliminar(id);
            toast.success("Eliminado");
            setRecuperaciones(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error(error.message || "Error al eliminar");
        }
    };

    const toggleSection = (sede) => {
        setOpenSections(prev => ({ ...prev, [sede]: !prev[sede] }));
    };

    const toggleAlumno = (alumnoId) => {
        setOpenAlumnos(prev => ({ ...prev, [alumnoId]: !prev[alumnoId] }));
    };

    const groupedData = useMemo(() => {
        const filtered = recuperaciones.filter(item => {
            const fullInfo = `${item.alumnos?.usuarios?.nombres} ${item.alumnos?.usuarios?.apellidos}`.toLowerCase();
            return fullInfo.includes(searchTerm.toLowerCase());
        });

        return filtered.reduce((acc, current) => {
            const sedeNombre = current.horarios_clases?.canchas?.sedes?.nombre || "RECUPERACIONES NO PROGRAMADAS";
            if (!acc[sedeNombre]) acc[sedeNombre] = {};
            
            const alumnoId = current.alumno_id;
            if (!acc[sedeNombre][alumnoId]) {
                acc[sedeNombre][alumnoId] = {
                    nombre: `${current.alumnos?.usuarios?.nombres} ${current.alumnos?.usuarios?.apellidos}`,
                    tickets: []
                };
            }
            acc[sedeNombre][alumnoId].tickets.push(current);
            return acc;
        }, {});
    }, [recuperaciones, searchTerm]);

    if (loading) return (
        <LoadingSpinner className="flex h-96 items-center justify-center" colorClassName="text-brand-primary" />
    );

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-4 pb-20">
            {/* Header */}
            <div className="bg-brand-primary-dark rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4 border-b-4 border-brand-accent">
                <div className="flex items-center gap-4">
                    <div className="bg-brand-accent p-3 rounded-2xl text-white shadow-lg">
                        <History size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">Depuración Maestra</h1>
                        <p className="text-[9px] text-brand-muted font-bold uppercase tracking-widest mt-1">Imperio 7 Club • Control de Registros</p>
                    </div>
                </div>
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar alumno..."
                    wrapperClassName="relative w-full md:w-80"
                    iconClassName="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    iconSize={16}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                />
            </div>

            {/* Listado */}
            <div className="space-y-3">
                {Object.entries(groupedData).map(([sede, alumnosGroup]) => (
                    <div key={sede} className="bg-brand-surface rounded-3xl border border-brand-border-soft overflow-hidden shadow-sm">
                        <button 
                            onClick={() => toggleSection(sede)}
                            className="w-full flex items-center justify-between p-4 hover:bg-brand-bg transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MapPin size={18} className={sede.includes("NO PROGRAMADAS") ? 'text-red-400' : 'text-brand-accent'} />
                                <h2 className="text-sm font-black text-brand-body uppercase italic">{sede}</h2>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-surface-alt text-slate-500 rounded-lg">
                                    {Object.keys(alumnosGroup).length} alumnos
                                </span>
                            </div>
                            <ChevronDown className={`text-slate-300 transition-transform ${openSections[sede] ? 'rotate-180' : ''}`} size={20} />
                        </button>

                        {openSections[sede] && (
                            <div className="p-2 bg-brand-bg/30 space-y-1 border-t border-slate-50">
                                {Object.entries(alumnosGroup).map(([alumnoId, data]) => (
                                    <div key={alumnoId} className="bg-brand-surface rounded-2xl border border-brand-border-soft overflow-hidden shadow-sm">
                                        {/* Botón Desplegable del Alumno */}
                                        <button 
                                            onClick={() => toggleAlumno(alumnoId)}
                                            className="w-full flex items-center justify-between p-3 hover:bg-brand-bg transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-lg ${openAlumnos[alumnoId] ? 'bg-brand-primary-soft text-brand-primary' : 'bg-brand-bg text-brand-muted'}`}>
                                                    <User size={14} />
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-[11px] font-black text-brand-body uppercase tracking-tight">
                                                        {data.nombre}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">ID: {alumnoId}</span>
                                                </div>
                                                <span className="text-[9px] font-black px-1.5 py-0.5 bg-brand-primary-soft text-brand-primary rounded-md">
                                                    {data.tickets.length} registros
                                                </span>
                                            </div>
                                            <ChevronRight className={`text-slate-300 transition-transform duration-200 ${openAlumnos[alumnoId] ? 'rotate-90' : ''}`} size={16} />
                                        </button>

                                        {/* Tabla Desplegable */}
                                        {openAlumnos[alumnoId] && (
                                            <div className="p-3 pt-0 animate-in slide-in-from-top-2 duration-200">
                                                <div className="overflow-hidden border border-slate-50 rounded-xl">
                                                    <table className="w-full text-left border-collapse bg-brand-surface">
                                                        <thead className="bg-brand-bg text-[8px] uppercase font-black text-brand-muted">
                                                            <tr>
                                                                <th className="px-4 py-2">Faltó el</th>
                                                                <th className="px-4 py-2">Recupera</th>
                                                                <th className="px-4 py-2">Tipo</th>
                                                                <th className="px-4 py-2 text-center">Estado</th>
                                                                <th className="px-4 py-2 text-right">Acción</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-50">
                                                            {data.tickets.map((recu) => (
                                                                <tr key={recu.id} className="hover:bg-brand-bg/50 transition-colors text-[10px]">
                                                                    <td className="px-4 py-2 font-bold text-slate-600">
                                                                        {formatLocalDate(recu.fecha_falta)}
                                                                    </td>
                                                                    <td className={`px-4 py-2 font-medium ${recu.fecha_programada ? 'text-brand-primary' : 'text-slate-300 italic'}`}>
                                                                        {formatLocalDate(recu.fecha_programada)}
                                                                    </td>
                                                                    <td className="px-4 py-2">
                                                                        {recu.es_por_lesion ? (
                                                                            <div className="flex items-center gap-1 text-red-500 font-bold uppercase text-[8px]">
                                                                                <Stethoscope size={10} /> Médico
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-brand-muted uppercase text-[8px] font-bold">Falta Común</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-tighter ${
                                                                            recu.estado === 'VENCIDA' ? 'bg-red-100 text-red-600' :
                                                                            recu.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-600' : 
                                                                            STATUS_SUCCESS
                                                                        }`}>
                                                                            {recu.estado}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-2 text-right">
                                                                        <button 
                                                                            onClick={() => handleDelete(recu.id, data.nombre)}
                                                                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeDelete}
                title="¿Eliminar registro?"
                message={deleteTarget ? `Se eliminará el registro de recuperación de ${deleteTarget.nombre}.` : ''}
                iconType="danger"
                confirmText="Eliminar"
            />
        </div>
    );
};

export default AdminDeleteMakeups;