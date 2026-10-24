import { useReducer, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Estado del asistente de matrícula (BL-003). Solo guarda lo que el alumno
 * ELIGE; todo lo calculable (horarios filtrados, bloques, validez de cada
 * paso) se deriva abajo con useMemo.
 *
 * Los extras (camiseta) NO viven aquí a propósito: pertenecen al contenedor y
 * se desacoplan de la lógica de matrícula (ver EnrollmentStepper).
 */
export const MODALIDAD = { MENSUAL: 'MENSUAL', UNICA: 'UNICA' };

const MENSUAL_VACIO = { horarioIds: [], opcionInicio: null, fechaInicio: null };
const UNICA_VACIA = { fecha: null, horarioId: null };

const initialState = {
  step: 1,
  modalidad: MODALIDAD.MENSUAL,
  sede: null,
  nivelId: null,
  mensual: MENSUAL_VACIO,
  unica: UNICA_VACIA,
};

function reducer(state, action) {
  switch (action.type) {
    // Cambiar modalidad, sede o nivel invalida lo elegido en el paso 2.
    case 'SET_MODALIDAD':
      return { ...state, modalidad: action.value, mensual: MENSUAL_VACIO, unica: UNICA_VACIA };
    case 'SET_SEDE':
      return { ...state, sede: action.value, nivelId: null, mensual: MENSUAL_VACIO, unica: UNICA_VACIA };
    case 'SET_NIVEL':
      return { ...state, nivelId: action.value, mensual: MENSUAL_VACIO, unica: UNICA_VACIA };

    // Cambiar los días invalida la fecha de inicio (depende de los horarios).
    case 'TOGGLE_HORARIO': {
      const ids = state.mensual.horarioIds;
      const horarioIds = ids.includes(action.id) ? ids.filter(i => i !== action.id) : [...ids, action.id];
      return { ...state, mensual: { horarioIds, opcionInicio: null, fechaInicio: null } };
    }
    case 'SET_INICIO':
      return { ...state, mensual: { ...state.mensual, opcionInicio: action.opcion, fechaInicio: action.fecha } };

    case 'SET_FECHA_UNICA':
      return { ...state, unica: { fecha: action.fecha, horarioId: action.horarioId ?? null } };
    case 'SET_HORARIO_UNICA':
      return { ...state, unica: { ...state.unica, horarioId: action.id } };

    case 'GO_TO':
      return { ...state, step: action.step };
    default:
      return state;
  }
}

const haySolape = (a, b) =>
  a.dia_semana === b.dia_semana && a.hora_inicio < b.hora_fin && a.hora_fin > b.hora_inicio;

/** @param {Array} horarios Horarios activos del club (useCatalogos). */
export function useEnrollmentWizard(horarios) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { step, modalidad, sede, nivelId, mensual, unica } = state;

  const sedes = useMemo(
    () => [...new Set(horarios.map(h => h.cancha?.sede?.nombre).filter(Boolean))].sort(),
    [horarios]
  );

  const niveles = useMemo(() => {
    const porId = new Map();
    horarios
      .filter(h => h.cancha?.sede?.nombre === sede && h.nivel)
      .forEach(h => porId.set(h.nivel.id, h.nivel));
    return [...porId.values()];
  }, [horarios, sede]);

  const horariosFiltrados = useMemo(
    () => horarios.filter(h => h.cancha?.sede?.nombre === sede && h.nivel?.id === nivelId),
    [horarios, sede, nivelId]
  );

  // Bloques "sede + nivel + franja" con sus días, igual que antes (gruposDeSedeActiva),
  // ahora incluyendo `sede` (StudentEnrollmentGroup lo leía y llegaba undefined).
  const bloques = useMemo(() => {
    const grupos = {};
    horariosFiltrados.forEach(h => {
      const hora = `${h.hora_inicio.slice(0, 5)} - ${h.hora_fin.slice(0, 5)}`;
      const key = `${sede}-${h.nivel?.nombre || 'General'}-${hora}`;
      if (!grupos[key]) grupos[key] = { key, sede, nivel: h.nivel?.nombre || 'General', hora, cancha: h.cancha?.nombre, opciones: [] };
      grupos[key].opciones.push(h);
    });
    return Object.values(grupos);
  }, [horariosFiltrados, sede]);

  const horariosElegidos = useMemo(
    () => horarios.filter(h => mensual.horarioIds.includes(h.id)),
    [horarios, mensual.horarioIds]
  );

  const toggleHorario = useCallback((id) => {
    if (!mensual.horarioIds.includes(id)) {
      const nuevo = horarios.find(h => h.id === id);
      if (nuevo && horariosElegidos.some(h => haySolape(h, nuevo))) {
        toast.error('¡Cruce detectado!');
        return;
      }
    }
    dispatch({ type: 'TOGGLE_HORARIO', id });
  }, [horarios, horariosElegidos, mensual.horarioIds]);

  const canAdvance = useMemo(() => {
    if (step === 1) return Boolean(modalidad && sede && nivelId);
    if (step === 2) {
      return modalidad === MODALIDAD.MENSUAL
        ? mensual.horarioIds.length > 0 && Boolean(mensual.fechaInicio)
        : Boolean(unica.fecha && unica.horarioId);
    }
    return false;
  }, [step, modalidad, sede, nivelId, mensual, unica]);

  const actions = useMemo(() => ({
    setModalidad: (value) => dispatch({ type: 'SET_MODALIDAD', value }),
    setSede: (value) => dispatch({ type: 'SET_SEDE', value }),
    setNivel: (value) => dispatch({ type: 'SET_NIVEL', value }),
    setInicio: (opcion, fecha) => dispatch({ type: 'SET_INICIO', opcion, fecha }),
    setFechaUnica: (fecha, horarioId) => dispatch({ type: 'SET_FECHA_UNICA', fecha, horarioId }),
    setHorarioUnica: (id) => dispatch({ type: 'SET_HORARIO_UNICA', id }),
    next: () => dispatch({ type: 'GO_TO', step: Math.min(step + 1, 3) }),
    back: () => dispatch({ type: 'GO_TO', step: Math.max(step - 1, 1) }),
  }), [step]);

  return {
    state,
    actions: { ...actions, toggleHorario },
    derived: { sedes, niveles, horariosFiltrados, bloques, horariosElegidos, canAdvance },
  };
}
