import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import InfoTip from '../../../shared/InfoTip';
import { BRAND_COLORS } from "../../../../config/themeColors.js";
import ChartHeader from '../../../shared/ChartHeader';

const FteTrendChart = ({ activosPorMes, selectedYear, setSelectedYear, availableYears }) => {
    const tendenciaCombinada = useMemo(() => {
        if (!activosPorMes || activosPorMes.length === 0) return [];
        return activosPorMes.map((item) => ({
            mes: item.mes,
            ftes: item.activos || 0,
            fisicos: item.fisicos || 0
        }));
    }, [activosPorMes]);

    // ¿Cuál es el mes actual? Lo usamos para avisar que ese dato es parcial/vivo.
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const esAñoActual = selectedYear === new Date().getFullYear();
    const mesActualLabel = esAñoActual ? nombresMeses[new Date().getMonth()] : null;

    // Tooltip personalizado exclusivo para la línea de FTE
    const CustomFteTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const fisicos = payload[0].payload.fisicos || 0;
            const esParcial = label === mesActualLabel;
            return (
                <div className="bg-brand-surface p-3 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-brand-border-soft max-w-[220px]">
                    <p className="font-bold text-slate-600 mb-2 border-b border-brand-border-soft pb-1">
                        {label} {selectedYear}
                        {fisicos > 0 && <span className="ml-2 text-brand-primary font-black text-[10px]">({fisicos} alumnos)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#6366f1' }}></div>
                        <span className="text-slate-500 uppercase font-bold">FTE Total:</span>
                        <span className="font-black text-slate-800">{payload[0].value}</span>
                    </div>
                    {esParcial && (
                        <p className="text-[10px] text-brand-accent font-bold mt-1.5 leading-snug">
                            Mes en curso: incluye a todo alumno activo en algún día de {label}, aunque hoy ya no lo esté.
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="lg:col-span-2 bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col relative z-20">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <ChartHeader
                        barClassName="w-1.5 h-6 bg-brand-primary rounded-full"
                        title="Volumen Activo (FTE)"
                        subtitle="Evolución de Full-Time Equivalents (1 Horario = 0.5 FTE)"
                    >
                        <InfoTip
                            width="w-72"
                            text="FTE = Full-Time Equivalent. Cada horario semanal de un alumno equivale a 0.5 FTE (2 horarios = 1.0 FTE). El mes en curso es parcial: cuenta a quien estuvo activo en cualquier día del mes, aunque hoy ya no lo esté — por eso puede diferir un poco del contador de 'Alumnos Activos' de arriba, que es la foto de hoy."
                        />
                    </ChartHeader>
                </div>
                <div className="flex items-center bg-brand-bg border border-brand-border-soft rounded-xl px-3 py-2 cursor-pointer shadow-sm relative">
                    <CalendarDays size={16} className="text-brand-primary mr-2" />
                    <select
                        className="bg-transparent text-sm font-black text-brand-primary outline-none cursor-pointer appearance-none pr-4"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                    >
                        {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>
            {mesActualLabel && (
                <p className="text-[10px] text-brand-accent font-bold uppercase tracking-wide mb-3 -mt-3 ml-3.5">
                    * {mesActualLabel} es mes en curso — dato parcial, puede variar hasta fin de mes.
                </p>
            )}
            <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                    <LineChart data={tendenciaCombinada} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND_COLORS['border-soft']} />
                        <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: BRAND_COLORS.muted, fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} width={60} tick={{ fontSize: 10, fill: BRAND_COLORS.muted, fontWeight: 'bold' }} />

                        <Tooltip content={<CustomFteTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />

                        <Line type="monotone" dataKey="ftes" name="Total FTEs (Equivalentes)" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 7, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default FteTrendChart;
