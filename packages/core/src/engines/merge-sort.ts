import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';

export class MergeSortEngine implements SortEngine {
  name = 'Merge Sort';

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    const merge = (arr: number[], left: number, mid: number, right: number) => {
      const n1 = mid - left + 1;
      const n2 = right - mid;

      const L = new Array(n1);
      const R = new Array(n2);

      for (let i = 0; i < n1; i++) L[i] = arr[left + i];
      for (let j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

      let i = 0, j = 0;
      let k = left;

      while (i < n1 && j < n2) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [left + i, mid + 1 + j],
          estadoArray: [...arr],
          lineaPseudocodigo: 7, 
        });

        if (L[i] <= R[j]) {
          arr[k] = L[i];
          i++;
        } else {
          arr[k] = R[j];
          j++;
        }
        
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8, 
        });
        k++;
      }

      while (i < n1) {
        arr[k] = L[i];
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8, 
        });
        i++;
        k++;
      }

      while (j < n2) {
        arr[k] = R[j];
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'insercion',
          indicesActivos: [k],
          estadoArray: [...arr],
          lineaPseudocodigo: 8,
        });
        j++;
        k++;
      }
    };

    const mergeSort = (arr: number[], left: number, right: number) => {
      if (left < right) {
        const mid = Math.floor((left + right) / 2);

        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        
        merge(arr, left, mid, right);
      }
    };

    mergeSort(array, 0, n - 1);

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
