import { SimulationStep } from '../types/step.types';
import { AlgoritmoMeta, PseudocodeLine } from '../types/algorithm.types';
import { SimulationInput } from '../types/simulation.types';

/**
 * Interfaz base generalizada para todos los motores de algoritmos del core (búsqueda, ordenamiento, grafos).
 */
export interface AlgorithmEngine {
  name: string;
  execute(input: SimulationInput | number[]): SimulationStep[];
  getPseudocode(): PseudocodeLine[];
}

/**
 * Interfaz y alias retrocompatible para motores de ordenamiento preexistentes.
 */
export interface SortEngine {
  name: string;
  execute(input: any): SimulationStep[];
  getPseudocode(): PseudocodeLine[];
}

/**
 * Interfaz extendida para engines con metadatos y pseudocódigo completo (CDR-001).
 */
export interface AlgorithmDefinition {
  meta: AlgoritmoMeta;
  pseudocode: PseudocodeLine[];
  execute(input: SimulationInput | number[] | any): SimulationStep[];
}
