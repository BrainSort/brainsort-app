import { SimulationStep, PseudocodeLine } from '../types/simulation';

export const SELECTION_SORT_PSEUDOCODE: PseudocodeLine[] = [
  { line: 1, text: 'procedimiento selectionSort(A : lista de elementos)', indent: 0 },
  { line: 2, text: 'n = longitud(A)', indent: 1 },
  { line: 3, text: 'para i = 1 hasta n-1 hacer', indent: 1 },
  { line: 4, text: '  minimo = i-1', indent: 2 },
  { line: 5, text: '  para j = i+1 hasta n hacer', indent: 2 },
  { line: 6, text: '    si A[j-1] < A[minimo] entonces', indent: 3 },
  { line: 7, text: '      minimo = j-1', indent: 4 },
  { line: 8, text: '    fin si', indent: 3 },
  { line: 9, text: '  fin para', indent: 2 },
  { line: 10, text: '  intercambiar(A[i-1], A[minimo])', indent: 2 },
  { line: 11, text: 'fin para', indent: 1 },
  { line: 12, text: 'fin procedimiento', indent: 0 },
];

export function generateSelectionSortSteps(input: number[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const A = [...input];
  const n = A.length;
  let pasoValue = 0;

  // Paso inicial: longitud
  steps.push({
    numeroPaso: pasoValue++,
    tipoOperacion: 'idle',
    indicesActivos: [],
    estadoArray: [...A],
    lineaPseudocodigo: 2,
  });

  for (let i = 0; i < n - 1; i++) {
    // Definir mínimo inicial
    let minIdx = i;
    steps.push({
      numeroPaso: pasoValue++,
      tipoOperacion: 'idle',
      indicesActivos: [minIdx],
      estadoArray: [...A],
      lineaPseudocodigo: 4,
    });

    for (let j = i + 1; j < n; j++) {
      // Comparación
      steps.push({
        numeroPaso: pasoValue++,
        tipoOperacion: 'comparacion',
        indicesActivos: [j, minIdx],
        estadoArray: [...A],
        lineaPseudocodigo: 6,
      });

      if (A[j] < A[minIdx]) {
        minIdx = j;
        // Actualizar mínimo
        steps.push({
          numeroPaso: pasoValue++,
          tipoOperacion: 'comparacion',
          indicesActivos: [minIdx],
          estadoArray: [...A],
          lineaPseudocodigo: 7,
        });
      }
    }

    // Intercambio
    if (minIdx !== i) {
      [A[i], A[minIdx]] = [A[minIdx], A[i]];
    }
    
    steps.push({
      numeroPaso: pasoValue++,
      tipoOperacion: 'intercambio',
      indicesActivos: [i, minIdx],
      estadoArray: [...A],
      lineaPseudocodigo: 10,
    });
  }

  // Paso final
  steps.push({
    numeroPaso: pasoValue++,
    tipoOperacion: 'final',
    indicesActivos: [],
    estadoArray: [...A],
    lineaPseudocodigo: 12,
  });

  return steps;
}
