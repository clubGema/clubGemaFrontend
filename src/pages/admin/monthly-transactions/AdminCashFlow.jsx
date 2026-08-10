import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { apiFetch } from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';

import { MonthAccordion } from '../../../components/Admin/Components-monthly-transactions/MonthAccordion';
import Swal from 'sweetalert2';

// Utilidades
const currentYear = new Date().getFullYear();
const MESES = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
];

// ✅ ORDEN FIJO DE NIVELES: ajusta/agrega aquí si tienes más niveles.
// Cualquier nivel que NO esté en esta lista se ubicará al final (antes de PLAN INDIVIDUAL),
// ordenado alfabéticamente, para que nunca "desaparezca" un nivel nuevo silenciosamente.
const ORDEN_NIVELES = ['BÁSICO', 'PRE INTERMEDIO', 'INTERMEDIO', 'AVANZADO'];

// Ordena los niveles de una sede: sigue ORDEN_NIVELES y deja PLAN INDIVIDUAL siempre al final.
const ordenarNiveles = (detalles) => {
    return [...detalles].sort((a, b) => {
        // PLAN INDIVIDUAL (esIndividual: true) siempre al final
        if (a.esIndividual && !b.esIndividual) return 1;
        if (!a.esIndividual && b.esIndividual) return -1;
        if (a.esIndividual && b.esIndividual) return 0;

        const idxA = ORDEN_NIVELES.indexOf((a.nivel || '').toUpperCase());
        const idxB = ORDEN_NIVELES.indexOf((b.nivel || '').toUpperCase());
        const posA = idxA === -1 ? ORDEN_NIVELES.length : idxA;
        const posB = idxB === -1 ? ORDEN_NIVELES.length : idxB;

        if (posA !== posB) return posA - posB;
        // Si ambos son "desconocidos" (no están en ORDEN_NIVELES), orden alfabético
        return (a.nivel || '').localeCompare(b.nivel || '');
    });
};

const formatLocalToUTC = (fechaStr) => {
    if (!fechaStr) return new Date().toISOString();
    const [yyyy, mm, dd] = fechaStr.split('-');
    return new Date(yyyy, mm - 1, dd, 12, 0, 0).toISOString();
};

const formatUTCtoLocalInput = (fechaISO) => {
    if (!fechaISO) return '';
    const d = new Date(fechaISO);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AdminCashFlow = () => {
    const [datosPorMes, setDatosPorMes] = useState({});
    const [loadingMeses, setLoadingMeses] = useState({});
    const [sedes, setSedes] = useState([]);

    const [filtroAnio, setFiltroAnio] = useState(currentYear);
    const [mesesAbiertos, setMesesAbiertos] = useState([]);

    // Estados de edición y creación
    const [inlineEditId, setInlineEditId] = useState(null);
    const [inlineData, setInlineData] = useState({ concepto: '', monto: '', fecha: '', sede_id: '' });
    const [addingMonth, setAddingMonth] = useState(null);
    const [addingType, setAddingType] = useState(null);
    const [newData, setNewData] = useState({ concepto: '', monto: '', fecha: '', sede_id: '' });
    const [submitting, setSubmitting] = useState(false);

    // 1. Cargar las sedes al iniciar
    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const response = await apiFetch.get(API_ROUTES.SEDES.ACTIVOS);
                if (response.ok) {
                    const data = await response.json();
                    setSedes(data.data || []);
                }
            } catch (error) {
                console.error("No se pudieron cargar las sedes", error);
            }
        };
        fetchSedes();
    }, []);

    // 2. Fetch Mes y lógica de consolidación
    const fetchMes = async (mesNum, anio, mostrarError = true) => {
        try {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: true }));
            const url = API_ROUTES.CAJA ? `${API_ROUTES.CAJA.RESUMEN}?mes=${mesNum}&anio=${anio}` : `/caja/resumen?mes=${mesNum}&anio=${anio}`;

            const response = await apiFetch.get(url);
            const data = await response.json();

            if (response.ok && data.success && data.data) {
                let ingresosConsolidadosObj = {};
                let ingresosManualesFlats = [];
                let egresosFlats = [];

                // Iterar sobre la nueva estructura: Sede -> niveles -> ingresos / egresos
                Object.entries(data.data).forEach(([sedeNombre, sedeData]) => {

                    // 🚀 NUEVA AGRUPACIÓN: SOLO POR SEDE
                    if (sedeData.niveles) {
                        const groupKey = sedeNombre;

                        if (!ingresosConsolidadosObj[groupKey]) {
                            ingresosConsolidadosObj[groupKey] = {
                                id: `auto-${groupKey}`,
                                sede: sedeNombre,
                                monto: 0,
                                cantidad: 0,
                                fteTotal: 0,
                                detallesNiveles: []
                            };
                        }

                        // ✨ NUEVO: Contadores globales para agrupar TODOS los planes individuales de esta sede
                        let cantidadSedeIndividual = 0;
                        let montoSedeIndividual = 0;
                        let fteSedeIndividual = 0;

                        Object.entries(sedeData.niveles).forEach(([nivelNombre, nivelData]) => {
                            const ingresosDelNivel = Array.isArray(nivelData.ingresos) ? nivelData.ingresos : [];
                            let cantidadNivel = 0;
                            let fteNivel = 0;
                            let montoNivel = 0;

                            ingresosDelNivel.forEach(ing => {
                                const montoIngreso = parseFloat(ing.monto || 0);

                                // Sumar al gran total de la sede (Esto se mantiene igual)
                                ingresosConsolidadosObj[groupKey].monto += montoIngreso;
                                ingresosConsolidadosObj[groupKey].cantidad += 1;

                                const matchFte = ing.concepto?.match(/([\d.]+)\s*FTE/i);
                                const currentFte = matchFte ? parseFloat(matchFte[1]) : (ing.es_plan_individual ? 0 : 0.5);

                                ingresosConsolidadosObj[groupKey].fteTotal += currentFte;

                                // ✨ SEPARACIÓN CLAVE: Si es individual, suma al contador "Individual", si no, al del "Nivel Normal"
                                if (ing.es_plan_individual) {
                                    cantidadSedeIndividual += 1;
                                    montoSedeIndividual += montoIngreso;
                                    fteSedeIndividual += currentFte; // (Aunque sea 0, lo sumamos por si acaso)
                                } else {
                                    cantidadNivel += 1;
                                    montoNivel += montoIngreso;
                                    fteNivel += currentFte;
                                }
                            });

                            // Agregamos el nivel normal (Solo si tuvo pagos que NO son individuales)
                            if (cantidadNivel > 0) {
                                ingresosConsolidadosObj[groupKey].detallesNiveles.push({
                                    nivel: nivelNombre,
                                    fte: fteNivel,
                                    cantidad: cantidadNivel,
                                    monto: montoNivel,
                                    esIndividual: false // 👈 Flag para la tabla
                                });
                            }
                        });

                        // ✨ CREACIÓN DEL "FALSO NIVEL": Agregamos la fila de PLAN INDIVIDUAL al final
                        if (cantidadSedeIndividual > 0) {
                            ingresosConsolidadosObj[groupKey].detallesNiveles.push({
                                nivel: 'PLAN INDIVIDUAL',
                                fte: fteSedeIndividual,
                                cantidad: cantidadSedeIndividual,
                                monto: montoSedeIndividual,
                                esIndividual: true // 👈 Flag que usaremos en IncomeTable para pintarlo de otro color
                            });
                        }

                        // ✅ FIX: forzar orden fijo de niveles (BÁSICO, PRE INTERMEDIO, INTERMEDIO...)
                        // y dejar PLAN INDIVIDUAL siempre al final, sin importar el orden en que
                        // vinieron las niveles desde el backend.
                        ingresosConsolidadosObj[groupKey].detallesNiveles = ordenarNiveles(
                            ingresosConsolidadosObj[groupKey].detallesNiveles
                        );
                    }

                    // Procesar Egresos de la sede
                    if (sedeData.egresos) {
                        sedeData.egresos.forEach(egr => {
                            egresosFlats.push({ ...egr, sede: sedeNombre, tipo: 'EGRESO' });
                        });
                    }

                    // Procesar ingresos manuales (Si existen)
                    if (sedeData.ingresosManuales) {
                        sedeData.ingresosManuales.forEach(ing => {
                            ingresosManualesFlats.push({ ...ing, sede: sedeNombre, tipo: 'INGRESO' });
                        });
                    }
                });

                // 🚀 INYECTAR EL TEXTO MULTILÍNEA
                const ingresosConsolidadosArray = Object.values(ingresosConsolidadosObj).map(item => {
                    // Línea principal (Ej: INGRESOS ACUMULADOS | 7.5 FTE (15 PAGOS))
                    let conceptoStr = `INGRESOS ACUMULADOS | ${item.fteTotal} FTE (${item.cantidad} PAGO${item.cantidad !== 1 ? 'S' : ''})`;

                    // Agregar una línea por cada nivel (Ej: ↳ BÁSICO: 2 FTE (4 PAGOS))
                    item.detallesNiveles.forEach(det => {
                        conceptoStr += `\n  ↳ ${det.nivel}: ${det.fte} FTE (${det.cantidad} PAGO${det.cantidad !== 1 ? 'S' : ''})`;
                    });

                    return {
                        ...item,
                        concepto: conceptoStr,
                        detallesRender: item.detallesNiveles // Lo dejamos por si a futuro quieres mapearlo con React
                    };
                });

                setDatosPorMes(prev => ({
                    ...prev,
                    [mesNum]: {
                        ingresosConsolidados: ingresosConsolidadosArray,
                        ingresosManuales: ingresosManualesFlats,
                        egresos: egresosFlats
                    }
                }));
            } else {
                if (mostrarError) toast.error(data.message || `Error al cargar mes ${mesNum}`);
            }
        } catch (error) {
            if (mostrarError) toast.error(`Error al cargar el mes ${mesNum}`);
        } finally {
            setLoadingMeses(prev => ({ ...prev, [mesNum]: false }));
        }
    };

    // 3. Cargar todo el año
    const cargarTodoElAnio = async () => {
        setDatosPorMes({});
        const promesas = MESES.map((_, index) => fetchMes(index + 1, filtroAnio, false));
        await Promise.all(promesas);

        const mesActual = new Date().getMonth() + 1;
        setMesesAbiertos([mesActual]);
    };

    useEffect(() => {
        cargarTodoElAnio();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroAnio]);

    const toggleMes = (mesNum) => {
        setMesesAbiertos(prev => prev.includes(mesNum) ? prev.filter(m => m !== mesNum) : [...prev, mesNum]);
    };

    // 4. Lógicas de Edición
    const startInlineEdit = (movimiento) => {
        setInlineEditId(movimiento.id);
        const sedeEncontrada = sedes.find(s => s.nombre === movimiento.sede);
        setInlineData({
            concepto: movimiento.concepto,
            monto: movimiento.monto,
            fecha: formatUTCtoLocalInput(movimiento.fecha),
            sede_id: sedeEncontrada ? sedeEncontrada.id : ''
        });
    };

    const saveInlineEdit = async (id, mesNum) => {
        if (!inlineData.concepto || !inlineData.monto) return toast.error("Complete concepto y monto");
        try {
            setSubmitting(true);
            const endpoint = `${API_ROUTES.CAJA?.BASE || '/caja'}/${id}`;
            const payload = {
                concepto: inlineData.concepto,
                monto: parseFloat(inlineData.monto),
                fecha_movimiento: formatLocalToUTC(inlineData.fecha),
                sede_id: inlineData.sede_id ? parseInt(inlineData.sede_id) : null
            };
            const response = await apiFetch.put(endpoint, payload);
            if (response.ok) {
                toast.success("Movimiento actualizado");
                setInlineEditId(null);
                await fetchMes(mesNum, filtroAnio);
            } else {
                const err = await response.json();
                toast.error(err.message || "Error al actualizar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const startAddNew = (mesNum, tipoMovimiento) => {
        const mesStr = String(mesNum).padStart(2, '0');
        setAddingMonth(mesNum);
        setAddingType(tipoMovimiento);
        setNewData({ concepto: '', monto: '', fecha: `${filtroAnio}-${mesStr}-01`, sede_id: '' });
    };

    const saveNewMovimiento = async (mesNum) => {
        if (!newData.concepto || !newData.monto || !newData.fecha) return toast.error("Complete los datos requeridos");
        try {
            setSubmitting(true);
            const endpoint = API_ROUTES.CAJA?.BASE || '/caja';
            const payload = {
                tipo_movimiento: addingType,
                concepto: newData.concepto,
                monto: parseFloat(newData.monto),
                fecha_movimiento: formatLocalToUTC(newData.fecha),
                sede_id: newData.sede_id ? parseInt(newData.sede_id) : null
            };
            const response = await apiFetch.post(endpoint, payload);
            if (response.ok) {
                toast.success(`${addingType} registrado correctamente`);
                setAddingMonth(null);
                setAddingType(null);
                await fetchMes(mesNum, filtroAnio);
            } else {
                const err = await response.json();
                toast.error(err.message || "Error al registrar");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setSubmitting(false);
        }
    };

    const movimientoDelete = async (movimiento) => {
        const result = await Swal.fire({
            title: `<span class="italic font-black uppercase text-[#1e3a8a]">¿Eliminar ${movimiento.tipo}?</span>`,
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'SÍ, ELIMINAR',
            customClass: { popup: 'rounded-[3rem] p-8' }
        });
        if (!result.isConfirmed) return;
        try {
            const response = await apiFetch.delete(`/caja/${movimiento.id}`);
            if (response.ok) {
                toast.success(`${movimiento.tipo} eliminado correctamente.`)
                await cargarTodoElAnio();
            } else {
                const err = await response.json();
                toast.error(err.message || 'Error al eliminar.')
            }
        } catch (e) {
            toast.error(e.message || 'Internal Error Server')
        }
    }

    // 5. Excel 
    const exportToExcel = () => {
        let dataToExport = [];

        // Iteramos por cada mes que tengamos cargado en el estado
        Object.entries(datosPorMes).forEach(([mesNum, dataMes]) => {
            const nombreMes = MESES[parseInt(mesNum) - 1];

            // 1. Procesar Ingresos Automáticos (Estructura: Sede -> Niveles)
            // Como 'data.data' del endpoint viene estructurado como:
            // { Sede: { niveles: { Nivel: { ingresos: [...] } } } }
            // Vamos a reconstruir el detalle desde el objeto original de la respuesta
            // (Nota: Si tu `datosPorMes` ya está procesado, ajustaremos para leer eso)

            // Si usas el estado 'datosPorMes', accedemos a la estructura que ya procesaste:
            if (dataMes.ingresosConsolidados) {
                dataMes.ingresosConsolidados.forEach(item => {
                    // Fila principal de la Sede
                    dataToExport.push({
                        "AÑO": filtroAnio,
                        "MES": nombreMes,
                        "SEDE": item.sede,
                        "NIVEL": "TOTAL SEDE",
                        "CONCEPTO": "TOTAL ACUMULADO",
                        "CANTIDAD PAGOS": item.cantidad,
                        "TOTAL FTE": item.fteTotal,
                        "MONTO (S/)": parseFloat(item.monto)
                    });

                    // Filas detalladas por nivel (dentro de la misma sede)
                    if (item.detallesRender) {
                        item.detallesRender.forEach(det => {
                            dataToExport.push({
                                "AÑO": filtroAnio,
                                "MES": nombreMes,
                                "SEDE": item.sede,
                                "NIVEL": det.nivel,
                                "CONCEPTO": `DESGLOSE: ${det.nivel}`,
                                "CANTIDAD PAGOS": det.cantidad,
                                "TOTAL FTE": det.fte,
                                "MONTO (S/)": "" // El monto total ya está arriba
                            });
                        });
                    }
                });
            }

            // 2. Ingresos Manuales y Egresos (Mantenemos tu lógica existente)
            if (dataMes.ingresosManuales) {
                dataMes.ingresosManuales.forEach(ing => {
                    dataToExport.push({
                        "AÑO": filtroAnio,
                        "MES": nombreMes,
                        "SEDE": ing.sede,
                        "NIVEL": "N/A",
                        "CONCEPTO": ing.concepto,
                        "CANTIDAD PAGOS": 1,
                        "TOTAL FTE": 0,
                        "MONTO (S/)": parseFloat(ing.monto)
                    });
                });
            }

            if (dataMes.egresos) {
                dataMes.egresos.forEach(egr => {
                    dataToExport.push({
                        "AÑO": filtroAnio,
                        "MES": nombreMes,
                        "SEDE": egr.sede,
                        "NIVEL": "N/A",
                        "CONCEPTO": egr.concepto,
                        "CANTIDAD PAGOS": 1,
                        "TOTAL FTE": 0,
                        "MONTO (S/)": -Math.abs(parseFloat(egr.monto))
                    });
                });
            }
        });

        if (dataToExport.length === 0) return toast.error("No hay datos para exportar.");

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Resumen ${filtroAnio}`);
        XLSX.writeFile(workbook, `Resumen_Financiero_${filtroAnio}.xlsx`);
    };

    // Objeto memoizado
    const tableProps = useMemo(() => ({
        sedes, inlineEditId, inlineData, setInlineData, submitting, saveInlineEdit,
        setInlineEditId, startInlineEdit, addingMonth, addingType, newData,
        setNewData, startAddNew, saveNewMovimiento, setAddingMonth, setAddingType, movimientoDelete
    }), [sedes, inlineEditId, inlineData, submitting, addingMonth, addingType, newData]);

    return (
        <div className="space-y-6 animate-fade-in-up p-2 max-w-[1400px] mx-auto">
            {/* Header del Admin */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-8 w-1.5 bg-[#f97316] rounded-full"></div>
                        <h1 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight italic">
                            Libro Diario <span className="text-[#f97316]">Mensual</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-70 ml-4">
                        Control de caja y reportes financieros por sede
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-3 py-1.5 shadow-sm hover:border-orange-300 transition-colors">
                        <Calendar size={14} className="text-slate-400" />
                        <select
                            value={filtroAnio}
                            onChange={(e) => setFiltroAnio(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black uppercase text-[#0f172a] outline-none cursor-pointer py-2 pl-2 pr-4 focus:ring-0"
                        >
                            <option value="2024">Año 2024</option>
                            <option value="2025">Año 2025</option>
                            <option value="2026">Año 2026</option>
                            <option value="2027">Año 2027</option>
                        </select>
                    </div>

                    <button onClick={exportToExcel} className="bg-[#f97316] hover:bg-orange-600 text-white px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2">
                        <FileSpreadsheet size={16} /> Descargar Excel
                    </button>
                </div>
            </div>

            {/* Listado de Meses */}
            <div className="space-y-3">
                {MESES.map((nombre, index) => (
                    <MonthAccordion
                        key={index + 1}
                        mesNum={index + 1}
                        mesNombre={nombre}
                        isOpen={mesesAbiertos.includes(index + 1)}
                        isLoading={loadingMeses[index + 1]}
                        toggleMes={toggleMes}
                        datosMes={datosPorMes[index + 1]}
                        tableProps={tableProps}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminCashFlow;