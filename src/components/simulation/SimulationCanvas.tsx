import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart } from './BarChart';
import { GraphRenderer } from '../../visualization/GraphRenderer';
import { TreeStructureCanvas } from './TreeStructureCanvas';
import type { GrafoData, SimulationStep } from '@brainsort/core';
import { isPasoGrafo } from '@brainsort/core';

interface SimulationCanvasProps {
  algorithmName?: string;
  step: SimulationStep | null;
  isCompleted?: boolean;
  grafo?: GrafoData | null;
}

/**
 * T-FE-064 / T-FE-06: Contenedor principal de visualización con selección dinámica de Canvas:
 *  - Grafos (BFS / DFS / Dijkstra) -> GraphRenderer
 *  - Árboles (Segment Tree, Heap) -> TreeStructureCanvas
 *  - Arreglos y Búsquedas -> BarChart
 */
export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  algorithmName,
  step,
  isCompleted = false,
  grafo,
}) => {
  const height = 280;

  const isGraph =
    (step && isPasoGrafo(step)) ||
    algorithmName === 'Breadth-First Search' ||
    algorithmName === 'Depth-First Search' ||
    algorithmName === 'BFS' ||
    algorithmName === 'DFS' ||
    (algorithmName ? algorithmName.toLowerCase().includes('dijkstra') : false) ||
    (algorithmName ? algorithmName.toLowerCase().includes('bfs') : false) ||
    (algorithmName ? algorithmName.toLowerCase().includes('dfs') : false);

  const isTree =
    algorithmName === 'Segment Tree' ||
    algorithmName === 'Heap Sort' ||
    (step &&
      'nodosArbol' in step &&
      Array.isArray((step as any).nodosArbol) &&
      (step as any).nodosArbol.length > 0);

  if (isGraph) {
    return (
      <View style={styles.container}>
        <GraphRenderer
          algorithmName={algorithmName}
          step={step}
          isCompleted={isCompleted}
          grafo={grafo}
          height={height}
        />
      </View>
    );
  }

  if (isTree) {
    return (
      <View style={styles.container}>
        <TreeStructureCanvas
          algorithmName={algorithmName ?? ''}
          step={step}
          isCompleted={isCompleted}
          height={height}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarChart
        algorithmName={algorithmName}
        step={step}
        isCompleted={isCompleted}
        height={height}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 280,
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
