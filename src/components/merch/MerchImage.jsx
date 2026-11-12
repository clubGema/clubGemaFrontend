import React from 'react';
import { getCategoriaMerch } from '../../config/merch';
import { isSafeImageUrl } from '../../utils/imageUpload';
import { obtenerImagenMerch } from '../../utils/merchCart';

// Imagen del ítem o, si no hay imagen_url (o no es segura), un placeholder por categoría.
// Para la Camiseta Oficial usa por defecto `/imperio7-camiseta-oficial.jpg` del repo.
const MerchImage = ({ item, className = '', iconSize = 56 }) => {
  const src = obtenerImagenMerch(item);
  if (isSafeImageUrl(src)) {
    return <img src={src} alt={item?.nombre || 'Merch'} referrerPolicy="no-referrer" className={`w-full h-full object-cover ${className}`} />;
  }
  const { icon: Icon } = getCategoriaMerch(item?.categoria);
  return (
    <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-primary-dark ${className}`}>
      <Icon size={iconSize} className="text-brand-gold" strokeWidth={1.5} />
    </div>
  );
};

export default MerchImage;
