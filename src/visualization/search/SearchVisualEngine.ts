/**
 * SearchVisualEngine.ts
 * Motor lógico desacoplado de React para procesar pasos de simulación de búsqueda.
 * Transforma un SimulationStep en un SearchFrame con estado de cada celda y punteros.
 */

import type { SimulationStep } from '@brainsort/core';
import { SearchColors } from './searchPalette';

export type SearchCellState =
  | 'idle'
  | 'evaluando'
  | 'mid'
  | 'descartado'
  | 'encontrado'
  | 'visitado';

export interface SearchCellVisual {
  index: number;
  value: number;
  state: SearchCellState;
  color: string;
  isDimmed: boolean;
  pointerLabels: string[];
}

export interface SearchFrame {
  cells: SearchCellVisual[];
  pointers: Array<{ index: number; label: string; color: string }>;
  comparaciones: number;
  resultado: 'buscando' | 'encontrado' | 'noEncontrado' | 'idle';
  indiceEncontrado?: number;
  objetivo?: number;
  left?: number;
  right?: number;
  mid?: number;
  puntero?: number;
  isCompleted: boolean;
}

export class SearchVisualEngine {
  /**
   * Construye el SearchFrame para renderizado visual a partir de un SimulationStep.
   */
  static buildFrame(
    step: SimulationStep | null,
    algorithmName?: string,
    isCompleted = false,
  ): SearchFrame {
    const rawStep = step as any;
    const array: number[] = rawStep?.estadoArray ?? rawStep?.array ?? [];

    if (!step || array.length === 0) {
      return {
        cells: array.map((value, index) => ({
          index,
          value,
          state: 'idle',
          color: SearchColors.idle,
          isDimmed: false,
          pointerLabels: [],
        })),
        pointers: [],
        comparaciones: 0,
        resultado: 'idle',
        isCompleted: false,
      };
    }

    const isBinary = algorithmName === 'Binary Search';
    const ctx = (step as any)?.contexto;
    const marcadores = step.marcadores ?? [];

    const resultado =
      ctx?.resultado ??
      (step.tipoOperacion === 'final'
        ? step.indicesActivos && step.indicesActivos.length > 0
          ? 'encontrado'
          : 'noEncontrado'
        : 'buscando');

    const comparaciones = ctx?.comparaciones ?? 0;
    const indiceEncontrado = ctx?.indiceEncontrado ?? (resultado === 'encontrado' ? step.indicesActivos?.[0] : undefined);
    const objetivo = ctx?.objetivo;
    const left = ctx?.left;
    const right = ctx?.right;
    const mid = ctx?.mid;
    const puntero = ctx?.puntero ?? (step.indicesActivos?.[0] ?? -1);

    // Mapeo de punteros a partir de marcadores o contexto
    const pointerMap: Record<number, { labels: string[]; color: string }> = {};

    marcadores.forEach((m) => {
      if (m.role === 'descartado') return;
      if (!pointerMap[m.index]) {
        pointerMap[m.index] = { labels: [], color: m.color || SearchColors.activo };
      }
      if (m.label && !pointerMap[m.index].labels.includes(m.label)) {
        pointerMap[m.index].labels.push(m.label);
      }
    });

    // Si no había marcadores explícitos, derivar desde contexto
    if (Object.keys(pointerMap).length === 0) {
      if (isBinary) {
        if (left !== undefined && left >= 0 && left < array.length) {
          pointerMap[left] = { labels: ['L'], color: SearchColors.pointerL };
        }
        if (right !== undefined && right >= 0 && right < array.length) {
          if (pointerMap[right]) {
            pointerMap[right].labels.push('R');
          } else {
            pointerMap[right] = { labels: ['R'], color: SearchColors.pointerR };
          }
        }
        if (mid !== undefined && mid >= 0 && mid < array.length) {
          if (pointerMap[mid]) {
            pointerMap[mid].labels.push('M');
            pointerMap[mid].color = SearchColors.mid;
          } else {
            pointerMap[mid] = { labels: ['M'], color: SearchColors.mid };
          }
        }
      } else {
        if (puntero >= 0 && puntero < array.length) {
          pointerMap[puntero] = { labels: [`i=${puntero}`], color: SearchColors.pointerI };
        }
      }
    }

    const cells: SearchCellVisual[] = array.map((value, index) => {
      // 1. Caso encontrado
      if (resultado === 'encontrado' && index === indiceEncontrado) {
        return {
          index,
          value,
          state: 'encontrado',
          color: SearchColors.encontrado,
          isDimmed: false,
          pointerLabels: ['★ Encontrado'],
        };
      }

      // 2. Búsqueda binaria: descartado si está fuera de [left, right] o si tiene marcador 'descartado'
      const hasDiscardedMarker = marcadores.some(
        (m) => m.index === index && m.role === 'descartado',
      );
      const isOutsideRange =
        isBinary &&
        left !== undefined &&
        right !== undefined &&
        (index < left || index > right);

      if (hasDiscardedMarker || isOutsideRange) {
        return {
          index,
          value,
          state: 'descartado',
          color: SearchColors.descartado,
          isDimmed: true,
          pointerLabels: [],
        };
      }

      // 3. Caso elemento medio (mid) en binaria
      const isMid = isBinary && (index === mid || pointerMap[index]?.labels.some((l) => l.includes('M')));
      if (isMid) {
        return {
          index,
          value,
          state: 'mid',
          color: SearchColors.mid,
          isDimmed: false,
          pointerLabels: pointerMap[index]?.labels ?? ['M'],
        };
      }

      // 4. Caso evaluando activamente
      const isEvaluating = step.indicesActivos?.includes(index) || pointerMap[index] !== undefined;
      if (isEvaluating) {
        return {
          index,
          value,
          state: 'evaluando',
          color: SearchColors.activo,
          isDimmed: false,
          pointerLabels: pointerMap[index]?.labels ?? [],
        };
      }

      // 5. Caso lineal: casillas ya recorridas (visitadas sin éxito)
      if (!isBinary && puntero > index) {
        return {
          index,
          value,
          state: 'visitado',
          color: SearchColors.idle,
          isDimmed: true,
          pointerLabels: [],
        };
      }

      // 6. En espera / dentro de rango
      return {
        index,
        value,
        state: 'idle',
        color: SearchColors.idle,
        isDimmed: false,
        pointerLabels: pointerMap[index]?.labels ?? [],
      };
    });

    const pointers = Object.entries(pointerMap).map(([idxStr, info]) => ({
      index: Number(idxStr),
      label: info.labels.join('/'),
      color: info.color,
    }));

    return {
      cells,
      pointers,
      comparaciones,
      resultado,
      indiceEncontrado,
      objetivo,
      left,
      right,
      mid,
      puntero,
      isCompleted: isCompleted || resultado === 'encontrado' || resultado === 'noEncontrado',
    };
  }
}
