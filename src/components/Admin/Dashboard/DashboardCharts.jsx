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

            {/* GRID PRINCIPAL DE 3 COLUMNAS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* ================= FILA 1 ================= */}
                
                {/* 1. FLUJO DE CAJA (2 COLUMNAS) */}
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

                {/* 2. OCUPACIÓN (1 COLUMNA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
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
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight truncate max-w-[120px]">{sede.nombre}</span>
                                </div>
                                <span className="font-black text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">{sede.valor}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= FILA 2 ================= */}

                {/* 3. EVOLUCIÓN DE ALUMNOS ACTIVOS (2 COLUMNAS) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Alumnos Activos
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Evolución mensual durante el año</p>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        {chartData.activosPorMes?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData.activosPorMes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="mes"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                        dy={10}
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={60} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip
                                        cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value} alumnos`, 'Activos']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '10px' }} />

                                    <Line 
                                        type="monotone" 
                                        dataKey="activos" 
                                        name="Total de Alumnos Activos" 
                                        stroke="#6366f1" 
                                        strokeWidth={4} 
                                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} 
                                        activeDot={{ r: 7, stroke: '#fff', strokeWidth: 2 }} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                Datos no disponibles
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. GÉNERO ALUMNOS (1 COLUMNA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
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
                    <div className="mt-8 space-y-4">
                        {chartData.alumnosGenero.map((g, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight">{g.nombre}</span>
                                </div>
                                <span className="font-black text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-lg">{g.valor}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= FILA 3 ================= */}

                {/* 5. NIVELES POR SEDE (3 COLUMNAS - ANCHO COMPLETO) */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div> Niveles x Sede
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Distribución Académica General</p>
                        </div>

                        {/* SELECT MULTIPLE DE SEDES */}
                        <div className="relative">
                            <select
                                multiple
                                className="text-[10px] font-bold text-[#1e3a8a] bg-slate-50 border border-slate-200 rounded-xl p-2 w-full md:w-64 h-20 outline-none focus:border-teal-500 transition-colors shadow-sm"
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setSedeSeleccionada(values.length === 0 ? [] : values);
                                }}
                            >
                                {(chartData?.vigentesPorSedeNivel || []).map(item => (
                                    <option key={item.sede} value={item.sede} className="py-1 px-2 mb-1 rounded hover:bg-teal-50 cursor-pointer">
                                        {item.sede}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[8px] text-slate-400 absolute -bottom-4 right-1 italic">Ctrl / Cmd para selección múltiple</p>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 320 }}>
                        {chartData.vigentesPorSedeNivel?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sedeSeleccionada.length > 0
                                        ? chartData.vigentesPorSedeNivel.filter(s => sedeSeleccionada.includes(s.sede))
                                        : chartData.vigentesPorSedeNivel}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="sede" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} 
                                        dy={15} 
                                        angle={-15} 
                                        textAnchor="end"
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} />

                                    {nivelesUnicos.map((nivel, idx) => (
                                        <Bar
                                            key={nivel}
                                            dataKey={nivel}
                                            name={nivel}
                                            stackId="a"
                                            fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                            radius={idx === nivelesUnicos.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                            barSize={40}
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

                {/* ================= FILA 4 ================= */}

                {/* 6. DISTRIBUCIÓN POR EDADES (2 COLUMNAS) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-8">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Rangos de Edad
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Métricas de Crecimiento</p>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData.alumnosEdades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} width={50} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Edades']} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={50}>
                                    {chartData.alumnosEdades.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {chartData.alumnosEdades.map((item, idx) => (
                            <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{item.range} años</span>
                                <span className="text-xl font-black text-[#1e3a8a]">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 7. RECAUDACIÓN (1 COLUMNA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-orange-500 rounded-full"></div> Recaudación
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Canales de Pago</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        {chartData.metodosPago.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.metodosPago} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="nombre" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} 
                                        dy={15} 
                                        angle={-25} 
                                        textAnchor="end" 
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={60} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(val) => val === 0 ? 'S/ 0' : `S/ ${val.toLocaleString()}`} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`S/ ${value.toLocaleString()}`, 'Total Recaudado']} />
                                    <Bar dataKey="monto" radius={[6, 6, 0, 0]} barSize={35}>
                                        {chartData.metodosPago.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#1e3a8a' : index === 1 ? '#f97316' : CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center p-4">
                                No hay pagos registrados
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DashboardCharts;