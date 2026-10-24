import React, { useEffect, useMemo, useState } from 'react';
import { PackageCheck, MapPin, ChevronDown, Loader2, User, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { useCatalogos } from '../../hooks/useCatalogos';
import { merchService } from '../../services/merch.service';
import PageTitle from '../../components/shared/PageTitle';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal';
import MerchImage from '../../components/merch/MerchImage';
import { uniqueSedes } from '../../utils/uniqueById';

const SEDE_KEY = 'merch_entregas_sede';
const MIN_BUSQUEDA = 2;

const leerSedeGuardada = () => {
    try { return localStorage.getItem(SEDE_KEY) || ''; } catch { return ''; }
};

const AdminMerchDeliveries = () => {
    const { sedes } = useCatalogos(['sedes']);
    // La recepción casi siempre trabaja en una sola sede: se recuerda la última elegida.
    const [sedeId, setSedeId] = useState(leerSedeGuardada);
    const [searchTerm, setSearchTerm] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [entregandoId, setEntregandoId] = useState(null);
    const [porConfirmar, setPorConfirmar] = useState(null);   // ítem a entregar, pendiente de confirmar
    const [recientes, setRecientes] = useState([]);           // entregados en esta sesión (revertibles)
    const [revirtiendoId, setRevirtiendoId] = useState(null);

    // Debounce: no se consulta en cada tecla.
    useEffect(() => {
        const texto = searchTerm.trim();
        const timer = setTimeout(() => setBusqueda(texto.length >= MIN_BUSQUEDA ? texto : ''), 350);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const cambiarSede = (e) => {
        setSedeId(e.target.value);
        try { localStorage.setItem(SEDE_KEY, e.target.value); } catch { /* sin almacenamiento: no pasa nada */ }
    };

    const { data: entregas, loading, refetch } = useFetch(
        () => merchService.getEntregasPendientes({ sedeId, busqueda }),
        [sedeId, busqueda],
        { initialData: [], errorMessage: 'No se pudieron cargar las entregas' }
    );

    // Un bloque por alumno, con todo lo que tiene por recoger.
    const porAlumno = useMemo(() => {
        const grupos = new Map();
        for (const e of entregas) {
            const clave = e.alumnoId ?? `${e.nombres}-${e.apellidos}`;
            if (!grupos.has(clave)) grupos.set(clave, { clave, nombres: e.nombres, apellidos: e.apellidos, documento: e.documento, items: [] });
            grupos.get(clave).items.push(e);
        }
        return [...grupos.values()];
    }, [entregas]);

    // Doble seguro contra entregas por error: confirmación antes de entregar y, después,
    // "Revertir" sobre lo entregado en esta sesión.
    const entregar = async () => {
        const item = porConfirmar;
        setEntregandoId(item.id);
        try {
            await merchService.entregarItem(item.id);
            toast.success(`Entregado: ${item.nombre}`);
            setPorConfirmar(null);
            setRecientes(prev => [item, ...prev.filter(r => r.id !== item.id)]);
            await refetch();
        } catch (error) {
            toast.error(error.message || 'No se pudo registrar la entrega');
        } finally {
            setEntregandoId(null);
        }
    };

    const revertir = async (item) => {
        setRevirtiendoId(item.id);
        try {
            await merchService.revertirEntrega(item.id);
            toast.success(`Entrega revertida: ${item.nombre}`);
            setRecientes(prev => prev.filter(r => r.id !== item.id));
            await refetch();
        } catch (error) {
            toast.error(error.message || 'No se pudo revertir la entrega');
        } finally {
            setRevirtiendoId(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <PageTitle
                title="Entregas de"
                accent="Merch"
                subtitle="Busca al alumno y entrega lo que ya pagó."
                subtitleClassName="text-slate-500 text-[11px] font-bold uppercase tracking-wider"
            />

            <div className="bg-brand-surface p-3 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row gap-3">
                <div className="relative md:w-64">
                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-primary pointer-events-none" />
                    <select
                        aria-label="Sede"
                        value={sedeId}
                        onChange={cambiarSede}
                        className="w-full appearance-none bg-brand-bg rounded-xl pl-11 pr-9 py-2.5 text-[10px] font-black uppercase text-slate-600 outline-none cursor-pointer focus:ring-2 focus:ring-brand-accent/20"
                    >
                        <option value="">Todas las sedes</option>
                        {uniqueSedes(sedes).map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
                </div>
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="NOMBRE O DNI DEL ALUMNO..."
                    wrapperClassName="flex-1 relative"
                    className="w-full bg-brand-bg border-none rounded-xl pl-12 pr-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : porAlumno.length === 0 ? (
                <EmptyState
                    icon={PackageCheck}
                    message={busqueda ? 'Ese alumno no tiene entregas pendientes.' : 'No hay entregas pendientes.'}
                />
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {porAlumno.map(alumno => (
                        <section key={alumno.clave} className="bg-brand-surface rounded-[2rem] border border-brand-border shadow-sm overflow-hidden">
                            <header className="flex items-center gap-4 bg-brand-primary-soft px-6 py-4">
                                <div className="p-2.5 rounded-xl bg-brand-primary text-white shrink-0"><User size={18} /></div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-black text-brand-heading uppercase italic truncate">{alumno.nombres} {alumno.apellidos}</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">DNI {alumno.documento || 'S/N'}</p>
                                </div>
                                <span className="text-[10px] font-black text-brand-gold-dark bg-brand-gold-soft rounded-full px-3 py-1 shrink-0">
                                    {alumno.items.length} por entregar
                                </span>
                            </header>

                            <ul className="divide-y divide-brand-border-soft">
                                {alumno.items.map(item => (
                                    <li key={item.id} className="flex items-center gap-4 px-6 py-4">
                                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0"><MerchImage item={item} iconSize={22} /></div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-black text-brand-heading uppercase italic leading-tight">{item.nombre}</p>
                                            {item.sede && (
                                                <p className="flex items-center gap-1 text-[10px] font-bold text-brand-muted uppercase mt-0.5">
                                                    <MapPin size={11} /> {item.sede}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setPorConfirmar({ ...item, nombres: alumno.nombres, apellidos: alumno.apellidos, documento: alumno.documento })}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white text-[10px] font-black uppercase tracking-widest shadow hover:bg-green-700 active:scale-95 transition-all shrink-0"
                                        >
                                            <PackageCheck size={14} />
                                            Entregar producto
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {recientes.length > 0 && (
                <section className="bg-brand-surface rounded-[2rem] border border-brand-border shadow-sm overflow-hidden">
                    <header className="flex items-center gap-2 bg-brand-surface-alt px-6 py-3">
                        <Undo2 size={14} className="text-slate-500" />
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Entregados en esta sesión · ¿Fue un error?</h3>
                    </header>
                    <ul className="divide-y divide-brand-border-soft">
                        {recientes.map(item => (
                            <li key={item.id} className="flex items-center gap-4 px-6 py-3">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-brand-heading uppercase italic truncate">{item.nombre}</p>
                                    <p className="text-[10px] font-bold text-brand-muted uppercase truncate">{item.nombres} {item.apellidos} · DNI {item.documento || 'S/N'}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => revertir(item)}
                                    disabled={revirtiendoId === item.id}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all disabled:opacity-60 shrink-0"
                                >
                                    {revirtiendoId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
                                    Revertir entrega
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <ConfirmModal
                isOpen={Boolean(porConfirmar)}
                onClose={() => !entregandoId && setPorConfirmar(null)}
                onConfirm={entregar}
                title="¿Confirmar entrega?"
                message={porConfirmar
                    ? `Vas a entregar "${porConfirmar.nombre}" a ${porConfirmar.nombres} ${porConfirmar.apellidos} (DNI ${porConfirmar.documento || 'S/N'}). Verifica que sea la persona correcta.`
                    : ''}
                confirmText={entregandoId ? 'Registrando...' : 'Sí, entregar'}
            />
        </div>
    );
};

export default AdminMerchDeliveries;
