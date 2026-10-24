import React, { useState, useCallback, useMemo, useDeferredValue } from 'react';
import { ChevronRight, ArrowLeft, Plus, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { exportAlumnosExcel } from '../../utils/exportAlumnosExcel';

import alumnoService from '../../services/alumno.service';
import { useFetch } from '../../hooks/useFetch';
import { useCatalogos } from '../../hooks/useCatalogos';
import { usePagination } from '../../hooks/usePagination';
import { invalidarHistorialCiclos } from '../../hooks/useHistorialCiclos';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import SearchInput from '../../components/shared/SearchInput';

// COMPONENTES MODULARIZADOS
import ChangeLevelStudent from '../../components/Admin/StudenManager/ChangeLevelStudent.jsx';
import StudentDetails from '../../components/Admin/StudenManager/StudentDetails.jsx';
import InscriptionsModal from '../../components/Admin/StudenManager/InscriptionsModal.jsx';
import StudentTable from '../../components/Admin/StudenManager/StudentTable.jsx';
import AdminStudents from '../../components/Admin/AdminStudents.jsx';
import StudentAttendanceHistory from '../../components/Admin/StudenManager/StudentAttendanceHistory.jsx';

const AdminStudentsManager = () => {
    const [view, setView] = useState('list'); // 'list' | 'details' | 'cambio_nivel'
    const [selectedAlumno, setSelectedAlumno] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSede, setSelectedSede] = useState('');
    // Las sedes salen de la cache compartida: antes esta vista pedia
    // /sedes?activo=true por su cuenta, igual que otras cinco pantallas.
    const { sedes } = useCatalogos(['sedes']);
    const [modalInscripciones, setModalInscripciones] = useState({ isOpen: false, data: null });
    const [isExporting, setIsExporting] = useState(false);

    // 🔥 MOVIDO desde StudentTable: filtros avanzados, texto y orden ahora
    // viven aquí, porque deben aplicarse sobre la lista COMPLETA de alumnos
    // antes de paginar — no sobre los 10 elementos ya paginados.
    const [filters, setFilters] = useState({ sede: '', nivel: '', estadoVisual: '' });
    const [textFilter, setTextFilter] = useState({ field: 'full_name', value: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    const itemsPerPage = 10;

    // --- CARGA Y PROCESAMIENTO DE DATOS ---
    // useFetch centraliza loading/error/toast y expone refetch(). `deps` lleva
    // solo la primitiva selectedSede (ver la nota de deps en useFetch.js).
    const { data: alumnos, loading, refetch: refetchAlumnos } = useFetch(
        async () => {
            const data = await alumnoService.getResumenTabla(selectedSede);
            // 🆕 estadoDisplay: campo derivado ÚNICO que combina estadoVisual +
            // estaVencido en un solo valor real. Antes el badge de la tabla
            // calculaba "NO RENOVADO" al vuelo con un ternario inline, pero el
            // filtro de "Estado" leía estadoVisual crudo (solo veía "ACTIVO") —
            // por eso el dropdown nunca mostraba "NO RENOVADO" como opción y
            // filtrar por "ACTIVO" mezclaba vencidos con al día. Ahora ambos
            // (badge y filtro) leen este mismo campo, así siempre coinciden.
            return data.map(a => ({
                ...a,
                estadoDisplay: a.estadoVisual === 'ACTIVO'
                    ? (a.estaVencido ? 'NO RENOVADO' : 'ACTIVO')
                    : a.estadoVisual,
            }));
        },
        [selectedSede],
        { initialData: [], errorMessage: 'Error al sincronizar Base Imperio 7' }
    );

    // El pipeline de filtrado corre sobre la lista completa, asi que se usa el
    // valor diferido del texto: React mantiene la tabla con el resultado
    // anterior mientras el usuario sigue escribiendo, en vez de recalcular y
    // reordenar los cientos de alumnos en cada pulsacion.
    const searchTermDiferido = useDeferredValue(searchTerm);
    const textFilterDiferido = useDeferredValue(textFilter);

    // BL-013: el backend arma las filas; el front solo las vuelca al Excel.
    const handleExportAlumnos = async () => {
        try {
            setIsExporting(true);
            const rows = await alumnoService.getReporteExportacion();
            if (rows.length === 0) {
                toast.error('No hay datos para exportar');
                return;
            }
            await exportAlumnosExcel(rows);
            toast.success('Excel exportado exitosamente');
        } catch (e) {
            console.error('Error al exportar alumnos:', e);
            toast.error(e.message || 'Error al generar el archivo');
        } finally {
            setIsExporting(false);
        }
    };

    const handleStatusHistory = async (estado) => {
        try {
            const result = await alumnoService.changeStatusHistory({ alumnoId: selectedAlumno.id, estado });
            toast.success(result.message);
            setSelectedAlumno((prev) => ({ ...prev, salud: { ...prev.salud, historial: estado } }));
        } catch (e) {
            toast.error(e.message || 'Error al actualizar el historial');
        }
    };

    // 🔥 Opciones de los selects de filtro: SIEMPRE calculadas sobre la lista
    // COMPLETA de alumnos (no solo los 10 de la página actual), para que no
    // "desaparezcan" sedes/niveles válidos según en qué página estés parado.
    const uniqueSedes = useMemo(
        () => [...new Set(alumnos.flatMap(a => a.sedes))].filter(Boolean).sort(),
        [alumnos]
    );
    const uniqueNiveles = useMemo(
        () => [...new Set(alumnos.flatMap(a => a.niveles))].filter(Boolean).sort(),
        [alumnos]
    );
    // 🔧 FIX: ahora se calcula sobre estadoDisplay (no estadoVisual crudo), para
    // que el dropdown de "Estado" muestre "NO RENOVADO" como opción real.
    const uniqueEstados = useMemo(
        () => [...new Set(alumnos.map(a => a.estadoDisplay))].filter(Boolean).sort(),
        [alumnos]
    );

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    // 🔥 FIX PRINCIPAL: todo el pipeline (búsqueda simple + filtro avanzado de
    // texto + filtros de sede/nivel/estado + orden) corre AQUÍ, sobre los 767
    // alumnos completos. Recién con el resultado final se calcula la paginación.
    const processedAlumnos = useMemo(() => {
        let result = [...alumnos];

        // A. Búsqueda simple del buscador superior (nombre o DNI)
        if (searchTermDiferido) {
            const lower = searchTermDiferido.toLowerCase();
            result = result.filter(a =>
                a.full_name.toLowerCase().includes(lower) || a.dni.includes(searchTermDiferido)
            );
        }

        // B. Filtro avanzado de texto (nombre / DNI / celular) desde la cabecera de tabla
        if (textFilterDiferido.value) {
            const lowerValue = textFilterDiferido.value.toLowerCase();
            result = result.filter(a => {
                const val = String(a[textFilterDiferido.field] || '').toLowerCase();
                return val.includes(lowerValue);
            });
        }

        // C. Filtros tipo segmentador (sede, nivel, estado)
        if (filters.sede) result = result.filter(a => a.sedes.includes(filters.sede));
        if (filters.nivel) result = result.filter(a => a.niveles.includes(filters.nivel));
        // 🔧 FIX: compara contra estadoDisplay, el mismo valor que ve el usuario en el badge
        if (filters.estadoVisual) result = result.filter(a => a.estadoDisplay === filters.estadoVisual);

        // D. Ordenamiento
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'monto_pendiente') {
                    aValue = parseFloat(a.monto_pendiente || 0);
                    bValue = parseFloat(b.monto_pendiente || 0);
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [alumnos, searchTermDiferido, textFilterDiferido, filters, sortConfig]);

    const { currentPage, setCurrentPage, totalPages, pageItems: currentAlumnos } =
        usePagination(processedAlumnos, itemsPerPage);

    // 🔥 Cambiar cualquier filtro devuelve a la página 1. Se hace en los propios
    // setters en vez de en un useEffect que observase el estado ya cambiado.
    const cambiarBusqueda = useCallback((valor) => { setSearchTerm(valor); setCurrentPage(1); }, [setCurrentPage]);
    const cambiarSede = useCallback((valor) => { setSelectedSede(valor); setCurrentPage(1); }, [setCurrentPage]);
    const cambiarFilters = useCallback((siguiente) => { setFilters(siguiente); setCurrentPage(1); }, [setCurrentPage]);
    const cambiarTextFilter = useCallback((siguiente) => { setTextFilter(siguiente); setCurrentPage(1); }, [setCurrentPage]);

    const hasFilters = filters.sede || filters.nivel || filters.estadoVisual || textFilter.value;

    const clearAllFilters = () => {
        cambiarFilters({ sede: '', nivel: '', estadoVisual: '' });
        cambiarTextFilter({ field: 'full_name', value: '' });
    };

    // --- RENDERIZADOS ---
    if (loading) return (
        <LoadingSpinner
            className="flex flex-col items-center justify-center h-96 gap-4"
            size={48}
            label="Consultando Registros..."
            labelClassName="font-black text-brand-primary text-xs uppercase italic tracking-widest animate-pulse"
        />
    );

    if (view === 'details' && selectedAlumno) {
        return <StudentDetails
            selectedAlumno={selectedAlumno}
            onBack={() => setView('list')}
            onStatusHistoryChange={handleStatusHistory}
        />;
    }

    if (view === 'cambio_nivel' && selectedAlumno) {
        return <ChangeLevelStudent alumno={selectedAlumno} onBack={() => { setView('list'); invalidarHistorialCiclos(selectedAlumno?.id); refetchAlumnos(); }} />;
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
                    <h1 className="text-3xl font-black text-brand-heading uppercase italic tracking-tighter leading-none">Gestión de <span className="text-brand-primary">Alumnos</span></h1>
                    <p className="text-brand-muted text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Control Maestro de la Academia</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={handleExportAlumnos} disabled={isExporting} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors hover:bg-emerald-700 disabled:opacity-50 shadow-lg">
                        <FileSpreadsheet size={20} /> {isExporting ? 'Generando...' : 'Exportar Excel'}
                    </button>
                    <button onClick={() => setView('create')} className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:bg-brand-accent shadow-lg">
                        <Plus size={20} /> Registrar Alumno
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => cambiarBusqueda(e.target.value)}
                    placeholder="BUSCAR POR NOMBRE, APELLIDO O DNI..."
                    wrapperClassName="relative group"
                    iconSize={20}
                    iconClassName="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-primary transition-colors"
                    className="w-full bg-brand-surface border-2 border-brand-border-soft rounded-[1.8rem] pl-16 pr-8 py-5 font-black text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-brand-accent/5 focus:border-brand-primary transition-all shadow-sm"
                />
                <select value={selectedSede} onChange={(e) => cambiarSede(e.target.value)} className="bg-brand-surface border border-brand-border rounded-xl px-4 py-3 text-[10px] font-black uppercase shadow-sm outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent">
                    <option value="">TODAS LAS SEDES</option>
                    {sedes.map(s => <option key={s.id} value={s.id}>SEDE {s.nombre}</option>)}
                </select>
            </div>

            {/* TABLA PRINCIPAL — ahora solo presentacional, recibe todo por props */}
            <StudentTable
                alumnos={currentAlumnos}
                sortConfig={sortConfig}
                requestSort={requestSort}
                filters={filters}
                setFilters={cambiarFilters}
                textFilter={textFilter}
                setTextFilter={cambiarTextFilter}
                uniqueSedes={uniqueSedes}
                uniqueNiveles={uniqueNiveles}
                uniqueEstados={uniqueEstados}
                hasFilters={hasFilters}
                onClearFilters={clearAllFilters}
                onViewDetails={(alum) => { setSelectedAlumno(alum); setView('details'); }}
                onAttendanceHistory={(alum) => { setSelectedAlumno(alum); setView('attendanceHistory'); }}
                onOpenInscriptions={(alum) => setModalInscripciones({ isOpen: true, data: alum })}
                onChangeLevel={(alum) => { setSelectedAlumno(alum); setView('cambio_nivel'); }}
            />

            {/* Paginación — ahora basada en processedAlumnos (con filtros aplicados) */}
            <div className="bg-brand-bg/50 border-t border-brand-border-soft p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                    Mostrando <span className="text-brand-primary">{currentAlumnos.length}</span> de <span className="text-slate-600">{processedAlumnos.length}</span> alumnos
                </p>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-surface border border-brand-border text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all shadow-sm"
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
                                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary-soft' : 'bg-brand-surface border border-brand-border text-slate-600 hover:bg-brand-bg'}`}
                                >
                                    {i + 1}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-brand-surface border border-brand-border text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brand-primary hover:text-white transition-all shadow-sm"
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