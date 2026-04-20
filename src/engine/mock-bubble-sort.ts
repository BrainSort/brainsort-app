import { SimulationStep, PseudocodeLine } from '../types/simulation';

export const BUBBLE_SORT_PSEUDOCODE: PseudocodeLine[] = [
  { line: 1, text: 'procedimiento bubbleSort(A : lista de elementos)', indent: 0 },
  { line: 2, text: 'n = longitud(A)', indent: 1 },
  { line: 3, text: 'repetir', indent: 1 },
  { line: 4, text: 'intercambiado = falso', indent: 2 },
  { line: 5, text: 'para i = 1 hasta n-1 inclusive hacer', indent: 2 },
  { line: 6, text: 'si A[i-1] > A[i] entonces', indent: 3 },
  { line: 7, text: 'intercambiar(A[i-1], A[i])', indent: 4 },
  { line: 8, text: 'intercambiado = verdadero', indent: 4 },
  { line: 9, text: 'fin si', indent: 3 },
  { line: 10, text: 'fin para', indent: 2 },
  { line: 11, text: 'hasta que no intercambiado', indent: 1 },
  { line: 12, text: 'fin procedimiento', indent: 0 },
];

export function generateBubbleSortSteps(input: number[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const A = [...input];
  const n = A.length;
  let paso = 0;

  steps.push({
    numeroPaso: paso++,
    tipoOperacion: 'idle',
    indicesActivos: [],
    estadoArray: [...A],
    lineaPseudocodigo: 2,
  });

  let swapped;
  do {
    swapped = false;
    steps.push({
      numeroPaso: paso++,
      tipoOperacion: 'idle',
      indicesActivos: [],
      estadoArray: [...A],
      lineaPseudocodigo: 4,
    });

    for (let i = 1; i < n; i++) {
      // Comparación
      steps.push({
        numeroPaso: paso++,
        tipoOperacion: 'comparison',
        indicesActivos: [i - 1, i],
        estadoArray: [...A],
        lineaPseudocodigo: 6,
      });

      if (A[i - 1] > A[i]) {
        // Intercambio
        [A[i - 1], A[i]] = [A[i], A[i - 1]];
        swapped = true;
        
        steps.push({
          numeroPaso: paso++,
          tipoOperacion: 'swap',
          indicesActivos: [i - 1, i],
          estadoArray: [...A],
          lineaPseudocodigo: 7,
        });
      }
    }
  } while (swapped);

  steps.push({
    numeroPaso: paso++,
    tipoOperacion: 'idle',
    indicesActivos: [],
    estadoArray: [...A],
    lineaPseudocodigo: 12,
  });

  return steps;
}
