import { SortEngine } from './engine.interface';
import { SimulationStep } from '../types/step.types';

export class InsertionSortEngine implements SortEngine {
  name = 'Insertion Sort';

  execute(data: number[]): SimulationStep[] {
    const steps: SimulationStep[] = [];
    let stepCount = 1;
    const array = [...data];
    const n = array.length;

    if (n === 0) return steps;

    for (let i = 1; i < n; i++) {
      const clave = array[i];
      let j = i - 1;

      if (j >= 0) {
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          indicesActivos: [j, Math.min(j + 1, i)], 
          estadoArray: [...array],
          lineaPseudocodigo: 4,
        });
      }

      while (j >= 0 && array[j] > clave) {
        // Line 5: arreglo[j+1] = arreglo[j]
        array[j + 1] = array[j];
        
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'intercambio',
          indicesActivos: [j, j + 1],
          estadoArray: [...array],
          lineaPseudocodigo: 5,
        });

        j = j - 1;

        if (j >= 0) {
          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'comparacion',
            indicesActivos: [j, j + 1],
            estadoArray: [...array],
            lineaPseudocodigo: 4,
          });
        }
      }

      // Line 7: arreglo[j+1] = clave
      array[j + 1] = clave;
      
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'insercion',
        indicesActivos: [j + 1],
        estadoArray: [...array],
        lineaPseudocodigo: 7,
      });
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
