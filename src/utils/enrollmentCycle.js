import { addDays, format, getISODay, isValid, parseISO } from 'date-fns';

export const CYCLE_DAYS = 30;

// Las fechas del backend pueden venir como 'YYYY-MM-DD' o ISO completo.
export const toDateKey = (value) => String(value).slice(0, 10);

// Fecha calendario sin hora: evita que un ISO con 'Z' retroceda un día en UTC-5.
export const parseDateOnly = (value) => parseISO(toDateKey(value));

export const esFechaValida = (value) => !!value && isValid(parseDateOnly(value));

// Fin real del ciclo: la fecha de su última clase programada (no se suman días a ciegas).
// `registros` son registros de asistencia ({ fecha, comentario }); `desde` acota al ciclo actual.
// Las recuperaciones se excluyen (igual que en "Mi Plan de Entrenamiento"). Devuelve 'YYYY-MM-DD' o null.
export const ultimaClaseProgramada = (registros, desde) => {
  const desdeKey = esFechaValida(desde) ? toDateKey(desde) : null;
  return registros.reduce((max, r) => {
    if (!esFechaValida(r.fecha) || r.comentario?.includes('[RECUPERACION]')) return max;
    const key = toDateKey(r.fecha);
    if (desdeKey && key < desdeKey) return max;
    return !max || key > max ? key : max;
  }, null);
};

/**
 * Previsualización REFERENCIAL del ciclo: cada fecha calculada a razón de 4 clases
 * por mes por cada día de semana elegido (1=lunes … 7=domingo, igual que
 * `horario.dia_semana`). Para `meses` adelantados se generan 4 * meses clases por día.
 * Las que caen en feriado se devuelven marcadas para que la UI las muestre como "sin clase".
 *
 * El backend sigue siendo autoritativo (enganche de paquetes, reposiciones).
 */
export const buildCyclePreview = ({ fechaInicio, diasSemana, feriados = [], duracionDias, meses = 1 }) => {
  if (!fechaInicio || !diasSemana || diasSemana.length === 0) return [];

  const cantidadMeses = Math.max(1, Number(meses) || 1);
  const limitePorDia = cantidadMeses * 4;
  const feriadosSet = new Set(feriados.map(toDateKey));
  const inicio = parseDateOnly(fechaInicio);

  const fechas = [];

  for (const diaSemana of diasSemana) {
    const diaTarget = Number(diaSemana);
    // Encontrar el primer día >= inicio que sea diaTarget
    const offset = (diaTarget - getISODay(inicio) + 7) % 7;
    let fechaActual = addDays(inicio, offset);

    for (let i = 0; i < limitePorDia; i++) {
      const key = format(fechaActual, 'yyyy-MM-dd');
      fechas.push({
        fecha: key,
        diaSemana: diaTarget,
        feriado: feriadosSet.has(key),
      });
      fechaActual = addDays(fechaActual, 7);
    }
  }

  // Ordenar cronológicamente
  return fechas.sort((a, b) => a.fecha.localeCompare(b.fecha));
};
