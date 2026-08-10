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

const Dashboard = ({ role = 'student' }) => {
    const data = roleData[role];
    const [stats, setStats] = useState(data?.stats || []);
    const [actividad, setActividad] = useState(data?.activity || []);
    const [isExporting, setIsExporting] = useState(false);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

    const [reporteMaestro, setReporteMaestro] = useState([]);
    const [reporteFiltrado, setReporteFiltrado] = useState([]);

    const [chartData, setChartData] = useState({
        ingresos: [], sedes: [], metodosPago: [], alumnosGenero: [], alumnosEdades: [],
        totalAlumnos: 0, vigentesPorSedeNivel: [], activosPorMes: [],
        alumnosMultiSede: 0 // 🚩 NUEVO
    });

    useEffect(() => {
        setReporteFiltrado(reporteMaestro);
    }, [reporteMaestro]);

    useEffect(() => {
        const fetchMovimientos = async () => {
            try {
                const fechaInicio = `${selectedYear}-01-01`;
                const fechaFin = `${selectedYear}-12-31`;
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
    }, [selectedYear]);

    useEffect(() => {
        if (role === 'admin') {
            const fetchDashboardData = async () => {
                try {
                    const [resStats, resGraficos] = await Promise.all([
                        apiFetch.get(API_ROUTES.USUARIOS.STATS),
                        apiFetch.get(`${API_ROUTES.USUARIOS.GRAFICOS_AVANZADOS}?year=${selectedYear}`)
                    ]);

                    const resultStats = resStats.ok ? await resStats.json() : {};
                    const graficosJson = resGraficos.ok ? await resGraficos.json() : {};

                    const statsData = resultStats.data || {};
                    const dataGraficos = graficosJson.data || {};

                    setStats(prevStats => prevStats.map(stat => {
                        switch (stat.id) {
                            case "alumnos":
                                return {
                                    ...stat,
                                    title: "Alumnos Activos / FTE",
                                    value: `${statsData.alumnosFisicosActivos || 0} (${Number(statsData.alumno || statsData.alumnosFteActivos || 0).toFixed(1)})`
                                };
                            case "coordinadores": return { ...stat, value: (statsData.coordinador || 0).toString() };
                            case "sedes": return { ...stat, value: (statsData.sedes || 0).toString() };
                            case "pendientes": return { ...stat, value: `S/ ${statsData.deudaPendiente || '0.00'}` };
                            default: return stat;
                        }
                    }));

                    if (statsData.actividadReciente) setActividad(statsData.actividadReciente);

                    // 🔥 1. RESCATE DE GÉNEROS PERDIDOS (Añadimos "Sin Especificar" para que cuadre el FTE total)
                    // 🔥 1. GÉNEROS: USAMOS CABEZAS FÍSICAS COMO PRINCIPAL Y FTE COMO SECUNDARIO
                    const genderFisico = statsData.alumnosGenero?.activoFisico || {};
                    const genderFte = statsData.alumnosGenero?.activoFte || {};

                    const genderData = [
                        { nombre: 'Femenino', valor: genderFisico.F || 0, fte: genderFte.F || 0, color: '#f97316' },
                        { nombre: 'Masculino', valor: genderFisico.M || 0, fte: genderFte.M || 0, color: '#1e3a8a' },
                        { nombre: 'Sin Especificar', valor: genderFisico.NOCONF || 0, fte: genderFte.NOCONF || 0, color: '#94a3b8' }
                    ].filter(g => g.valor > 0 || g.fte > 0);

                    // 🔥 2. OCUPACIÓN BASADA EN CABEZAS FÍSICAS (Dejamos el FTE como extra)
                    const distribucionSedes = (dataGraficos.ocupacionSedes || []).map(s => ({
                        nombre: s.sede,
                        valor: s.fisicos, // El gráfico ahora usará alumnos físicos reales
                        fte: s.ftes       // Guardamos el FTE para mostrarlo en el texto chiquito
                    }));
                    const totalAlumnosFisicos = distribucionSedes.reduce((acc, curr) => acc + curr.valor, 0);

                    const tendencia = dataGraficos.tendenciaMensual || [];
                    const ingresosMensuales = tendencia.map(t => ({ mes: t.mes, ingresos: t.ingresos }));
                    const ftesMensuales = tendencia.map(t => ({ mes: t.mes, activos: t.ftes, fisicos: t.fisicos }));

                    setChartData(prev => ({
                        ...prev,
                        sedes: distribucionSedes,
                        totalAlumnos: totalAlumnosFisicos, // Centramos la cantidad de alumnos
                        alumnosGenero: genderData,
                        alumnosEdades: statsData.alumnosEdades || [],
                        vigentesPorSedeNivel: dataGraficos.nivelesSedes || [],
                        activosPorMes: ftesMensuales,
                        ingresos: ingresosMensuales,
                        metodosPago: dataGraficos.recaudacionMetodos || [],
                        alumnosMultiSede: dataGraficos.alumnosMultiSede || 0 // 🚩 NUEVO
                    }));

                } catch (error) {
                    console.error("Error analíticas:", error);
                }
            };
            fetchDashboardData();
        } else {
            setStats(data?.stats || []);
        }
    }, [role, data, selectedYear]);

    const handleExportExcel = () => {
        const reportData = reporteFiltrado;
        if (!reportData || reportData.length === 0) {
            toast.error("No hay datos para exportar");
            return;
        }
        try {
            setIsExporting(true);
            const workbook = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(reportData);
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
                setReporteFiltrado={setReporteFiltrado}
                handleExportExcel={handleExportExcel}
                isExporting={isExporting}
            />
        </div>
    );
};

export default Dashboard;