/**
 * searchPalette.ts
 * Paleta de colores con contraste AA y leyendas semánticas para simulación de búsqueda.
 */

export const SearchColors = {
  // Estados de elementos
  idle: '#2F80ED', // Azul neutro en rango
  activo: '#F5A623', // Amarillo de evaluación activa
  mid: '#00D4FF', // Cian vibrante para el punto medio
  descartado: '#1B2430', // Atenuado / fuera de rango
  descartadoBorder: 'rgba(255, 255, 255, 0.1)',
  encontrado: '#7ED321', // Verde brillante de éxito
  noEncontrado: '#E74C3C', // Rojo de elemento inexistente
  rangoActual: 'rgba(0, 212, 255, 0.25)', // Fondo sutil para subarreglo activo

  // Texto y etiquetas
  pointerL: '#00D4FF', // Cian para Left
  pointerR: '#9B51E0', // Morado para Right
  pointerMid: '#F5A623', // Naranja/Amarillo para Mid
  pointerI: '#F5A623', // Naranja para puntero i (lineal)
  textLight: '#FFFFFF',
  textMuted: '#8E9AA8',
};

export const SearchLegends = {
  linear: [
    { color: SearchColors.idle, label: 'Pendiente' },
    { color: SearchColors.activo, label: 'Buscando (i)' },
    { color: SearchColors.encontrado, label: 'Encontrado' },
  ],
  binary: [
    { color: SearchColors.idle, label: 'Buscando' },
    { color: SearchColors.mid, label: 'Elemento Medio (mid)' },
    { color: SearchColors.descartado, label: 'Descartado' },
    { color: SearchColors.encontrado, label: 'Encontrado' },
  ],
};
