import React from 'react';
import { MODALIDAD } from '../../../../hooks/useEnrollmentWizard';
import MensualSchedule from '../mensual/MensualSchedule';
import UnicaSchedule from '../unica/UnicaSchedule';

// Aquí ocurre la bifurcación: el paso 1 decide qué rama se muestra.
const StepHorarioFechas = ({ state, derived, actions, userId, feriados, precioUnitario }) => (
  state.modalidad === MODALIDAD.MENSUAL ? (
    <MensualSchedule
      userId={userId}
      bloques={derived.bloques}
      horariosElegidos={derived.horariosElegidos}
      mensual={state.mensual}
      feriados={feriados}
      onToggle={actions.toggleHorario}
      onSelectInicio={actions.setInicio}
      onSelectMeses={actions.setMeses}
      precioUnitario={precioUnitario}
    />
  ) : (
    <div>
      <h2 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter leading-none mb-6">
        Elige tu <span className="text-brand-accent">fecha</span>
      </h2>
      <UnicaSchedule
        horarios={derived.horariosFiltrados}
        unica={state.unica}
        onSelectFecha={actions.setFechaUnica}
        onSelectHorario={actions.setHorarioUnica}
      />
    </div>
  )
);

export default StepHorarioFechas;
