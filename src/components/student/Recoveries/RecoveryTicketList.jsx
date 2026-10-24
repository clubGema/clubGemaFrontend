import React from 'react';
import { Ticket, Flame, Clock, CalendarCheck, ShieldCheck } from 'lucide-react';

const RecoveryTicketList = ({ tickets, selectedTicket, onSelect }) => {
    // Manejo de la estructura de datos según tu snippet original
    const ticketArray = tickets?.tickets || [];

    if (!ticketArray || ticketArray.length === 0) {
        return (
            <div className="bg-brand-surface border border-brand-border rounded-3xl p-12 text-center shadow-sm">
                <div className="w-20 h-20 bg-brand-bg rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarCheck size={40} className="text-slate-300" />
                </div>
                <h3 className="text-brand-heading font-bold text-lg">¡Todo en orden!</h3>
                <p className="text-slate-500 max-w-xs mx-auto">No tienes clases pendientes de recuperar en este momento.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {ticketArray.map((ticket) => {
                const isSelected = selectedTicket?.id === ticket.id;
                const isVip = ticket.es_por_lesion;
                const fechaVencimiento = ticket.fecha_caducidad;

                return (
                    <button
                        key={ticket.id}
                        onClick={() => onSelect(isSelected ? null : ticket)}
                        className={`relative p-6 rounded-[2rem] border-2 text-left transition-all duration-300 transform ${isSelected
                            ? 'bg-brand-accent border-brand-accent-dark shadow-2xl shadow-brand-accent/25 scale-[1.03] -translate-y-1'
                            : 'bg-brand-surface border-brand-border-soft hover:border-brand-accent/30 hover:shadow-xl shadow-sm'
                            }`}
                    >
                        {/* Indicador de Estado Superior  */}
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${isSelected ? 'bg-white/20 text-white' : 'bg-brand-accent-soft text-brand-accent-dark'
                                }`}>
                                {isVip ? <Flame size={24} strokeWidth={2.5} /> : <Ticket size={24} strokeWidth={2.5} />}
                            </div>

                            {isVip ? (
                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full ${isSelected ? 'bg-brand-surface text-brand-accent-dark' : 'bg-red-500 text-white animate-pulse'
                                    }`}>
                                    <ShieldCheck size={12} /> Lesión
                                </span>
                            ) : (
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isSelected ? 'bg-brand-accent-dark text-white' : 'bg-brand-surface-alt text-slate-500'
                                    }`}>
                                    Ticket
                                </span>
                            )}
                        </div>

                        {/* Información Principal */}
                        <div className="space-y-1">
                            <p className={`text-[11px] font-bold uppercase tracking-[0.15em] ${isSelected ? 'text-brand-accent-soft' : 'text-brand-muted'
                                }`}>
                                Sesión perdida
                            </p>
                            <p className={`text-2xl font-black italic uppercase tracking-tight ${isSelected ? 'text-white' : 'text-brand-primary'
                                }`}>
                                {new Date(ticket.fecha_falta).toLocaleDateString('es-PE', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    timeZone: 'UTC'
                                })}
                            </p>
                        </div>

                        {/* Footer del Card */}
                        <div className={`mt-5 pt-4 flex items-center gap-2 border-t text-xs font-bold ${isSelected ? 'border-white/20 text-brand-accent-soft' : 'border-slate-50 text-slate-500'
                            }`}>
                            <Clock size={14} strokeWidth={3} />
                            {isVip || !fechaVencimiento ? (
                                <span>SIN CADUCIDAD</span>
                            ) : (
                                <span className="uppercase tracking-tight">
                                    Vence: {new Date(fechaVencimiento).toLocaleDateString('es-PE', {
                                        day: '2-digit',
                                        month: 'short',
                                        timeZone: 'UTC'
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Brillo decorativo interno para el seleccionado */}
                        {isSelected && (
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default RecoveryTicketList;