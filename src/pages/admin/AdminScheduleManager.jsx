import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Clock, User, MapPin, Edit3, Trash2, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import AdminSchedule from '../../components/Admin/AdminSchedule';
import { apiFetch } from '../../interceptors/api';
import toast from 'react-hot-toast';
import { API_ROUTES } from '../../constants/apiRoutes';
import ConfirmModal from '../../components/shared/ConfirmModal';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import { usePagination } from '../../hooks/usePagination';

const AdminSchedulesManager = () => {
    const [view, setView] = useState('list');
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteTargetId, setDeleteTargetId] = useState(null);

    // --- ESTADOS DE FILTRO ---
    const [filterDia, setFilterDia] = useState('');
    const [filterSede, setFilterSede] = useState('');
    const [filterCoordinador, setFilterCoordinador] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHorario, setSelectedHorario] = useState(null);

    // --- ESTADO PAGINACIÓN ---
    const itemsPerPage = 6;

    const handleEdit = (horario) => {
        setSelectedHorario(horario);
        setView('edit');
    };

    const mapDiaSemana = (dia) => {
        const dias = { 1: 'Lun', 2: 'Mar', 3: 'Mie', 4: 'Jue', 5: 'Vie', 6: 'Sab', 7: 'Dom' };
        return dias[dia] || 'S/D';
    };

    const fetchHorarios = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.HORARIOS.BASE);
            const result = await response.json();
            if (response.ok) setHorarios(result.data);
        } catch (error) {
            console.error('Error en fetchHorarios:', error);
            toast.error("Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = (id) => {
        setDeleteTargetId(id);
    };

    const executeDelete = async () => {
        const id = deleteTargetId;
        setDeleteTargetId(null);
        const loadingToast = toast.loading("Eliminando horario...");

        try {
            const res = await apiFetch.delete(`${API_ROUTES.HORARIOS.BASE}/${id}`);
            if (res.ok) {
                toast.success("Horario eliminado correctamente", { id: loadingToast });
                fetchHorarios(); // Recargamos la lista
            } else {
                const err = await res.json();
                toast.error(err.message || "No se pudo eliminar", { id: loadingToast });
            }
        } catch (error) {
            console.error('Error en executeDelete:', error);
            toast.error("Error de conexión al eliminar", { id: loadingToast });
        }
    };

    useEffect(() => {
        if (view === 'list') fetchHorarios();
    }, [view]);

    // --- LÓGICA DE FILTRADO ---
    const filteredHorarios = useMemo(() => {
        return horarios.filter(h => {
            const matchesDia = filterDia === '' || h.dia_semana.toString() === filterDia;
            const matchesSede = filterSede === '' || h.cancha.sede.nombre === filterSede;
            const nombreCoordinador = h.coordinador?.nombre_completo || 'Sin asignar';
            const matchesProf = filterCoordinador === '' || nombreCoordinador === filterCoordinador;
            const matchesSearch = searchTerm === '' ||
                nombreCoordinador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.cancha.nombre.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesDia && matchesSede && matchesProf && matchesSearch;
        });
    }, [horarios, filterDia, filterSede, filterCoordinador, searchTerm]);

    // --- LÓGICA DE PAGINACIÓN ---
    const { currentPage, setCurrentPage, totalPages, pageItems: currentData } =
        usePagination(filteredHorarios, itemsPerPage);

    // Obtener opciones únicas para los selects de filtro
    const uniqueSedes = [...new Set(horarios.map(h => h.cancha.sede.nombre))];
    const uniqueCoordinadores = [...new Set(horarios.map(h => h.coordinador.nombre_completo))];

    if (view === 'create') return <AdminSchedule onBack={() => setView('list')} />;
    if (view === 'edit') return <AdminSchedule onBack={() => { setView('list'); setSelectedHorario(null); }} initialData={selectedHorario} />;

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-1 bg-brand-accent rounded-full"></div>
                        <h1 className="text-2xl font-black text-brand-heading uppercase tracking-tight">Panel de <span className="text-brand-primary">Horarios</span></h1>
                    </div>
                </div>
                <button onClick={() => setView('create')} className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-brand-accent transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Programar Clase
                </button>
            </div>

            {/* --- BARRA DE FILTROS --- */}
            <div className="bg-brand-surface p-4 rounded-3xl border border-brand-border shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Buscar..."
                    iconClassName="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted"
                    iconSize={16}
                    className="w-full pl-10 pr-4 py-2 bg-brand-bg border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
                <select
                    className="bg-brand-bg border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterDia}
                    onChange={(e) => { setFilterDia(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todos los días</option>
                    <option value="1">Lunes</option><option value="2">Martes</option>
                    <option value="3">Miércoles</option><option value="4">Jueves</option>
                    <option value="5">Viernes</option><option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                </select>
                <select
                    className="bg-brand-bg border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterSede}
                    onChange={(e) => { setFilterSede(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todas las Sedes</option>
                    {uniqueSedes.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="bg-brand-bg border-none rounded-2xl px-4 py-2 text-xs font-bold outline-none"
                    value={filterCoordinador}
                    onChange={(e) => { setFilterCoordinador(e.target.value); setCurrentPage(1); }}
                >
                    <option value="">Todos los Coordinadores</option>
                    {uniqueCoordinadores.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {loading ? (
                <LoadingSpinner className="flex justify-center p-20" />
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {currentData.length > 0 ? (
                            currentData.map((h) => (
                                <div key={h.id} className="bg-brand-surface rounded-3xl border border-brand-border p-5 md:p-6 hover:shadow-xl transition-all group flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-2 py-1 bg-brand-accent-soft text-brand-accent-dark text-[9px] font-black rounded-lg uppercase tracking-wider">
                                                {mapDiaSemana(h.dia_semana)}
                                            </span>
                                            {/* Botones de acción siempre visibles en móvil, hover en desktop */}
                                            <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(h)}
                                                    className="p-2 text-brand-muted hover:text-brand-primary bg-brand-bg md:bg-transparent rounded-lg transition-colors"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(h.id)}
                                                    className="p-2 text-brand-muted hover:text-red-500 bg-brand-bg md:bg-transparent rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="shrink-0 p-3 bg-brand-primary-soft text-brand-primary rounded-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-300">
                                                <Clock size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-black text-slate-800 text-base md:text-lg italic leading-tight truncate">
                                                    {h.hora_inicio} - {h.hora_fin}
                                                </h3>
                                                <p className="text-brand-primary text-[10px] font-black uppercase tracking-widest truncate">
                                                    {h.nivel.nombre}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2.5 pt-4 border-t border-slate-50">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <User size={14} className="shrink-0 text-brand-accent" />
                                            <span className="text-[11px] font-bold uppercase truncate">
                                                {h.coordinador.nombre_completo}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin size={14} className="shrink-0 text-brand-accent" />
                                            <span className="text-[11px] font-bold uppercase truncate" title={`${h.cancha.nombre} (${h.cancha.sede.nombre})`}>
                                                {h.cancha.nombre} <span className="text-[10px] text-brand-muted font-medium">({h.cancha.sede.nombre})</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                className="col-span-full py-20 text-center bg-brand-bg rounded-3xl border border-dashed border-brand-border"
                                message="No se encontraron horarios con esos filtros."
                                messageClassName="text-brand-muted font-bold italic"
                            />
                        )}
                    </div>

                    {/* --- CONTROLES DE PAGINACIÓN --- */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-6">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-brand-surface border border-brand-border rounded-xl disabled:opacity-30 hover:bg-brand-bg transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                Página {currentPage} de {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-brand-surface border border-brand-border rounded-xl disabled:opacity-30 hover:bg-brand-bg transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            )}

            <ConfirmModal
                isOpen={!!deleteTargetId}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={executeDelete}
                title="¿Eliminar Horario?"
                message="Esta acción no se puede deshacer y liberará la cancha en ese horario."
                iconType="danger"
                confirmText="Sí, Eliminar"
            />
        </div>
    );
};

export default AdminSchedulesManager;