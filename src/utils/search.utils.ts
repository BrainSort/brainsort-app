/**
 * search.utils.ts
 * Utilidades puras para validación, formateo y ordenamiento en simulaciones de búsqueda.
 */

export interface ParsedListResult {
  values: number[];
  error?: string;
}

export interface TargetValidationResult {
  value?: number;
  error?: string;
}

/**
 * Valida y parsea una cadena CSV de enteros.
 * Mínimo 2 elementos, máximo 50, valores entre 0 y 999.
 */
export function parseDatasetInput(input: string): ParsedListResult {
  if (!input || !input.trim()) {
    return { values: [], error: 'Ingresa al menos 2 números separados por comas' };
  }

  const rawTokens = input.split(',').map((t) => t.trim()).filter((t) => t.length > 0);

  if (rawTokens.length < 2) {
    return { values: [], error: 'El arreglo debe tener al menos 2 elementos' };
  }

  if (rawTokens.length > 50) {
    return { values: [], error: 'El arreglo debe tener como máximo 50 elementos' };
  }

  const values: number[] = [];
  for (const token of rawTokens) {
    const num = Number(token);
    if (!Number.isInteger(num)) {
      return { values: [], error: `"${token}" no es un número entero válido` };
    }
    if (num < 0 || num > 999) {
      return { values: [], error: 'Los valores deben estar entre 0 y 999' };
    }
    values.push(num);
  }

  return { values };
}

/**
 * Determina si un arreglo de números está ordenado ascendentemente.
 */
export function isSortedAscending(arr: number[]): boolean {
  if (!arr || arr.length <= 1) return true;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

/**
 * Retorna una copia ordenada ascendentemente del arreglo.
 */
export function sortAscending(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

/**
 * Valida un valor objetivo (target).
 */
export function validateTargetInput(input: string): TargetValidationResult {
  const trimmed = input.trim();
  if (trimmed === '') {
    return { error: 'Ingresa un valor objetivo a buscar' };
  }

  const num = Number(trimmed);
  if (!Number.isInteger(num)) {
    return { error: 'El objetivo debe ser un número entero' };
  }

  if (num < 0 || num > 999) {
    return { error: 'El objetivo debe estar entre 0 y 999' };
  }

  return { value: num };
}

/**
 * Selecciona un valor objetivo representativo para sugerencias o 🎲.
 * @param arr Arreglo de números
 * @param forceExisting Si true, siempre elige uno existente; si false, puede generar uno inexistente
 */
export function pickSuggestedTarget(arr: number[], forceExisting = true): number {
  if (!arr || arr.length === 0) return 42;

  if (forceExisting || Math.random() > 0.3) {
    const randomIdx = Math.floor(Math.random() * arr.length);
    return arr[randomIdx];
  }

  // Generar un número inexistente
  const max = Math.max(...arr);
  return max + Math.floor(Math.random() * 20) + 1;
}
