import apiFetch from '../interceptors/api';
import { API_ROUTES } from '../constants/apiRoutes';
import { parseJsonResponse } from './httpHelpers';
import { qtyMapToIds } from '../utils/merchCart';

// Adaptador de extras → payload. Es el ÚNICO punto donde la matrícula conoce
// los extras (cantidades de merch de "Añade a tu plan"); los componentes de merch no lo importan.
// El backend recibe el ID repetido por cada unidad: 2 camisetas (id 1) → [1, 1].
// `sede_recojo_id` = sede de recojo (número); solo viaja si hay merch.
const extrasToPayload = (extras = {}) => {
    const merchIds = qtyMapToIds(extras.merchQty);
    return {
        merch_ids: merchIds,
        ...(merchIds.length > 0 && extras.sedeId && { sede_recojo_id: Number(extras.sedeId) }),
    };
};

export const enrollmentService = {
    /** Deuda PENDIENTE/PARCIAL del alumno, o null si está al día. */
    deudaPendiente: async (alumnoId) => {
        const response = await apiFetch.get(API_ROUTES.CUENTAS_POR_COBRAR.HISTORIAL(alumnoId));
        const result = await parseJsonResponse(response, 'Error al consultar la deuda');
        return result.data?.find(c =>
            c.alumno_id == alumnoId && (c.estado === 'PENDIENTE' || c.estado === 'PARCIAL')
        ) || null;
    },

    /**
     * Fechas de arranque posibles para los horarios elegidos.
     * Devuelve un array por horario: [inmediata, siguiente].
     */
    previsualizarFechas: async (alumnoId, horarioIds) => {
        const response = await apiFetch.post(API_ROUTES.ASISTENCIAS.PREVISUALIZAR, {
            alumno_id: alumnoId,
            horario_ids: horarioIds,
        });
        const result = await parseJsonResponse(response, 'Error al previsualizar las fechas');
        return result.data;
    },

    inscribirMensual: async ({ alumnoId, horarioIds, fechaInicio, meses, extras }) => {
        const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.BASE, {
            alumno_id: alumnoId,
            horario_ids: horarioIds,
            fecha_inicio_electiva: fechaInicio,
            ...(meses ? { meses_adelantados: meses } : {}),
            ...extrasToPayload(extras),
        });
        return parseJsonResponse(response, 'Error al procesar la matrícula');
    },

    inscribirMesesAdelantados: async ({ alumnoId, horarioIds, fechaInicio, meses, extras }) => {
        const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.MESES_ADELANTADOS, {
            alumno_id: alumnoId,
            horario_ids: horarioIds,
            meses_adelantados: meses,
            fecha_inicio_electiva: fechaInicio,
            ...extrasToPayload(extras),
        });
        return parseJsonResponse(response, 'Error al procesar la matrícula por meses adelantados');
    },

    inscribirUnica: async ({ alumnoId, horarioId, fecha }) => {
        const response = await apiFetch.post(API_ROUTES.INSCRIPCIONES.INDIVIDUAL, {
            alumno_id: alumnoId,
            idHorario: horarioId,
            fecha_inicio_electiva: fecha,
        });
        return parseJsonResponse(response, 'Error al procesar la clase única');
    },

    /**
     * Disponibilidad por fecha de un horario (BL-003):
     * [{ fecha, ocupados, capacidad_max, disponible, es_feriado }].
     * Solo trae fechas en las que el horario tiene clase.
     */
    disponibilidadPorFecha: async (horarioId, desde, hasta) => {
        const response = await apiFetch.get(API_ROUTES.HORARIOS.DISPONIBILIDAD(horarioId, desde, hasta));
        const result = await parseJsonResponse(response, 'Error al consultar la disponibilidad');
        return result.data;
    },
};
