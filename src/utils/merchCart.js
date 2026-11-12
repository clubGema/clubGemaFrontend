// Carrito de merch como mapa { [merchId]: cantidad }.

/** { 1: 2, 4: 1 } → [1, 1, 4]. El backend espera el ID repetido por cada unidad. */
export const qtyMapToIds = (qtyMap = {}) =>
  Object.entries(qtyMap).flatMap(([id, qty]) => Array(Math.max(0, Number(qty) || 0)).fill(Number(id)));

/** Líneas del carrito con su catálogo: [{ item, qty, subtotal }]. Ignora cantidades en 0. */
export const cartLines = (catalogo, qtyMap = {}) =>
  catalogo
    .filter(item => (qtyMap[item.id] || 0) > 0)
    .map(item => ({
      item,
      qty: qtyMap[item.id],
      subtotal: Number(item.precio) * qtyMap[item.id],
    }));

export const cartTotal = (lines) => lines.reduce((acc, l) => acc + l.subtotal, 0);
export const cartCount = (qtyMap = {}) => Object.values(qtyMap).reduce((acc, q) => acc + (q || 0), 0);

/** Ruta estática en el repo con la imagen recortada solo de la Camiseta Oficial Imperio 7. */
export const IMAGEN_CAMISETA_OFICIAL = '/imperio7-camiseta-oficial.jpg';

/** Identifica si el producto es una camiseta/polo oficial (no se bloquea por stock). */
export const esCamisetaMerch = (item) =>
  /\b(camiseta|polo)\b/i.test(String(item?.nombre ?? ''));

/**
 * Resuelve la imagen a mostrar para un ítem de merch:
 * - Si es camiseta y no tiene imagen propia subida a Cloudinary (o tiene un placeholder de Unsplash),
 *   usa siempre `/imperio7-camiseta-oficial.jpg` del repositorio.
 */
export const obtenerImagenMerch = (item) => {
  const url = String(item?.imagen_url ?? '').trim();
  const esPlaceholderDemo = /images\.unsplash\.com/i.test(url);
  if (esCamisetaMerch(item)) {
    if (!url || esPlaceholderDemo) return IMAGEN_CAMISETA_OFICIAL;
    return url;
  }
  return url || null;
};

/** true solo si NO es camiseta/polo y su stock llegó a 0. */
export const estaAgotadoMerch = (item) =>
  !esCamisetaMerch(item) && item?.stock != null && Number(item.stock) <= 0;

/** Tope de unidades por ítem: 99 para camiseta/polo, o el stock del catálogo para el resto. */
export const maxQty = (item) =>
  esCamisetaMerch(item)
    ? 99
    : item?.stock != null
      ? Math.max(0, Number(item.stock))
      : 99;

/** Devuelve un nuevo mapa con la cantidad fijada (0 elimina la entrada). */
export const withQty = (qtyMap, id, qty) => {
  const { [id]: _omit, ...rest } = qtyMap;
  return qty > 0 ? { ...rest, [id]: qty } : rest;
};
