/**
 * useSimulationEngine.ts
 * BrainSort — Hook para ejecutar algoritmos desde packages/core y el backend
 *
 * Responsabilidades:
 *   • Ejecutar el engine de un algoritmo con datos o grafo (SimulationInput)
 *   • Generar pasos de simulación (SimulationStep[])
 *   • Validar datos de entrada
 *   • Fallback automático a packages/core cuando la API no responde o está offline
 *   • Manejar timeout (10s máximo) para evitar bucles infinitos (HU-06)
 *   • Actualizar SimulationContext con los pasos y pseudocódigo generados
 */

import { useCallback, useState } from 'react';
import { useSimulationContext } from '../context/SimulationContext';
import { simulationService } from '../services/simulation.service';
import {
  AlgorithmEngine,
  BubbleSortEngine,
  SelectionSortEngine,
  InsertionSortEngine,
  MergeSortEngine,
  QuickSortEngine,
  HeapSortEngine,
  LinearSearchEngine,
  BinarySearchEngine,
  BfsEngine,
  DfsEngine,
  DijkstraEngine,
  StackEngine,
  QueueEngine,
  LinkedListEngine,
  DequeEngine,
  PriorityQueueEngine,
  SegmentTreeEngine,
  SimulationInput,
  SimulationStep,
  PseudocodeLine,
} from '@brainsort/core';

// ─── Constantes ───────────────────────────────────────────────────────────────

const API_TIMEOUT_MS = 3000;

// ─── Registro de Motores del Core ─────────────────────────────────────────────

const CORE_ENGINES: Record<string, AlgorithmEngine> = {
  'bubble sort': new BubbleSortEngine(),
  'bubble-sort': new BubbleSortEngine(),
  bubblesort: new BubbleSortEngine(),

  'selection sort': new SelectionSortEngine(),
  'selection-sort': new SelectionSortEngine(),
  selectionsort: new SelectionSortEngine(),

  'insertion sort': new InsertionSortEngine(),
  'insertion-sort': new InsertionSortEngine(),
  insertionsort: new InsertionSortEngine(),

  'merge sort': new MergeSortEngine(),
  'merge-sort': new MergeSortEngine(),
  mergesort: new MergeSortEngine(),

  'quick sort': new QuickSortEngine(),
  'quick-sort': new QuickSortEngine(),
  quicksort: new QuickSortEngine(),

  'heap sort': new HeapSortEngine(),
  'heap-sort': new HeapSortEngine(),
  heapsort: new HeapSortEngine(),

  'linear search': new LinearSearchEngine(),
  'linear-search': new LinearSearchEngine(),
  linearsearch: new LinearSearchEngine(),
  'búsqueda lineal': new LinearSearchEngine(),
  'busqueda lineal': new LinearSearchEngine(),

  'binary search': new BinarySearchEngine(),
  'binary-search': new BinarySearchEngine(),
  binarysearch: new BinarySearchEngine(),
  'búsqueda binaria': new BinarySearchEngine(),
  'busqueda binaria': new BinarySearchEngine(),

  'breadth-first search': new BfsEngine(),
  'breadth first search': new BfsEngine(),
  'breadth-first-search': new BfsEngine(),
  bfs: new BfsEngine(),

  'depth-first search': new DfsEngine(),
  'depth first search': new DfsEngine(),
  'depth-first-search': new DfsEngine(),
  dfs: new DfsEngine(),

  dijkstra: new DijkstraEngine(),
  'algoritmo de dijkstra': new DijkstraEngine(),
  'dijkstra algorithm': new DijkstraEngine(),

  stack: new StackEngine(),
  pila: new StackEngine(),

  queue: new QueueEngine(),
  cola: new QueueEngine(),

  'linked list': new LinkedListEngine(),
  'linked-list': new LinkedListEngine(),
  linkedlist: new LinkedListEngine(),
  'lista enlazada': new LinkedListEngine(),

  deque: new DequeEngine(),
  'cola doble': new DequeEngine(),

  'priority queue': new PriorityQueueEngine(),
  'priority-queue': new PriorityQueueEngine(),
  priorityqueue: new PriorityQueueEngine(),
  'cola de prioridad': new PriorityQueueEngine(),

  'segment tree': new SegmentTreeEngine(),
  'segment-tree': new SegmentTreeEngine(),
  segmenttree: new SegmentTreeEngine(),
  'árbol de segmentos': new SegmentTreeEngine(),
  'arbol de segmentos': new SegmentTreeEngine(),
};

/**
 * Resuelve un motor de simulación de packages/core por nombre o ID.
 */
export function getCoreEngine(nameOrId?: string): AlgorithmEngine | undefined {
  if (!nameOrId) return undefined;
  const key = nameOrId.trim().toLowerCase();
  if (CORE_ENGINES[key]) return CORE_ENGINES[key];

  for (const [k, engine] of Object.entries(CORE_ENGINES)) {
    if (key.includes(k) || k.includes(key)) return engine;
  }
  return undefined;
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface EngineError {
  code: 'INVALID_DATA' | 'TIMEOUT' | 'ENGINE_NOT_FOUND' | 'EXECUTION_ERROR';
  message: string;
}

export interface UseSimulationEngineReturn {
  executeAlgorithm: (
    algoritmoId: string,
    input: SimulationInput | number[],
    algorithmName?: string,
  ) => Promise<void>;
  isExecuting: boolean;
  error: EngineError | null;
}

// ─── Helper: Validar Datos ────────────────────────────────────────────────────

function validateData(data: number[]): void {
  if (!Array.isArray(data)) {
    throw new Error('INVALID_DATA: Datos no son un arreglo');
  }
  if (data.length === 0) {
    throw new Error('INVALID_DATA: El arreglo está vacío');
  }
  if (data.length > 1000) {
    throw new Error('INVALID_DATA: Arreglo muy grande (máx 1000 elementos)');
  }
  for (const valor of data) {
    if (!Number.isFinite(valor)) {
      throw new Error('INVALID_DATA: Contiene valores no numéricos');
    }
  }
}

// ─── Helper: Ejecutar con Timeout ─────────────────────────────────────────────

async function executeWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let completed = false;
    const timeoutId = setTimeout(() => {
      if (!completed) {
        completed = true;
        reject(new Error('TIMEOUT: La simulación tardó demasiado'));
      }
    }, timeoutMs);

    fn()
      .then((result) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutId);
          resolve(result);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timeoutId);
          reject(err);
        }
      });
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSimulationEngine(): UseSimulationEngineReturn {
  const { setSimulationData } = useSimulationContext();
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [error, setError] = useState<EngineError | null>(null);

  const executeAlgorithm = useCallback(
    async (
      algoritmoId: string,
      input: SimulationInput | number[],
      algorithmName?: string,
    ) => {
      setIsExecuting(true);
      setError(null);

      try {
        const isArrayInput = Array.isArray(input);
        const inputObj: SimulationInput = isArrayInput
          ? {
              tipoOrigen: 'Personalizado',
              valores: input,
              tamano: input.length,
            }
          : input;

        const isGraph = !!inputObj.grafo;
        const values = inputObj.valores ?? inputObj.data ?? [];

        if (isGraph) {
          if (
            !inputObj.grafo ||
            !Array.isArray(inputObj.grafo.nodos) ||
            inputObj.grafo.nodos.length < 2
          ) {
            throw new Error(
              'INVALID_DATA: El grafo debe tener al menos 2 nodos',
            );
          }
        } else {
          validateData(values);
        }

        const coreEngine =
          getCoreEngine(algorithmName) ?? getCoreEngine(algoritmoId);

        let steps: SimulationStep[] = [];
        let pseudocode: PseudocodeLine[] = [];
        let sesionSimulacion: any = undefined;
        let executionSuccess = false;

        try {
          const result = await executeWithTimeout(
            () =>
              simulationService.runSimulation({
                algoritmoId,
                conjuntoDeDatos: {
                  tipoOrigen: inputObj.tipoOrigen ?? 'Personalizado',
                  valores: isGraph ? undefined : values,
                  tamano: isGraph ? undefined : values.length,
                  objetivo: inputObj.objetivo,
                  grafo: inputObj.grafo,
                  nodoInicio: inputObj.nodoInicio,
                },
                objetivo: inputObj.objetivo,
              }),
            API_TIMEOUT_MS,
          );

          if (result && Array.isArray(result.pasos) && result.pasos.length > 0) {
            steps = result.pasos;
            pseudocode = result.pseudocode ?? [];
            if (result.simulacion?.sesionId) {
              sesionSimulacion = { id: result.simulacion.sesionId };
            }
            executionSuccess = true;
          }
        } catch {
          executionSuccess = false;
        }

        if (!executionSuccess) {
          if (coreEngine) {
            steps = coreEngine.execute(inputObj);
            pseudocode = coreEngine.getPseudocode();
            executionSuccess = true;
          } else {
            throw new Error(
              `ENGINE_NOT_FOUND: Motor no disponible para el algoritmo '${algorithmName ?? algoritmoId}'`,
            );
          }
        }

        if ((!pseudocode || pseudocode.length === 0) && coreEngine) {
          pseudocode = coreEngine.getPseudocode();
        }

        setSimulationData({
          steps,
          data: isGraph ? [] : [...values],
          grafo: inputObj.grafo,
          objetivo: inputObj.objetivo,
          nodoInicio: inputObj.nodoInicio,
          algoritmoId,
          pseudocode,
          sesionSimulacion,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        let engineError: EngineError;
        if (errorMessage.includes('INVALID_DATA')) {
          engineError = {
            code: 'INVALID_DATA',
            message: errorMessage.replace('INVALID_DATA: ', ''),
          };
        } else if (errorMessage.includes('TIMEOUT')) {
          engineError = {
            code: 'TIMEOUT',
            message:
              'El algoritmo tardó demasiado. Intenta con un conjunto de datos menor.',
          };
        } else if (errorMessage.includes('ENGINE_NOT_FOUND')) {
          engineError = {
            code: 'ENGINE_NOT_FOUND',
            message: `Algoritmo '${algorithmName ?? algoritmoId}' no disponible.`,
          };
        } else {
          engineError = {
            code: 'EXECUTION_ERROR',
            message: `Error ejecutando algoritmo: ${errorMessage}`,
          };
        }

        setError(engineError);
        throw engineError;
      } finally {
        setIsExecuting(false);
      }
    },
    [setSimulationData],
  );

  return {
    executeAlgorithm,
    isExecuting,
    error,
  };
}
