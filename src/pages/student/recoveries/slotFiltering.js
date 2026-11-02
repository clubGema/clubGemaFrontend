import { generarClasesDisponibles } from '../../../utils/schedulerUtils';

// Genera los slots disponibles para el ticket seleccionado, quitando los que el alumno
// ya tiene ocupados ('PROGRAMADA'), que corresponden a un horario regular protegido
// o que superan el último día de clases del ciclo (`fechaFinCiclo`).
export const calcularSlotsDisponibles = (horariosPatron, historial = [], stats = {}, fechaFinCiclo = null) => {
    const rawSlots = generarClasesDisponibles(horariosPatron, 8);
    const finKey = fechaFinCiclo ? String(fechaFinCiclo).slice(0, 10) : null;
    const regulares = stats?.fechas_clases_regulares || [];

    return rawSlots.filter(slot => {
        const fechaSlotTexto = slot.fecha.split('T')[0];

        if (finKey && fechaSlotTexto > finKey) {
            return false;
        }

        // Buscamos si el alumno ya tiene algo agendado ('PROGRAMADA') en este mismo día y a esta misma hora
        const yaLoTieneOcupado = historial.some(ticket => {
            if (ticket.estado !== 'PROGRAMADA' || !ticket.fecha_programada) return false;

            const fechaTicketTexto = ticket.fecha_programada.split('T')[0];
            const mismaFecha = fechaTicketTexto === fechaSlotTexto;
            const mismoHorario = ticket.horario_destino_id === slot.horarioData.id;

            return mismaFecha && mismoHorario;
        });

        const esHorarioRegularProtegido = regulares.some(
            f => f.fecha_clase === slot.fecha && f.id_horario === slot.horarioData.id
        );

        return !yaLoTieneOcupado && !esHorarioRegularProtegido;
    });
};
