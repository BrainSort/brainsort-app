import { ChartScales } from './scales';

export interface BarCoordinate {
  id: string;
  index: number;
  value: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BarPointer {
  index: number;
  label: 'low' | 'mid' | 'high' | string;
  color: string;
  x: number;
  y: number;
}

export interface DiscardedBarMarker {
  index: number;
  descartado: boolean;
  opacity: number;
}

/**
 * Genera la geometría (x, y, width, height) para cada valor en el array, basado en las escalas d3 en SVG.
 * RECORDATORIO SVG: el origen (0,0) está arriba a la izquierda.
 */
export function calculateBarCoordinates(
  data: number[],
  scales: ChartScales,
): BarCoordinate[] {
  const barWidth =
    data.length > 1
      ? Math.abs(scales.xScale(1) - scales.xScale(0)) * 0.8 // 80% ancho de barra, 20% gap
      : Math.abs(scales.xScale.range()[1] - scales.xScale.range()[0]) * 0.5;

  // La línea base (suelo de las barras) se localiza en yScale evaluado con el valor 0
  const baseY = scales.yScale(0);

  return data.map((value, index) => {
    const centerX = scales.xScale(index);
    const topY = scales.yScale(value);

    // Altura de la barra es la diferencia desde la línea base hasta su punto más alto
    const height = Math.abs(baseY - topY);

    return {
      id: `bar_idx_${index}_val_${value}`,
      index,
      value,
      x: centerX - barWidth / 2, // Centramos la barra
      y: topY,
      width: barWidth,
      height,
    };
  });
}

/**
 * T-FE-004: Calcula las posiciones y colores de los punteros (low, mid, high) en el canvas de barras.
 */
export function calculateBarPointers(
  rango: { bajo: number; medio: number; alto: number },
  coordinates: BarCoordinate[],
): BarPointer[] {
  const pointers: BarPointer[] = [];

  if (rango.bajo >= 0 && rango.bajo < coordinates.length) {
    const bar = coordinates[rango.bajo];
    pointers.push({
      index: rango.bajo,
      label: 'low',
      color: '#00D4FF',
      x: bar.x + bar.width / 2,
      y: bar.y,
    });
  }

  if (rango.medio >= 0 && rango.medio < coordinates.length) {
    const bar = coordinates[rango.medio];
    pointers.push({
      index: rango.medio,
      label: 'mid',
      color: '#F5A623',
      x: bar.x + bar.width / 2,
      y: bar.y,
    });
  }

  if (rango.alto >= 0 && rango.alto < coordinates.length) {
    const bar = coordinates[rango.alto];
    pointers.push({
      index: rango.alto,
      label: 'high',
      color: '#00D4FF',
      x: bar.x + bar.width / 2,
      y: bar.y,
    });
  }

  return pointers;
}

/**
 * T-FE-004: Marca los elementos descartados en Búsqueda Binaria asignando opacidad atenuada.
 */
export function calculateDiscardedBars(
  totalBars: number,
  rango: { bajo: number; medio: number; alto: number },
  opacityDiscarded = 0.25,
): DiscardedBarMarker[] {
  const markers: DiscardedBarMarker[] = [];
  for (let i = 0; i < totalBars; i++) {
    const descartado = i < rango.bajo || i > rango.alto;
    markers.push({
      index: i,
      descartado,
      opacity: descartado ? opacityDiscarded : 1.0,
    });
  }
  return markers;
}
