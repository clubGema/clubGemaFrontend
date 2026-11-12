// Validación de imágenes subidas por el admin.
// Solo rasters conocidos: se rechaza SVG a propósito (puede llevar scripts).
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // mismo tope que multer en el backend

/**
 * Valida tipo y tamaño de un File antes de enviarlo (multipart) al backend, que lo sube a
 * Cloudinary. Lanza un Error con mensaje listo para mostrar en un toast.
 */
export const validateImageFile = (file) => {
  if (!TIPOS_PERMITIDOS.includes(file.type)) throw new Error('Solo se permiten imágenes JPG, PNG o WEBP');
  if (file.size > MAX_BYTES) throw new Error('La imagen no debe superar los 5 MB');
  return file;
};

/**
 * true solo para data URLs de imagen raster, http(s) (Cloudinary) o blob: locales de la vista
 * previa (URL.createObjectURL). Bloquea javascript:, SVG, etc.
 */
export const isSafeImageUrl = (url) =>
  typeof url === 'string' &&
  (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url) ||
    /^https?:\/\//i.test(url) ||
    /^blob:https?:\/\//i.test(url) ||
    /^\/[A-Za-z0-9._/-]+\.(jpe?g|png|webp)$/i.test(url));
