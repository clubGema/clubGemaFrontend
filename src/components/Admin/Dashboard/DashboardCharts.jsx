import React, { useState, useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

const CHART_COLORS = ['#1e3a8a', '#f97316', '#3b82f6', '#94a3b8', '#cbd5e1', '#facc15'];


const DashboardCharts = ({ chartData, selectedYear, setSelectedYear, availableYears }) => {
const [sedeSeleccionada, setSedeSeleccionada] = useState([]);
    // Función para obtener los niveles dinámicamente de la data del backend (Gráfico de Sedes x Nivel)
    const nivelesUnicos = useMemo(() => {
        if (!chartData?.vigentesPorSedeNivel) return [];
        const niveles = new Set();
        chartData.vigentesPorSedeNivel.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'sede') niveles.add(key);
            });
        });
        return Array.from(niveles);
    }, [chartData?.vigentesPorSedeNivel]);

    return (
        <div className="mb-16 pt-8 border-t border-slate-200/60">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-[#1e3a8a] uppercase tracking-tighter italic">
                    Inteligencia <span className="text-orange-500 underline decoration-orange-500/20 underline-offset-8">Financiera y Operativa</span>
                </h2>
                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mt-3">
                    Análisis de Resultados ({selectedYear})
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. FLUJO DE CAJA (LINEAL) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col relative z-20">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> Flujo de Caja Validado
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Ingresos Consolidados</p>
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 cursor-pointer shadow-sm relative">
                            <CalendarDays size={16} className="text-[#1e3a8a] mr-2" />
                            <select
                                className="bg-transparent text-sm font-black text-[#1e3a8a] outline-none cursor-pointer appearance-none pr-4"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                            >
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </select>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData.ingresos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(val) => val === 0 ? 'S/ 0' : `S/ ${val.toLocaleString()}`} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Area type="monotone" dataKey="ingresos" stroke="#1e3a8a" strokeWidth={4} fillOpacity={1} fill="url(#colorIng)" activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. OCUPACIÓN (DONA) */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Ocupación
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Distribución Estratégica</p>
                    </div>
                    <div style={{ width: '100%', height: 180, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData.sedes} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="valor" nameKey="nombre" stroke="none">
                                    {chartData.sedes.map((entry, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
                                </Pie>
                                <Tooltip isAnimationActive={false} wrapperStyle={{ zIndex: 100 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Asistencia']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-[#1e3a8a] italic leading-none">{chartData.totalAlumnos}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Totales</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {chartData.sedes.map((sede, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight">{sede.nombre}</span>
                                </div>
                                <span className="font-black text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-lg">{sede.valor}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. RECAUDACIÓN (BARRAS) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-4 lg:mt-0">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> Recaudación
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Canales de Pago</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        {chartData.metodosPago.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.metodosPago} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(val) => val === 0 ? 'S/ 0' : `S/ ${val.toLocaleString()}`} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`S/ ${value.toLocaleString()}`, 'Total Recaudado']} />
                                    <Bar dataKey="monto" radius={[10, 10, 0, 0]} barSize={40}>
                                        {chartData.metodosPago.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : index === 1 ? '#f97316' : CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                No hay pagos registrados para este periodo
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. GÉNERO ALUMNOS (PIE) */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-4 lg:mt-0">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Alumnado
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Segmentación por Género</p>
                    </div>
                    <div style={{ width: '100%', height: 180, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData.alumnosGenero} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="valor" nameKey="nombre" stroke="none">
                                    {chartData.alumnosGenero.map((entry, idx) => (<Cell key={idx} fill={entry.color} />))}
                                </Pie>
                                <Tooltip isAnimationActive={false} wrapperStyle={{ zIndex: 100 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Cantidad']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-[#1e3a8a] italic leading-none">{chartData.alumnosGenero.reduce((acc, curr) => acc + curr.valor, 0)}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {chartData.alumnosGenero.map((g, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight">{g.nombre}</span>
                                </div>
                                <span className="font-black text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-lg">{g.valor}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. DISTRIBUCIÓN POR EDADES (BARRAS) */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-4 lg:mt-4">
                    <div className="mb-8">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Rangos de Edad
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Métricas de Crecimiento</p>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.alumnosEdades} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Edades']} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={60}>
                                    {chartData.alumnosEdades.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {chartData.alumnosEdades.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.range} años</span>
                                <span className="text-xl font-black text-[#1e3a8a]">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 6. RETENCIÓN VS DESERCIÓN (LÍNEAS) - NUEVO */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-4 lg:mt-4">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div> Retención vs Deserción
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Métricas de los últimos 30 días</p>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        {chartData.ingresosVsDeserciones?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData.ingresosVsDeserciones} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="fecha"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                        dy={10}
                                        tickFormatter={(val) => {
                                            const parts = val.split('-');
                                            return `${parts[2]}/${parts[1]}`; // Muestra DD/MM
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={60} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />

                                    <Line type="monotone" dataKey="ingresos" name="Nuevos Ingresos" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                                    <Line type="monotone" dataKey="deserciones" name="Deserciones (>30 días)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                Datos no disponibles o insuficientes
                            </div>
                        )}
                    </div>
                </div>

                
                {/* 7. NIVELES POR SEDE (BARRAS APILADAS) CON FILTRO MULTIPLE */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-4 lg:mt-4">
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div> Niveles x Sede
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Distribución Académica</p>
                        </div>

                        {/* SELECT MULTIPLE DE SEDES */}
                        <select
                            multiple
                            className="text-[10px] font-bold text-[#1e3a8a] bg-slate-50 border border-slate-200 rounded-xl p-2 w-32 h-20 outline-none"
                            onChange={(e) => {
                                const values = Array.from(e.target.selectedOptions, option => option.value);
                                // Si seleccionan nada, reseteamos a mostrar todas
                                setSedeSeleccionada(values.length === 0 ? [] : values);
                            }}
                        >
                            {(chartData?.vigentesPorSedeNivel || []).map(item => (
                                <option key={item.sede} value={item.sede}>{item.sede}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ width: '100%', height: 260 }}>
                        {chartData.vigentesPorSedeNivel?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sedeSeleccionada.length > 0
                                        ? chartData.vigentesPorSedeNivel.filter(s => sedeSeleccionada.includes(s.sede))
                                        : chartData.vigentesPorSedeNivel}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="sede" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />

                                    {nivelesUnicos.map((nivel, idx) => (
                                        <Bar
                                            key={nivel}
                                            dataKey={nivel}
                                            name={nivel}
                                            stackId="a"
                                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                Sin alumnos activos
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardCharts;