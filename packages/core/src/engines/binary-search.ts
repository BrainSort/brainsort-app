import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';

export class BinarySearchEngine implements SortEngine {
  name = 'Binary Search';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'low = 0; high = n - 1', indent: 0 },
      { line: 2, text: 'Mientras low <= high', indent: 0 },
      { line: 3, text: 'mid = piso((low + high) / 2)', indent: 1 },
      { line: 4, text: 'Si arreglo[mid] == objetivo: devolver mid', indent: 1 },
      { line: 5, text: 'Si arreglo[mid] < objetivo: low = mid + 1', indent: 1 },
      { line: 6, text: 'Si no: high = mid - 1', indent: 1 },
    ];
  }

  execute(data: number[]): SimulationStep[] {
    const array = [...data].sort((a, b) => a - b);
    const target = array[Math.floor(array.length * 0.65)] ?? array[0];
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    let low = 0;
    let high = array.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'comparacion',
        indicesActivos: [low, mid, high],
        estadoArray: [...array],
        lineaPseudocodigo: 3,
      });

      if (array[mid] === target) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'final',
          indicesActivos: [mid],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });
        return steps;
      }

      if (array[mid] < target) {
        low = mid + 1;
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: Array.from({ length: Math.max(0, high - low + 1) }, (_, index) => low + index),
          estadoArray: [...array],
          lineaPseudocodigo: 5,
        });
      } else {
        high = mid - 1;
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: Array.from({ length: Math.max(0, high - low + 1) }, (_, index) => low + index),
          estadoArray: [...array],
          lineaPseudocodigo: 6,
        });
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: [],
      estadoArray: [...array],
      lineaPseudocodigo: 6,
    });
    return steps;
  }
}
