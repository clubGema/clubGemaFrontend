import React, { useMemo, useState } from 'react';
import { Plus, Edit3, PackageX, PackageCheck, Gift, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '../../hooks/useFetch';
import { merchService } from '../../services/merch.service';
import { formatSoles } from '../../utils/formatSoles';
import PageTitle from '../../components/shared/PageTitle';
import SearchInput from '../../components/shared/SearchInput';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmModal from '../../components/shared/ConfirmModal';
import MerchImage from '../../components/merch/MerchImage';
import MerchFormModal from '../../components/merch/MerchFormModal';

const STOCK_BAJO = 5;

const AdminMerchManager = () => {
    const [searchTerm, setSearchTerm] = useState('');
    // null = cerrado · {} = alta · producto = edición
    const [formTarget, setFormTarget] = useState(null);
    // Producto pendiente de baja/reactivación.
    const [toggleTarget, setToggleTarget] = useState(null);
    // Producto pendiente de eliminación definitiva (borra también su imagen en la nube).
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data: productos, loading, refetch } = useFetch(
        () => merchService.getCatalogoCompleto(),
        [],
        { initialData: [], errorMessage: 'Error al cargar el inventario' }
    );

    const filtrados = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        return term ? productos.filter(p => p.nombre?.toLowerCase().includes(term)) : productos;
    }, [productos, searchTerm]);

    const guardar = async (payload) => {
        const esEdicion = Boolean(formTarget?.id);
        try {
            if (esEdicion) await merchService.actualizar(formTarget.id, payload);
            else await merchService.crear(payload);
            toast.success(esEdicion ? 'Producto actualizado' : 'Producto creado');
            setFormTarget(null);
            await refetch();
        } catch (error) {
            toast.error(error.message || 'No se pudo guardar el producto');
        }
    };

    const confirmarCambioEstado = async () => {
        const activar = toggleTarget.estado === 'INACTIVO';
        try {
            await merchService.actualizar(toggleTarget.id, { estado: activar ? 'ACTIVO' : 'INACTIVO' });
            toast.success(activar ? 'Producto reactivado' : 'Producto dado de baja');
            setToggleTarget(null);
            await refetch();
        } catch (error) {
            toast.error(error.message || 'No se pudo cambiar el estado');
        }
    };

    const confirmarEliminacion = async () => {
        try {
            await merchService.eliminar(deleteTarget.id);
            toast.success('Producto eliminado');
            setDeleteTarget(null);
            await refetch();
        } catch (error) {
            // Con ventas el backend responde 409 y sugiere darlo de baja.
            toast.error(error.message || 'No se pudo eliminar el producto');
            setDeleteTarget(null);
        }
    };

    const reactivando = toggleTarget?.estado === 'INACTIVO';

    return (
        <div className="space-y-6 animate-fade-in-up p-1 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageTitle
                    title="Gestión de"
                    accent="Merch"
                    subtitle="Administra el inventario, precios y stock de la tienda."
                    subtitleClassName="text-slate-500 text-[11px] font-bold uppercase tracking-wider"
                />
                <button
                    type="button"
                    onClick={() => setFormTarget({})}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={16} /> Añadir nuevo merch
                </button>
            </div>

            <div className="bg-brand-surface p-3 rounded-2xl border border-brand-border shadow-sm">
                <SearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="BUSCAR PRODUCTO..."
                    wrapperClassName="relative"
                    className="w-full bg-brand-bg border-none rounded-xl pl-12 pr-4 py-2.5 text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-brand-accent/20"
                />
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : filtrados.length === 0 ? (
                <EmptyState icon={Gift} message="No hay productos que coincidan." />
            ) : (
                <div className="bg-brand-surface rounded-2xl border border-brand-border shadow-sm overflow-x-auto">
                    <table className="w-full text-left min-w-[640px]">
                        <thead>
                            <tr className="border-b border-brand-border text-[9px] font-black text-brand-muted uppercase tracking-widest">
                                <th className="px-5 py-4">Imagen</th>
                                <th className="px-5 py-4">Nombre</th>
                                <th className="px-5 py-4">Precio</th>
                                <th className="px-5 py-4">Stock</th>
                                <th className="px-5 py-4">Estado</th>
                                <th className="px-5 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtrados.map(p => {
                                const inactivo = p.estado === 'INACTIVO';
                                return (
                                    <tr key={p.id} className={`border-b border-brand-border-soft last:border-0 ${inactivo ? 'bg-brand-bg/60 opacity-70' : ''}`}>
                                        <td className="px-5 py-3">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden">
                                                <MerchImage item={p} iconSize={22} />
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="text-sm font-black text-brand-heading uppercase italic leading-tight">{p.nombre}</p>
                                            {p.descripcion && <p className="text-[10px] font-bold text-brand-muted line-clamp-1 max-w-xs">{p.descripcion}</p>}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-black text-green-600 italic">{formatSoles(p.precio)}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs font-black px-2.5 py-1 rounded-full ${Number(p.stock) === 0 ? 'bg-red-50 text-red-600' : Number(p.stock) <= STOCK_BAJO ? 'bg-brand-accent-soft text-brand-accent-dark' : 'bg-brand-surface-alt text-slate-600'}`}>
                                                {p.stock}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${inactivo ? 'bg-red-50 text-red-500' : 'bg-brand-gold-soft text-brand-gold-dark'}`}>
                                                {inactivo ? 'De baja' : 'Activo'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="flex justify-end gap-1">
                                                <button type="button" title="Editar" onClick={() => setFormTarget(p)} className="p-2 rounded-lg text-slate-400 hover:text-brand-primary hover:bg-brand-surface-alt transition-colors">
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    title={inactivo ? 'Reactivar' : 'Dar de baja'}
                                                    onClick={() => setToggleTarget(p)}
                                                    className={`p-2 rounded-lg transition-colors ${inactivo ? 'text-slate-400 hover:text-green-600 hover:bg-green-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                                >
                                                    {inactivo ? <PackageCheck size={16} /> : <PackageX size={16} />}
                                                </button>
                                                <button type="button" title="Eliminar" onClick={() => setDeleteTarget(p)} className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {formTarget && (
                <MerchFormModal
                    producto={formTarget.id ? formTarget : null}
                    onClose={() => setFormTarget(null)}
                    onSubmit={guardar}
                />
            )}

            <ConfirmModal
                isOpen={Boolean(toggleTarget)}
                onClose={() => setToggleTarget(null)}
                onConfirm={confirmarCambioEstado}
                iconType={reactivando ? 'warning' : 'danger'}
                title={reactivando ? '¿Reactivar producto?' : '¿Dar de baja?'}
                message={reactivando
                    ? `"${toggleTarget?.nombre}" volverá a mostrarse en la tienda.`
                    : `"${toggleTarget?.nombre}" dejará de mostrarse en la tienda. Los alumnos que ya lo tienen lo conservan.`}
                confirmText={reactivando ? 'Reactivar' : 'Dar de baja'}
            />

            <ConfirmModal
                isOpen={Boolean(deleteTarget)}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmarEliminacion}
                iconType="danger"
                title="¿Eliminar producto?"
                message={`"${deleteTarget?.nombre}" y su imagen se borrarán definitivamente. Si ya se vendió, no se podrá eliminar: dalo de baja en su lugar.`}
                confirmText="Eliminar"
            />
        </div>
    );
};

export default AdminMerchManager;
