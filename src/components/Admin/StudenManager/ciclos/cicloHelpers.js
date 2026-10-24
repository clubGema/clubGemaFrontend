import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { STATUS_SUCCESS } from '../../../../config/statusColors';

// Compartido entre InscriptionsModal y StudentDetails: ambos consumen el mismo
// endpoint de historial académico y necesitan formatear/clasificar "ciclos" igual.

export const formatearFecha = (fechaString) => {
    if (!fechaString) return "S/F";
    return format(parseISO(fechaString.slice(0, 10)), "dd MMM yyyy", { locale: es });
};

// Extrae "Abril - Mayo 2026" evaluando inicio y fin REAL (calculado por asistencias)
export const obtenerRangoCiclo = (fechaInicio, fechaFin) => {
    if (!fechaInicio) return "SIN CLASES REGISTRADAS";

    const inicioDate = parseISO(fechaInicio.slice(0, 10));
    const mesInicio = format(inicioDate, "MMMM", { locale: es });
    const anioInicio = format(inicioDate, "yyyy");

    if (!fechaFin) return `${mesInicio} ${anioInicio} · EN CURSO`;

    const finDate = parseISO(fechaFin.slice(0, 10));
    const mesFin = format(finDate, "MMMM", { locale: es });
    const anioFin = format(finDate, "yyyy");

    if (mesInicio === mesFin && anioInicio === anioFin) return `${mesInicio} ${anioInicio}`;
    if (anioInicio === anioFin) return `${mesInicio} - ${mesFin} ${anioInicio}`;
    return `${mesInicio.slice(0, 3)} ${anioInicio} - ${mesFin.slice(0, 3)} ${anioFin}`;
};

export const getEstadoPagoBadge = (estado) => {
    switch (estado?.toUpperCase()) {
        case 'PAGADA':
        case 'PAGADO': return STATUS_SUCCESS;
        case 'PENDIENTE': return 'bg-brand-accent-soft text-brand-accent-dark border-brand-accent/30';
        case 'VENCIDO': return 'bg-red-100 text-red-700 border-red-200';
        default: return 'bg-brand-surface-alt text-slate-500 border-brand-border';
    }
};

// BADGE PARA CADA CLASE DEL DESGLOSE MENSUAL (BL-012)
export const getEstadoClaseBadge = (estado) => {
    switch (estado?.toUpperCase()) {
        case 'PRESENTE': return STATUS_SUCCESS;
        case 'FALTA': return 'text-red-600 bg-red-50 border-red-100';
        case 'PROGRAMADA': return 'text-brand-primary bg-brand-primary-soft border-brand-primary/10';
        default: return 'text-brand-muted bg-brand-bg border-brand-border-soft';
    }
};

// BADGE PARA LA(S) INSCRIPCIÓN(ES) — puede haber más de un estado dentro
// de la misma tarjeta si el paquete agrupa varias inscripciones.
export const getEstadoInscripcionBadge = (estado) => {
    switch (estado?.toUpperCase()) {
        case 'ACTIVO': return STATUS_SUCCESS;
        case 'INACTIVO': return 'text-slate-500 bg-brand-bg border-brand-border';
        case 'FINALIZADO': return 'text-slate-500 bg-brand-surface-alt border-brand-border';
        case 'PENDIENTE_PAGO': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'CONGELADO': return 'text-brand-primary bg-brand-primary-soft border-brand-primary/10';
        default: return 'text-brand-muted bg-brand-bg border-brand-border-soft';
    }
};
