import { Accent, Neutral, Semantic, SimulationColors } from '../styles/colors';
import { TipoOperacion } from '@brainsort/core';

export interface OperationColorConfig {
  color: string;
  label: string;
  description: string;
  opacity?: number;
}

export const OPERATION_COLOR_MAP: Record<TipoOperacion, OperationColorConfig> = {
  idle: {
    color: SimulationColors.idle,
    label: 'Inactivo',
    description: 'Elemento en estado base de espera',
  },
  comparacion: {
    color: SimulationColors.comparacion,
    label: 'Comparación',
    description: 'Elemento en evaluación o lectura',
  },
  intercambio: {
    color: SimulationColors.intercambio,
    label: 'Intercambio',
    description: 'Modificación de posición o swap',
  },
  insercion: {
    color: Accent[500],
    label: 'Inserción',
    description: 'Inserción de elemento en su posición',
  },
  final: {
    color: SimulationColors.final,
    label: 'Finalizado',
    description: 'Posición ordenada final / completado',
  },
  encontrado: {
    color: SimulationColors.final,
    label: 'Encontrado',
    description: 'Elemento objetivo localizado exitosamente',
  },
  descarte: {
    color: Neutral[700],
    label: 'Descartado',
    description: 'Sub-rango descartado en búsqueda binaria',
    opacity: 0.25,
  },
  no_encontrado: {
    color: Semantic.error,
    label: 'No encontrado',
    description: 'Elemento objetivo no existe en el conjunto',
  },
  visita: {
    color: SimulationColors.comparacion,
    label: 'Visita',
    description: 'Nodo actualmente explorado en el grafo',
  },
  encolar: {
    color: Accent[500],
    label: 'Encolar',
    description: 'Nodo añadido a la cola de exploración',
  },
  desencolar: {
    color: Accent[300],
    label: 'Desencolar',
    description: 'Nodo extraído de la cola de exploración',
  },
  apilar: {
    color: Accent[500],
    label: 'Apilar',
    description: 'Nodo añadido a la pila de exploración',
  },
  desapilar: {
    color: Accent[300],
    label: 'Desapilar',
    description: 'Nodo extraído de la pila de exploración',
  },
  relajacion: {
    color: SimulationColors.final,
    label: 'Relajación',
    description: 'Actualización de distancia mínima hacia el nodo',
  },
};

export class ColorMapper {
  static getColorForOperation(operation?: string | null): string {
    if (!operation) return SimulationColors.idle;
    const op = operation.toLowerCase() as TipoOperacion;
    return OPERATION_COLOR_MAP[op]?.color ?? SimulationColors.idle;
  }

  static getOpacityForOperation(operation?: string | null): number {
    if (!operation) return 1.0;
    const op = operation.toLowerCase() as TipoOperacion;
    return OPERATION_COLOR_MAP[op]?.opacity ?? 1.0;
  }

  static getConfigForOperation(operation?: string | null): OperationColorConfig {
    if (!operation) return OPERATION_COLOR_MAP.idle;
    const op = operation.toLowerCase() as TipoOperacion;
    return OPERATION_COLOR_MAP[op] ?? OPERATION_COLOR_MAP.idle;
  }
}
