import React, { useState, useMemo, useEffect } from 'react';
import { CalendarDays, Info } from 'lucide-react';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, LineChart, Line
} from 'recharts';

const CHART_COLORS = ['#1e3a8a', '#f97316', '#3b82f6', '#94a3b8', '#cbd5e1', '#facc15'];

// 🆕 Componente reutilizable: icono "i" con tooltip al hacer hover/tap.
// No agrega dependencias nuevas, solo Tailwind + estado local.
const InfoTip = ({ text, width = 'w-64' }) => (
    <div className="relative inline-flex group">
        <button
            type="button"
            aria-label="Más información"
            className="text-slate-300 hover:text-[#1e3a8a] transition-colors focus:outline-none"
        >
            <Info size={14} strokeWidth={2.5} />
        </button>
        <div
            className={`pointer-events-none absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 ${width}
                        bg-slate-800 text-white text-[11px] font-semibold leading-snug rounded-xl px-3 py-2
                        opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity
                        shadow-lg normal-case tracking-normal`}
        >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
    </div>
);

const DashboardCharts = ({ chartData, selectedYear, setSelectedYear, availableYears }) => {
    // 1. ESTADOS DEL COMPONENTE
    const [sedeSeleccionada, setSedeSeleccionada] = useState([]);
    const [nivelesSeleccionados, setNivelesSeleccionados] = useState([]);

    // 2. MERGE DE DATOS
    const tendenciaCombinada = useMemo(() => {
        if (!chartData.activosPorMes || chartData.activosPorMes.length === 0) return [];
        return chartData.activosPorMes.map((item) => ({
            mes: item.mes,
            ftes: item.activos || 0,
            fisicos: item.fisicos || 0
        }));
    }, [chartData.activosPorMes]);

    // 🆕 ¿Cuál es el mes actual? Lo usamos para avisar que ese dato es parcial/vivo.
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const esAñoActual = selectedYear === new Date().getFullYear();
    const mesActualLabel = esAñoActual ? nombresMeses[new Date().getMonth()] : null;

    // 3. OBTENER NIVELES ÚNICOS
    const nivelesUnicos = useMemo(() => {
        if (!chartData?.vigentesPorSedeNivel) return [];
        const niveles = new Set();
        chartData.vigentesPorSedeNivel.forEach(item => {
            Object.keys(item).forEach(key => {
                if (key !== 'sede' && !key.includes('_')) niveles.add(key);
            });
        });
        return Array.from(niveles);
    }, [chartData?.vigentesPorSedeNivel]);

    useEffect(() => {
        if (nivelesUnicos.length > 0) {
            setNivelesSeleccionados(nivelesUnicos);
        }
    }, [nivelesUnicos]);

    const toggleSede = (sede) => {
        setSedeSeleccionada(prev => prev.includes(sede) ? prev.filter(s => s !== sede) : [...prev, sede]);
    };

    const toggleNivel = (nivel) => {
        setNivelesSeleccionados(prev => prev.includes(nivel) ? prev.filter(n => n !== nivel) : [...prev, nivel]);
    };

    // Tooltip personalizado exclusivo para la línea de FTE
    const CustomFteTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const fisicos = payload[0].payload.fisicos || 0;
            const esParcial = label === mesActualLabel;
            return (
                <div className="bg-white p-3 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-100 max-w-[220px]">
                    <p className="font-bold text-slate-600 mb-2 border-b border-slate-100 pb-1">
                        {label} {selectedYear}
                        {fisicos > 0 && <span className="ml-2 text-indigo-500 font-black text-[10px]">({fisicos} alumnos)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: '#6366f1' }}></div>
                        <span className="text-slate-500 uppercase font-bold">FTE Total:</span>
                        <span className="font-black text-slate-800">{payload[0].value}</span>
                    </div>
                    {esParcial && (
                        <p className="text-[10px] text-orange-500 font-bold mt-1.5 leading-snug">
                            Mes en curso: incluye a todo alumno activo en algún día de {label}, aunque hoy ya no lo esté.
                        </p>
                    )}
                </div>
            );
        }
        return null;
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

                {/* 1. GRÁFICO MAESTRO: LÍNEA FTE (2 COLUMNAS) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col relative z-20">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div> Volumen Activo (FTE)
                                <InfoTip
                                    width="w-72"
                                    text="FTE = Full-Time Equivalent. Cada horario semanal de un alumno equivale a 0.5 FTE (2 horarios = 1.0 FTE). El mes en curso es parcial: cuenta a quien estuvo activo en cualquier día del mes, aunque hoy ya no lo esté — por eso puede diferir un poco del contador de 'Alumnos Activos' de arriba, que es la foto de hoy."
                                />
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Evolución de Full-Time Equivalents (1 Horario = 0.5 FTE)</p>
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
                    {mesActualLabel && (
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wide mb-3 -mt-3 ml-3.5">
                            * {mesActualLabel} es mes en curso — dato parcial, puede variar hasta fin de mes.
                        </p>
                    )}
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <LineChart data={tendenciaCombinada} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} width={60} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />

                                <Tooltip content={<CustomFteTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />

                                <Line type="monotone" dataKey="ftes" name="Total FTEs (Equivalentes)" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 7, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. OCUPACIÓN (1 COLUMNA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Ocupación
                            <InfoTip
                                text="Cada alumno se cuenta una vez por sede en la que tiene clases activas hoy. Si está matriculado en 2+ sedes, la suma de las sedes será mayor al total real de alumnos — por eso mostramos el aviso de 'alumnos en 2+ sedes' abajo."
                            />
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Plazas Ocupadas por Sede (Hoy)</p>
                    </div>
                    <div style={{ width: '100%', height: 200, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <PieChart>
                                <Pie data={chartData.sedes} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="valor" nameKey="nombre" stroke="none">
                                    {chartData.sedes.map((entry, idx) => (<Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />))}
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
                            <span className="text-3xl font-black text-[#1e3a8a] italic leading-none">{chartData.totalAlumnos}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Plazas Ocupadas</span>
                            {/* Aviso de alumnos en más de una sede */}
                            {chartData.alumnosMultiSede > 0 && (
                                <span className="text-[9px] font-bold text-orange-500 uppercase mt-1 text-center leading-tight">
                                    {chartData.alumnosMultiSede} alumno{chartData.alumnosMultiSede > 1 ? 's' : ''} en 2+ sedes
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mt-8 space-y-3">
                        {chartData.sedes.map((sede, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight truncate max-w-[120px]">{sede.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">({sede.fte} FTE)</span>
                                    <span className="font-black text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-lg shrink-0">{sede.valor}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= FILA 2 ================= */}

                {/* 3. DISTRIBUCIÓN POR EDADES (2 COLUMNAS) */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
                    <div className="mb-8">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Rangos de Edad
                            <InfoTip
                                text="Este gráfico es histórico: incluye a TODOS los alumnos que alguna vez se registraron (activos e inactivos), no solo a los activos hoy. Úsalo para entender el perfil general del club, no el volumen actual."
                            />
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Métricas de Crecimiento (Histórico Físico)</p>
                    </div>
                    <div style={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <BarChart data={chartData.alumnosEdades} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 'bold' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} width={50} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`${value} alumnos`, 'Histórico']} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={60}>
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

                {/* 4. GÉNERO ALUMNOS (1 COLUMNA) */}
                <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
                    <div className="mb-6">
                        <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div> Alumnado Activo
                            <InfoTip
                                text="A diferencia del gráfico de Rangos de Edad, aquí SOLO se cuentan alumnos activos hoy (con clases vigentes). El número entre paréntesis es su equivalente en FTE."
                            />
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Segmentación por Género (Activos Hoy)</p>
                    </div>
                    <div style={{ width: '100%', height: 180, position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                            <PieChart>
                                <Pie data={chartData.alumnosGenero} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="valor" nameKey="nombre" stroke="none">
                                    {chartData.alumnosGenero.map((entry, idx) => {
                                        const sliceColor = entry.nombre === 'Sin Especificar' ? '#94a3b8' : entry.color;
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
                            <span className="text-3xl font-black text-[#1e3a8a] italic leading-none">{chartData.alumnosGenero.reduce((acc, curr) => acc + curr.valor, 0)}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Alumnos Totales</span>
                        </div>
                    </div>
                    <div className="mt-8 space-y-4">
                        {chartData.alumnosGenero.map((g, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: g.nombre === 'Sin Especificar' ? '#94a3b8' : g.color }}></div>
                                    <span className="text-slate-600 font-bold uppercase tracking-tight">{g.nombre}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400">({g.fte} FTE)</span>
                                    <span className="font-black text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-lg shrink-0">{g.valor}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ================= FILA 3 ================= */}

                {/* 5. NIVELES POR SEDE */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
                    <div className="mb-8 flex flex-col gap-6">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-teal-500 rounded-full"></div> Niveles x Sede (FTE)
                                <InfoTip
                                    text="Las barras muestran FTE (0.5 por horario), no alumnos físicos. Pasa el mouse sobre una barra para ver el equivalente en alumnos reales entre paréntesis."
                                />
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Distribución Académica en Equivalentes (Hoy)</p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Filtrar Niveles</p>
                                <div className="flex flex-wrap gap-2">
                                    {nivelesUnicos.map((nivel) => {
                                        const isSelected = nivelesSeleccionados.includes(nivel);
                                        return (
                                            <button
                                                key={nivel}
                                                onClick={() => toggleNivel(nivel)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isSelected ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                {nivel}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

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
                                                className={`flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors select-none ${isSelected ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'} border`}
                                            >
                                                <input type="checkbox" checked={isSelected} onChange={() => toggleSede(item.sede)} className="hidden" />
                                                {item.sede}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: '100%', height: 380 }}>
                        {chartData.vigentesPorSedeNivel?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                                <BarChart
                                    data={sedeSeleccionada.length > 0 ? chartData.vigentesPorSedeNivel.filter(s => sedeSeleccionada.includes(s.sede)) : chartData.vigentesPorSedeNivel}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="sede" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} angle={-45} textAnchor="end" interval={0} dx={-5} dy={5} height={90} />
                                    <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const fisicos = props.payload[`${name}_Fisicos`];
                                            return fisicos !== undefined ? [`${value} FTE (${fisicos} alumnos)`, name] : [`${value} FTE`, name];
                                        }}
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '10px' }} />

                                    {nivelesUnicos
                                        .filter(nivel => nivelesSeleccionados.includes(nivel))
                                        .map((nivel, idx) => (
                                            <Bar key={nivel} dataKey={nivel} name={nivel} stackId="a" fill={CHART_COLORS[idx % CHART_COLORS.length]} radius={[0, 0, 0, 0]} barSize={40} />
                                        ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold text-sm uppercase bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                Sin volumen activo
                            </div>
                        )}
                    </div>
                </div>

                {/* ================= FILA 4 ================= */}

                {/* 6. RECAUDACIÓN */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.03)] p-5 md:p-8 flex flex-col mt-6">
                    <div className="mb-6 flex justify-between items-start">
                        <div>
                            <h2 className="font-black text-[#1e3a8a] uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
                                <div className="w-1.5 h-6 bg-red-500 rounded-full"></div> Recaudación Anual
                                <InfoTip
                                    text="Solo suma pagos con estado APROBADO dentro del año seleccionado. Pagos pendientes de validación o rechazados no aparecen aquí."
                                />
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-3.5">Ingresos por Canales de Pago</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 350 }}>
                        {chartData.metodosPago.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%" minWidth={1}>
                                <BarChart data={chartData.metodosPago} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="nombre" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} dy={15} angle={-15} textAnchor="end" />
                                    <YAxis axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} tickFormatter={(val) => val === 0 ? 'S/ 0' : `S/ ${val.toLocaleString()}`} />
                                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(value) => [`S/ ${value.toLocaleString()}`, 'Total Recaudado']} />
                                    <Bar dataKey="monto" radius={[8, 8, 0, 0]} barSize={50}>
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
