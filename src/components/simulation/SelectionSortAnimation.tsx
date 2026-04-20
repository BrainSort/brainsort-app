import React from 'react';
import { G, Rect, Line, Text } from 'react-native-svg';
import { Bar } from './Bar';
import { OperationType } from '../../types/simulation';

interface SelectionSortAnimationProps {
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  width: number;
  height: number;
  isCompleted?: boolean;
}

/**
 * Animación especializada para Selection Sort con resaltado del mínimo
 * Muestra visualmente el proceso de encontrar el mínimo y posicionarlo
 */
export const SelectionSortAnimation: React.FC<SelectionSortAnimationProps> = ({
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

        // Efectos especiales para Selection Sort
        const isComparing = tipoOperacion === 'comparacion' && isActive;
        const isSwapping = tipoOperacion === 'intercambio' && isActive;
        
        // Durante comparación, resaltar el candidato a mínimo
        const isMinimumCandidate = isComparing && index === indicesActivos[indicesActivos.length - 1];

        return (
          <G key={index}>
            {/* Fondo resaltado para candidato a mínimo */}
            {isMinimumCandidate && (
              <Rect
                x={index * barWidth + gap / 2 - 2}
                y={height - barHeight - 2}
                width={barWidth - gap + 4}
                height={barHeight + 4}
                fill="#03DAC6"
                opacity="0.3"
                rx="3"
              />
            )}
            
            {/* Línea de conexión durante intercambio */}
            {isSwapping && indicesActivos.length === 2 && index === indicesActivos[0] && (
              <Line
                x1={index * barWidth + barWidth / 2}
                y1={height - barHeight / 2}
                x2={indicesActivos[1] * barWidth + barWidth / 2}
                y2={height - (data[indicesActivos[1]] / maxVal) * height / 2}
                stroke="#D0021B"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
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

            {/* Indicador de mínimo encontrado */}
            {isMinimumCandidate && (
              <Text
                x={index * barWidth + barWidth / 2}
                y={height - barHeight - 15}
                fill="#03DAC6"
                fontSize="12"
                textAnchor="middle"
                fontWeight="bold"
              >
                MIN
              </Text>
            )}
          </G>
        );
      })}
    </G>
  );
};
