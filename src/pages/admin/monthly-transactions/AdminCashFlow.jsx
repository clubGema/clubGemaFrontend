import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import cajaService from '../../../services/caja.service';
import { useCatalogos } from '../../../hooks/useCatalogos';

import { MonthAccordion } from '../../../components/Admin/Components-monthly-transactions/MonthAccordion';
import ConfirmModal from '../../../components/shared/ConfirmModal';
import PageTitle from '../../../components/shared/PageTitle';
import {
    formatLocalToUTC, formatUTCtoLocalInput, consolidarDatosMes,
    construirFilasExcel, construirFilasDesgloseExcel, construirFilasAuditoriaExcel,
} from './cashFlowUtils';

const currentYear = new Date().getFullYear();
const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// Identidad estable: se pasa a los meses que NO se estan editando para que
// React.memo pueda saltarselos (ver nota sobre el churn de props mas abajo).
const FORM_VACIO = { concepto: '', monto: '', fecha: '', sede_id: '' };

const AdminCashFlow = () => {
    // Detalle por mes, rellenado SOLO para los meses que el usuario abre.
    const [datosPorMes, setDatosPorMes] = useState({});
    // Merch vs Matrícula de cada mes abierto (endpoint aparte del detalle; si falla, el mes
    // se muestra igual, sin la tarjeta).
    const [desglosePorMes, setDesglosePorMes] = useState({});
    // Agregados de los 12 meses (1 peticion) para las cabeceras de los acordeones.
    const [resumenAnual, setResumenAnual] = useState([]);
    const [loadingMeses, setLoadingMeses] = useState({});

    const { sedes } = useCatalogos(['sedes']);

    const [filtroAnio, setFiltroAnio] = useState(currentYear);
    const [mesesAbiertos, setMesesAbiertos] = useState([]);

    // Estados de edición y creación
    const [inlineEditId, setInlineEditId] = useState(null);
    const [inlineEditMes, setInlineEditMes] = useState(null);
    const [inlineData, setInlineData] = useState(FORM_VACIO);
    const [addingMonth, setAddingMonth] = useState(null);
    const [addingType, setAddingType] = useState(null);
    const [newData, setNewData] = useState(FORM_VACIO);
    const [submitting, setSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // movimiento pendiente de eliminar
    const [isExporting, setIsExporting] = useState(false);

    // Espejos en ref de los formularios: permiten que los handlers de guardado
    // tengan identidad ESTABLE (useCallback sin `inlineData`/`newData` en deps)
    // sin dejar de leer el valor mas reciente. Mismo patron que `fetcherRef`
    // en src/hooks/useFetch.js.
    const inlineDataRef = useRef(inlineData);
    inlineDataRef.current = inlineData;
    const newDataRef = useRef(newData);
    newDataRef.current = newData;
    const addingTypeRef = useRef(addingType);
    addingTypeRef.current = addingType;
    const sedesRef = useRef(sedes);
    sedesRef.current = sedes;
    // Meses cuyo detalle ya se pidio en este año, para no repetir la peticion.
    const mesesPedidos = useRef(new Set());
    // Espejo de los acordeones abiertos: permite que toggleMes sea estable.
    const mesesAbiertosRef = useRef(mesesAbiertos);
    mesesAbiertosRef.current = mesesAbiertos;

    // Detalle de UN mes. Antes se llamaban los 12 al entrar; ahora solo el mes
    // que se abre, porque las cabeceras ya salen del resumen anual.
    const fetchMes = useCallback(async (mesNum, anio, mostrarError = true) => {
        try {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: true }));
            const [data, desglose] = await Promise.all([
                cajaService.obtenerResumenMes(mesNum, anio),
                cajaService.obtenerDesgloseIngresos(mesNum, anio).catch(() => null),
            ]);
            if (data) {
                setDatosPorMes(prev => ({ ...prev, [mesNum]: consolidarDatosMes(data) }));
            }
            setDesglosePorMes(prev => ({ ...prev, [mesNum]: desglose }));
            return data;
        } catch (error) {
            if (mostrarError) toast.error(error.message || `Error al cargar el mes ${mesNum}`);
            return null;
        } finally {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: false }));
        }
    }, []);

    // Carga del año: 1 peticion de agregados + el detalle del unico mes que
    // arranca abierto. Antes eran 12 peticiones de detalle.
    useEffect(() => {
        let cancelado = false;

        const cargarAnio = async () => {
            setDatosPorMes({});
            setDesglosePorMes({});
            mesesPedidos.current = new Set();
            const mesActual = new Date().getMonth() + 1;
            setMesesAbiertos([mesActual]);

            try {
                const resumen = await cajaService.obtenerResumenAnual(filtroAnio);
                if (!cancelado) setResumenAnual(resumen);
            } catch (error) {
                if (!cancelado) {
                    setResumenAnual([]);
                    toast.error(error.message || 'Error al cargar el resumen anual');
                }
            }

            if (!cancelado) {
                mesesPedidos.current.add(mesActual);
                fetchMes(mesActual, filtroAnio, false);
            }
        };

        cargarAnio();
        return () => { cancelado = true; };
    }, [filtroAnio, fetchMes]);

    // Al abrir un mes se pide su detalle una sola vez. El fetch va FUERA del
    // updater de estado: React puede invocar los updaters dos veces en modo
    // estricto, y ahi dentro acabaria duplicando la peticion.
    const toggleMes = useCallback((mesNum) => {
        const estabaAbierto = mesesAbiertosRef.current.includes(mesNum);
        setMesesAbiertos(prev => (estabaAbierto ? prev.filter(m => m !== mesNum) : [...prev, mesNum]));

        if (!estabaAbierto && !mesesPedidos.current.has(mesNum)) {
            mesesPedidos.current.add(mesNum);
            fetchMes(mesNum, filtroAnio, false);
        }
    }, [fetchMes, filtroAnio]);

    // --- Lógicas de Edición ---
    const startInlineEdit = useCallback((movimiento, mesNum) => {
        setInlineEditId(movimiento.id);
        setInlineEditMes(mesNum);
        const sedeEncontrada = sedesRef.current.find(s => s.nombre === movimiento.sede);
        setInlineData({
            concepto: movimiento.concepto,
            monto: movimiento.monto,
            fecha: formatUTCtoLocalInput(movimiento.fecha),
            sede_id: sedeEncontrada ? sedeEncontrada.id : ''
        });
    }, []);

    const cancelInlineEdit = useCallback(() => {
        setInlineEditId(null);
        setInlineEditMes(null);
    }, []);

    const saveInlineEdit = useCallback(async (id, mesNum) => {
        const datos = inlineDataRef.current;
        if (!datos.concepto || !datos.monto) return toast.error("Complete concepto y monto");
        try {
            setSubmitting(true);
            await cajaService.actualizar(id, {
                concepto: datos.concepto,
                monto: parseFloat(datos.monto),
                fecha_movimiento: formatLocalToUTC(datos.fecha),
                sede_id: datos.sede_id ? parseInt(datos.sede_id) : null
            });
            toast.success("Movimiento actualizado");
            setInlineEditId(null);
            setInlineEditMes(null);
            await fetchMes(mesNum, filtroAnio);
        } catch (error) {
            toast.error(error.message || "Error al actualizar");
        } finally {
            setSubmitting(false);
        }
    }, [fetchMes, filtroAnio]);

    const startAddNew = useCallback((mesNum, tipoMovimiento) => {
        const mesStr = String(mesNum).padStart(2, '0');
        setAddingMonth(mesNum);
        setAddingType(tipoMovimiento);
        setNewData({ concepto: '', monto: '', fecha: `${filtroAnio}-${mesStr}-01`, sede_id: '' });
    }, [filtroAnio]);

    const cancelAddNew = useCallback(() => {
        setAddingMonth(null);
        setAddingType(null);
    }, []);

    const saveNewMovimiento = useCallback(async (mesNum) => {
        const datos = newDataRef.current;
        if (!datos.concepto || !datos.monto || !datos.fecha) return toast.error("Complete los datos requeridos");
        const tipo = addingTypeRef.current;
        try {
            setSubmitting(true);
            await cajaService.crear({
                tipo_movimiento: tipo,
                concepto: datos.concepto,
                monto: parseFloat(datos.monto),
                fecha_movimiento: formatLocalToUTC(datos.fecha),
                sede_id: datos.sede_id ? parseInt(datos.sede_id) : null
            });
            toast.success(`${tipo} registrado correctamente`);
            setAddingMonth(null);
            setAddingType(null);
            await fetchMes(mesNum, filtroAnio);
        } catch (error) {
            toast.error(error.message || "Error al registrar");
        } finally {
            setSubmitting(false);
        }
    }, [fetchMes, filtroAnio]);

    const movimientoDelete = useCallback((movimiento, mesNum) => {
        setDeleteTarget({ movimiento, mesNum });
    }, []);

    const executeMovimientoDelete = useCallback(async () => {
        const { movimiento, mesNum } = deleteTarget;
        setDeleteTarget(null);
        try {
            await cajaService.eliminar(movimiento.id);
            toast.success(`${movimiento.tipo} eliminado correctamente.`);
            // Solo el mes afectado: recargar el año entero eran 12 peticiones
            // para refrescar una sola fila.
            await fetchMes(mesNum, filtroAnio);
        } catch (e) {
            toast.error(e.message || 'Error al eliminar.');
        }
    }, [deleteTarget, fetchMes, filtroAnio]);

    // Excel: el aplanado de filas vive en cashFlowUtils.js y recorre TODOS los
    // meses, asi que con la carga diferida hay que completar los que falten
    // antes de construirlo (si no, el reporte saldria solo con los abiertos).
    const exportToExcel = useCallback(async () => {
        try {
            setIsExporting(true);
            const faltantes = MESES
                .map((_, i) => i + 1)
                .filter(mes => datosPorMes[mes] === undefined);

            let completo = datosPorMes;
            if (faltantes.length > 0) {
                const cargados = await Promise.all(
                    faltantes.map(async (mes) => [mes, await cajaService.obtenerResumenMes(mes, filtroAnio).catch(() => null)])
                );
                completo = { ...datosPorMes };
                for (const [mes, data] of cargados) {
                    if (data) {
                        completo[mes] = consolidarDatosMes(data);
                        mesesPedidos.current.add(mes);
                    }
                }
                setDatosPorMes(completo);
            }

            // Desglose Merch vs Matrícula: mismo criterio. Un mes con `null` es un desglose que
            // falló al cargarse; se reintenta y, si sigue fallando, NO se genera el Excel: para
            // contabilidad es peor un reporte con huecos que ningún reporte.
            const sinDesglose = MESES
                .map((_, i) => i + 1)
                .filter(mes => !desglosePorMes[mes]);

            let desgloseCompleto = desglosePorMes;
            if (sinDesglose.length > 0) {
                const cargados = await Promise.all(
                    sinDesglose.map(async (mes) => [mes, await cajaService.obtenerDesgloseIngresos(mes, filtroAnio).catch(() => null)])
                );
                const fallidos = cargados.filter(([, d]) => !d).map(([mes]) => MESES[mes - 1]);
                if (fallidos.length > 0) {
                    return toast.error(`No se pudo cargar el desglose Merch/Matrícula de: ${fallidos.join(', ')}. Intenta de nuevo.`);
                }
                desgloseCompleto = { ...desglosePorMes };
                for (const [mes, d] of cargados) desgloseCompleto[mes] = d;
                setDesglosePorMes(desgloseCompleto);
            }

            const dataToExport = construirFilasExcel(completo, filtroAnio, MESES);
            if (dataToExport.length === 0) return toast.error("No hay datos para exportar.");

            // XLSX se carga con import() dentro del handler: son 870 kB (323 kB gzip) que solo
            // hacen falta al pulsar el botón de exportar, no al abrir la vista.
            const XLSX = await import('xlsx-js-style');

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `Resumen ${filtroAnio}`);

            // Hojas extra con lo mismo que muestra la plataforma (por fecha de pago). Van aparte
            // del resumen por ciclo para que sumar la columna MONTO de esa hoja no los duplique.
            const filasDesglose = construirFilasDesgloseExcel(desgloseCompleto, filtroAnio, MESES);
            if (filasDesglose.length > 0) {
                const hojaDesglose = XLSX.utils.json_to_sheet(filasDesglose);
                hojaDesglose['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 28 }, { wch: 24 }, { wch: 20 }, { wch: 13 }, { wch: 10 }];
                XLSX.utils.book_append_sheet(workbook, hojaDesglose, `Merch vs Matrícula ${filtroAnio}`);
            }
            const filasAuditoria = construirFilasAuditoriaExcel(desgloseCompleto, filtroAnio, MESES);
            if (filasAuditoria.length > 0) {
                const hojaAuditoria = XLSX.utils.json_to_sheet(filasAuditoria);
                hojaAuditoria['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 12 }, { wch: 32 }, { wch: 12 }, { wch: 9 }, { wch: 12 }];
                XLSX.utils.book_append_sheet(workbook, hojaAuditoria, `Auditoría Merch ${filtroAnio}`);
            }

            XLSX.writeFile(workbook, `Resumen_Financiero_${filtroAnio}.xlsx`);
        } catch {
            // La carga diferida del chunk puede fallar sin red; sin este catch
            // seria una promesa rechazada en silencio.
            toast.error("No se pudo generar el Excel. Revisa tu conexion.");
        } finally {
            setIsExporting(false);
        }
    }, [datosPorMes, desglosePorMes, filtroAnio]);

    // Acciones y datos estables: identidad constante entre renders, para que
    // React.memo(MonthAccordion) pueda descartar los meses no afectados.
    const acciones = useMemo(() => ({
        sedes,
        setInlineData,
        saveInlineEdit,
        cancelInlineEdit,
        startInlineEdit,
        setNewData,
        startAddNew,
        cancelAddNew,
        saveNewMovimiento,
        movimientoDelete,
    }), [sedes, saveInlineEdit, cancelInlineEdit, startInlineEdit, startAddNew, cancelAddNew, saveNewMovimiento, movimientoDelete]);

    // Agregados indexados por mes, para la cabecera de cada acordeón.
    const totalesPorMes = useMemo(() => {
        const mapa = {};
        for (const m of resumenAnual) mapa[m.mes] = m;
        return mapa;
    }, [resumenAnual]);

    return (
        <div className="space-y-6 animate-fade-in-up p-2 max-w-[1400px] mx-auto">
            {/* Header del Admin */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <PageTitle
                        title="Libro Diario"
                        accent="Mensual"
                        subtitle="Control de caja y reportes financieros por sede"
                        wrapperClassName="flex items-center gap-3 mb-1"
                        barClassName="h-8 w-1.5 bg-brand-accent rounded-full"
                        accentClassName="text-brand-accent"
                        subtitleClassName="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-70 ml-4"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-brand-surface border border-brand-border rounded-2xl px-3 py-1.5 shadow-sm hover:border-brand-accent/40 transition-colors">
                        <Calendar size={14} className="text-brand-muted" />
                        <select
                            value={filtroAnio}
                            onChange={(e) => setFiltroAnio(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black uppercase text-brand-heading outline-none cursor-pointer py-2 pl-2 pr-4 focus:ring-0"
                        >
                            <option value="2024">Año 2024</option>
                            <option value="2025">Año 2025</option>
                            <option value="2026">Año 2026</option>
                            <option value="2027">Año 2027</option>
                        </select>
                    </div>

                    <button onClick={exportToExcel} disabled={isExporting} className="bg-brand-accent hover:bg-brand-accent-dark text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-accent/30 transition-all flex items-center gap-2 disabled:opacity-60">
                        <FileSpreadsheet size={16} /> {isExporting ? 'Generando...' : 'Descargar Excel'}
                    </button>
                </div>
            </div>

            {/* Listado de Meses */}
            <div className="space-y-3">
                {MESES.map((nombre, index) => {
                    const mesNum = index + 1;
                    return (
                        <MonthAccordion
                            key={mesNum}
                            mesNum={mesNum}
                            mesNombre={nombre}
                            isOpen={mesesAbiertos.includes(mesNum)}
                            isLoading={!!loadingMeses[mesNum]}
                            toggleMes={toggleMes}
                            datosMes={datosPorMes[mesNum]}
                            desgloseMes={desglosePorMes[mesNum]}
                            totalesMes={totalesPorMes[mesNum]}
                            acciones={acciones}
                            submitting={submitting}
                            /* El estado volátil de los formularios solo baja al mes que
                               se está editando. Los demás reciben siempre la misma
                               identidad (null / FORM_VACIO), así que React.memo los
                               descarta y no se re-renderizan en cada pulsación. */
                            inlineEditId={inlineEditMes === mesNum ? inlineEditId : null}
                            inlineData={inlineEditMes === mesNum ? inlineData : FORM_VACIO}
                            addingType={addingMonth === mesNum ? addingType : null}
                            newData={addingMonth === mesNum ? newData : FORM_VACIO}
                        />
                    );
                })}
            </div>

            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={executeMovimientoDelete}
                title={deleteTarget ? `¿Eliminar ${deleteTarget.movimiento.tipo}?` : ''}
                message="Esta acción no se puede deshacer."
                iconType="danger"
                confirmText="Sí, eliminar"
            />
        </div>
    );
};

export default AdminCashFlow;
