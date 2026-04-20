import React from 'react';
import { Rect } from 'react-native-svg';
import { SimulationColors } from '../../constants/colors';
import { OperationType } from '../../types/simulation';

interface BarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  type: OperationType | 'sorted';
}

/**
 * T-FE-065: Barra individual usando react-native-svg Rect
 */
export const Bar: React.FC<BarProps> = ({ x, y, width, height, type }) => {
  const color = type === 'sorted' ? SimulationColors.final : SimulationColors[type];

  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={color}
      rx={2} // Rounded corners as per modern aesthetics
      ry={2}
    />
  );
};
