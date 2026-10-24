import React, { useEffect } from 'react';
import StudentRegistration from '../components/StudentRegistration';

/**
 * Page: Register
 * Esta página sirve como contenedor para el proceso de inscripción
 * de nuevos alumnos de Imperio 7 Club.
 */
const Register = () => {

    // Opcional: Desplazar al inicio cuando se carga la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="min-h-screen w-full bg-brand-primary-dark selection:bg-brand-accent selection:text-white">
            {/* Renderizamos el componente StudentRegistration que contiene 
                toda la lógica de negocio, validaciones y diseño de la matrícula.
            */}
            <StudentRegistration />

            {/* Footer sutil para la página de registro 
                (Opcional: puedes quitarlo si el componente ya ocupa toda la pantalla)
            */}
            <div className="pb-8 text-center">
                <p className="text-brand-muted/40 text-[10px] uppercase font-black tracking-[0.3em]">
                    © 2026 Imperio 7 Club • Sistema de Gestión Deportiva
                </p>
            </div>
        </main>
    );
};

export default Register;