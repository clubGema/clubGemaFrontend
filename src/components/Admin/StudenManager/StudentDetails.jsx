import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

import ChangePasswordModal from '../../../components/shared/ChangePasswordModal'; // Ajusta la ruta si es necesario
import apiFetch from '../../../interceptors/api';
import { API_ROUTES } from '../../../constants/apiRoutes';
import StudentProfileCard from './student-details/StudentProfileCard';
import StudentHealthCard from './student-details/StudentHealthCard';
import EmergencyContactCard from './student-details/EmergencyContactCard';
import CicloHistoryPanel from './student-details/CicloHistoryPanel';
import ClaseSueltaDetailModal from './ciclos/ClaseSueltaDetailModal';
import { useHistorialCiclosPorMes } from '../../../hooks/useHistorialCiclos';
import LoadingSpinner from '../../..//components/shared/LoadingSpinner';

const StudentDetails = ({ selectedAlumno, onBack, onStatusHistoryChange }) => {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    // BL-012: historial de ciclos del mes elegido (con selector de mes y desglose).
    const { historial, loading: loadingCiclos, seleccionarMes } = useHistorialCiclosPorMes(selectedAlumno?.id);

    // Clase individual seleccionada para ver su resumen en modal aparte
    const [claseIndividualSeleccionada, setClaseIndividualSeleccionada] = useState(null);

    // Detalle completo del alumno (dirección, salud, contacto, email, etc.)
    // — ya NO viene en selectedAlumno (ese objeto viene de resumen-tabla,
    // que es liviano). Se pide aparte solo al abrir el expediente.
    const [detalle, setDetalle] = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(true);

    useEffect(() => {
        if (!selectedAlumno?.id) return;

        const fetchDetalle = async () => {
            try {
                setLoadingDetalle(true);
                const res = await apiFetch.get(API_ROUTES.HISTORIAL_ACADEMICO.ALUMNO_DETALLE(selectedAlumno.id));
                const result = await res.json();
                if (res.ok) {
                    setDetalle(result.data);
                } else {
                    toast.error("No se pudo obtener el detalle del alumno");
                }
            } catch (error) {
                console.error('Error en fetchDetalle:', error);
                toast.error("Error al conectar con el servidor para obtener el detalle");
            } finally {
                setLoadingDetalle(false);
            }
        };

        fetchDetalle();
    }, [selectedAlumno?.id]);

    if (!selectedAlumno) return null;

    // Evita el crash: mientras no haya detalle cargado, no renderiza el
    // cuerpo que depende de direccion/salud/contactoEmergencia/email/etc.
    if (loadingDetalle || !detalle) {
        return (
            <LoadingSpinner
                className="flex flex-col items-center justify-center h-96 gap-4"
                size={48}
                label="Cargando expediente..."
                labelClassName="font-black text-brand-primary text-xs uppercase italic tracking-widest animate-pulse"
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1">
            {/* Header del Expediente */}
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="w-12 h-12 bg-brand-surface border border-brand-border rounded-2xl flex items-center justify-center hover:bg-brand-bg transition-all shadow-sm">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-black uppercase italic text-slate-800 leading-none">Expediente <span className="text-brand-primary">Imperio 7</span></h2>
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-[0.2em] mt-1">Ficha completa del Alumno</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA (Datos Personales y Médicos) */}
                <div className="lg:col-span-2 space-y-6">
                    <StudentProfileCard
                        alumno={selectedAlumno}
                        detalle={detalle}
                        onOpenPasswordModal={() => setIsPasswordModalOpen(true)}
                    />
                    <StudentHealthCard detalle={detalle} onStatusHistoryChange={onStatusHistoryChange} />
                </div>

                {/* COLUMNA DERECHA (Emergencia y Ciclos) */}
                <div className="lg:col-span-1 space-y-6">
                    <EmergencyContactCard contacto={detalle.contactoEmergencia} />
                    <CicloHistoryPanel
                        historial={historial}
                        loadingCiclos={loadingCiclos}
                        onSelectMes={seleccionarMes}
                        onSelectIndividual={setClaseIndividualSeleccionada}
                    />
                </div>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                userId={selectedAlumno.id}
            />

            {claseIndividualSeleccionada && (
                <ClaseSueltaDetailModal
                    ciclo={claseIndividualSeleccionada}
                    onClose={() => setClaseIndividualSeleccionada(null)}
                    title="Resumen de Clase Suelta"
                />
            )}
        </div>
    );
};

export default StudentDetails;
