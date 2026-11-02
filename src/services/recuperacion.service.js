import apiFetch from "../interceptors/api";
import { API_ROUTES } from "../constants/apiRoutes";
import { parseJsonResponse } from "./httpHelpers";

const recuperacionService = {
    // Obtener tickets pendientes (Normales y Lesión)
    obtenerPendientes: async () => {
        const response = await apiFetch.get(`${API_ROUTES.RECUPERACIONES.BASE}/pendientes`);
        const result = await parseJsonResponse(response, "Error al obtener recuperaciones");
        return result.data;
    },

    // Canjear el ticket
    agendar: async (data) => {
        // data = { alumnoId, recuperacionId, horarioDestinoId, fechaProgramada }
        const response = await apiFetch.post(`${API_ROUTES.RECUPERACIONES.BASE}/agendar-recuperacion`, data);
        const result = await parseJsonResponse(response, "Error al agendar");
        return result.data;
    },

    cancelar: async (recuperacionId) => {
        const response = await apiFetch.post(`${API_ROUTES.RECUPERACIONES.BASE}/cancelar-recuperacion/${recuperacionId}`);
        const result = await parseJsonResponse(response, "Error al cancelar recuperación");
        return result.data;
    },

    obtenerHistorial: async () => {
        const response = await apiFetch.get(`${API_ROUTES.RECUPERACIONES.BASE}/historial`);
        const result = await parseJsonResponse(response, "Error al obtener historial");
        return result.data;
    },

    // 🗓️ Recuperación anticipada: próximas clases del paquete actual
    obtenerClasesAnticipables: async () => {
        const response = await apiFetch.get(`${API_ROUTES.RECUPERACIONES.BASE}/anticipadas/clases`);
        const result = await parseJsonResponse(response, "Error al obtener tus próximas clases");
        return result.data;
    },

    // 🗓️ Avisar falta anticipada (y opcionalmente agendar la recuperación en el mismo paso)
    marcarFaltaAnticipada: async (data) => {
        // data = { registroId, horarioDestinoId?, fechaProgramada? }
        const response = await apiFetch.post(`${API_ROUTES.RECUPERACIONES.BASE}/anticipadas`, data);
        const result = await parseJsonResponse(response, "Error al registrar la falta anticipada");
        return result.data;
    },

    // 🗓️ Cancelar el aviso de falta anticipada
    cancelarFaltaAnticipada: async (registroId) => {
        const response = await apiFetch.delete(`${API_ROUTES.RECUPERACIONES.BASE}/anticipadas/${registroId}`);
        const result = await parseJsonResponse(response, "Error al cancelar el aviso de falta");
        return result.data;
    },

    // Listado para la pantalla de depuracion de recuperaciones (admin).
    listarDepuracion: async () => {
        const response = await apiFetch.get(API_ROUTES.RECUPERACIONES.LISTAR_DEPURACION);
        const result = await parseJsonResponse(response, "Error al cargar las recuperaciones");
        return result.data || [];
    },

    eliminar: async (recuperacionId) => {
        const response = await apiFetch.delete(API_ROUTES.RECUPERACIONES.ELIMINAR(recuperacionId));
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || "Error al eliminar la recuperacion");
        }
        return response.status === 204 ? { success: true } : await response.json();
    },
};

export default recuperacionService;
