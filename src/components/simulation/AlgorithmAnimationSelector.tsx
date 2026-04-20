import React from 'react';
import { BubbleSortAnimation } from './BubbleSortAnimation';
import { SelectionSortAnimation } from './SelectionSortAnimation';
import { InsertionSortAnimation } from './InsertionSortAnimation';
import { BarChart } from './BarChart';
import { OperationType } from '../../types/simulation';

interface AlgorithmAnimationSelectorProps {
  algorithmName: string;
  data: number[];
  indicesActivos: number[];
  tipoOperacion: OperationType;
  width: number;
  height: number;
  isCompleted?: boolean;
}

/**
 * Selector inteligente de animaciones según el algoritmo
 * Devuelve la animación especializada para cada algoritmo de ordenamiento
 */
export const AlgorithmAnimationSelector: React.FC<AlgorithmAnimationSelectorProps> = ({
  algorithmName,
  data,
  indicesActivos,
  tipoOperacion,
  width,
  height,
  isCompleted = false,
}) => {
  // Normalizar el nombre del algoritmo para comparación
  const normalizedAlgorithm = algorithmName.toLowerCase().trim();

  // Seleccionar animación especializada según el algoritmo
  switch (normalizedAlgorithm) {
    case 'bubble sort':
      return (
        <BubbleSortAnimation
          data={data}
          indicesActivos={indicesActivos}
          tipoOperacion={tipoOperacion}
          width={width}
          height={height}
          isCompleted={isCompleted}
        />
      );

    case 'selection sort':
      return (
        <SelectionSortAnimation
          data={data}
          indicesActivos={indicesActivos}
          tipoOperacion={tipoOperacion}
          width={width}
          height={height}
          isCompleted={isCompleted}
        />
      );

    case 'insertion sort':
      return (
        <InsertionSortAnimation
          data={data}
          indicesActivos={indicesActivos}
          tipoOperacion={tipoOperacion}
          width={width}
          height={height}
          isCompleted={isCompleted}
        />
      );

    default:
      // Para algoritmos no reconocidos, usar la animación genérica
      return (
        <BarChart
          data={data}
          indicesActivos={indicesActivos}
          tipoOperacion={tipoOperacion}
          width={width}
          height={height}
          isCompleted={isCompleted}
        />
      );
  }
};
