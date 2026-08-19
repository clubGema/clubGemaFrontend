import React from 'react';
import { motion } from 'framer-motion';
import { Clock, BarChart3 } from 'lucide-react';

const ALTURA_AREA_PX = 150; 

const AdminPaymentStats = ({ stats }) => {
    // Escala combinada (ingreso + egreso apilados)
    const scaleMax = Math.max(
        ...stats.chartData.map(d => (d.totalIngresos || 0) + (d.egresos || 0)),
        1
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* ⏳ CONTROL OPERATIVO */}
            <div className="md:col-span-1 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:border-orange-400 transition-all duration-300">
                <div className="p-4 bg-orange-100 text-orange-600 rounded-3xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
                    <Clock size={32} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Por Validar</p>
                    <h2 className="text-4xl font-black text-slate-900 italic tracking-tighter">
                        {stats.pendientes}
                    </h2>
                    <p className="text-[8px] font-bold text-orange-500 uppercase mt-1 italic">Tickets en espera</p>
                </div>
            </div>

            {/* 📊 ANÁLISIS DINÁMICO */}
            <div className="md:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group">

                {/* Header del Gráfico */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <BarChart3 size={18} className="text-[#1e3a8a]" />
                        </div>
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Análisis Mensual de Ingresos Reales</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-black text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full italic shadow-sm">
                            Pico: S/ {stats.maxRecaudacion.toFixed(0)}
                        </span>
                    </div>
                </div>

                {/* Área de Barras */}
                <div className="flex items-end gap-2 px-1 relative z-10" style={{ height: ALTURA_AREA_PX + 60 }}>
                    {stats.chartData.map((item, idx) => {
                        const ingresos = item.totalIngresos || 0;
                        const egresos = item.egresos || 0;
                        const hayDatos = ingresos > 0 || egresos > 0;

                        const alturaIngresoPx = ingresos > 0 ? Math.max((ingresos / scaleMax) * ALTURA_AREA_PX, 4) : 0;
                        const alturaEgresoPx = egresos > 0 ? Math.max((egresos / scaleMax) * ALTURA_AREA_PX, 4) : 0;

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center group/bar relative h-full justify-end">

                                {/* Montos siempre visibles arriba de la barra */}
                                <div className="mb-2 flex flex-col items-center justify-end h-10 gap-1 w-full relative z-20">
                                    {ingresos > 0 && (
                                        <span className="text-[9px] md:text-[10px] font-black text-[#1e3a8a] leading-none whitespace-nowrap">
                                            S/ {ingresos.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    )}
                                    {egresos > 0 && (
                                        <span className="text-[9px] md:text-[10px] font-bold text-red-500 leading-none whitespace-nowrap">
                                            -S/ {egresos.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </span>
                                    )}
                                </div>

                                {/* Tooltip Pro — 🔥 FIX: le faltaba left-1/2 -translate-x-1/2 para
                                    centrarse sobre su propia barra. Sin eso, quedaba anclado a la
                                    posición que tenía en el flujo normal antes de volverse absolute
                                    (pegado a la izquierda del contenedor), por eso se veía descuadrado
                                    al hacer hover — más notorio en barras con ambos valores (ingreso
                                    + egreso) como Agosto, donde además solapaba los montos vecinos. */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-10 opacity-0 group-hover/bar:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/bar:translate-y-0 bg-slate-900 text-white text-[10px] px-3 py-2 rounded-xl font-bold z-50 whitespace-nowrap shadow-xl border border-white/10 flex flex-col gap-1 pointer-events-none">
                                    <span className="text-blue-400">Pagos: S/ {(item.ingresosPagos || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <span className="text-slate-300 normal-case">Manual: S/ {(item.ingresosManuales || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>

                                {/* Barra Apilada */}
                                <div className="w-full flex flex-col-reverse items-stretch rounded-t-xl overflow-hidden shadow-sm transition-all group-hover/bar:brightness-110">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: alturaIngresoPx }}
                                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                                        className={`w-full ${ingresos > 0 ? 'bg-gradient-to-t from-[#1e3a8a] via-blue-600 to-blue-400' : 'bg-slate-50'} min-h-[4px]`}
                                    />
                                    {egresos > 0 && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: alturaEgresoPx }}
                                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                                            className="w-full bg-gradient-to-t from-red-600 via-red-500 to-red-400 border-b border-white/10"
                                        />
                                    )}
                                </div>

                                {/* Etiqueta del Mes */}
                                <span className={`text-[8px] md:text-[9px] font-black mt-3 uppercase tracking-wider transition-colors duration-300 ${hayDatos ? 'text-slate-700' : 'text-slate-400'}`}>
                                    {item.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Leyenda de colores */}
                <div className="flex items-center justify-center gap-6 mt-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-gradient-to-t from-[#1e3a8a] via-blue-600 to-blue-400 shadow-sm" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Ingresos</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md bg-gradient-to-t from-red-600 via-red-500 to-red-400 shadow-sm" />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide">Egresos</span>
                    </div>
                </div>

                {/* Marca de agua */}
                <BarChart3 className="absolute -right-6 -bottom-6 text-slate-50 opacity-50 pointer-events-none" size={150} />
            </div>
        </div>
    );
};

export default AdminPaymentStats;