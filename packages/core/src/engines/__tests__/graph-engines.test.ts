import { BfsEngine } from '../bfs';
import { DfsEngine } from '../dfs';
import { DijkstraEngine } from '../dijkstra';
import {
  parseWeightedGraphInput,
  parseUnweightedGraphInput,
} from '../../validators/dataset.validator';
import { GrafoData } from '../../types/simulation.types';

describe('Graph Engines (BFS & DFS)', () => {
  const testGrafo: GrafoData = {
    nodos: ['A', 'B', 'C', 'D', 'E', 'F'],
    aristas: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'D'],
      ['B', 'E'],
      ['C', 'F'],
    ],
    dirigido: false,
  };

  describe('BfsEngine', () => {
    it('recorre el grafo por niveles (FIFO) en orden determinista ascendente', () => {
      const engine = new BfsEngine();
      const steps = engine.execute({
        grafo: testGrafo,
        nodoInicio: 'A',
      });

      expect(steps.length).toBeGreaterThan(0);
      const operations = steps.map((s) => s.tipoOperacion);
      expect(operations).toContain('encolar');
      expect(operations).toContain('desencolar');
      expect(operations).toContain('visita');
      expect(operations[operations.length - 1]).toBe('final');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.visitados).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(lastStep.tipoEstructura).toBe('grafo');
    });

    it('ejecuta con grafo predeterminado cuando no se proporciona input', () => {
      const engine = new BfsEngine();
      const steps = engine.execute([]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].tipoOperacion).toBe('final');
    });

    it('expone pseudocódigo con 7 líneas', () => {
      const engine = new BfsEngine();
      expect(engine.getPseudocode()).toHaveLength(7);
    });
  });

  describe('DfsEngine', () => {
    it('recorre el grafo en profundidad (LIFO) de manera determinista', () => {
      const engine = new DfsEngine();
      const steps = engine.execute({
        grafo: testGrafo,
        nodoInicio: 'A',
      });

      expect(steps.length).toBeGreaterThan(0);
      const operations = steps.map((s) => s.tipoOperacion);
      expect(operations).toContain('apilar');
      expect(operations).toContain('desapilar');
      expect(operations).toContain('visita');
      expect(operations[operations.length - 1]).toBe('final');

      const lastStep = steps[steps.length - 1];
      // DFS explora A -> B -> D -> E -> C -> F
      expect(lastStep.visitados).toEqual(['A', 'B', 'D', 'E', 'C', 'F']);
    });

    it('difiere el orden de visita entre BFS y DFS en presencia de bifurcaciones', () => {
      const bfsEngine = new BfsEngine();
      const dfsEngine = new DfsEngine();

      const bfsSteps = bfsEngine.execute({ grafo: testGrafo, nodoInicio: 'A' });
      const dfsSteps = dfsEngine.execute({ grafo: testGrafo, nodoInicio: 'A' });

      const bfsVisitados = bfsSteps[bfsSteps.length - 1].visitados;
      const dfsVisitados = dfsSteps[dfsSteps.length - 1].visitados;

      expect(bfsVisitados).not.toEqual(dfsVisitados);
      expect(bfsVisitados).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
      expect(dfsVisitados).toEqual(['A', 'B', 'D', 'E', 'C', 'F']);
    });

    it('expone pseudocódigo con 8 líneas', () => {
      const engine = new DfsEngine();
      expect(engine.getPseudocode()).toHaveLength(8);
    });
  });

  describe('DijkstraEngine', () => {
    it('calcula los caminos mínimos correctamente en un grafo ponderado', () => {
      const engine = new DijkstraEngine();
      const steps = engine.execute({ nodoInicio: 'A' });

      expect(steps.length).toBeGreaterThan(0);
      const operations = steps.map((s) => s.tipoOperacion);
      expect(operations).toContain('desencolar');
      expect(operations).toContain('visita');
      expect(operations).toContain('comparacion');
      expect(operations).toContain('relajacion');
      expect(operations[operations.length - 1]).toBe('final');

      const lastStep = steps[steps.length - 1];
      expect(lastStep.distancias).toBeDefined();
      expect(lastStep.distancias?.['A']).toBe(0);
      expect(lastStep.distancias?.['C']).toBe(2);
      expect(lastStep.distancias?.['B']).toBe(3); // A -> C -> B (2 + 1 = 3 < 4)
      expect(lastStep.distancias?.['D']).toBe(8); // A -> C -> B -> D (3 + 5 = 8)
      expect(lastStep.distancias?.['E']).toBe(10); // A -> C -> B -> D -> E (8 + 2 = 10)
    });

    it('ejecuta con grafo predeterminado ante arreglo vacío', () => {
      const engine = new DijkstraEngine();
      const steps = engine.execute([]);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[steps.length - 1].tipoOperacion).toBe('final');
      expect(steps[steps.length - 1].distancias?.['A']).toBe(0);
    });

    it('expone pseudocódigo con 10 líneas', () => {
      const engine = new DijkstraEngine();
      expect(engine.getPseudocode()).toHaveLength(10);
    });
  });

  describe('parseWeightedGraphInput (Validador de entrada Dijkstra)', () => {
    it('parsea correctamente aristas en formato [origen, destino] peso', () => {
      const input = '[4, 5] 6, [5, 6] 2, [4, 6] 10';
      const result = parseWeightedGraphInput(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.grafo).toBeDefined();
      expect(result.grafo?.nodos).toEqual(['4', '5', '6']);
      expect(result.grafo?.aristas).toEqual([
        ['4', '5'],
        ['5', '6'],
        ['4', '6'],
      ]);
      expect(result.grafo?.pesos?.['4-5']).toBe(6);
      expect(result.grafo?.pesos?.['5-6']).toBe(2);
      expect(result.grafo?.pesos?.['4-6']).toBe(10);
    });

    it('soporta separación por saltos de línea y punto y coma', () => {
      const input = '[A, B] 4\n[B, C] 3; [A, C] 10';
      const result = parseWeightedGraphInput(input);

      expect(result.valid).toBe(true);
      expect(result.grafo?.nodos).toEqual(['A', 'B', 'C']);
      expect(result.grafo?.pesos?.['A-B']).toBe(4);
    });

    it('rechaza estrictamente entradas malformadas como [1,2,3,4] 1 2 3 con mensaje descriptivo', () => {
      const input = '[1,2,3,4] 1 2 3';
      const result = parseWeightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Formato inválido');
      expect(result.errors[0]).toContain('[1,2,3,4] 1 2 3');
      expect(result.grafo).toBeUndefined();
    });

    it('rechaza pesos negativos ya que Dijkstra requiere pesos no negativos', () => {
      const input = '[A, B] -5';
      const result = parseWeightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no puede ser negativo');
      expect(result.errors[0]).toContain('-5');
    });

    it('rechaza auto-bucles [A, A] 5', () => {
      const input = '[A, A] 5';
      const result = parseWeightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no puede conectar un nodo consigo mismo');
    });

    it('rechaza grafos con menos de 2 nodos o entradas vacías', () => {
      const emptyResult = parseWeightedGraphInput('');
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.errors[0]).toContain('al menos una arista');
    });
  });

  describe('parseUnweightedGraphInput (Validador de entrada BFS & DFS)', () => {
    it('parsea correctamente aristas no ponderadas en formato [origen, destino] (ej: [1, 3])', () => {
      const input = '[1, 3], [1, 2], [3, 4]';
      const result = parseUnweightedGraphInput(input);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.grafo).toBeDefined();
      expect(result.grafo?.nodos).toEqual(['1', '2', '3', '4']);
      expect(result.grafo?.aristas).toEqual([
        ['1', '3'],
        ['1', '2'],
        ['3', '4'],
      ]);
    });

    it('soporta separación con saltos de línea y punto y coma', () => {
      const input = '[A, B]\n[B, C]; [C, D]';
      const result = parseUnweightedGraphInput(input);

      expect(result.valid).toBe(true);
      expect(result.grafo?.nodos).toEqual(['A', 'B', 'C', 'D']);
      expect(result.grafo?.aristas).toHaveLength(3);
    });

    it('ejecuta BFS y DFS correctamente con el grafo personalizado parseado', () => {
      const parsed = parseUnweightedGraphInput('[1, 3], [1, 2], [3, 4]');
      expect(parsed.valid).toBe(true);

      const bfsEngine = new BfsEngine();
      const dfsEngine = new DfsEngine();

      const bfsSteps = bfsEngine.execute({ grafo: parsed.grafo!, nodoInicio: '1' });
      const dfsSteps = dfsEngine.execute({ grafo: parsed.grafo!, nodoInicio: '1' });

      // BFS desde 1: visita 1, luego vecinos en orden ascendente (2, 3), luego 4
      const lastBfs = bfsSteps[bfsSteps.length - 1];
      expect(lastBfs.visitados).toEqual(['1', '2', '3', '4']);

      // DFS desde 1: visita 1, profundiza en vecino menor 2 (sin más vecinos), retrocede y va a 3 -> 4
      const lastDfs = dfsSteps[dfsSteps.length - 1];
      expect(lastDfs.visitados).toEqual(['1', '2', '3', '4']);
    });

    it('rechaza si el usuario coloca pesos adicionales en BFS/DFS como [1, 3] 5', () => {
      const input = '[1, 3] 5';
      const result = parseUnweightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no llevan peso');
      expect(result.errors[0]).toContain('[1, 3]');
    });

    it('rechaza entradas malformadas como [1,2,3,4]', () => {
      const input = '[1,2,3,4]';
      const result = parseUnweightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Formato inválido');
      expect(result.errors[0]).toContain('exactamente dos nodos');
    });

    it('rechaza auto-bucles [1, 1]', () => {
      const input = '[1, 1]';
      const result = parseUnweightedGraphInput(input);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('no puede conectar un nodo consigo mismo');
    });

    it('rechaza entrada vacía o con menos de 2 nodos', () => {
      const emptyResult = parseUnweightedGraphInput('   ');
      expect(emptyResult.valid).toBe(false);
      expect(emptyResult.errors[0]).toContain('al menos una arista');
    });
  });
});
