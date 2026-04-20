import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg from 'react-native-svg';
import { BarChart } from './BarChart';
import { OperationType } from '../../types/simulation';

interface SimulationCanvasProps {
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  isCompleted?: boolean;
}

/**
 * T-FE-064: Contenedor SVG principal para la visualización
 */
export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
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
        <BarChart
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
