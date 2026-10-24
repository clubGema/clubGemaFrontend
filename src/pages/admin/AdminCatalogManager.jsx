import React, { useState, useMemo } from 'react';
import { Tag, Edit3, Filter } from 'lucide-react'; // Quitamos Plus de los imports
import AdminCatalog from '../../components/Admin/AdminCatalog';
import { useFetch } from '../../hooks/useFetch';
import PageTitle from '../../components/shared/PageTitle';
import { catalogoService } from '../../services/catalogo.service';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';

const AdminCatalogManager = () => {
    const [view, setView] = useState('list');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [vigenciaFilter, setVigenciaFilter] = useState('VIGENTE');

    const {
        data: conceptos,
        loading,
        refetch: fetchCatalog,
    } = useFetch(
        () => catalogoService.getAll(),
        [],
        { initialData: [], errorMessage: "Error al cargar el catálogo" }
    );

    const filteredData = useMemo(() => {
        return conceptos.filter(c => {
            const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.codigo_interno?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesVigencia = vigenciaFilter === 'ALL' ? true :
                vigenciaFilter === 'VIGENTE' ? c.es_vigente === true :
                    c.es_vigente === false;

            return matchesSearch && matchesVigencia;
        });
    }, [conceptos, searchTerm, vigenciaFilter]);

    const handleEdit = (item) => {
        setSelectedItem(item);
        setView('edit');
    };

    // Mantenemos la lógica de edit, pero creamos una protección visual al no tener botón 'create'
    if (view === 'create' || view === 'edit') {
        return (
            <AdminCatalog
                editData={selectedItem}
                onBack={() => {
                    setView('list');
                    setSelectedItem(null);
                    fetchCatalog();
                }}
            />
        );
    }

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            {/* Header - Botón eliminado aquí */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <PageTitle
                        title="Catálogo de"
                        accent="Precios"
                        subtitle="Edita los precios del catálogo, ya que son parte de la lógica interna."
                        subtitleClassName="text-slate-500 text-[11px] font-bold uppercase tracking-wider"
                    />
                </div>
            </div>

            {/* Barra de Búsqueda y Filtro de Vigencia */}
            <div className="bg-brand-surface p-3 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row gap-4">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR NOMBRE O CÓDIGO..."
                    wrapperClassName="flex-1 relative"
                    className="w-full bg-brand-bg border-none rounded-xl pl-12 pr-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-brand-accent/20"
                />

                <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-xl border border-brand-border-soft">
                    <Filter size={14} className="text-brand-primary" />
                    <select
                        className="bg-transparent border-none text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600"
                        value={vigenciaFilter}
                        onChange={(e) => setVigenciaFilter(e.target.value)}
                    >
                        <option value="VIGENTE">Solo Vigentes</option>
                        <option value="NO_VIGENTE">No Vigentes</option>
                        <option value="ALL">Ver Todos</option>
                    </select>
                </div>
            </div>

            {/* Grid de Tarjetas Compactas */}
            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredData.map((item) => (
                        <div key={item.id} className={`bg-brand-surface rounded-2xl border border-brand-border p-4 hover:shadow-lg transition-all group relative flex flex-col justify-between ${!item.es_vigente && 'bg-brand-bg/50'}`}>
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-xl ${item.es_vigente ? 'bg-brand-accent-soft text-brand-accent-dark' : 'bg-slate-200 text-slate-500'}`}>
                                        <Tag size={18} />
                                    </div>
                                    <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-300 hover:text-brand-primary transition-colors">
                                        <Edit3 size={16} />
                                    </button>
                                </div>

                                <div className="space-y-1 mb-3">
                                    <div className="flex flex-wrap gap-1">
                                        <span className="text-[8px] font-black text-brand-primary bg-brand-primary-soft px-1.5 py-0.5 rounded uppercase">
                                            {item.codigo_interno}
                                        </span>
                                        {!item.es_vigente && (
                                            <span className="text-[8px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-slate-800 text-sm uppercase italic leading-tight min-h-[2.5rem] flex items-center">
                                        {item.nombre}
                                    </h3>
                                    <p className="text-[9px] text-brand-muted font-medium line-clamp-2 leading-relaxed italic">
                                        Lógica interna vinculada a {item.cantidad_clases_semanal} clases por semana.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                <div>
                                    <span className="text-[8px] font-black text-brand-muted uppercase block tracking-tighter">Precio</span>
                                    <span className="text-sm font-black text-green-600 italic">S/ {parseFloat(item.precio_base).toFixed(2)}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[8px] font-black text-brand-muted uppercase block tracking-tighter">Frecuencia</span>
                                    <span className="text-[9px] font-bold text-slate-600 uppercase">{item.cantidad_clases_semanal} cl/sem</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredData.length === 0 && !loading && (
                <EmptyState
                    message="No se encontraron conceptos con estos criterios."
                    className="py-20 text-center text-brand-muted font-bold italic uppercase text-xs"
                />
            )}
        </div>
    );
};

export default AdminCatalogManager;