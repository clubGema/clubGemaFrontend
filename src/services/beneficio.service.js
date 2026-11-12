import apiFetch from '../interceptors/api';
import { parseJsonResponse } from './httpHelpers';

export const beneficioService = {
    getBeneficios: async (idAlumno) => {
        const response = await apiFetch.get(`/beneficioPendiente/alumno/${idAlumno}`);

        const result = await parseJsonResponse(response, 'Error al obtener el beneficios del alumno');
        return result.data || [];
    },
};