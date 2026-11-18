// T-FE-021: Barrel export de todos los módulos de packages/core

// engines/
export { AlgorithmEngine, SortEngine, AlgorithmDefinition } from './engines/engine.interface';
export { BubbleSortEngine } from './engines/bubble-sort';
export { SelectionSortEngine } from './engines/selection-sort';
export { InsertionSortEngine } from './engines/insertion-sort';
export { MergeSortEngine } from './engines/merge-sort';
export { QuickSortEngine } from './engines/quick-sort';
export { HeapSortEngine } from './engines/heap-sort';
export { LinearSearchEngine } from './engines/linear-search';
export { BinarySearchEngine } from './engines/binary-search';
export { BfsEngine } from './engines/bfs';
export { DfsEngine } from './engines/dfs';
export { DijkstraEngine, DEFAULT_WEIGHTED_GRAFO } from './engines/dijkstra';
export { StackEngine } from './engines/stack';
export { QueueEngine } from './engines/queue';
export { LinkedListEngine } from './engines/linked-list';
export { DequeEngine } from './engines/deque';
export { PriorityQueueEngine } from './engines/priority-queue';
export { SegmentTreeEngine } from './engines/segment-tree';

// math/
export { createScales } from './math/scales';
export type { ScalesConfig, ChartScales } from './math/scales';
export { getNumberInterpolator, interpolateValue, interpolateBarState } from './math/transitions';
export type { BarTransitionState } from './math/transitions';
export { calculateBarCoordinates, calculateBarPointers, calculateDiscardedBars } from './math/coordinates';
export type { BarCoordinate, BarPointer, DiscardedBarMarker } from './math/coordinates';
export { calculateCircularGraphLayout, calculateHierarchicalGraphLayout } from './math/graph-layout';
export type { GraphLayoutNode, GraphLayoutEdge, GraphLayoutResult, GraphLayoutConfig, HierarchicalGraphLayoutOptions } from './math/graph-layout';

// types/
export type { TipoOrigenDatos, ConjuntoDeDatos, SesionSimulacion, GrafoData, SimulationInput } from './types/simulation.types';
export type { CategoriaAlgoritmo, AlgoritmoMeta, Algoritmo, PseudocodeLine } from './types/algorithm.types';
export type { TipoOperacion, SimulationMarker, SimulationTreeNode, SimulationStep, PasoBase, PasoArray, PasoGrafo, RangoBusqueda } from './types/step.types';
export { isPasoGrafo, isPasoArray } from './types/step.types';

// validators/
export {
  validateDataset,
  validateGraphData,
  sugerirOrdenamiento,
  parseWeightedGraphInput,
  parseUnweightedGraphInput,
  splitWeightedGraphEntries,
} from './validators/dataset.validator';
export type {
  DatasetValidationResult,
  ParseWeightedGraphResult,
  ParseUnweightedGraphResult,
} from './validators/dataset.validator';
