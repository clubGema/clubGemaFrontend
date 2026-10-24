import React from 'react';
import toast from 'react-hot-toast';

const RecoveryConfirmToast = ({ t, slot, onConfirm }) => (
    <div className="flex flex-col gap-4 p-1">
        <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">Confirmación de Reserva</span>
            <p className="text-sm font-bold text-brand-primary leading-tight mt-1">
                ¿Confirmas recuperar tu clase el <span className="text-brand-accent">{new Date(slot.fecha).toLocaleDateString()}</span> a las <span className="text-brand-accent">{slot.horarioData.hora_inicio.substring(0, 5)}</span>?
            </p>
        </div>

        <div className="flex gap-2">
            <button
                onClick={() => {
                    toast.dismiss(t.id);
                    onConfirm();
                }}
                className="flex-1 bg-brand-accent text-white text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-brand-accent-dark transition-colors shadow-lg shadow-brand-accent/25"
            >
                Confirmar
            </button>
            <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-1 bg-brand-surface-alt text-slate-500 text-[10px] font-black uppercase py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
                Cancelar
            </button>
        </div>
    </div>
);

export default RecoveryConfirmToast;
