import React, { useEffect, useState } from 'react';
import { roleData } from '../data/mockDashboard';
import { apiFetch } from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import * as XLSX from 'xlsx-js-style';
import toast from 'react-hot-toast';
import { Activity } from 'lucide-react';

import StatCard from '../components/Admin/Dashboard/StatCard';
import DashboardHeader from '../components/Admin/Dashboard/DashboardHeader';
import DashboardCharts from '../components/Admin/Dashboard/DashboardCharts';
import DashboardOperations from '../components/Admin/Dashboard/DashboardOperations';

const MAPA_METODOS = {
    1: 'YAPE', 2: 'PLIN', 3: 'TRANSFERENCIA', 4: 'EFECTIVO'
};

const Dashboard = ({ role = 'student' }) => {
    const data = roleData[role];
    const [stats, setStats] = useState(data?.stats || []);
    const [actividad, setActividad] = useState(data?.activity || []);
    const [isExporting, setIsExporting] = useState(false);

    const [rawPagos, setRawPagos] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [availableYears, setAvailableYears] = useState([]);
    const [reporteMaestro, setReporteMaestro] = useState([]);

    // ESTADO PARA EXPORTACIÓN: Contendrá los datos que el usuario visualiza
    const [reporteFiltrado, setReporteFiltrado] = useState([]);

    const [chartData, setChartData] = useState({
        ingresos: [], sedes: [], metodosPago: [], alumnosGenero: [], alumnosEdades: [], totalAlumnos: 0
    });

    // Sincronizar reporte filtrado cuando carga el maestro
    useEffect(() => {
        setReporteFiltrado(reporteMaestro);
    }, [reporteMaestro]);

    const generarAñoCompleto = (año) => {
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
        return meses.map((mes, idx) => ({ monthIndex: idx, year: año, mes, ingresos: 0 }));
    };

    useEffect(() => {
        const fetchMovimientos = async () => {
            try {
                // 1. Armamos el rango basado en el año seleccionado en tu UI
                const fechaInicio = `${selectedYear}-01-01`;
                const fechaFin = `${selectedYear}-12-31`;

                // 2. Adjuntamos las fechas a la URL
                const url = `${API_ROUTES.USUARIOS.MOVIMIENTOS}?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;

                const response = await apiFetch.get(url);
                const result = await response.json();

                if (result.success) {
                    setReporteMaestro(result.data.reporte);
                }
            } catch (error) {
                console.error("Error cargando reporte:", error);
            }
        };

        fetchMovimientos();
    }, [selectedYear]); // <-- 3. SUPER IMPORTANTE: Agregar selectedYear como dependencia

    useEffect(() => {
        if (role === 'admin') {
            const fetchDashboardData = async () => {
                try {
                    const [resStats, resPagos, resOcupacion, resGraficos] = await Promise.all([
                        apiFetch.get(API_ROUTES.USUARIOS.STATS),
                        apiFetch.get(API_ROUTES.PAGOS.BASE),
                        apiFetch.get(API_ROUTES.SEDES.OCUPACION),
                        apiFetch.get(API_ROUTES.USUARIOS.GRAFICOS_AVANZADOS)
                    ]);

                    const extractArray = (json) => Array.isArray(json?.data?.data) ? json.data.data : (Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []));

                    // --- AQUÍ ESTABA EL FALLO: Extraemos los datos del response antes de usarlos ---
                    const graficosJson = resGraficos.ok ? await resGraficos.json() : {};
                    const dataGraficos = graficosJson.data || {};
                    // ------------------------------------------------------------------------------

                    const resultStats = resStats.ok ? await resStats.json() : {};
                    if (resStats.ok && resultStats.data) {
                        // ... (tu lógica de stats se mantiene igual)
                        const d = resultStats.data;
                        setStats(prevStats => prevStats.map(stat => {
                            switch (stat.id) {
                                case "alumnos": return { ...stat, value: (d.alumno || 0).toString() };
                                case "coordinadores": return { ...stat, value: (d.coordinador || 0).toString() };
                                case "sedes": return { ...stat, value: (d.sedes || 0).toString() };
                                case "pendientes": return { ...stat, value: `S/ ${d.deudaPendiente || '0.00'}` };
                                default: return stat;
                            }
                        }));
                        if (d.actividadReciente) setActividad(d.actividadReciente);
                    }

                    const ocupacionJson = resOcupacion.ok ? await resOcupacion.json() : {};
                    let distribucionSedes = extractArray(ocupacionJson);
                    const alumnosActivosTotales = distribucionSedes.reduce((acc, curr) => acc + (curr.valor === 1 && curr.nombre === 'Sin Datos' ? 0 : curr.valor), 0);

                    const pagosJson = resPagos.ok ? await resPagos.json() : {};
                    const dPagos = extractArray(pagosJson);
                    const años = new Set();
                    dPagos.forEach(p => { if (p.fecha_pago) años.add(new Date(p.fecha_pago).getFullYear()); });
                    const arrayAños = Array.from(años).sort((a, b) => b - a);
                    if (arrayAños.length === 0) arrayAños.push(new Date().getFullYear());

                    setAvailableYears(arrayAños);
                    setRawPagos(dPagos);

                    const genderStats = resultStats.data?.alumnosGenero || {};
                    const genderData = [{ nombre: 'Femenino', valor: genderStats.F || 0, color: '#f97316' }, { nombre: 'Masculino', valor: genderStats.M || 0, color: '#1e3a8a' }].filter(g => g.valor > 0);

                    // Ahora dataGraficos ya está definida y funciona aquí:
                    setChartData(prev => ({
                        ...prev,
                        sedes: distribucionSedes,
                        totalAlumnos: alumnosActivosTotales,
                        alumnosGenero: genderData,
                        alumnosEdades: resultStats.data?.alumnosEdades || [],
                        vigentesPorSedeNivel: dataGraficos.vigentesPorSedeNivel || [],
                        ingresosVsDeserciones: dataGraficos.ingresosVsDeserciones || []
                    }));
                } catch (error) {
                    console.error("Error analíticas:", error);
                }
            };
            fetchDashboardData();
        } else {
            setStats(data?.stats || []);
        }
    }, [role, data]);

    useEffect(() => {
        if (rawPagos.length === 0) return;
        const historialAnual = generarAñoCompleto(selectedYear);
        const metodosData = {};
        rawPagos.forEach(pago => {
            if (pago.estado_validacion === 'APROBADO' && pago.fecha_pago) {
                const datePago = new Date(pago.fecha_pago);
                const monto = parseFloat(pago.monto_pagado) || 0;
                if (datePago.getFullYear() === selectedYear) {
                    const mesIndex = datePago.getMonth();
                    historialAnual[mesIndex].ingresos += monto;
                    let nombreMetodo = pago.metodos_pago?.nombre ? pago.metodos_pago.nombre.toUpperCase() : MAPA_METODOS[pago.metodo_pago_id] || 'OTROS';
                    metodosData[nombreMetodo] = (metodosData[nombreMetodo] || 0) + monto;
                }
            }
        });
        setChartData(prev => ({ ...prev, ingresos: historialAnual, metodosPago: Object.keys(metodosData).map(key => ({ nombre: key, monto: metodosData[key] })).filter(item => item.monto > 0).sort((a, b) => b.monto - a.monto) }));
    }, [rawPagos, selectedYear]);

    const handleExportExcel = () => {
        // Usamos el estado recién creado
        const reportData = reporteFiltrado;

        if (!reportData || reportData.length === 0) {
            toast.error("No hay datos para exportar");
            return;
        }

        try {
            setIsExporting(true);
            const workbook = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(reportData);

            // Configuración de estilo y columnas
            ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 20 }, { wch: 30 }];

            XLSX.utils.book_append_sheet(workbook, ws, "Reporte_Maestro");
            XLSX.writeFile(workbook, `Reporte_Maestro_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Excel exportado exitosamente");
        } catch (error) {
            console.error("Error al exportar:", error);
            toast.error("Error al generar el archivo");
        } finally {
            setIsExporting(false);
        }
    };

    if (!data) return <div className="flex h-96 items-center justify-center">Cargando...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 animate-fade-in">
            <DashboardHeader />
            <div className="mb-14">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-orange-500" size={20} />
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Resumen Ejecutivo</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                    {stats.map((stat, index) => <StatCard key={index} {...stat} />)}
                </div>
            </div>
            <DashboardCharts chartData={chartData} selectedYear={selectedYear} setSelectedYear={setSelectedYear} availableYears={availableYears} />
            <DashboardOperations
                actividad={actividad}
                data={data}
                reporte={reporteMaestro}
                setReporteFiltrado={setReporteFiltrado} // Pasamos el setter para que el componente hijo actualice el estado
                handleExportExcel={handleExportExcel}
                isExporting={isExporting}
            />
        </div>
    );
};

export default Dashboard;