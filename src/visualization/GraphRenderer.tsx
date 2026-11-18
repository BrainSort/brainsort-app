import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  G,
  Line,
  Circle,
  Text as SvgText,
  Defs,
  Marker,
  Polygon,
} from 'react-native-svg';
import {
  GrafoData,
  PasoGrafo,
  SimulationStep,
  calculateCircularGraphLayout,
  isPasoGrafo,
} from '@brainsort/core';
import { Accent, DarkSurfaces, DarkText, Neutral, SimulationColors } from '../styles/colors';

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

export interface GraphRendererProps {
  algorithmName?: string;
  step: SimulationStep | null;
  isCompleted?: boolean;
  grafo?: GrafoData | null;
  height?: number;
  width?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * T-FE-06: Renderizado SVG vectorial determinista para algoritmos de grafos (BFS / DFS / Dijkstra).
 * Soporta nodos coloreados según su ciclo de vida y aristas activas.
 */
export const GraphRenderer: React.FC<GraphRendererProps> = ({
  step,
  isCompleted = false,
  grafo,
  height = 280,
  width,
}) => {
  const actualWidth = width || Math.min(SCREEN_WIDTH - 32, 600);
  const graphStep: PasoGrafo | null = step && isPasoGrafo(step) ? step : null;
  const activeGrafo: GrafoData = grafo ?? (graphStep as any)?.grafo ?? DEFAULT_GRAFO;

  const layout = useMemo(() => {
    return calculateCircularGraphLayout(activeGrafo, {
      width: actualWidth,
      height,
      nodeRadius: 22,
      padding: 36,
    });
  }, [activeGrafo, actualWidth, height]);

  const getNodeColor = (nodeId: string): string => {
    if (isCompleted) return SimulationColors.final;
    if (!graphStep) return SimulationColors.idle;

    if (graphStep.nodoActual === nodeId) {
      return SimulationColors.comparacion;
    }
    if (graphStep.frontera?.includes(nodeId)) {
      return Accent[500];
    }
    if (graphStep.visitados?.includes(nodeId)) {
      return SimulationColors.final;
    }
    return SimulationColors.idle;
  };

  const isEdgeActive = (from: string, to: string): boolean => {
    if (!graphStep?.aristaActiva) return false;
    const [a, b] = graphStep.aristaActiva;
    if (a === from && b === to) return true;
    if (!activeGrafo.dirigido && a === to && b === from) return true;
    return false;
  };

  const isEdgeTraversed = (from: string, to: string): boolean => {
    if (isCompleted) return true;
    if (!graphStep?.visitados) return false;
    return graphStep.visitados.includes(from) && graphStep.visitados.includes(to);
  };

  return (
    <View style={[styles.container, { height, width: actualWidth }]}>
      <Svg width={actualWidth} height={height} viewBox={`0 0 ${actualWidth} ${height}`}>
        <Defs>
          <Marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <Polygon points="0 0, 10 5, 0 10" fill={Neutral[400]} />
          </Marker>
          <Marker
            id="arrowhead-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <Polygon points="0 0, 10 5, 0 10" fill={SimulationColors.comparacion} />
          </Marker>
        </Defs>

        {/* Aristas */}
        <G>
          {layout.edges.map((edge, idx) => {
            const active = isEdgeActive(edge.from, edge.to);
            const traversed = isEdgeTraversed(edge.from, edge.to);

            let strokeColor: string = DarkSurfaces.border;
            let strokeWidth = 2;
            let markerEnd = edge.dirigida ? 'url(#arrowhead)' : undefined;

            if (active) {
              strokeColor = SimulationColors.comparacion;
              strokeWidth = 3.5;
              markerEnd = edge.dirigida ? 'url(#arrowhead-active)' : undefined;
            } else if (traversed) {
              strokeColor = SimulationColors.final;
              strokeWidth = 2.5;
            }

            return (
              <Line
                key={`edge-${edge.from}-${edge.to}-${idx}`}
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={markerEnd}
                strokeLinecap="round"
              />
            );
          })}
        </G>

        {/* Pesos de Aristas (si existen) */}
        <G>
          {layout.edges.map((edge, idx) => {
            if (edge.peso === undefined) return null;
            const midX = (edge.x1 + edge.x2) / 2;
            const midY = (edge.y1 + edge.y2) / 2;
            const active = isEdgeActive(edge.from, edge.to);

            return (
              <G key={`edge-weight-${edge.from}-${edge.to}-${idx}`}>
                <Circle
                  cx={midX}
                  cy={midY}
                  r={10}
                  fill={active ? SimulationColors.comparacion : DarkSurfaces.surfaceElevated}
                  stroke={active ? '#FFFFFF' : DarkSurfaces.border}
                  strokeWidth={1.5}
                />
                <SvgText
                  x={midX}
                  y={midY + 3.5}
                  fontSize="10"
                  fontWeight="bold"
                  fill={active ? '#000000' : DarkText.primary}
                  textAnchor="middle"
                >
                  {edge.peso}
                </SvgText>
              </G>
            );
          })}
        </G>

        {/* Nodos */}
        <G>
          {layout.nodes.map((node) => {
            const color = getNodeColor(node.id);
            const isActive = graphStep?.nodoActual === node.id;
            const inFrontier = graphStep?.frontera?.includes(node.id);
            const dist = graphStep?.distancias?.[node.id];
            const hasDist = dist !== undefined;
            const distText = dist === Infinity ? '∞' : String(dist);

            let strokeColor: string = DarkSurfaces.border;
            let strokeWidth = 2;

            if (isActive) {
              strokeColor = '#FFFFFF';
              strokeWidth = 3.5;
            } else if (inFrontier) {
              strokeColor = Accent[500];
              strokeWidth = 2.5;
            } else if (isCompleted || graphStep?.visitados?.includes(node.id)) {
              strokeColor = SimulationColors.final;
              strokeWidth = 2;
            }

            return (
              <G key={`node-${node.id}`}>
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                <SvgText
                  x={node.x}
                  y={hasDist ? node.y + 1 : node.y + 5}
                  fontSize="13"
                  fontWeight="bold"
                  fill={DarkText.primary}
                  textAnchor="middle"
                >
                  {node.label}
                </SvgText>

                {/* Distancia mínima acumulada para Dijkstra */}
                {hasDist && (
                  <SvgText
                    x={node.x}
                    y={node.y + node.r + 13}
                    fontSize="10"
                    fontWeight="700"
                    fill={isActive ? '#FFFFFF' : Accent[300]}
                    textAnchor="middle"
                  >
                    d:{distText}
                  </SvgText>
                )}
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
