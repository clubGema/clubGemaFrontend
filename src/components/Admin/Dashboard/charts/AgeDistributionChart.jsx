import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import InfoTip from '../../../shared/InfoTip';
import { CHART_COLORS } from './chartColors';
import { BRAND_COLORS } from "../../../../config/themeColors.js";
import ChartHeader from '../../../shared/ChartHeader';

const AgeDistributionChart = ({ alumnosEdades }) => (
    <div className="lg:col-span-2 bg-brand-surface rounded-[2.5rem] border border-brand-border-soft shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
        <div className="mb-8">
            <ChartHeader
                barClassName="w-1.5 h-6 bg-emerald-500 rounded-full"
                title="Rangos de Edad"
                subtitle="Métricas de Crecimiento (Histórico Físico)"
            >
                <InfoTip
                    text="Este gráfico es histórico: incluye a TODOS los alumnos que alguna vez se registraron (activos e inactivos), no solo a los activos hoy. Úsalo para entender el perfil general del club, no el volumen actual."
                />
            </ChartHeader>
        </div>
        <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                <BarChart data={alumnosEdades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={BRAND_COLORS['border-soft']} />
                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: BRAND_COLORS.muted, fontWeight: 'bold' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} width={50} tick={{ fontSize: 10, fill: BRAND_COLORS.muted, fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: BRAND_COLORS.bg }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Histórico']} />
                    <Bar dataKey="count" fill={BRAND_COLORS.primary} radius={[8, 8, 0, 0]} barSize={60}>
                        {alumnosEdades.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {alumnosEdades.map((item, idx) => (
                <div key={idx} className="bg-brand-bg p-4 rounded-2xl border border-brand-border-soft flex flex-col items-center justify-center shadow-sm">
                    <span className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">{item.range} años</span>
                    <span className="text-xl font-black text-brand-primary">{item.count}</span>
                </div>
            ))}
        </div>
    </div>
);

export default AgeDistributionChart;
