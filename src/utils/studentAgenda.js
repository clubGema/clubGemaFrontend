// Lógica pura de la agenda del alumno (sin React ni red).
//
// El Dashboard recibe dos listas con formas distintas: asistencias (una fila por
// sesión, con `fecha`) y tickets de recuperación (con `fecha_programada`).
// Aquí se normalizan a una sola forma y se separan en próximas / pasadas, para
// que ningún componente repita esa lógica ni tenga que saber de qué lista viene
// cada fila.

const DIAS_SEMANA_CORTO = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
export const getDiaCorto = (date) => DIAS_SEMANA_CORTO[date.getDay()];

// Estados que NO cuentan como clase por venir aunque su fecha sea futura.
const ESTADOS_CERRADOS = new Set(['MOVIDA', 'VENCIDA', 'CANCELADA']);

const ESTADO_ASISTENCIA = {
  COMPLETADA_PRESENTE: 'PRESENTE',
  COMPLETADA_FALTA: 'FALTA',
  REPROGRAMADO: 'MOVIDA',
  JUSTIFICADO_LESION: 'JUSTIFICADA',
};

// Los tickets de recuperación VENCIDA/CANCELADA no son una clase en el
// calendario: solo cuentan los agendados y los ya cerrados.
const ESTADO_RECUPERACION = {
  PROGRAMADA: 'PROGRAMADA',
  COMPLETADA_PRESENTE: 'PRESENTE',
  COMPLETADA_FALTA: 'FALTA',
};

// 'HH:mm' desde '18:00', '18:00:00' o '1970-01-01T18:00:00.000Z'. Mismo criterio
// (regex sobre el texto, sin pasar por Date) que ya usaba el dashboard: las horas
// se guardan como hora de pared y convertirlas a Date las desplazaría por zona.
const extraerHora = (valor) => {
  if (!valor) return null;
  const match = String(valor).match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : null;
};

// 'YYYY-MM-DD' sin convertir a Date: new Date('2026-10-15T00:00:00Z') en
// Lima (UTC-5) es el día anterior (ver BL-011).
const extraerFecha = (valor) => (valor ? String(valor).slice(0, 10) : null);

// Fecha + 'HH:mm' -> Date en hora local.
const construirFecha = (fecha, hora, fallback) => {
  const [y, m, d] = fecha.split('-').map(Number);
  if (!hora) return new Date(y, m - 1, d, ...fallback);
  const [hh, mm] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

const nombreCoordinador = (horario) => {
  const u = horario?.coordinadores?.usuarios;
  return u ? `${u.nombres.trim()} ${u.apellidos.trim()}` : 'COORDINADOR IMPERIO 7';
};

const construirSesion = ({ key, tipo, estado, fecha, horaInicio, horaFin, horario, fechaOriginal, raw }) => ({
  key,
  tipo,
  estado,
  fecha,
  horaInicio,
  horaFin,
  // Sin hora conocida la clase dura todo el día: así "hoy" nunca cae al pasado.
  inicio: construirFecha(fecha, horaInicio, [0, 0, 0, 0]),
  fin: construirFecha(fecha, horaFin || horaInicio, [23, 59, 59, 0]),
  sede: horario?.canchas?.sedes?.nombre || horario?.canchas?.nombre || 'T1',
  nivel: horario?.niveles_entrenamiento?.nombre || 'Formativo',
  coordinador: nombreCoordinador(horario),
  fechaOriginal,
  raw,
});

const normalizarAsistencia = (raw) => {
  // La sesión espejo de una recuperación llega también como asistencia.
  if (raw.comentario?.includes('[RECUPERACION]')) return null;

  const fecha = extraerFecha(raw.fecha);
  const horario = raw.inscripciones?.horarios_clases || raw.horarios_clases;
  if (!fecha || !horario) return null;

  const repro = raw.reprogramaciones_clases;
  const esReposicion = Boolean(raw.fecha_original) || raw.tipo_sesion === 'REPOSICION';

  return construirSesion({
    key: `asist-${raw.id}`,
    tipo: esReposicion ? 'REPOSICION' : 'REGULAR',
    estado: ESTADO_ASISTENCIA[raw.estado] || raw.estado,
    fecha,
    horaInicio: extraerHora(repro ? repro.hora_inicio_destino : horario.hora_inicio),
    horaFin: extraerHora(repro ? repro.hora_fin_destino : horario.hora_fin),
    horario,
    fechaOriginal: extraerFecha(raw.fecha_original),
    raw,
  });
};

const normalizarRecuperacion = (raw) => {
  const fecha = extraerFecha(raw.fecha_programada);
  const estado = ESTADO_RECUPERACION[raw.estado];
  if (!fecha || !raw.horarios_clases || !estado) return null;

  return construirSesion({
    key: `recu-${raw.id}`,
    tipo: 'RECUPERACION',
    estado,
    fecha,
    horaInicio: extraerHora(raw.horarios_clases.hora_inicio),
    horaFin: extraerHora(raw.horarios_clases.hora_fin),
    horario: raw.horarios_clases,
    fechaOriginal: extraerFecha(raw.fecha_falta),
    raw,
  });
};

// Una inscripción solo "da derecho" a clases por venir si está vigente.
const INSCRIPCION_VIGENTE = new Set(['ACTIVO', 'PENDIENTE_PAGO']);

// Asistencia ya registrada: es historial real, no depende de cómo terminó la inscripción.
const ASISTENCIA_REGISTRADA = new Set(['COMPLETADA_PRESENTE', 'COMPLETADA_FALTA', 'JUSTIFICADO_LESION']);

// Misma resolución de la llave que usa MyRegistrations.
const inscripcionDeAsistencia = (a) => a.inscripcion_id ?? a.id_inscripcion ?? a.inscripciones?.id;

/**
 * Descarta las clases huérfanas: asistencias programadas de inscripciones
 * anuladas, finalizadas o que ya no existen, que el endpoint sigue devolviendo.
 *
 * Se cruza con el array de inscripciones. Dos salvedades a propósito:
 * - Lo ya registrado (asistió / faltó / lesión) se conserva: es historial real
 *   aunque su ciclo ya esté FINALIZADO.
 * - Sin inscripciones cargadas (null) o sin llave en la fila no hay base para
 *   juzgar: se conserva en vez de vaciar el dashboard por un fallo de red.
 */
export const filtrarAsistenciasVigentes = (asistencias = [], inscripciones = null) => {
  if (!inscripciones) return asistencias;
  const vigentes = new Set(
    inscripciones.filter((i) => INSCRIPCION_VIGENTE.has(i.estado)).map((i) => String(i.id)),
  );

  return asistencias.filter((a) => {
    if (ASISTENCIA_REGISTRADA.has(a.estado)) return true;
    const id = inscripcionDeAsistencia(a);
    return id == null || vigentes.has(String(id));
  });
};

/** Une asistencias y recuperaciones en una sola lista de sesiones normalizadas. */
export const buildSesiones = (asistencias = [], recuperaciones = []) => [
  ...asistencias.map(normalizarAsistencia),
  ...recuperaciones.map(normalizarRecuperacion),
].filter(Boolean);

/**
 * Separa en próximas (la más cercana primero) y pasadas (la más reciente primero).
 * El corte es la HORA DE FIN, no el estado: una clase de la semana pasada que
 * nadie marcó sigue siendo pasado.
 */
export const partitionAgenda = (sesiones, now = new Date()) => {
  const proximas = [];
  const pasadas = [];

  sesiones.forEach((s) => {
    if (s.fin >= now && !ESTADOS_CERRADOS.has(s.estado)) proximas.push(s);
    else pasadas.push(s);
  });

  proximas.sort((a, b) => a.inicio - b.inicio);
  pasadas.sort((a, b) => b.inicio - a.inicio);
  return { proximas, pasadas };
};

/** La clase a la que el alumno debe ir: la primera próxima aún por asistir. */
export const getNextClass = (proximas) => proximas.find((s) => s.estado === 'PROGRAMADA') || null;

const inicioDelDia = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const diasEntre = (desde, hasta) => Math.round((inicioDelDia(hasta) - inicioDelDia(desde)) / 86400000);

/** Cuándo ocurre la sesión respecto a ahora: AHORA | HOY | MANANA | FUTURO. */
export const getMomento = (sesion, now = new Date()) => {
  if (sesion.inicio <= now && sesion.fin >= now) return 'AHORA';
  const dias = diasEntre(now, sesion.inicio);
  if (dias === 0) return 'HOY';
  if (dias === 1) return 'MANANA';
  return 'FUTURO';
};

/** Cuenta corta para el hero de una clase de hoy: "en 3 h", "en 25 min". */
export const getTiempoRestante = (sesion, now = new Date()) => {
  const minutos = Math.round((sesion.inicio - now) / 60000);
  if (minutos <= 0) return null;
  if (minutos < 60) return `en ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `en ${horas} h ${resto} min` : `en ${horas} h`;
};

const GRUPOS = [
  { key: 'HOY', label: 'Hoy' },
  { key: 'ESTA_SEMANA', label: 'Esta semana' },
  { key: 'MAS_ADELANTE', label: 'Más adelante' },
];

/** Agrupa las próximas (ya ordenadas) en Hoy / Esta semana / Más adelante. */
export const groupProximas = (proximas, now = new Date()) => {
  const buckets = { HOY: [], ESTA_SEMANA: [], MAS_ADELANTE: [] };

  proximas.forEach((s) => {
    // Una clase en curso que empezó ayer a medianoche no existe; "hoy" se mide por inicio.
    const dias = Math.max(0, diasEntre(now, s.inicio));
    if (dias === 0) buckets.HOY.push(s);
    else if (dias <= 6) buckets.ESTA_SEMANA.push(s);
    else buckets.MAS_ADELANTE.push(s);
  });

  return GRUPOS
    .map(({ key, label }) => ({ key, label, items: buckets[key] }))
    .filter((g) => g.items.length > 0);
};
