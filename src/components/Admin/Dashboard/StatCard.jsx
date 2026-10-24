import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
    const colors = {
        blue: "from-brand-primary/20 to-brand-primary/5 text-brand-primary border-brand-primary/10",
        orange: "from-brand-accent/20 to-amber-500/5 text-brand-accent-dark border-brand-accent-soft",
        green: "from-emerald-500/20 to-teal-500/5 text-emerald-600 border-emerald-100",
        purple: "from-purple-500/20 to-fuchsia-500/5 text-purple-700 border-purple-100",
        gray: "from-slate-500/20 to-slate-700/5 text-slate-600 border-brand-border",
    };

    return (
        <div className="relative overflow-hidden bg-brand-surface p-5 md:p-8 rounded-[2.5rem] border border-brand-border-soft shadow-[0_15px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-bg rounded-full -mr-16 -mt-16 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
            <div className="flex items-center justify-between relative z-10 mb-6">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${colors[color]} border shadow-[0_8px_20px_rgba(0,0,0,0.04)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Real Time</span>
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mt-1"></div>
                </div>
            </div>
            <div className="relative z-10">
                <h3 className="text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1.5 italic">{title}</h3>
                <div className="flex items-baseline">
                    <p className="text-3xl font-black text-brand-primary tracking-tighter italic leading-none">{value}</p>
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-brand-bg">
                <div className={`h-full bg-gradient-to-r ${colors[color]} w-0 group-hover:w-full transition-all duration-700`}></div>
            </div>
        </div>
    );
};

export default StatCard;