import {
  calculateCircularGraphLayout,
  calculateHierarchicalGraphLayout,
} from '../graph-layout';
import { calculateBarPointers, calculateDiscardedBars } from '../coordinates';
import { GrafoData } from '../../types/simulation.types';

describe('Graph Layout and Coordinate Utilities', () => {
  const testGrafo: GrafoData = {
    nodos: ['A', 'B', 'C', 'D'],
    aristas: [
      ['A', 'B'],
      ['B', 'C'],
      ['C', 'D'],
      ['D', 'A'],
    ],
    dirigido: true,
  };

  describe('calculateCircularGraphLayout', () => {
    it('produce coordenadas deterministas e idénticas en múltiples ejecuciones', () => {
      const config = { width: 400, height: 300, nodeRadius: 20, padding: 30 };
      const run1 = calculateCircularGraphLayout(testGrafo, config);
      const run2 = calculateCircularGraphLayout(testGrafo, config);

      expect(run1).toEqual(run2);
    });

    it('genera nodos con propiedades { id, x, y, r, label }', () => {
      const result = calculateCircularGraphLayout(testGrafo, { width: 300, height: 300 });

      expect(result.nodes).toHaveLength(4);
      result.nodes.forEach((node) => {
        expect(node).toHaveProperty('id');
        expect(typeof node.x).toBe('number');
        expect(typeof node.y).toBe('number');
        expect(node.r).toBe(24);
        expect(node.label).toBe(node.id);
      });
    });

    it('genera aristas con propiedades { from, to, x1, y1, x2, y2, dirigida }', () => {
      const result = calculateCircularGraphLayout(testGrafo, { width: 300, height: 300 });

      expect(result.edges).toHaveLength(4);
      result.edges.forEach((edge) => {
        expect(edge).toHaveProperty('from');
        expect(edge).toHaveProperty('to');
        expect(typeof edge.x1).toBe('number');
        expect(typeof edge.y1).toBe('number');
        expect(typeof edge.x2).toBe('number');
        expect(typeof edge.y2).toBe('number');
        expect(edge.dirigida).toBe(true);
      });
    });
  });

  describe('calculateBarPointers and calculateDiscardedBars', () => {
    it('genera punteros low, mid, high para coordenadas de barras', () => {
      const dummyCoords = [
        { id: '1', index: 0, value: 10, x: 10, y: 50, width: 20, height: 50 },
        { id: '2', index: 1, value: 20, x: 40, y: 30, width: 20, height: 70 },
        { id: '3', index: 2, value: 30, x: 70, y: 10, width: 20, height: 90 },
      ];

      const pointers = calculateBarPointers({ bajo: 0, medio: 1, alto: 2 }, dummyCoords);
      expect(pointers).toHaveLength(3);
      expect(pointers.map((p) => p.label)).toEqual(['low', 'mid', 'high']);
      expect(pointers[0].x).toBe(20);
    });

    it('marca barras descartadas fuera del rango', () => {
      const markers = calculateDiscardedBars(5, { bajo: 1, medio: 2, alto: 3 });
      expect(markers).toHaveLength(5);
      expect(markers[0].descartado).toBe(true);
      expect(markers[0].opacity).toBe(0.25);
      expect(markers[2].descartado).toBe(false);
      expect(markers[2].opacity).toBe(1.0);
      expect(markers[4].descartado).toBe(true);
    });
  });

  describe('calculateHierarchicalGraphLayout', () => {
    const binaryTreeGrafo: GrafoData = {
      nodos: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      aristas: [
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['B', 'E'],
        ['C', 'F'],
        ['C', 'G'],
      ],
      dirigido: false,
    };

    it('distribuye un árbol binario balanceado top-down en niveles crecientes de Y', () => {
      const result = calculateHierarchicalGraphLayout(
        binaryTreeGrafo,
        { width: 600, height: 360, nodeRadius: 24, padding: 40 },
        { startNodeId: 'A', orientation: 'top-down' },
      );

      expect(result.nodes).toHaveLength(7);
      const byId = new Map(result.nodes.map((n) => [n.id, n]));
      const a = byId.get('A')!;
      const b = byId.get('B')!;
      const c = byId.get('C')!;
      const d = byId.get('D')!;
      const g = byId.get('G')!;

      expect(a.x).toBe(300);
      expect(a.y).toBeLessThan(b.y);
      expect(b.y).toBe(c.y);
      expect(b.y).toBeLessThan(d.y);
      expect(d.y).toBe(g.y);
      expect(b.x).toBeLessThan(c.x);
      expect(d.x).toBeLessThan(g.x);

      // Aristas de árbol puro no necesitan curva Bézier
      result.edges.forEach((edge) => {
        expect(edge.cx).toBeUndefined();
        expect(edge.cy).toBeUndefined();
      });
    });

    it('distribuye una red ponderada left-to-right y curva aristas del mismo nivel o saltos', () => {
      const dijkstraGrafo: GrafoData = {
        nodos: ['A', 'B', 'C', 'D', 'E', 'F'],
        aristas: [
          ['A', 'B'],
          ['A', 'C'],
          ['B', 'C'],
          ['B', 'D'],
          ['C', 'D'],
          ['C', 'E'],
          ['D', 'F'],
          ['E', 'F'],
        ],
        dirigido: false,
        pesos: { 'B-C': 1 },
      };

      const result = calculateHierarchicalGraphLayout(
        dijkstraGrafo,
        { width: 640, height: 340, nodeRadius: 22, padding: 36 },
        { startNodeId: 'A', orientation: 'left-to-right' },
      );

      const byId = new Map(result.nodes.map((n) => [n.id, n]));
      expect(byId.get('A')!.x).toBeLessThan(byId.get('B')!.x);
      expect(byId.get('B')!.x).toBe(byId.get('C')!.x);
      expect(byId.get('B')!.x).toBeLessThan(byId.get('D')!.x);
      expect(byId.get('D')!.x).toBeLessThan(byId.get('F')!.x);

      const bcEdge = result.edges.find(
        (e) => (e.from === 'B' && e.to === 'C') || (e.from === 'C' && e.to === 'B'),
      );
      expect(bcEdge).toBeDefined();
      expect(typeof bcEdge!.cx).toBe('number');
      expect(typeof bcEdge!.cy).toBe('number');
      expect(byId.get('B')!.x - bcEdge!.cx!).toBeGreaterThanOrEqual(36);
      expect(bcEdge!.peso).toBe(1);
    });

    it('ubica nodos desconectados en una capa final limpia', () => {
      const disconnectedGrafo: GrafoData = {
        nodos: ['A', 'B', 'Z'],
        aristas: [['A', 'B']],
        dirigido: false,
      };

      const result = calculateHierarchicalGraphLayout(
        disconnectedGrafo,
        { width: 400, height: 300 },
        { startNodeId: 'A', orientation: 'top-down' },
      );

      const byId = new Map(result.nodes.map((n) => [n.id, n]));
      expect(byId.get('A')!.y).toBeLessThan(byId.get('B')!.y);
      expect(byId.get('B')!.y).toBeLessThan(byId.get('Z')!.y);
    });
  });
});
