import { AlgorithmEngine, SortEngine } from './engine.interface';
import { PasoGrafo } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';
import { GrafoData, SimulationInput } from '../types/simulation.types';

export const DEFAULT_WEIGHTED_GRAFO: GrafoData = {
  nodos: ['A', 'B', 'C', 'D', 'E'],
  aristas: [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'C'],
    ['B', 'D'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'E'],
  ],
  dirigido: false,
  pesos: {
    'A-B': 4,
    'A,B': 4,
    'B-A': 4,
    'B,A': 4,
    'A-C': 2,
    'A,C': 2,
    'C-A': 2,
    'C,A': 2,
    'B-C': 1,
    'B,C': 1,
    'C-B': 1,
    'C,B': 1,
    'B-D': 5,
    'B,D': 5,
    'D-B': 5,
    'D,B': 5,
    'C-D': 8,
    'C,D': 8,
    'D-C': 8,
    'D,C': 8,
    'C-E': 10,
    'C,E': 10,
    'E-C': 10,
    'E,C': 10,
    'D-E': 2,
    'D,E': 2,
    'E-D': 2,
    'E,D': 2,
  },
  aristasPonderadas: [
    ['A', 'B', 4],
    ['A', 'C', 2],
    ['B', 'C', 1],
    ['B', 'D', 5],
    ['C', 'D', 8],
    ['C', 'E', 10],
    ['D', 'E', 2],
  ],
};

interface PQItem {
  node: string;
  dist: number;
}

export class DijkstraEngine implements AlgorithmEngine, SortEngine {
  name = 'Dijkstra';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure Dijkstra(Grafo G, nodoInicio s):', indent: 0 },
      { line: 2, text: 'dist[s] = 0; dist[v] = ∞ para v ≠ s', indent: 1 },
      { line: 3, text: 'PQ = prioridad([(s, 0)]); visitados = {}', indent: 1 },
      { line: 4, text: 'Mientras PQ no esté vacía:', indent: 1 },
      { line: 5, text: '  u = PQ.extraerMinimo()', indent: 2 },
      { line: 6, text: '  Si u ya en visitados: continuar; visitados.agregar(u)', indent: 2 },
      { line: 7, text: '  Para cada vecino v de u (orden ascendente):', indent: 2 },
      { line: 8, text: '    Si dist[u] + peso(u, v) < dist[v]:', indent: 3 },
      { line: 9, text: '      dist[v] = dist[u] + peso(u, v); PQ.insertar((v, dist[v]))', indent: 4 },
      { line: 10, text: 'Caminos mínimos calculados → FIN', indent: 1 },
    ];
  }

  execute(input: SimulationInput | number[]): PasoGrafo[] {
    const isArrayInput = Array.isArray(input);
    const grafo: GrafoData = !isArrayInput && input.grafo ? input.grafo : DEFAULT_WEIGHTED_GRAFO;
    const nodoInicio: string =
      !isArrayInput && input.nodoInicio ? input.nodoInicio : (grafo.nodos[0] ?? 'A');

    const steps: PasoGrafo[] = [];
    let stepCount = 1;

    // Obtener peso de arista
    const getWeight = (u: string, v: string): number => {
      if (grafo.pesos) {
        if (grafo.pesos[`${u}-${v}`] !== undefined) return grafo.pesos[`${u}-${v}`];
        if (grafo.pesos[`${u},${v}`] !== undefined) return grafo.pesos[`${u},${v}`];
        if (!grafo.dirigido) {
          if (grafo.pesos[`${v}-${u}`] !== undefined) return grafo.pesos[`${v}-${u}`];
          if (grafo.pesos[`${v},${u}`] !== undefined) return grafo.pesos[`${v},${u}`];
        }
      }
      if (grafo.aristasPonderadas) {
        const found = grafo.aristasPonderadas.find(
          ([from, to]) => (from === u && to === v) || (!grafo.dirigido && from === v && to === u),
        );
        if (found !== undefined) return found[2];
      }
      return 1;
    };

    // Obtener vecinos en orden ascendente (determinismo)
    const getNeighbors = (node: string): string[] => {
      const neighbors: string[] = [];
      for (const [from, to] of grafo.aristas) {
        if (from === node && !neighbors.includes(to)) {
          neighbors.push(to);
        } else if (!grafo.dirigido && to === node && !neighbors.includes(from)) {
          neighbors.push(from);
        }
      }
      return neighbors.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      );
    };

    // Estructuras de datos
    const distancias: Record<string, number> = {};
    const caminoPrevio: Record<string, string | null> = {};
    for (const node of grafo.nodos) {
      distancias[node] = node === nodoInicio ? 0 : Infinity;
      caminoPrevio[node] = null;
    }

    const pq: PQItem[] = [{ node: nodoInicio, dist: 0 }];
    const visitados: string[] = [];

    // Helper para obtener nombres de frontera
    const getFrontera = (): string[] => pq.map((item) => item.node);

    // Paso inicial: Inicialización
    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'idle',
      tipoEstructura: 'grafo',
      nodoActual: nodoInicio,
      visitados: [...visitados],
      frontera: getFrontera(),
      distancias: { ...distancias },
      caminoPrevio: { ...caminoPrevio },
      lineaPseudocodigo: 2,
    });

    while (pq.length > 0) {
      // Ordenar por distancia ascendente, desempate determinista por ID de nodo
      pq.sort((a, b) => {
        if (a.dist !== b.dist) return a.dist - b.dist;
        return a.node.localeCompare(b.node, undefined, { numeric: true, sensitivity: 'base' });
      });

      const currentItem = pq.shift()!;
      const u = currentItem.node;

      // Paso: Extraer mínimo
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'desencolar',
        tipoEstructura: 'grafo',
        nodoActual: u,
        visitados: [...visitados],
        frontera: getFrontera(),
        distancias: { ...distancias },
        caminoPrevio: { ...caminoPrevio },
        lineaPseudocodigo: 5,
      });

      if (visitados.includes(u)) {
        continue;
      }

      // Marcar u como visitado (camino mínimo definitivo)
      visitados.push(u);
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'visita',
        tipoEstructura: 'grafo',
        nodoActual: u,
        visitados: [...visitados],
        frontera: getFrontera(),
        distancias: { ...distancias },
        caminoPrevio: { ...caminoPrevio },
        lineaPseudocodigo: 6,
      });

      // Explorar vecinos
      const neighbors = getNeighbors(u);
      for (const v of neighbors) {
        if (visitados.includes(v)) {
          continue;
        }

        const pesoArista = getWeight(u, v);
        const nuevaDist = distancias[u] + pesoArista;

        // Paso de evaluación/comparación
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'comparacion',
          tipoEstructura: 'grafo',
          nodoActual: u,
          nodoEvaluado: v,
          aristaActiva: [u, v],
          visitados: [...visitados],
          frontera: getFrontera(),
          distancias: { ...distancias },
          caminoPrevio: { ...caminoPrevio },
          lineaPseudocodigo: 8,
        });

        // Relajación si encontramos un camino más corto
        if (nuevaDist < distancias[v]) {
          distancias[v] = nuevaDist;
          caminoPrevio[v] = u;
          pq.push({ node: v, dist: nuevaDist });

          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'relajacion',
            tipoEstructura: 'grafo',
            nodoActual: u,
            nodoEvaluado: v,
            aristaActiva: [u, v],
            relajacion: true,
            visitados: [...visitados],
            frontera: getFrontera(),
            distancias: { ...distancias },
            caminoPrevio: { ...caminoPrevio },
            lineaPseudocodigo: 9,
          });
        }
      }
    }

    // Paso final
    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'final',
      tipoEstructura: 'grafo',
      nodoActual: null,
      visitados: [...visitados],
      frontera: [],
      distancias: { ...distancias },
      caminoPrevio: { ...caminoPrevio },
      lineaPseudocodigo: 10,
    });

    return steps.map((s) => ({ ...s, grafo }));
  }
}
