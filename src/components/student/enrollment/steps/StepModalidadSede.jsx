import React from 'react';
import ModalityChoice from '../modalidad/ModalityChoice';
import SedeSelector from '../sede/SedeSelector';
import NivelSelector from '../sede/NivelSelector';
import EmptyState from '../../../shared/EmptyState';

const Title = ({ children }) => (
  <h2 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-2 ml-2">{children}</h2>
);

const StepModalidadSede = ({ state, derived, actions }) => (
  <div className="max-w-3xl mx-auto space-y-10">
    <section>
      <h2 className="text-3xl md:text-4xl font-black text-brand-primary italic uppercase tracking-tighter leading-none mb-6">
        ¿Qué modalidad <span className="text-brand-accent">buscas?</span>
      </h2>
      <ModalityChoice value={state.modalidad} onChange={actions.setModalidad} />
    </section>

    {state.modalidad && (
      <section>
        <Title>¿Dónde quieres entrenar?</Title>
        <SedeSelector sedes={derived.sedes} active={state.sede} onSelect={actions.setSede} />
      </section>
    )}

    {state.sede && (
      <section>
        <Title>¿Qué nivel?</Title>
        {derived.niveles.length === 0
          ? <EmptyState message="Esta sede no tiene niveles disponibles." />
          : <NivelSelector niveles={derived.niveles} activeId={state.nivelId} onSelect={actions.setNivel} />}
      </section>
    )}
  </div>
);

export default StepModalidadSede;
