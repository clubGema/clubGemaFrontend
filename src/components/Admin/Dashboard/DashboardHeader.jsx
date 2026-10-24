import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const DashboardHeader = () => {
    return (
        <div className="mb-10 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-brand-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Imperio 7 Performance</span>
                    <div className="h-[1px] w-12 bg-slate-200"></div>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-brand-primary tracking-tight uppercase italic leading-[0.9]">
                    Panel de <span className="text-brand-accent">Control</span>
                </h1>
                <p className="text-brand-muted text-xs font-bold uppercase tracking-[0.3em] mt-3">
                    Sincronización de Datos
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Link to="/" className="p-3 bg-brand-surface text-brand-muted hover:text-brand-primary border border-brand-border-soft rounded-2xl shadow-lg shadow-slate-200/40 transition-all hover:-translate-y-1">
                    <Home size={22} />
                </Link>
                <div className="flex items-center gap-4 bg-brand-surface p-3 rounded-3xl border border-brand-border-soft shadow-xl shadow-slate-200/40">
                    <div className="h-10 w-10 rounded-2xl bg-brand-accent-soft flex items-center justify-center text-brand-accent-dark font-bold">A</div>
                    <div className="pr-4">
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Operaciones</p>
                        <p className="text-xs font-bold text-brand-body">Administrador</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHeader;