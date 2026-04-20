import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';

export class SelectionSortEngine implements SortEngine {
  name = 'Selection Sort';

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;

      for (let j = i + 1; j < n; j++) {
        // Line 4: SI arreglo[j] < arreglo[minIdx]
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, minIdx],
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });

        if (array[j] < array[minIdx]) {
          // Line 5: minIdx = j
          minIdx = j;
        }
      }

      // Line 6: INTERCAMBIAR(arreglo[i], arreglo[minIdx])
      if (minIdx !== i) {
        const temp = array[i];
        array[i] = array[minIdx];
        array[minIdx] = temp;

        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'intercambio',
          indicesActivos: [i, minIdx],
          estadoArray: [...array],
          lineaPseudocodigo: 6,
        });
      }
    }

    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      indicesActivos: Array.from({ length: n }, (_, index) => index),
      estadoArray: [...array],
      lineaPseudocodigo: 1,
    });

    return steps;
  }
}
