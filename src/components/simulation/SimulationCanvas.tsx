import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg from 'react-native-svg';
import { AlgorithmAnimationSelector } from './AlgorithmAnimationSelector';
import { OperationType } from '../../types/simulation';

interface SimulationCanvasProps {
  algorithmName: string;
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  isCompleted?: boolean;
}

/**
 * T-FE-064: Contenedor SVG principal para la visualización
 */
export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  algorithmName,
  data,
  indicesActivos,
  tipoOperacion,
  isCompleted = false,
}) => {
  // Hard-coded dimensions for Web reliability to prevent 0x0 situations
  const width = 800; // Standard baseline width
  const height = 300;

  return (
    <View style={styles.container}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <AlgorithmAnimationSelector
          algorithmName={algorithmName}
          data={data}
          indicesActivos={indicesActivos}
          tipoOperacion={tipoOperacion}
          width={width}
          height={height}
          isCompleted={isCompleted}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300, // Explicit height for Web reliability
    width: '100%',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
