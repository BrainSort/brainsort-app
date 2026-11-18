import { validateDataset } from '../dataset.validator';
import { ConjuntoDeDatos } from '../../types/simulation.types';

describe('dataset.validator', () => {
  it('Acepta arreglo válido de enteros', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 3,
      valores: [10, 5, 8],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('Rechaza arreglo vacío', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 0,
      valores: [],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('El arreglo de valores no puede estar vacío.');
  });

  it('Rechaza arreglo con valores no numéricos', () => {
    const dataset: any = {
      tipoOrigen: 'Personalizado',
      tamano: 3,
      valores: [1, 'texto', 3],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no es un número válido'))).toBe(true);
  });

  it('Rechaza arreglo con valores nulos o indefinidos', () => {
    const dataset: any = {
      tipoOrigen: 'Personalizado',
      tamano: 2,
      valores: [1, null],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('es nulo o indefinido'))).toBe(true);
  });

  it('Rechaza arreglo con valores no enteros', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 2,
      valores: [1.5, 2],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('debe ser un entero'))).toBe(true);
  });

  it('Valida rango de tamaño y consistencia', () => {
    const dataset: ConjuntoDeDatos = {
      tipoOrigen: 'Predeterminado',
      tamano: 5, // Tamaño dice 5
      valores: [1, 2, 3], // Pero solo hay 3 valores
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('no coincide con la longitud del arreglo'))).toBe(true);
  });

  it('Valida tipoOrigen correcto', () => {
    const dataset: any = {
      tipoOrigen: 'Invalido',
      tamano: 2,
      valores: [1, 2],
    };
    
    const result = validateDataset(dataset);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('tipoOrigen inválido'))).toBe(true);
  });

  describe('validaciones de búsqueda y grafos (Sprint 1)', () => {
    it('rechaza algoritmo de búsqueda sin objetivo entero', () => {
      const dataset: ConjuntoDeDatos = {
        tipoOrigen: 'Personalizado',
        valores: [1, 2, 3],
        tamano: 3,
      };

      const result = validateDataset(dataset, 'Linear Search');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('requiere un objetivo'))).toBe(true);
    });

    it('rechaza Búsqueda Binaria con arreglo desordenado', () => {
      const dataset: ConjuntoDeDatos = {
        tipoOrigen: 'Personalizado',
        valores: [10, 5, 20],
        tamano: 3,
        objetivo: 5,
      };

      const result = validateDataset(dataset, 'Binary Search');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ordenado ascendentemente'))).toBe(true);
    });

    it('sugerirOrdenamiento ordena un arreglo numérico', () => {
      const { sugerirOrdenamiento } = require('../dataset.validator');
      expect(sugerirOrdenamiento([30, 10, 20])).toEqual([10, 20, 30]);
    });

    it('rechaza grafo con menos de 2 nodos', () => {
      const dataset: any = {
        tipoOrigen: 'Personalizado',
        grafo: {
          nodos: ['A'],
          aristas: [],
          dirigido: false,
        },
      };

      const result = validateDataset(dataset, 'BFS');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('al menos 2 nodos'))).toBe(true);
    });

    it('rechaza grafo con arista a nodo inexistente', () => {
      const dataset: any = {
        tipoOrigen: 'Personalizado',
        grafo: {
          nodos: ['A', 'B'],
          aristas: [['A', 'Z']],
          dirigido: false,
        },
      };

      const result = validateDataset(dataset, 'DFS');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('inexistente'))).toBe(true);
    });

    it('rechaza nodo de inicio no existente en el grafo', () => {
      const dataset: any = {
        tipoOrigen: 'Personalizado',
        grafo: {
          nodos: ['A', 'B'],
          aristas: [['A', 'B']],
          dirigido: false,
        },
        nodoInicio: 'X',
      };

      const result = validateDataset(dataset, 'BFS');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nodo de inicio'))).toBe(true);
    });
  });
});

