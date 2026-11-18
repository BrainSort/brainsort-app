import { AlgorithmEngine, SortEngine } from './engine.interface';
import { PasoGrafo } from '../types/step.types';
import { PseudocodeLine } from '../types/algorithm.types';
import { GrafoData, SimulationInput } from '../types/simulation.types';

const DEFAULT_GRAFO: GrafoData = {
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

export class BfsEngine implements AlgorithmEngine, SortEngine {
  name = 'Breadth-First Search';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure BFS(Grafo G, nodoInicio s):', indent: 0 },
      { line: 2, text: 'cola = [s]; visitados = {s}', indent: 1 },
      { line: 3, text: 'Mientras cola no esté vacía:', indent: 1 },
      { line: 4, text: 'u = cola.desencolar(); visitar u', indent: 2 },
      { line: 5, text: 'Para cada vecino v de u (orden ascendente):', indent: 2 },
      { line: 6, text: 'Si v no en visitados: cola.encolar(v)', indent: 3 },
      { line: 7, text: 'Recorrido BFS finalizado → FIN', indent: 1 },
    ];
  }

  execute(input: SimulationInput | number[]): PasoGrafo[] {
    const isArrayInput = Array.isArray(input);
    const grafo: GrafoData = (!isArrayInput && input.grafo) ? input.grafo : DEFAULT_GRAFO;
    const nodoInicio: string = (!isArrayInput && input.nodoInicio)
      ? input.nodoInicio
      : (grafo.nodos[0] ?? 'A');

    const steps: PasoGrafo[] = [];
    let stepCount = 1;

    // Regla de determinismo: vecinos en orden ascendente
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

    const cola: string[] = [nodoInicio];
    const visitados: string[] = [];
    const enqueued = new Set<string>([nodoInicio]);

    // Paso inicial de encolar raíz
    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'encolar',
      tipoEstructura: 'grafo',
      nodoActual: nodoInicio,
      visitados: [...visitados],
      frontera: [...cola],
      lineaPseudocodigo: 2,
    });

    while (cola.length > 0) {
      const u = cola.shift()!;

      // Desencolar
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'desencolar',
        tipoEstructura: 'grafo',
        nodoActual: u,
        visitados: [...visitados],
        frontera: [...cola],
        lineaPseudocodigo: 4,
      });

      // Visitar nodo
      if (!visitados.includes(u)) {
        visitados.push(u);
      }

      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'visita',
        tipoEstructura: 'grafo',
        nodoActual: u,
        visitados: [...visitados],
        frontera: [...cola],
        lineaPseudocodigo: 4,
      });

      // Explorar vecinos en orden ascendente
      const neighbors = getNeighbors(u);
      for (const v of neighbors) {
        if (!enqueued.has(v) && !visitados.includes(v)) {
          enqueued.add(v);
          cola.push(v);
          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'encolar',
            tipoEstructura: 'grafo',
            nodoActual: u,
            visitados: [...visitados],
            frontera: [...cola],
            aristaActiva: [u, v],
            lineaPseudocodigo: 6,
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
      lineaPseudocodigo: 7,
    });

    return steps.map((s) => ({ ...s, grafo }));
  }
}
