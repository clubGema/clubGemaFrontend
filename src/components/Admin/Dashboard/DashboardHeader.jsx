import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const DashboardHeader = () => {
    return (
        <div className="mb-10 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#1e3a8a] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Gema Performance</span>
                    <div className="h-[1px] w-12 bg-slate-200"></div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-[#1e3a8a] tracking-tight uppercase italic leading-[0.9]">
                    Panel de <span className="text-orange-500">Control</span>
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] mt-3">
                    Sincronización de Datos
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/" className="p-3 bg-white text-slate-400 hover:text-[#1e3a8a] border border-slate-100 rounded-2xl shadow-lg shadow-slate-200/40 transition-all hover:-translate-y-1">
                    <Home size={22} />
                </Link>
                <div className="flex items-center gap-4 bg-white p-3 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold">A</div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operaciones</p>
                        <p className="text-xs font-bold text-slate-700">Administrador</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;