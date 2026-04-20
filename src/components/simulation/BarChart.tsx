import React from 'react';
import { G } from 'react-native-svg';
import { Bar } from './Bar';
import { OperationType } from '../../types/simulation';

interface BarChartProps {
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  width: number;
  height: number;
  isCompleted?: boolean;
}

/**
 * T-FE-066: Conjunto de barras renderizadas con alturas proporcionales al valor (HU-03)
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  indicesActivos,
  tipoOperacion,
  width,
  height,
  isCompleted = false,
}) => {
  const maxVal = Math.max(...data, 1);
  const barWidth = width / data.length;
  const gap = barWidth * 0.1;

  return (
    <G>
      {data.map((value, index) => {
        const isActive = indicesActivos.includes(index);
        const barHeight = (value / maxVal) * height;
        
        let type: OperationType = 'idle';
        if (isCompleted) {
          type = 'final';
        } else if (isActive) {
          type = tipoOperacion;
        }

        return (
          <Bar
            key={index}
            x={index * barWidth + gap / 2}
            y={height - barHeight}
            width={barWidth - gap}
            height={barHeight}
            type={type}
          />
        );
      })}
    </G>
  );
};
