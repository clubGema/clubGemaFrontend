import React, { memo, useMemo } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Activity, Loader2 } from 'lucide-react';
import { IncomeTable } from './IncomeTable';
import { ExpenseTable } from './ExpenseTable';
import { MerchRevenueBreakdown } from './MerchRevenueBreakdown';

const MonthAccordionBase = ({
    mesNum, mesNombre, isOpen, isLoading, toggleMes, datosMes, desgloseMes, totalesMes,
    acciones, submitting, inlineEditId, inlineData, addingType, newData
}) => {

    // Las filas se memoizan con el propio datosMes: con `|| []` suelto se creaban
    // arrays nuevas en cada render y cualquier useMemo que dependiera de ellas
    // quedaba inservible.
    const { ingresosConsolidados, ingresosManuales, egresos } = useMemo(() => ({
        ingresosConsolidados: datosMes?.ingresosConsolidados || [],
        ingresosManuales: datosMes?.ingresosManuales || [],
        egresos: datosMes?.egresos || [],
    }), [datosMes]);

    // Totales: cuando el detalle del mes está cargado se calculan desde él
    // (misma cifra que antes). Si el mes todavía no se ha abierto se usan los
    // agregados del resumen anual, que llegan en una sola petición.
    const { totalIng, totalEgr, balance } = useMemo(() => {
        if (datosMes) {
            const ing =
                (datosMes.ingresosConsolidados || []).reduce((sum, item) => sum + parseFloat(item.monto), 0) +
                (datosMes.ingresosManuales || []).reduce((sum, item) => sum + parseFloat(item.monto), 0);
            const egr = (datosMes.egresos || []).reduce((sum, item) => sum + parseFloat(item.monto), 0);
            return { totalIng: ing, totalEgr: egr, balance: ing - egr };
        }

        const ing = Number(totalesMes?.totalIngresos ?? 0);
        const egr = Number(totalesMes?.egresos ?? 0);
        return {
            totalIng: ing,
            totalEgr: egr,
            balance: totalesMes?.balance != null ? Number(totalesMes.balance) : ing - egr,
        };
    }, [datosMes, totalesMes]);

    return (
        <div className="mb-4 animate-fade-in-up">
            {/* --- ACORDEÓN HEADER --- */}
            <div
                onClick={() => toggleMes(mesNum)}
                className={`bg-brand-surface border rounded-2xl px-6 py-5 cursor-pointer flex flex-col lg:flex-row justify-between items-start lg:items-center shadow-sm transition-all duration-200 ${isOpen ? 'border-brand-accent shadow-md ring-1 ring-brand-accent/20' : 'border-brand-border hover:border-slate-300 hover:shadow-md'}`}
            >
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-brand-accent-soft text-brand-accent-dark' : 'bg-brand-surface-alt text-slate-500'}`}>
                        {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </div>
                    <h2 className="text-[15px] font-black text-brand-heading uppercase tracking-widest flex items-center gap-2">
                        {mesNombre}
                        {isLoading && <Loader2 size={14} className="animate-spin text-brand-accent" />}
                    </h2>
                </div>

                <div className="flex w-full lg:w-auto justify-between lg:justify-end gap-6 lg:gap-12 mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-brand-border-soft">
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-brand-muted tracking-widest flex items-center gap-1"><TrendingUp size={10} className="text-green-500"/> Ingresos</span>
                        <span className="text-sm font-black text-slate-800">S/ {totalIng.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-brand-muted tracking-widest flex items-center gap-1"><TrendingDown size={10} className="text-brand-accent"/> Egresos</span>
                        <span className="text-sm font-black text-slate-800">S/ {totalEgr.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[9px] font-black uppercase text-brand-muted tracking-widest flex items-center gap-1"><Activity size={10} className={balance >= 0 ? "text-brand-heading" : "text-red-500"}/> Balance</span>
                        <span className={`text-sm font-black ${balance >= 0 ? "text-brand-heading" : "text-red-600"}`}>S/ {balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO DESPLEGABLE (TABLAS) --- */}
            {isOpen && !isLoading && (
                <div className="mt-3 grid grid-cols-1 xl:grid-cols-2 gap-6 pl-4 pr-2 pb-4 border-l-2 border-brand-accent/30 ml-4">
                    {desgloseMes && (
                        <div className="xl:col-span-2">
                            <MerchRevenueBreakdown desglose={desgloseMes} />
                        </div>
                    )}
                    <IncomeTable
                        mesNum={mesNum}
                        ingresosConsolidados={ingresosConsolidados}
                        ingresosManuales={ingresosManuales}
                        acciones={acciones}
                        submitting={submitting}
                        inlineEditId={inlineEditId}
                        inlineData={inlineData}
                        addingType={addingType}
                        newData={newData}
                    />
                    <ExpenseTable
                        mesNum={mesNum}
                        egresos={egresos}
                        acciones={acciones}
                        submitting={submitting}
                        inlineEditId={inlineEditId}
                        inlineData={inlineData}
                        addingType={addingType}
                        newData={newData}
                    />
                </div>
            )}
        </div>
    );
};

// Memoizado a propósito: antes el padre esparcía un `tableProps` que incluía
// `inlineData`/`newData`, así que una pulsación en el formulario de un mes
// re-renderizaba los 12 acordeones y recalculaba sus reduce. Ahora el estado
// volátil solo baja al mes afectado y el resto se descarta aquí.
export const MonthAccordion = memo(MonthAccordionBase);
