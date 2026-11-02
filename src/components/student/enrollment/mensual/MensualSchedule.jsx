import React, { useMemo } from 'react';
import { useFetch } from '../../../../hooks/useFetch';
import { enrollmentService } from '../../../../services/enrollment.service';
import { buildCyclePreview } from '../../../../utils/enrollmentCycle';
import LoadingSpinner from '../../../shared/LoadingSpinner';
import EmptyState from '../../../shared/EmptyState';
import StudentEnrollmentGroup from '../../StudentEnrollmentGroup';
import StartDateChoice from './StartDateChoice';
import AdvanceMonthsSelector from './AdvanceMonthsSelector';
import CyclePreview from './CyclePreview';

const SectionTitle = ({ n, children }) => (
  <h2 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] mb-4 ml-2">
    {n}. {children}
  </h2>
);

const MensualSchedule = ({
  userId,
  bloques,
  horariosElegidos,
  mensual,
  feriados,
  onToggle,
  onSelectInicio,
  onSelectMeses,
  precioUnitario,
}) => {
  // useFetch pide deps primitivas: la lista de ids se serializa.
  const idsKey = [...mensual.horarioIds].sort((a, b) => a - b).join(',');

  const { data: previewData, loading: loadingFechas } = useFetch(
    () => (idsKey ? enrollmentService.previsualizarFechas(userId, mensual.horarioIds) : null),
    [userId, idsKey],
    { errorMessage: 'No se pudieron calcular las fechas de inicio' }
  );

  const mesesSeleccionados = mensual.meses || 1;

  const ciclo = useMemo(() => buildCyclePreview({
    fechaInicio: mensual.fechaInicio,
    diasSemana: horariosElegidos.map(h => h.dia_semana),
    feriados,
    meses: mesesSeleccionados,
  }), [mensual.fechaInicio, horariosElegidos, feriados, mesesSeleccionados]);

  if (bloques.length === 0) return <EmptyState message="No hay horarios activos para esta sede y nivel." />;

  return (
    <div className="space-y-10">
      <section>
        <SectionTitle n={1}>Elige tus días</SectionTitle>
        <div className="space-y-6">
          {bloques.map(grupo => (
            <StudentEnrollmentGroup
              key={grupo.key}
              group={grupo}
              selectedIds={mensual.horarioIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      </section>

      {mensual.horarioIds.length > 0 && (
        <section>
          <SectionTitle n={2}>¿Cuándo empiezas?</SectionTitle>
          {loadingFechas || !previewData ? (
            <LoadingSpinner className="flex justify-center py-10" />
          ) : (
            <StartDateChoice
              previewData={previewData}
              selectedDate={mensual.fechaInicio}
              onSelect={onSelectInicio}
            />
          )}
        </section>
      )}

      {mensual.horarioIds.length > 0 && mensual.fechaInicio && (
        <section>
          <SectionTitle n={3}>¿Cuántos meses deseas pagar?</SectionTitle>
          <AdvanceMonthsSelector
            meses={mesesSeleccionados}
            onChange={onSelectMeses}
            diasCount={horariosElegidos.length}
            precioUnitario={precioUnitario}
          />
        </section>
      )}

      {ciclo.length > 0 && (
        <section>
          <SectionTitle n={mensual.fechaInicio ? 4 : 3}>Así queda tu ciclo</SectionTitle>
          <CyclePreview fechas={ciclo} meses={mesesSeleccionados} />
        </section>
      )}
    </div>
  );
};

export default MensualSchedule;
