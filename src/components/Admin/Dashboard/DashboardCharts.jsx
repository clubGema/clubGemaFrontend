import React, { useState, useMemo, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';

const CHART_COLORS = ['#1e3a8a', '#f97316', '#3b82f6', '#94a3b8', '#cbd5e1', '#facc15'];

const DashboardCharts = ({ chartData, selectedYear, setSelectedYear, availableYears }) => {
    // 1. ESTADOS DEL COMPONENTE
    const [sedeSeleccionada, setSedeSeleccionada] = useState([]);
    const [nivelesSeleccionados, setNivelesSeleccionados] = useState([]); // <- AGREGADO

    // 2. OBTENER NIVELES ÚNICOS
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

    // 3. SELECCIONAR TODOS LOS NIVELES POR DEFECTO AL CARGAR LA DATA
    useEffect(() => {
        if (nivelesUnicos.length > 0) {
            setNivelesSeleccionados(nivelesUnicos);
        }
    }, [nivelesUnicos]);

    // 4. FUNCIONES DE TOGGLE (AHORA DENTRO DEL COMPONENTE)
    const toggleSede = (sede) => {
        setSedeSeleccionada(prev =>
            prev.includes(sede) ? prev.filter(s => s !== sede) : [...prev, sede]
        );
    };

    const toggleNivel = (nivel) => {
        setNivelesSeleccionados(prev =>
            prev.includes(nivel) ? prev.filter(n => n !== nivel) : [...prev, nivel]
        );
    };

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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
                    {/* CABECERA Y FILTROS */}
                    <div className="mb-8 flex flex-col gap-6">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div> Niveles x Sede
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Distribución Académica General</p>
                        </div>

                        {/* CONTENEDORES DE FILTROS ORGANICOS */}
                        <div className="flex flex-col md:flex-row gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">

                            {/* FILTRO DE NIVELES */}
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Filtrar Niveles</p>
                                <div className="flex flex-wrap gap-2">
                                    {nivelesUnicos.map((nivel, idx) => {
                                        const isSelected = nivelesSeleccionados.includes(nivel);
                                        return (
                                            <button
                                                key={nivel}
                                                onClick={() => toggleNivel(nivel)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected
                                                    ? 'bg-[#1e3a8a] text-white shadow-md'
                                                    : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'
                                                    }`}
                                            >
                                                {nivel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* FILTRO DE SEDES */}
                            <div className="flex-[2]">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Filtrar Sedes</p>
                                    {sedeSeleccionada.length > 0 && (
                                        <button onClick={() => setSedeSeleccionada([])} className="text-[9px] font-bold text-teal-600 hover:text-teal-700 underline">
                                            Limpiar filtros
                                        </button>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                                    {(chartData?.vigentesPorSedeNivel || []).map(item => {
                                        const isSelected = sedeSeleccionada.length === 0 || sedeSeleccionada.includes(item.sede);
                                        return (
                                            <label
                                                key={item.sede}
                                                className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors select-none ${isSelected
                                                    ? 'bg-teal-50 border-teal-200 text-teal-800'
                                                    : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                                                    } border`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleSede(item.sede)}
                                                    className="hidden"
                                                />
                                                {item.sede}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRÁFICO */}
                    <div style={{ width: '100%', height: 380 }}>
                        {chartData.vigentesPorSedeNivel?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                                <BarChart
                                    data={sedeSeleccionada.length > 0
                                        ? chartData.vigentesPorSedeNivel.filter(s => sedeSeleccionada.includes(s.sede))
                                        : chartData.vigentesPorSedeNivel}
                                    // Redujimos el bottom porque ahora el XAxis controlará su propio espacio
                                    margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="sede"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }}
                                        angle={-45}
                                        textAnchor="end"
                                        interval={0}
                                        dx={-5}        // NUEVO: Lo mueve ligeramente a la izquierda
                                        dy={5}         // NUEVO: Lo baja solo un poquito
                                        height={90}    // NUEVO: ¡El truco maestro! Reserva 90px de alto solo para los textos inclinados
                                    />
                                    <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} />

                                    <Legend
                                        iconType="circle"
                                        verticalAlign="bottom" // NUEVO: Obliga a la leyenda a estar abajo de todo
                                        wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }}
                                    />

                                    {nivelesUnicos
                                        .filter(nivel => nivelesSeleccionados.includes(nivel))
                                        .map((nivel, idx) => (
                                            <Bar
                                                key={nivel}
                                                dataKey={nivel}
                                                name={nivel}
                                                stackId="a"
                                                fill={CHART_COLORS[idx % CHART_COLORS.length]}
                                                radius={[0, 0, 0, 0]}
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
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
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