/**
 * useDataset.ts
 * BrainSort — Hook para generar y validar conjuntos de datos
 *
 * Responsabilidades:
 *   • Generar datos predeterminados (arreglos aleatorios, arreglos ordenados para búsqueda binaria, grafos estándar)
 *   • Validar datos personalizados del usuario
 *   • Control de objetivo numérico para algoritmos de búsqueda
 *   • Selector de grafos y nodo de inicio para BFS y DFS
 *   • Helper de auto-ordenado para asistir al usuario en Búsqueda Binaria
 */

import { useCallback, useState } from 'react';
import { GrafoData, sugerirOrdenamiento, DEFAULT_WEIGHTED_GRAFO } from '@brainsort/core';

export interface DatasetError {
  code:
    | 'EMPTY_ARRAY'
    | 'TOO_LARGE'
    | 'CONTAINS_NON_NUMERIC'
    | 'ALREADY_SORTED'
    | 'DUPLICATE_VALUES'
    | 'INVALID_OBJECTIVE'
    | 'UNSORTED_ARRAY'
    | 'INVALID_GRAPH';
  message: string;
}

export interface UseDatasetReturn {
  // Generadores
  generateDefault: (algorithmName?: string) => number[];
  generateRandomInt: (min: number, max: number, count: number) => number[];
  generateDefaultSorted: () => number[];
  generateDefaultGraph: (algorithmName?: string) => GrafoData;
  generateDefaultWeightedGraph: () => GrafoData;

  // Validación
  validateDataset: (data: number[], algorithmName?: string) => DatasetError | null;
  validateForAlgorithm: (params: {
    data?: number[];
    objetivo?: number;
    grafo?: GrafoData;
    nodoInicio?: string;
    algorithmName: string;
  }) => DatasetError | null;

  // Helpers
  autoOrdenar: (arr: number[]) => number[];

  // Estado contextual
  objetivo: number | null;
  setObjetivo: (val: number | null) => void;
  grafo: GrafoData | null;
  setGrafo: (g: GrafoData | null) => void;
  nodoInicio: string | null;
  setNodoInicio: (n: string | null) => void;

  lastError: DatasetError | null;
}

const MIN_SIZE = 3;
const MAX_SIZE = 1000;
const DEFAULT_MIN = 1;
const DEFAULT_MAX = 100;
const DEFAULT_SIZE_MIN = 8;
const DEFAULT_SIZE_MAX = 15;

const DEFAULT_GRAFO: GrafoData = {
  nodos: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  aristas: [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['B', 'E'],
    ['C', 'F'],
    ['C', 'G'],
  ],
  dirigido: false,
};

export function useDataset(): UseDatasetReturn {
  const [lastError, setLastError] = useState<DatasetError | null>(null);
  const [objetivo, setObjetivo] = useState<number | null>(null);
  const [grafo, setGrafo] = useState<GrafoData | null>(DEFAULT_GRAFO);
  const [nodoInicio, setNodoInicio] = useState<string | null>('A');

  const randomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const isArraySorted = (arr: number[]): boolean => {
    return arr.every((val, i, a) => i === 0 || a[i - 1] <= val);
  };

  const generateDefault = useCallback((algorithmName?: string): number[] => {
    if (algorithmName === 'Binary Search') {
      const size = randomInt(DEFAULT_SIZE_MIN, DEFAULT_SIZE_MAX);
      const data: number[] = [];
      for (let i = 0; i < size; i++) {
        data.push(randomInt(DEFAULT_MIN, DEFAULT_MAX));
      }
      const sorted = sugerirOrdenamiento(data);
      setLastError(null);
      setObjetivo(sorted[Math.floor(sorted.length * 0.65)] ?? sorted[0]);
      return sorted;
    }

    let data: number[];
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const size = randomInt(DEFAULT_SIZE_MIN, DEFAULT_SIZE_MAX);
      data = [];
      for (let i = 0; i < size; i++) {
        data.push(randomInt(DEFAULT_MIN, DEFAULT_MAX));
      }
      attempts++;
    } while (isArraySorted(data) && attempts < maxAttempts);

    setLastError(null);
    if (algorithmName === 'Linear Search') {
      setObjetivo(data[Math.floor(data.length / 2)] ?? data[0]);
    }
    return data;
  }, []);

  const generateDefaultSorted = useCallback((): number[] => {
    const size = randomInt(DEFAULT_SIZE_MIN, DEFAULT_SIZE_MAX);
    const data: number[] = [];
    for (let i = 0; i < size; i++) {
      data.push(randomInt(DEFAULT_MIN, DEFAULT_MAX));
    }
    const sorted = sugerirOrdenamiento(data);
    setLastError(null);
    setObjetivo(sorted[Math.floor(sorted.length * 0.65)] ?? sorted[0]);
    return sorted;
  }, []);

  const generateDefaultGraph = useCallback((algorithmName?: string): GrafoData => {
    setLastError(null);
    if (algorithmName?.toLowerCase().includes('dijkstra')) {
      setGrafo(DEFAULT_WEIGHTED_GRAFO);
      setNodoInicio('A');
      return DEFAULT_WEIGHTED_GRAFO;
    }
    setGrafo(DEFAULT_GRAFO);
    setNodoInicio('A');
    return DEFAULT_GRAFO;
  }, []);

  const generateDefaultWeightedGraph = useCallback((): GrafoData => {
    setLastError(null);
    setGrafo(DEFAULT_WEIGHTED_GRAFO);
    setNodoInicio('A');
    return DEFAULT_WEIGHTED_GRAFO;
  }, []);

  const generateRandomInt = useCallback(
    (min: number, max: number, count: number): number[] => {
      const data: number[] = [];
      for (let i = 0; i < count; i++) {
        data.push(randomInt(min, max));
      }
      setLastError(null);
      return data;
    },
    [],
  );

  const autoOrdenar = useCallback((arr: number[]): number[] => {
    const sorted = sugerirOrdenamiento(arr);
    setLastError(null);
    return sorted;
  }, []);

  const validateDataset = useCallback(
    (data: number[], algorithmName?: string): DatasetError | null => {
      if (!Array.isArray(data)) {
        const error: DatasetError = {
          code: 'EMPTY_ARRAY',
          message: 'Debes proporcionar un arreglo de números.',
        };
        setLastError(error);
        return error;
      }

      if (data.length === 0) {
        const error: DatasetError = {
          code: 'EMPTY_ARRAY',
          message: 'El arreglo no puede estar vacío.',
        };
        setLastError(error);
        return error;
      }

      if (data.length < MIN_SIZE) {
        const error: DatasetError = {
          code: 'EMPTY_ARRAY',
          message: `El arreglo debe tener al menos ${MIN_SIZE} elementos.`,
        };
        setLastError(error);
        return error;
      }

      if (data.length > MAX_SIZE) {
        const error: DatasetError = {
          code: 'TOO_LARGE',
          message: `El arreglo no puede tener más de ${MAX_SIZE} elementos.`,
        };
        setLastError(error);
        return error;
      }

      for (let i = 0; i < data.length; i++) {
        if (!Number.isFinite(data[i])) {
          const error: DatasetError = {
            code: 'CONTAINS_NON_NUMERIC',
            message: `Elemento en posición ${i} no es un número válido.`,
          };
          setLastError(error);
          return error;
        }
      }

      const isBinarySearch = algorithmName === 'Binary Search';
      if (isBinarySearch) {
        if (!isArraySorted(data)) {
          const error: DatasetError = {
            code: 'UNSORTED_ARRAY',
            message:
              'Para la Búsqueda Binaria, el conjunto de datos debe estar ordenado ascendentemente. Usa la opción de auto-ordenar.',
          };
          setLastError(error);
          return error;
        }
      } else if (
        algorithmName &&
        !['Linear Search', 'Binary Search Tree'].includes(algorithmName)
      ) {
        // En algoritmos de ordenamiento estándar, rechazar si ya está ordenado
        if (isArraySorted(data)) {
          const error: DatasetError = {
            code: 'ALREADY_SORTED',
            message: 'El arreglo ya está ordenado. La simulación sería trivial.',
          };
          setLastError(error);
          return error;
        }
      }

      setLastError(null);
      return null;
    },
    [],
  );

  const validateForAlgorithm = useCallback(
    (params: {
      data?: number[];
      objetivo?: number;
      grafo?: GrafoData;
      nodoInicio?: string;
      algorithmName: string;
    }): DatasetError | null => {
      const { data, objetivo: target, grafo: g, nodoInicio: start, algorithmName } = params;

      const isGraph =
        algorithmName === 'Breadth-First Search' ||
        algorithmName === 'Depth-First Search' ||
        algorithmName === 'BFS' ||
        algorithmName === 'DFS' ||
        algorithmName.toLowerCase().includes('dijkstra');

      if (isGraph) {
        if (!g || !Array.isArray(g.nodos) || g.nodos.length < 2) {
          const error: DatasetError = {
            code: 'INVALID_GRAPH',
            message: 'El grafo debe tener al menos 2 nodos.',
          };
          setLastError(error);
          return error;
        }
        if (start && !g.nodos.includes(start)) {
          const error: DatasetError = {
            code: 'INVALID_GRAPH',
            message: `El nodo de inicio "${start}" no existe en el grafo.`,
          };
          setLastError(error);
          return error;
        }
        setLastError(null);
        return null;
      }

      if (data) {
        const arrayErr = validateDataset(data, algorithmName);
        if (arrayErr) return arrayErr;
      }

      if (['Linear Search', 'Binary Search'].includes(algorithmName)) {
        if (target === undefined || target === null || isNaN(target) || !Number.isInteger(target)) {
          const error: DatasetError = {
            code: 'INVALID_OBJECTIVE',
            message: 'El algoritmo de búsqueda requiere un objetivo numérico entero.',
          };
          setLastError(error);
          return error;
        }
      }

      setLastError(null);
      return null;
    },
    [validateDataset],
  );

  return {
    generateDefault,
    generateRandomInt,
    generateDefaultSorted,
    generateDefaultGraph,
    generateDefaultWeightedGraph,
    validateDataset,
    validateForAlgorithm,
    autoOrdenar,
    objetivo,
    setObjetivo,
    grafo,
    setGrafo,
    nodoInicio,
    setNodoInicio,
    lastError,
  };
}
