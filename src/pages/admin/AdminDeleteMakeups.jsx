import React, { useState, useEffect, useMemo } from 'react';
import { 
    Trash2, 
    Search, 
    User, 
    Calendar, 
    AlertTriangle, 
    Loader2, 
    Filter, 
    History, 
    MapPin, 
    BarChart3,
    ChevronDown 
} from 'lucide-react';
import { apiFetch } from "../../interceptors/api";
import { API_ROUTES } from "../../constants/apiRoutes";
import toast from 'react-hot-toast';
import { format } from 'date-fns'; 

const AdminDeleteMakeups = () => {
    const [recuperaciones, setRecuperaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [openSections, setOpenSections] = useState({});

    useEffect(() => {
        fetchRecuperaciones();
    }, []);

    const fetchRecuperaciones = async () => {
        try {
            setLoading(true);
            const response = await apiFetch.get(API_ROUTES.RECUPERACIONES.LISTAR_DEPURACION);
            const json = await response.json();
            setRecuperaciones(json.data || []);
        } catch (error) {
            toast.error("Error al cargar las recuperaciones");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar permanentemente el ticket de ${nombre}?`)) return;

        try {
            await apiFetch.delete(API_ROUTES.RECUPERACIONES.ELIMINAR(id));
            toast.success("Ticket eliminado");
            setRecuperaciones(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    const toggleSection = (sede) => {
        setOpenSections(prev => ({ ...prev, [sede]: !prev[sede] }));
    };

    const groupedData = useMemo(() => {
        const filtered = recuperaciones.filter(item => {
            const fullInfo = `${item.alumnos?.usuarios?.nombres} ${item.alumnos?.usuarios?.apellidos}`.toLowerCase();
            return fullInfo.includes(searchTerm.toLowerCase());
        });

        return filtered.reduce((acc, current) => {
            const sedeNombre = current.horarios_clases?.canchas?.sedes?.nombre || "SEDE NO ESPECIFICADA";
            if (!acc[sedeNombre]) acc[sedeNombre] = [];
            acc[sedeNombre].push(current);
            return acc;
        }, {});
    }, [recuperaciones, searchTerm]);

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Header Pro */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 border-b-4 border-orange-500">
                <div className="flex items-center gap-5">
                    <div className="bg-orange-500 p-4 rounded-[1.2rem] text-white rotate-3 shadow-lg shadow-orange-500/20">
                        <History size={28} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Depuración Maestra</h1>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Gestión de Tickets y Fechas • Gema Academy</p>
                    </div>
                </div>

                <div className="relative w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar alumno en todas las sedes..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                    />
                </div>
            </div>

            {/* Listado con Acordeones */}
            <div className="space-y-4">
                {Object.entries(groupedData).map(([sede, tickets]) => (
                    <div key={sede} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
                        <button 
                            onClick={() => toggleSection(sede)}
                            className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-4 text-left">
                                <div className={`p-3 rounded-2xl ${sede === "SEDE NO ESPECIFICADA" ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-orange-600'}`}>
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">{sede}</h2>
                                    <span className="text-[10px] font-black px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase">
                                        {tickets.length} Alumnos en cola
                                    </span>
                                </div>
                            </div>
                            <ChevronDown className={`text-slate-300 transition-transform duration-300 ${openSections[sede] ? 'rotate-180' : ''}`} size={24} />
                        </button>

                        {openSections[sede] && (
                            <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-6 animate-in slide-in-from-top-2">
                                    {tickets.map((recu) => (
                                        <div key={recu.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 hover:border-orange-200 hover:shadow-xl transition-all group relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-md shadow-blue-100">
                                                        <User size={18} />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-[11px] font-black text-slate-800 uppercase leading-none italic">
                                                            {recu.alumnos?.usuarios?.nombres}
                                                        </h3>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            {recu.alumnos?.usuarios?.apellidos}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(recu.id, recu.alumnos?.usuarios?.nombres)}
                                                    className="bg-slate-50 text-slate-400 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-sm"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {/* SECCIÓN DE FECHAS CLAVE */}
                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-red-50/50 p-3 rounded-2xl border border-red-100">
                                                    <div className="flex items-center gap-1.5 mb-1 text-red-400">
                                                        <Calendar size={12} />
                                                        <span className="text-[8px] font-black uppercase">Faltó el:</span>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-700">
                                                        {format(new Date(recu.fecha_falta), 'dd/MM/yyyy')}
                                                    </p>
                                                </div>

                                                <div className={`p-3 rounded-2xl border ${recu.fecha_programada ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                                    <div className={`flex items-center gap-1.5 mb-1 ${recu.fecha_programada ? 'text-blue-500' : 'text-slate-400'}`}>
                                                        <Calendar size={12} />
                                                        <span className="text-[8px] font-black uppercase">Recupera el:</span>
                                                    </div>
                                                    <p className={`text-[10px] font-black ${recu.fecha_programada ? 'text-blue-700' : 'text-slate-400 italic'}`}>
                                                        {recu.fecha_programada 
                                                            ? format(new Date(recu.fecha_programada), 'dd/MM/yyyy') 
                                                            : 'Sin fecha'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4 px-1">
                                                <BarChart3 size={12} className="text-slate-400" />
                                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                                    Nivel: {recu.horarios_clases?.niveles_entrenamiento?.nombre || 'General'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                                                    recu.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-600' : 
                                                    recu.estado.startsWith('COMPLETADA') ? 'bg-emerald-100 text-emerald-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {recu.estado.replace('_', ' ')}
                                                </span>
                                                {recu.es_por_lesion && (
                                                    <div className="flex items-center gap-1 text-red-500">
                                                        <AlertTriangle size={12} />
                                                        <span className="text-[8px] font-black uppercase italic tracking-tighter">Médico</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                
                {Object.keys(groupedData).length === 0 && !loading && (
                    <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                        <Filter className="mx-auto text-slate-200 mb-4" size={60} />
                        <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No hay registros para depurar</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDeleteMakeups;