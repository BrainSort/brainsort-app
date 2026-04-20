import React from 'react';
import { G, Rect, Text, Path, Line } from 'react-native-svg';
import { Bar } from './Bar';
import { OperationType } from '../../types/simulation';

interface InsertionSortAnimationProps {
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  width: number;
  height: number;
  isCompleted?: boolean;
}

/**
 * Animación especializada para Insertion Sort con efecto de inserción
 * Muestra visualmente cómo los elementos se insertan en su posición correcta
 */
export const InsertionSortAnimation: React.FC<InsertionSortAnimationProps> = ({
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

        // Efectos especiales para Insertion Sort
        const isInserting = tipoOperacion === 'insercion' && isActive;
        const isComparing = tipoOperacion === 'comparacion' && isActive;
        
        // Durante inserción, mostrar efecto de "deslizamiento"
        const slideOffset = isInserting ? -3 : 0;
        
        // Zona ordenada (parte izquierda del arreglo)
        const sortedZoneEnd = index === 0 ? 0 : index - 1;
        const isInSortedZone = index <= sortedZoneEnd && !isInserting;

        return (
          <G key={index}>
            {/* Fondo para zona ordenada */}
            {isInSortedZone && (
              <Rect
                x={0}
                y={0}
                width={(index + 1) * barWidth}
                height={height}
                fill="#7ED321"
                opacity={0.1}
              />
            )}
            
            {/* Flecha de inserción */}
            {isInserting && (
              <Path
                d={`M ${index * barWidth + barWidth / 2} ${height + 10} 
                     L ${index * barWidth + barWidth / 2} ${height - barHeight - 5}
                     L ${index * barWidth + barWidth / 2 - 5} ${height - barHeight - 10}
                     M ${index * barWidth + barWidth / 2} ${height - barHeight - 5}
                     L ${index * barWidth + barWidth / 2 + 5} ${height - barHeight - 10}`}
                stroke="#03DAC6"
                strokeWidth="2"
                fill="none"
              />
            )}
            
            {/* Efecto de desplazamiento durante inserción */}
            {isInserting && (
              <Rect
                x={index * barWidth + gap / 2 + slideOffset}
                y={height - barHeight}
                width={barWidth - gap}
                height={barHeight}
                fill="#4A90D9"
                opacity={0.5}
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

            {/* Indicador de "key" durante inserción */}
            {isInserting && indicesActivos.length === 1 && (
              <Text
                x={index * barWidth + barWidth / 2}
                y={height - barHeight - 15}
                fill="#03DAC6"
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                KEY
              </Text>
            )}

            {/* Líneas de guía para comparación */}
            {isComparing && indicesActivos.length === 2 && index === indicesActivos[0] && (
              <Line
                x1={index * barWidth + barWidth / 2}
                y1={height - barHeight}
                x2={indicesActivos[1] * barWidth + barWidth / 2}
                y2={height - (data[indicesActivos[1]] / maxVal) * height}
                stroke="#F5A623"
                strokeWidth="1"
                strokeDasharray="3,3"
                opacity="0.7"
              />
            )}
          </G>
        );
      })}
    </G>
  );
};
