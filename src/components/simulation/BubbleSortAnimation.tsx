import React from 'react';
import { G, Circle, Rect } from 'react-native-svg';
import { Bar } from './Bar';
import { OperationType } from '../../types/simulation';

interface BubbleSortAnimationProps {
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  width: number;
  height: number;
  isCompleted?: boolean;
}

/**
 * Animación especializada para Bubble Sort con efecto de "burbujeo"
 * Muestra visualmente cómo los elementos más grandes suben hacia el final
 */
export const BubbleSortAnimation: React.FC<BubbleSortAnimationProps> = ({
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

        // Efecto especial para Bubble Sort: mostrar dirección del "burbujeo"
        const isBubbling = tipoOperacion === 'intercambio' && isActive;
        const bubbleOffset = isBubbling ? 2 : 0; // Pequeño desplazamiento para simular movimiento

        return (
          <G key={index}>
            {/* Sombra o efecto de movimiento durante intercambio */}
            {isBubbling && (
              <rect
                x={index * barWidth + gap / 2 + bubbleOffset}
                y={height - barHeight + 2}
                width={barWidth - gap}
                height={barHeight}
                fill="#4A90D9"
                opacity={0.3}
                rx={2}
                ry={2}
              />
            )}
            
            {/* Barra principal */}
            <Bar
              x={index * barWidth + gap / 2}
              y={height - barHeight}
              width={barWidth - gap}
              height={barHeight}
              type={type}
            />

            {/* Indicador de burbuja para elementos grandes */}
            {isBubbling && value > maxVal * 0.7 && (
              <Circle
                cx={index * barWidth + barWidth / 2}
                cy={height - barHeight - 10}
                r="3"
                fill="#F5A623"
                opacity="0.8"
              />
            )}
          </G>
        );
      })}
    </G>
  );
};
