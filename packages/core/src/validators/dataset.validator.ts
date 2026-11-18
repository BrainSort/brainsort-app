import { ConjuntoDeDatos, GrafoData, TipoOrigenDatos } from '../types/simulation.types';

export interface DatasetValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_ORIGENES: TipoOrigenDatos[] = ['Predeterminado', 'Personalizado'];

/**
 * Sugerencia de ordenamiento para asistir al usuario cuando introduce un dataset desordenado para Búsqueda Binaria.
 */
export function sugerirOrdenamiento(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

/**
 * Divide una cadena de entrada con aristas ponderadas respetando corchetes.
 * Soporta separadores como comas, punto y coma o saltos de línea fuera de corchetes.
 */
export function splitWeightedGraphEntries(input: string): string[] {
  const entries: string[] = [];
  let current = '';
  let insideBrackets = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '[') {
      insideBrackets = true;
      current += char;
    } else if (char === ']') {
      insideBrackets = false;
      current += char;
    } else if ((char === ',' || char === ';' || char === '\n' || char === '\r') && !insideBrackets) {
      if (current.trim().length > 0) {
        entries.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.trim().length > 0) {
    entries.push(current.trim());
  }
  return entries;
}

export interface ParseWeightedGraphResult {
  valid: boolean;
  grafo?: GrafoData;
  errors: string[];
}

export interface ParseUnweightedGraphResult {
  valid: boolean;
  grafo?: GrafoData;
  errors: string[];
}

/**
 * Parsea y valida estrictamente una entrada de grafo no ponderado para BFS y DFS en formato:
 * [origen, destino] (ej: [1, 3] o [A, B]).
 * Rechaza formatos inválidos, pesos adicionales, auto-bucles y aridades incorrectas con mensajes descriptivos.
 */
export function parseUnweightedGraphInput(
  input: string,
  dirigido = false,
): ParseUnweightedGraphResult {
  const errors: string[] = [];
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      errors: ['Debes ingresar al menos una arista en formato [origen, destino] (ej: [1, 3]).'],
    };
  }

  const entries = splitWeightedGraphEntries(trimmed);
  if (entries.length === 0) {
    return {
      valid: false,
      errors: ['No se encontraron aristas válidas en la entrada.'],
    };
  }

  const nodeSet = new Set<string>();
  const aristas: [string, string][] = [];

  const UNWEIGHTED_EDGE_REGEX = /^\[\s*([a-zA-Z0-9_-]+)\s*,\s*([a-zA-Z0-9_-]+)\s*\]$/;
  const WEIGHTED_EDGE_CHECK = /^\[\s*([a-zA-Z0-9_-]+)\s*,\s*([a-zA-Z0-9_-]+)\s*\]\s*\S+/;

  for (const entry of entries) {
    const match = entry.match(UNWEIGHTED_EDGE_REGEX);
    if (!match) {
      if (WEIGHTED_EDGE_CHECK.test(entry)) {
        errors.push(
          `Formato inválido en "${entry}". En BFS y DFS las aristas no llevan peso; usa el formato [origen, destino] (ej: [1, 3]).`,
        );
      } else {
        errors.push(
          `Formato inválido en "${entry}". Debe tener exactamente dos nodos entre corchetes (ej: [1, 3]).`,
        );
      }
      continue;
    }

    const [, from, to] = match;

    if (from === to) {
      errors.push(`La arista [${from}, ${to}] no puede conectar un nodo consigo mismo.`);
      continue;
    }

    nodeSet.add(from);
    nodeSet.add(to);
    aristas.push([from, to]);
  }

  const nodos = Array.from(nodeSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

  if (errors.length === 0) {
    if (nodos.length < 2) {
      errors.push('El grafo debe tener al menos 2 nodos distintos.');
    }
    if (aristas.length < 1) {
      errors.push('El grafo debe tener al menos 1 arista.');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    grafo: {
      nodos,
      aristas,
      dirigido,
    },
    errors: [],
  };
}

/**
 * Parsea y valida estrictamente una entrada de grafo ponderado en formato:
 * [origen, destino] peso (ej: [4, 5] 6 o [A, B] 4).
 * Rechaza formatos inválidos como [1,2,3,4] 1 2 3 con mensajes descriptivos.
 */
export function parseWeightedGraphInput(
  input: string,
  dirigido = false,
): ParseWeightedGraphResult {
  const errors: string[] = [];
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      valid: false,
      errors: ['Debes ingresar al menos una arista en formato [origen, destino] peso (ej: [4, 5] 6).'],
    };
  }

  const entries = splitWeightedGraphEntries(trimmed);
  if (entries.length === 0) {
    return {
      valid: false,
      errors: ['No se encontraron aristas válidas en la entrada.'],
    };
  }

  const nodeSet = new Set<string>();
  const aristas: [string, string][] = [];
  const pesos: Record<string, number> = {};
  const aristasPonderadas: [string, string, number][] = [];

  const EDGE_REGEX = /^\[\s*([a-zA-Z0-9_-]+)\s*,\s*([a-zA-Z0-9_-]+)\s*\]\s*(-?\d+(?:\.\d+)?)$/;

  for (const entry of entries) {
    const match = entry.match(EDGE_REGEX);
    if (!match) {
      errors.push(
        `Formato inválido en "${entry}". Debe tener exactamente dos nodos entre corchetes y un peso numérico (ej: [4, 5] 6).`,
      );
      continue;
    }

    const [, from, to, weightStr] = match;
    const weight = Number(weightStr);

    if (isNaN(weight)) {
      errors.push(`El peso en "${entry}" no es un número válido: "${weightStr}".`);
      continue;
    }

    if (weight < 0) {
      errors.push(
        `El peso de la arista [${from}, ${to}] no puede ser negativo (${weight}). Dijkstra requiere pesos >= 0.`,
      );
      continue;
    }

    if (from === to) {
      errors.push(`La arista [${from}, ${to}] no puede conectar un nodo consigo mismo.`);
      continue;
    }

    nodeSet.add(from);
    nodeSet.add(to);
    aristas.push([from, to]);
    pesos[`${from}-${to}`] = weight;
    pesos[`${from},${to}`] = weight;
    aristasPonderadas.push([from, to, weight]);

    if (!dirigido) {
      pesos[`${to}-${from}`] = weight;
      pesos[`${to},${from}`] = weight;
    }
  }

  const nodos = Array.from(nodeSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
  );

  if (errors.length === 0) {
    if (nodos.length < 2) {
      errors.push('El grafo debe tener al menos 2 nodos distintos.');
    }
    if (aristas.length < 1) {
      errors.push('El grafo debe tener al menos 1 arista ponderada.');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    grafo: {
      nodos,
      aristas,
      dirigido,
      pesos,
      aristasPonderadas,
    },
    errors: [],
  };
}

/**
 * Validador específico para estructuras de Grafo.
 */
export function validateGraphData(
  grafo?: GrafoData,
  nodoInicio?: string,
): DatasetValidationResult {
  const errors: string[] = [];

  if (!grafo) {
    errors.push('La estructura de grafo no puede estar vacía.');
    return { valid: false, errors };
  }

  if (!Array.isArray(grafo.nodos) || grafo.nodos.length < 2) {
    errors.push('El grafo debe tener al menos 2 nodos.');
  }

  const nodeSet = new Set(grafo.nodos ?? []);

  if (Array.isArray(grafo.aristas)) {
    for (const [from, to] of grafo.aristas) {
      if (!nodeSet.has(from)) {
        errors.push(`La arista [${from}, ${to}] contiene un nodo origen inexistente: "${from}".`);
      }
      if (!nodeSet.has(to)) {
        errors.push(`La arista [${from}, ${to}] contiene un nodo destino inexistente: "${to}".`);
      }
    }
  } else {
    errors.push('Las aristas del grafo deben ser una lista válida.');
  }

  if (nodoInicio !== undefined && !nodeSet.has(nodoInicio)) {
    errors.push(`El nodo de inicio "${nodoInicio}" no existe en el grafo.`);
  }

  if (grafo.pesos) {
    for (const [key, weight] of Object.entries(grafo.pesos)) {
      if (typeof weight !== 'number' || isNaN(weight) || weight < 0) {
        errors.push(`El peso asignado a la arista (${key}) debe ser un número >= 0. Recibido: ${weight}.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * T-FE-020: Valida un ConjuntoDeDatos antes de enviarlo al engine o a la API.
 * Soporta validación de Búsqueda (objetivo, orden ascendente en binaria) y Grafos.
 */
export function validateDataset(
  dataset: ConjuntoDeDatos,
  algorithmNameOrType?: string,
): DatasetValidationResult {
  const errors: string[] = [];

  // Validar tipoOrigen
  if (!VALID_ORIGENES.includes(dataset.tipoOrigen)) {
    errors.push(
      `tipoOrigen inválido: "${dataset.tipoOrigen}". Debe ser "Predeterminado" o "Personalizado".`,
    );
  }

  const isGraphAlgorithm =
    algorithmNameOrType === 'Breadth-First Search' ||
    algorithmNameOrType === 'Depth-First Search' ||
    algorithmNameOrType === 'BFS' ||
    algorithmNameOrType === 'DFS' ||
    algorithmNameOrType === 'Dijkstra' ||
    algorithmNameOrType === 'Algoritmo de Dijkstra' ||
    algorithmNameOrType === 'Grafos' ||
    dataset.grafo !== undefined;

  if (isGraphAlgorithm) {
    const graphResult = validateGraphData(dataset.grafo, dataset.nodoInicio);
    errors.push(...graphResult.errors);
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Validar que valores no esté vacío en estructuras lineales / arrays
  if (!Array.isArray(dataset.valores) || dataset.valores.length === 0) {
    errors.push('El arreglo de valores no puede estar vacío.');
    return { valid: false, errors };
  }

  // Validar que tamano coincida con la longitud real
  if (dataset.tamano !== undefined && dataset.tamano !== dataset.valores.length) {
    errors.push(
      `tamano (${dataset.tamano}) no coincide con la longitud del arreglo (${dataset.valores.length}).`,
    );
  }

  // Validar cada elemento del arreglo
  dataset.valores.forEach((val, idx) => {
    if (val === null || val === undefined) {
      errors.push(`El valor en el índice ${idx} es nulo o indefinido.`);
    } else if (typeof val !== 'number' || isNaN(val)) {
      errors.push(`El valor en el índice ${idx} no es un número válido: "${val}".`);
    } else if (!Number.isInteger(val)) {
      errors.push(`El valor en el índice ${idx} debe ser un entero: ${val}.`);
    }
  });

  const isSearchAlgorithm =
    algorithmNameOrType === 'Linear Search' ||
    algorithmNameOrType === 'Binary Search' ||
    algorithmNameOrType === 'Busqueda';

  if (isSearchAlgorithm) {
    if (dataset.objetivo === undefined || dataset.objetivo === null) {
      errors.push('El algoritmo de búsqueda requiere un objetivo numérico entero.');
    } else if (
      typeof dataset.objetivo !== 'number' ||
      isNaN(dataset.objetivo) ||
      !Number.isInteger(dataset.objetivo)
    ) {
      errors.push(`El objetivo debe ser un número entero válido: "${dataset.objetivo}".`);
    }
  }

  const isBinarySearch = algorithmNameOrType === 'Binary Search';
  if (isBinarySearch && Array.isArray(dataset.valores) && dataset.valores.length > 1) {
    for (let i = 0; i < dataset.valores.length - 1; i++) {
      if (dataset.valores[i] > dataset.valores[i + 1]) {
        errors.push(
          'Para la Búsqueda Binaria, el conjunto de datos debe estar ordenado ascendentemente.',
        );
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
