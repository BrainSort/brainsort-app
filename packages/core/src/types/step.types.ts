import { GrafoData } from './simulation.types';

export type TipoOperacion =
  | 'idle'
  | 'comparacion'
  | 'intercambio'
  | 'insercion'
  | 'final'
  | 'descarte'
  | 'encontrado'
  | 'no_encontrado'
  | 'visita'
  | 'encolar'
  | 'desencolar'
  | 'apilar'
  | 'desapilar'
  | 'relajacion';

export interface SimulationMarker {
  index: number;
  label: string;
  role: string;
  color: string;
}

export interface SimulationTreeNode {
  index: number;
  value: number | null;
  level: number;
  position: number;
  label?: string;
}

export interface SimulationStepContext {
  waitingIndices?: number[];
}

export interface RangoBusqueda {
  bajo: number;
  medio: number;
  alto: number;
}

export interface PasoBase {
  numeroPaso: number;
  tipoOperacion: TipoOperacion;
  lineaPseudocodigo: number;
  marcadores?: SimulationMarker[];
  contexto?: SimulationStepContext;
}

export interface PasoArray extends PasoBase {
  tipoEstructura?: 'array';
  indicesActivos: number[];
  estadoArray: number[];
  rango?: RangoBusqueda;
  nodosArbol?: SimulationTreeNode[];
}

export interface PasoGrafo extends PasoBase {
  tipoEstructura: 'grafo';
  nodoActual: string | null;
  visitados: string[];
  frontera: string[];
  aristaActiva?: [string, string];
  grafo?: GrafoData;
  distancias?: Record<string, number>;
  caminoPrevio?: Record<string, string | null>;
  nodoEvaluado?: string | null;
  relajacion?: boolean;
  indicesActivos?: number[];
  estadoArray?: number[];
  rango?: RangoBusqueda;
  nodosArbol?: SimulationTreeNode[];
}

export type SimulationStep = PasoArray | PasoGrafo;

export function isPasoGrafo(step: SimulationStep): step is PasoGrafo {
  return step.tipoEstructura === 'grafo';
}

export function isPasoArray(step: SimulationStep): step is PasoArray {
  return step.tipoEstructura !== 'grafo';
}
