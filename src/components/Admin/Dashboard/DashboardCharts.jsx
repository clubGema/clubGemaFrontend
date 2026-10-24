import React, { memo } from 'react';
import FteTrendChart from './charts/FteTrendChart';
import OccupancyChart from './charts/OccupancyChart';
import AgeDistributionChart from './charts/AgeDistributionChart';
import GenderChart from './charts/GenderChart';
import LevelsBySedeChart from './charts/LevelsBySedeChart';
import RevenueChart from './charts/RevenueChart';

const DashboardChartsBase = ({ chartData, selectedYear, setSelectedYear, availableYears }) => (
    <div className="mb-16 pt-8 border-t border-brand-border/60">
        <div className="mb-10">
            <h2 className="text-4xl font-black text-brand-primary uppercase tracking-tighter italic">
                Inteligencia <span className="text-brand-accent underline decoration-brand-accent/20 underline-offset-8">Financiera y Operativa</span>
            </h2>
            <p className="text-brand-muted text-xs font-black uppercase tracking-[0.2em] mt-3">
                Análisis de Resultados ({selectedYear})
            </p>
        </div>

        {/* GRID PRINCIPAL DE 3 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <FteTrendChart
                activosPorMes={chartData.activosPorMes}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                availableYears={availableYears}
            />
            <OccupancyChart
                sedes={chartData.sedes}
                totalAlumnos={chartData.totalAlumnos}
                alumnosMultiSede={chartData.alumnosMultiSede}
            />
            <AgeDistributionChart alumnosEdades={chartData.alumnosEdades} />
            <GenderChart alumnosGenero={chartData.alumnosGenero} />
            <LevelsBySedeChart vigentesPorSedeNivel={chartData.vigentesPorSedeNivel} />
            <RevenueChart metodosPago={chartData.metodosPago} />
        </div>
    </div>
);

// Memoizado: los 6 SVG de Recharts son lo mas caro de la pagina y antes se
// repintaban con cualquier re-render del Dashboard (por ejemplo al teclear en
// la celda de comentarios del Reporte Maestro).
export default memo(DashboardChartsBase);
