import React from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { IncomeTable } from './IncomeTable';
import { ExpenseTable } from './ExpenseTable';

export const MonthAccordion = ({ 
    mesNum, mesNombre, isOpen, isLoading, toggleMes, datosMes, tableProps 
}) => {
    
    // Obtenemos los datos destructuring o fallback arrays vacíos
    const ingresosConsolidados = datosMes?.ingresosConsolidados || [];
    const ingresosManuales = datosMes?.ingresosManuales || [];
    const egresos = datosMes?.egresos || [];

    // Totales calculados
    const totalIng = 
        ingresosConsolidados.reduce((sum, item) => sum + parseFloat(item.monto), 0) + 
        ingresosManuales.reduce((sum, item) => sum + parseFloat(item.monto), 0);
        
    const totalEgr = egresos.reduce((sum, item) => sum + parseFloat(item.monto), 0);
    const balance = totalIng - totalEgr;

    return (
        <div className="mb-4 animate-fade-in-up">
            {/* --- ACORDEÓN HEADER --- */}
            <div 
                onClick={() => toggleMes(mesNum)}
                className={`bg-white border rounded-2xl px-6 py-5 cursor-pointer flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm transition-all duration-200 ${isOpen ? 'border-orange-500 shadow-md ring-1 ring-orange-500/20' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'}`}
            >
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                        {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                    <h2 className="text-[15px] font-black text-[#0f172a] uppercase tracking-widest flex items-center gap-2">
                        {mesNombre} 
                        {isLoading && <Loader2 size={14} className="animate-spin text-orange-500" />}
                    </h2>
                </div>
                
                <div className="flex w-full lg:w-auto justify-between lg:justify-end gap-6 lg:gap-12 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><TrendingUp size={10} className="text-green-500"/> Ingresos</span>
                        <span className="text-sm font-black text-slate-800">S/ {totalIng.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><TrendingDown size={10} className="text-orange-500"/> Egresos</span>
                        <span className="text-sm font-black text-slate-800">S/ {totalEgr.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1"><Activity size={10} className={balance >= 0 ? "text-[#0f172a]" : "text-red-500"}/> Balance</span>
                        <span className={`text-sm font-black ${balance >= 0 ? "text-[#0f172a]" : "text-red-600"}`}>S/ {balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO DESPLEGABLE (TABLAS) --- */}
            {isOpen && !isLoading && (
                <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-6 pl-4 pr-2 pb-4 border-l-2 border-orange-200 ml-4">
                    <IncomeTable 
                        mesNum={mesNum} 
                        ingresosConsolidados={ingresosConsolidados} 
                        ingresosManuales={ingresosManuales} 
                        {...tableProps} 
                    />
                    <ExpenseTable 
                        mesNum={mesNum} 
                        egresos={egresos} 
                        {...tableProps} 
                    />
                </div>
            )}
        </div>
    );
};