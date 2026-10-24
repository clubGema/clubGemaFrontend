import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import InfoTip from '../../../shared/InfoTip';
import { BRAND_COLORS } from "../../../../config/themeColors.js";
import ChartHeader from '../../../shared/ChartHeader';

const GenderChart = ({ alumnosGenero }) => (
    <div className="lg:col-span-1 bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
        <div className="mb-6">
            <ChartHeader
                barClassName="w-1.5 h-6 bg-brand-primary rounded-full"
                title="Alumnado Activo"
                subtitle="Segmentación por Género (Activos Hoy)"
            >
                <InfoTip
                    text="A diferencia del gráfico de Rangos de Edad, aquí SOLO se cuentan alumnos activos hoy (con clases vigentes). El número entre paréntesis es su equivalente en FTE."
                />
            </ChartHeader>
        </div>
        <div style={{ width: '100%', height: 180, position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                <PieChart>
                    <Pie data={alumnosGenero} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="valor" nameKey="nombre" stroke="none">
                        {alumnosGenero.map((entry, idx) => {
                            const sliceColor = entry.nombre === 'Sin Especificar' ? BRAND_COLORS.muted : entry.color;
                            return <Cell key={idx} fill={sliceColor} />;
                        })}
                    </Pie>
                    <Tooltip
                        isAnimationActive={false}
                        wrapperStyle={{ zIndex: 100 }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value, name, props) => {
                            const fte = props.payload.fte;
                            return fte !== undefined ? [`${value} alumnos (${fte} FTE)`, 'Volumen'] : [`${value} alumnos`, 'Volumen'];
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-brand-primary italic leading-none">{alumnosGenero.reduce((acc, curr) => acc + curr.valor, 0)}</span>
                <span className="text-[10px] font-bold text-brand-muted uppercase">Alumnos Totales</span>
            </div>
        </div>
        <div className="mt-8 space-y-4">
            {alumnosGenero.map((g, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.nombre === 'Sin Especificar' ? BRAND_COLORS.muted : g.color }}></div>
                        <span className="text-slate-600 font-bold uppercase tracking-tight">{g.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-brand-muted">({g.fte} FTE)</span>
                        <span className="font-black text-brand-primary bg-brand-primary-soft px-3 py-1 rounded-lg shrink-0">{g.valor}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default GenderChart;
