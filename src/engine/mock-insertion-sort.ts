import { SimulationStep, PseudocodeLine } from '../types/simulation';

export const INSERTION_SORT_PSEUDOCODE: PseudocodeLine[] = [
  { line: 1, text: 'procedimiento insertionSort(A : lista de elementos)', indent: 0 },
  { line: 2, text: 'n = longitud(A)', indent: 1 },
  { line: 3, text: 'para i = 1 hasta n-1 hacer', indent: 1 },
  { line: 4, text: '  clave = A[i]', indent: 2 },
  { line: 5, text: '  j = i - 1', indent: 2 },
  { line: 6, text: '  mientras j >= 0 y A[j] > clave hacer', indent: 2 },
  { line: 7, text: '    A[j + 1] = A[j]', indent: 3 },
  { line: 8, text: '    j = j - 1', indent: 3 },
  { line: 9, text: '  fin mientras', indent: 2 },
  { line: 10, text: '  A[j + 1] = clave', indent: 2 },
  { line: 11, text: 'fin para', indent: 1 },
  { line: 12, text: 'fin procedimiento', indent: 0 },
];

export function generateInsertionSortSteps(input: number[]): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const A = [...input];
  const n = A.length;
  let pasoValue = 0;

  // Paso inicial
  steps.push({
    numeroPaso: pasoValue++,
    tipoOperacion: 'idle',
    indicesActivos: [],
    estadoArray: [...A],
    lineaPseudocodigo: 2,
  });

  for (let i = 1; i < n; i++) {
    const key = A[i];
    
    // Selección de la clave
    steps.push({
      numeroPaso: pasoValue++,
      tipoOperacion: 'insercion',
      indicesActivos: [i],
      estadoArray: [...A],
      lineaPseudocodigo: 4,
    });

    let j = i - 1;
    
    // Mientras para buscar posición
    while (j >= 0 && A[j] > key) {
      // Comparación antes de mover
      steps.push({
        numeroPaso: pasoValue++,
        tipoOperacion: 'comparacion',
        indicesActivos: [j, j + 1],
        estadoArray: [...A],
        lineaPseudocodigo: 6,
      });

      A[j + 1] = A[j];
      
      // Desplazamiento
      steps.push({
        numeroPaso: pasoValue++,
        tipoOperacion: 'insercion',
        indicesActivos: [j, j + 1],
        estadoArray: [...A],
        lineaPseudocodigo: 7,
      });

      j = j - 1;
    }

    // Comparación final (donde falla la condición del mientras)
    if (j >= 0) {
      steps.push({
        numeroPaso: pasoValue++,
        tipoOperacion: 'comparacion',
        indicesActivos: [j, j + 1],
        estadoArray: [...A],
        lineaPseudocodigo: 6,
      });
    }

    A[j + 1] = key;
    
    // Inserción de la clave en su lugar
    steps.push({
      numeroPaso: pasoValue++,
      tipoOperacion: 'insercion',
      indicesActivos: [j + 1],
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
