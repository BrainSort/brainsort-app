// T-FE-021: Barrel export de todos los módulos de packages/core

// engines/
export { SortEngine, AlgorithmDefinition } from './engines/engine.interface';
export { BubbleSortEngine } from './engines/bubble-sort';
export { SelectionSortEngine } from './engines/selection-sort';
export { InsertionSortEngine } from './engines/insertion-sort';
export { MergeSortEngine } from './engines/merge-sort';

// math/
export { createScales } from './math/scales';
export type { ScalesConfig, ChartScales } from './math/scales';
export { getNumberInterpolator, interpolateValue, interpolateBarState } from './math/transitions';
export type { BarTransitionState } from './math/transitions';
export { calculateBarCoordinates } from './math/coordinates';
export type { BarCoordinate } from './math/coordinates';

// types/
export type { TipoOrigenDatos, ConjuntoDeDatos, SesionSimulacion } from './types/simulation.types';
export type { CategoriaAlgoritmo, AlgoritmoMeta, Algoritmo, PseudocodeLine } from './types/algorithm.types';
export type { TipoOperacion, SimulationStep } from './types/step.types';

// validators/
export { validateDataset } from './validators/dataset.validator';
export type { DatasetValidationResult } from './validators/dataset.validator';
