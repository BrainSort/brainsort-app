import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { ColorMapper } from './ColorMapper';
import { TipoOperacion } from '@brainsort/core';

export interface AccessibilityIconProps {
  operation: TipoOperacion | string;
  size?: number;
  color?: string;
}

/**
 * T-FE-05: Íconos vectoriales SVG accesibles que complementan el color de cada estado.
 */
export const AccessibilityIcons: React.FC<AccessibilityIconProps> = ({
  operation,
  size = 16,
  color,
}) => {
  const op = (operation || 'idle').toLowerCase() as TipoOperacion;
  const iconColor = color || ColorMapper.getColorForOperation(op);

  switch (op) {
    case 'comparacion':
      // Lupa (inspección / búsqueda)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="11"
            cy="11"
            r="7"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <Line
            x1="16"
            y1="16"
            x2="21"
            y2="21"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'intercambio':
      // Flechas horizontales opuestas (swap)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 8h14M14 4l4 4-4 4M20 16H6M10 20l-4-4 4-4"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'insercion':
      // Flecha hacia abajo (inserción en posición)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4v14M6 13l6 6 6-6"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'final':
    case 'encontrado':
      // Check mark (éxito / encontrado / completado)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 13l4 4L19 7"
            stroke={iconColor}
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'descarte':
      // Línea tachada (descarte de rango)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={iconColor} strokeWidth="2" opacity="0.6" />
          <Line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'no_encontrado':
      // Cruz (X - no encontrado)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
            stroke={iconColor}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Line
            x1="18"
            y1="6"
            x2="6"
            y2="18"
            stroke={iconColor}
            strokeWidth="2.8"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'visita':
      // Nodo activo (círculo con punto central)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="8" stroke={iconColor} strokeWidth="2.2" />
          <Circle cx="12" cy="12" r="3.5" fill={iconColor} />
        </Svg>
      );

    case 'encolar':
    case 'apilar':
      // Flecha de entrada / empuje
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M5 12h14M13 6l6 6-6 6"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'desencolar':
    case 'desapilar':
      // Flecha de salida / pop
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 12H5M11 18l-6-6 6-6"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'relajacion':
      // Flecha de actualización / relajación hacia abajo
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3v13M7 11l5 5 5-5M5 21h14"
            stroke={iconColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'idle':
    default:
      // Estado inactivo neutral (punto suave)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="4" fill={iconColor} opacity="0.8" />
        </Svg>
      );
  }
};
