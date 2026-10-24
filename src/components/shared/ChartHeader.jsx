import React from 'react';

/**
 * Cabecera de un gráfico del dashboard: barra de color + título + subtítulo.
 *
 * La cadena de clases del h2 y la del subtítulo eran literalmente idénticas en
 * los 6 gráficos; lo único que cambiaba era el color de la barra y los textos.
 * El `InfoTip` de cada gráfico entra como children, porque su copy es propio.
 */
const ChartHeader = ({ title, subtitle, barClassName = 'w-1.5 h-6 bg-brand-primary rounded-full', children }) => (
  <>
    <h2 className="font-black text-brand-primary uppercase tracking-tight text-xl italic mb-1 flex items-center gap-2">
      <div className={barClassName}></div> {title}
      {children}
    </h2>
    {subtitle && (
      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest ml-3.5">{subtitle}</p>
    )}
  </>
);

export default ChartHeader;
