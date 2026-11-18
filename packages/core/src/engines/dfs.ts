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

export class DfsEngine implements AlgorithmEngine, SortEngine {
  name = 'Depth-First Search';

  getPseudocode(): PseudocodeLine[] {
    return [
      { line: 1, text: 'procedure DFS(Grafo G, nodoInicio s):', indent: 0 },
      { line: 2, text: 'pila = [s]; visitados = {}', indent: 1 },
      { line: 3, text: 'Mientras pila no esté vacía:', indent: 1 },
      { line: 4, text: 'u = pila.desapilar(); Si u no visitado:', indent: 2 },
      { line: 5, text: 'visitar u; marcar visitado', indent: 3 },
      { line: 6, text: 'Para cada vecino v de u (orden descendente al apilar):', indent: 3 },
      { line: 7, text: 'Si v no en visitados: pila.apilar(v)', indent: 4 },
      { line: 8, text: 'Recorrido DFS finalizado → FIN', indent: 1 },
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

    // Obtener vecinos deterministas
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

    const pila: string[] = [nodoInicio];
    const visitados: string[] = [];
    const visitedSet = new Set<string>();

    // Paso inicial de apilar nodo raíz
    steps.push({
      numeroPaso: stepCount++,
      tipoOperacion: 'apilar',
      tipoEstructura: 'grafo',
      nodoActual: nodoInicio,
      visitados: [...visitados],
      frontera: [...pila],
      lineaPseudocodigo: 2,
    });

    while (pila.length > 0) {
      const u = pila.pop()!;

      // Desapilar
      steps.push({
        numeroPaso: stepCount++,
        tipoOperacion: 'desapilar',
        tipoEstructura: 'grafo',
        nodoActual: u,
        visitados: [...visitados],
        frontera: [...pila],
        lineaPseudocodigo: 4,
      });

      if (!visitedSet.has(u)) {
        visitedSet.add(u);
        visitados.push(u);

        // Visitar nodo
        steps.push({
          numeroPaso: stepCount++,
          tipoOperacion: 'visita',
          tipoEstructura: 'grafo',
          nodoActual: u,
          visitados: [...visitados],
          frontera: [...pila],
          lineaPseudocodigo: 5,
        });

        // Para explorar en orden ascendente (menores primero al desapilar),
        // en la pila LIFO se apilan en orden inverso (descendente)
        const neighbors = getNeighbors(u);
        const unvisitedNeighbors = neighbors
          .filter((v) => !visitedSet.has(v))
          .sort((a, b) =>
            b.localeCompare(a, undefined, { numeric: true, sensitivity: 'base' }),
          );

        for (const v of unvisitedNeighbors) {
          pila.push(v);
          steps.push({
            numeroPaso: stepCount++,
            tipoOperacion: 'apilar',
            tipoEstructura: 'grafo',
            nodoActual: u,
            visitados: [...visitados],
            frontera: [...pila],
            aristaActiva: [u, v],
            lineaPseudocodigo: 7,
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
      lineaPseudocodigo: 8,
    });

    return steps.map((s) => ({ ...s, grafo }));
  }
}
