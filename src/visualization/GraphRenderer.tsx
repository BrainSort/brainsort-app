import React, { useMemo, useState } from 'react';
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Marker,
  Path,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import {
  GrafoData,
  PasoGrafo,
  SimulationStep,
  calculateHierarchicalGraphLayout,
  isPasoGrafo,
} from '@brainsort/core';
import { useThemeContext } from '../context/ThemeContext';
import { SimulationColors } from '../styles/colors';

const DEFAULT_GRAFO: GrafoData = {
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

export interface GraphRendererProps {
  algorithmName?: string;
  step: SimulationStep | null;
  isCompleted?: boolean;
  grafo?: GrafoData | null;
  nodoInicio?: string | null;
  height?: number;
  width?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * T-FE-06: Renderizado SVG vectorial jerárquico para algoritmos de grafos (BFS / DFS / Dijkstra).
 * Soporta layout jerárquico top-down (BFS/DFS) y left-to-right (Dijkstra), aristas rectas/curvas,
 * pesos en punto medio real de Bézier y tema claro/oscuro.
 */
export const GraphRenderer: React.FC<GraphRendererProps> = ({
  algorithmName,
  step,
  isCompleted = false,
  grafo,
  nodoInicio,
  height = 300,
  width,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const [containerWidth, setContainerWidth] = useState<number>(
    Math.min(SCREEN_WIDTH - 48, 860),
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    const measured = Math.floor(event.nativeEvent.layout.width);
    if (measured > 0 && measured !== containerWidth) {
      setContainerWidth(measured);
    }
  };

  const actualWidth = width ?? containerWidth;
  const graphStep: PasoGrafo | null = step && isPasoGrafo(step) ? step : null;
  const activeGrafo: GrafoData =
    grafo ?? (graphStep as any)?.grafo ?? DEFAULT_GRAFO;
  const effectiveStartNodeId = nodoInicio ?? activeGrafo.nodos[0];
  const isDijkstra =
    Boolean(algorithmName?.toLowerCase().includes('dijkstra')) ||
    graphStep?.distancias !== undefined;

  const layout = useMemo(() => {
    return calculateHierarchicalGraphLayout(
      activeGrafo,
      {
        width: actualWidth,
        height,
        nodeRadius: 22,
        padding: 36,
      },
      {
        startNodeId: effectiveStartNodeId,
        orientation: isDijkstra ? 'left-to-right' : 'top-down',
      },
    );
  }, [activeGrafo, actualWidth, height, effectiveStartNodeId, isDijkstra]);

  const getNodeColor = (nodeId: string): string => {
    if (isCompleted) return SimulationColors.final;
    if (!graphStep) return SimulationColors.idle;

    if (graphStep.nodoActual === nodeId) {
      return SimulationColors.comparacion;
    }
    if (graphStep.frontera?.includes(nodeId)) {
      return colors.brandAccent;
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
    return (
      graphStep.visitados.includes(from) && graphStep.visitados.includes(to)
    );
  };

  return (
    <View
      style={[styles.container, { height }]}
      onLayout={handleLayout}
    >
      <Svg
        width={actualWidth}
        height={height}
        viewBox={`0 0 ${actualWidth} ${height}`}
      >
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
            <Polygon points="0 0, 10 5, 0 10" fill={colors.textMuted} />
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
            <Polygon
              points="0 0, 10 5, 0 10"
              fill={SimulationColors.comparacion}
            />
          </Marker>
        </Defs>

        {/* Aristas */}
        <G>
          {layout.edges.map((edge, idx) => {
            const active = isEdgeActive(edge.from, edge.to);
            const traversed = isEdgeTraversed(edge.from, edge.to);

            let strokeColor: string = colors.border;
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

            if (edge.cx !== undefined && edge.cy !== undefined) {
              return (
                <Path
                  key={`edge-${edge.from}-${edge.to}-${idx}`}
                  d={`M ${edge.x1} ${edge.y1} Q ${edge.cx} ${edge.cy} ${edge.x2} ${edge.y2}`}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={markerEnd}
                  strokeLinecap="round"
                />
              );
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
            const isCurved = edge.cx !== undefined && edge.cy !== undefined;
            const midX = isCurved
              ? 0.25 * edge.x1 + 0.5 * (edge.cx ?? 0) + 0.25 * edge.x2
              : (edge.x1 + edge.x2) / 2;
            const midY = isCurved
              ? 0.25 * edge.y1 + 0.5 * (edge.cy ?? 0) + 0.25 * edge.y2
              : (edge.y1 + edge.y2) / 2;
            const active = isEdgeActive(edge.from, edge.to);

            return (
              <G key={`edge-weight-${edge.from}-${edge.to}-${idx}`}>
                <Circle
                  cx={midX}
                  cy={midY}
                  r={10}
                  fill={
                    active
                      ? SimulationColors.comparacion
                      : colors.surfaceElevated
                  }
                  stroke={active ? colors.textPrimary : colors.border}
                  strokeWidth={1.5}
                />
                <SvgText
                  x={midX}
                  y={midY + 3.5}
                  fontSize="10"
                  fontWeight="bold"
                  fill={active ? '#000000' : colors.textPrimary}
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
            const isStartNode = node.id === effectiveStartNodeId;
            const inFrontier = graphStep?.frontera?.includes(node.id);
            const dist = graphStep?.distancias?.[node.id] as
              | number
              | null
              | undefined;
            const hasDist = dist !== undefined;
            const distText =
              dist === null || dist === undefined || !Number.isFinite(dist)
                ? '∞'
                : String(dist);

            let strokeColor: string = colors.border;
            let strokeWidth = 2;

            if (isActive) {
              strokeColor = colors.textPrimary;
              strokeWidth = 3.5;
            } else if (inFrontier) {
              strokeColor = colors.brandAccent;
              strokeWidth = 2.5;
            } else if (isCompleted || graphStep?.visitados?.includes(node.id)) {
              strokeColor = SimulationColors.final;
              strokeWidth = 2;
            }

            return (
              <G key={`node-${node.id}`}>
                {/* Indicador sutil para el nodo de inicio */}
                {isStartNode && (
                  <>
                    <Circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 5}
                      fill="none"
                      stroke={colors.brandAccent}
                      strokeWidth={1.25}
                      strokeDasharray="3,3"
                      strokeOpacity={0.75}
                    />
                    <SvgText
                      x={node.x}
                      y={Math.max(11, node.y - node.r - 8)}
                      fontSize="9"
                      fontWeight="700"
                      fill={colors.brandAccent}
                      textAnchor="middle"
                    >
                      Inicio
                    </SvgText>
                  </>
                )}

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
                  y={node.y + 4.5}
                  fontSize="13"
                  fontWeight="bold"
                  fill={
                    color === SimulationColors.comparacion
                      ? '#0F1318'
                      : '#FFFFFF'
                  }
                  textAnchor="middle"
                >
                  {node.label}
                </SvgText>

                {/* Distancia mínima acumulada para Dijkstra */}
                {hasDist && (() => {
                  const fullLabel = `d:${distText}`;
                  const pillW = Math.max(30, fullLabel.length * 6.5 + 10);
                  const pillH = 16;
                  const pillY = Math.min(height - pillH - 2, node.y + node.r + 4);
                  return (
                    <G>
                      <Rect
                        x={node.x - pillW / 2}
                        y={pillY}
                        width={pillW}
                        height={pillH}
                        rx={5}
                        fill={colors.surfaceElevated}
                        stroke={isActive ? colors.brandAccent : colors.border}
                        strokeWidth={1}
                      />
                      <SvgText
                        x={node.x}
                        y={pillY + 11.5}
                        fontSize="10"
                        fontWeight="700"
                        fill={isActive ? colors.textPrimary : colors.brandAccent}
                        textAnchor="middle"
                      >
                        {fullLabel}
                      </SvgText>
                    </G>
                  );
                })()}
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
});
