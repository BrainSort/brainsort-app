import { GrafoData } from '../types/simulation.types';

export interface GraphLayoutNode {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
}

export interface GraphLayoutEdge {
  from: string;
  to: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cx?: number;
  cy?: number;
  dirigida: boolean;
  peso?: number;
}

export interface HierarchicalGraphLayoutOptions {
  startNodeId?: string;
  orientation?: 'top-down' | 'left-to-right';
}

export interface GraphLayoutResult {
  nodes: GraphLayoutNode[];
  edges: GraphLayoutEdge[];
  width: number;
  height: number;
}

export interface GraphLayoutConfig {
  width: number;
  height: number;
  nodeRadius?: number;
  padding?: number;
}

/**
 * T-FE-004: Calcula la geometría SVG de un grafo mediante distribución circular determinista (sin d3-force).
 * Garantiza idempotencia y estabilidad posicional para un mismo conjunto de nodos y aristas.
 */
export function calculateCircularGraphLayout(
  grafo: GrafoData,
  config: GraphLayoutConfig,
): GraphLayoutResult {
  const { width, height, nodeRadius = 24, padding = 40 } = config;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(20, Math.min(width, height) / 2 - padding - nodeRadius);

  const numNodes = grafo.nodos.length;
  const nodeMap = new Map<string, GraphLayoutNode>();

  const nodes: GraphLayoutNode[] = grafo.nodos.map((id, index) => {
    // Ángulo determinista: parte de -PI/2 (12 en punto) en sentido horario
    const angle = numNodes > 0
      ? -Math.PI / 2 + (2 * Math.PI * index) / numNodes
      : 0;

    const x = Math.round((cx + radius * Math.cos(angle)) * 100) / 100;
    const y = Math.round((cy + radius * Math.sin(angle)) * 100) / 100;

    const node: GraphLayoutNode = {
      id,
      x,
      y,
      r: nodeRadius,
      label: id,
    };
    nodeMap.set(id, node);
    return node;
  });

  const edges: GraphLayoutEdge[] = (grafo.aristas || []).map(([from, to]) => {
    const fromNode = nodeMap.get(from);
    const toNode = nodeMap.get(to);
    const peso =
      grafo.pesos?.[`${from}-${to}`] ??
      grafo.pesos?.[`${from},${to}`] ??
      (!grafo.dirigido
        ? (grafo.pesos?.[`${to}-${from}`] ?? grafo.pesos?.[`${to},${from}`])
        : undefined) ??
      grafo.aristasPonderadas?.find(
        ([f, t]) => (f === from && t === to) || (!grafo.dirigido && f === to && t === from),
      )?.[2];

    return {
      from,
      to,
      x1: fromNode ? fromNode.x : 0,
      y1: fromNode ? fromNode.y : 0,
      x2: toNode ? toNode.x : 0,
      y2: toNode ? toNode.y : 0,
      dirigida: grafo.dirigido ?? false,
      peso,
    };
  });

  return {
    nodes,
    edges,
    width,
    height,
  };
}

function getEdgeWeight(grafo: GrafoData, from: string, to: string): number | undefined {
  return (
    grafo.pesos?.[`${from}-${to}`] ??
    grafo.pesos?.[`${from},${to}`] ??
    (!grafo.dirigido
      ? (grafo.pesos?.[`${to}-${from}`] ?? grafo.pesos?.[`${to},${from}`])
      : undefined) ??
    grafo.aristasPonderadas?.find(
      ([f, t]) => (f === from && t === to) || (!grafo.dirigido && f === to && t === from),
    )?.[2]
  );
}

/**
 * Calcula un layout jerárquico por capas mediante BFS desde `startNodeId`.
 * Soporta orientación `'top-down'` (árboles BFS/DFS) y `'left-to-right'` (redes ponderadas/Dijkstra).
 * Las aristas no-árbol (mismo nivel o salto > 1 nivel) reciben un punto de control Bézier cuadrático (cx, cy).
 */
export function calculateHierarchicalGraphLayout(
  grafo: GrafoData,
  config: GraphLayoutConfig,
  options?: HierarchicalGraphLayoutOptions,
): GraphLayoutResult {
  const { width, height, nodeRadius = 24, padding = 40 } = config;
  const orientation = options?.orientation ?? 'top-down';

  if (!grafo.nodos || grafo.nodos.length === 0) {
    return { nodes: [], edges: [], width, height };
  }

  const startNodeId =
    options?.startNodeId && grafo.nodos.includes(options.startNodeId)
      ? options.startNodeId
      : grafo.nodos[0];

  // Construir lista de adyacencia ordenada determinísticamente
  const adj = new Map<string, string[]>();
  for (const id of grafo.nodos) {
    adj.set(id, []);
  }
  for (const [from, to] of grafo.aristas || []) {
    if (adj.has(from) && !adj.get(from)!.includes(to)) {
      adj.get(from)!.push(to);
    }
    if (!grafo.dirigido && adj.has(to) && !adj.get(to)!.includes(from)) {
      adj.get(to)!.push(from);
    }
  }
  for (const neighbors of adj.values()) {
    neighbors.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
    );
  }

  // BFS para asignar niveles y ordenar hijos sin cruces
  const levelMap = new Map<string, number>();
  const levels: string[][] = [];
  const queue: string[] = [startNodeId];
  levelMap.set(startNodeId, 0);

  while (queue.length > 0) {
    const u = queue.shift()!;
    const lvl = levelMap.get(u)!;
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(u);

    for (const v of adj.get(u) ?? []) {
      if (!levelMap.has(v)) {
        levelMap.set(v, lvl + 1);
        queue.push(v);
      }
    }
  }

  // Ubicar nodos desconectados en una capa final limpia
  const disconnected = grafo.nodos.filter((id) => !levelMap.has(id));
  if (disconnected.length > 0) {
    const finalLevel = levels.length;
    levels[finalLevel] = disconnected;
    for (const id of disconnected) {
      levelMap.set(id, finalLevel);
    }
  }

  const minX = padding + nodeRadius;
  const maxX = Math.max(minX, width - padding - nodeRadius);
  const minY = padding + nodeRadius;
  const maxY = Math.max(minY, height - padding - nodeRadius);
  const numLevels = levels.length;

  const nodeMap = new Map<string, GraphLayoutNode>();
  const nodes: GraphLayoutNode[] = [];

  levels.forEach((levelNodes, levelIndex) => {
    const count = levelNodes.length;
    levelNodes.forEach((id, posIndex) => {
      let rawX: number;
      let rawY: number;

      if (orientation === 'left-to-right') {
        rawX =
          numLevels === 1
            ? width / 2
            : minX + (levelIndex / (numLevels - 1)) * (maxX - minX);
        rawY =
          count === 1
            ? height / 2
            : minY + ((posIndex + 0.5) / count) * (maxY - minY);
      } else {
        rawX =
          count === 1
            ? width / 2
            : minX + ((posIndex + 0.5) / count) * (maxX - minX);
        rawY =
          numLevels === 1
            ? height / 2
            : minY + (levelIndex / (numLevels - 1)) * (maxY - minY);
      }

      const node: GraphLayoutNode = {
        id,
        x: Math.round(rawX * 100) / 100,
        y: Math.round(rawY * 100) / 100,
        r: nodeRadius,
        label: id,
      };
      nodeMap.set(id, node);
      nodes.push(node);
    });
  });

  const centerX = width / 2;
  const centerY = height / 2;

  const edges: GraphLayoutEdge[] = (grafo.aristas || []).map(([from, to]) => {
    const fromNode = nodeMap.get(from);
    const toNode = nodeMap.get(to);
    const x1 = fromNode ? fromNode.x : 0;
    const y1 = fromNode ? fromNode.y : 0;
    const x2 = toNode ? toNode.x : 0;
    const y2 = toNode ? toNode.y : 0;

    const lvlFrom = levelMap.get(from) ?? 0;
    const lvlTo = levelMap.get(to) ?? 0;
    const isSameLevel = lvlFrom === lvlTo;
    const isNonTreeEdge = isSameLevel || Math.abs(lvlFrom - lvlTo) > 1;

    let cx: number | undefined;
    let cy: number | undefined;

    if (isNonTreeEdge) {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      let nx = -dy / len;
      let ny = dx / len;

      if (isSameLevel && orientation === 'left-to-right') {
        // Desplazar siempre hacia la izquierda para no chocar con etiquetas d:x debajo del nodo superior
        if (nx > 0) {
          nx = -nx;
          ny = -ny;
        }
      } else {
        // Orientar la curvatura hacia afuera respecto al centro del lienzo
        const toCenterX = mx - centerX;
        const toCenterY = my - centerY;
        if (nx * toCenterX + ny * toCenterY < 0) {
          nx = -nx;
          ny = -ny;
        }
      }

      const offset = isSameLevel
        ? Math.max(44, Math.min(76, len * 0.36))
        : Math.max(28, Math.min(64, len * 0.28));
      cx = Math.round((mx + nx * offset) * 100) / 100;
      cy = Math.round((my + ny * offset) * 100) / 100;
    }

    return {
      from,
      to,
      x1,
      y1,
      x2,
      y2,
      ...(cx !== undefined && cy !== undefined ? { cx, cy } : {}),
      dirigida: grafo.dirigido ?? false,
      peso: getEdgeWeight(grafo, from, to),
    };
  });

  return {
    nodes,
    edges,
    width,
    height,
  };
}
