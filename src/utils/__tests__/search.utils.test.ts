import {
  parseDatasetInput,
  isSortedAscending,
  sortAscending,
  validateTargetInput,
  pickSuggestedTarget,
} from '../search.utils';

describe('search.utils', () => {
  describe('parseDatasetInput', () => {
    it('debe parsear correctamente una lista válida separada por comas', () => {
      const result = parseDatasetInput('5, 12, 34, 78');
      expect(result.error).toBeUndefined();
      expect(result.values).toEqual([5, 12, 34, 78]);
    });

    it('debe rechazar entradas vacías o solo espacios', () => {
      expect(parseDatasetInput('').error).toBeDefined();
      expect(parseDatasetInput('   ').error).toBeDefined();
    });

    it('debe rechazar entradas con menos de 2 elementos', () => {
      const result = parseDatasetInput('42');
      expect(result.error).toBe('El arreglo debe tener al menos 2 elementos');
      expect(result.values).toEqual([]);
    });

    it('debe rechazar entradas con más de 50 elementos', () => {
      const numbers = Array.from({ length: 51 }, (_, i) => i).join(', ');
      const result = parseDatasetInput(numbers);
      expect(result.error).toBe('El arreglo debe tener como máximo 50 elementos');
    });

    it('debe rechazar tokens que no son enteros válidos', () => {
      const result = parseDatasetInput('5, abc, 12');
      expect(result.error).toContain('"abc" no es un número entero válido');
    });

    it('debe rechazar valores negativos o mayores a 999', () => {
      expect(parseDatasetInput('-5, 10, 20').error).toBe(
        'Los valores deben estar entre 0 y 999',
      );
      expect(parseDatasetInput('10, 1000, 20').error).toBe(
        'Los valores deben estar entre 0 y 999',
      );
    });
  });

  describe('isSortedAscending', () => {
    it('debe retornar true para arreglos vacíos o con un solo elemento', () => {
      expect(isSortedAscending([])).toBe(true);
      expect(isSortedAscending([5])).toBe(true);
    });

    it('debe retornar true para arreglos ordenados ascendentemente', () => {
      expect(isSortedAscending([1, 2, 3, 4, 5])).toBe(true);
      expect(isSortedAscending([10, 20, 20, 30])).toBe(true); // duplicados permitidos
    });

    it('debe retornar false para arreglos desordenados', () => {
      expect(isSortedAscending([5, 2, 8])).toBe(false);
      expect(isSortedAscending([1, 2, 0])).toBe(false);
    });
  });

  describe('sortAscending', () => {
    it('debe ordenar ascendentemente sin mutar el arreglo original', () => {
      const original = [30, 10, 50, 20];
      const sorted = sortAscending(original);
      expect(sorted).toEqual([10, 20, 30, 50]);
      expect(original).toEqual([30, 10, 50, 20]);
    });
  });

  describe('validateTargetInput', () => {
    it('debe aceptar números enteros válidos entre 0 y 999', () => {
      expect(validateTargetInput('42')).toEqual({ value: 42 });
      expect(validateTargetInput(' 0 ')).toEqual({ value: 0 });
      expect(validateTargetInput('999')).toEqual({ value: 999 });
    });

    it('debe rechazar cadenas vacías', () => {
      expect(validateTargetInput('').error).toBeDefined();
    });

    it('debe rechazar números decimales o texto', () => {
      expect(validateTargetInput('3.14').error).toContain('número entero');
      expect(validateTargetInput('hola').error).toContain('número entero');
    });

    it('debe rechazar fuera de rango 0-999', () => {
      expect(validateTargetInput('-1').error).toBeDefined();
      expect(validateTargetInput('1000').error).toBeDefined();
    });
  });

  describe('pickSuggestedTarget', () => {
    it('debe retornar 42 si el arreglo está vacío', () => {
      expect(pickSuggestedTarget([])).toBe(42);
    });

    it('debe retornar un elemento del arreglo si forceExisting es true', () => {
      const arr = [10, 25, 50];
      const target = pickSuggestedTarget(arr, true);
      expect(arr).toContain(target);
    });
  });
});
