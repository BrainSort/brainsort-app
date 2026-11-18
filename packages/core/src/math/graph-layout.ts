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
  dirigida: boolean;
  peso?: number;
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
