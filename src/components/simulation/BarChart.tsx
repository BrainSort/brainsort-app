/**
 * BarChart.tsx
 * BrainSort — Componente de visualización de barras para simulación
 *
 * Renderiza el arreglo actual como barras de altura proporcional.
 * Aplica el color coding del spec (Constitution §3):
 *   Azul   (#4A90D9) → idle
 *   Amarillo (#F5A623) → comparando
 *   Rojo   (#D0021B) → intercambiando
 *   Verde  (#7ED321) → posición final / completado
 *
 * Usa react-native-svg para renderizado vectorial. (HU-04)
 * Animaciones con Animated.Value para transiciones suaves. (≥24 FPS)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SimulationColors } from '../../styles/colors';
import type { SimulationStep } from '@brainsort/core';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BarChartProps {
  /** Nombre del algoritmo para derivar etiquetas de variables como i, j, pivot, mid */
  algorithmName?: string;
  /** Paso actual de simulación (contiene array + highlight info) */
  step: SimulationStep | null;
  /** true cuando la simulación ha terminado — todas las barras en verde */
  isCompleted: boolean;
  /** Altura disponible para el canvas de barras */
  height?: number;
}

type BarMarkerView = Record<number, { label: string; color: string }>;

function getMarkerView(step: SimulationStep | null): BarMarkerView {
  const markers = step?.marcadores ?? [];
  return markers.reduce<BarMarkerView>((acc, marker) => {
    if (!marker.label) {
      acc[marker.index] = acc[marker.index] ?? {
        label: '',
        color: marker.color,
      };
      return acc;
    }
    const existing = acc[marker.index];
    acc[marker.index] = {
      label: existing?.label ? `${existing.label}/${marker.label}` : marker.label,
      color: marker.color,
    };
    return acc;
  }, {});
}

// ─── Helper: color por estado ─────────────────────────────────────────────────

function getBarColor(
  index: number,
  step: SimulationStep | null,
  isCompleted: boolean,
): string {
  if (isCompleted) return SimulationColors.final; // Verde total al terminar

  if (!step) return SimulationColors.idle;
  const marker = step.marcadores?.find((item) => item.index === index);
  if (marker) {
    if (marker.role === 'descartado') {
      return SimulationColors.idle; // Keep original idle color (blue)
    }
    return marker.color;
  }

  const rawStep = step as any;
  const highlightIndices = rawStep.highlightIndices;
  const legacyActiveIndices = rawStep.indicesActivos;
  const includes = (arr?: number[]) => Array.isArray(arr) && arr.includes(index);

  if (highlightIndices) {
    if (includes(highlightIndices.swap)) return SimulationColors.intercambio;
    if (includes(highlightIndices.compare)) return SimulationColors.comparacion;
    if (includes(highlightIndices.sorted)) return SimulationColors.final;
  }

  // Compatibilidad con esquema legacy de pasos.
  if (Array.isArray(legacyActiveIndices) && legacyActiveIndices.includes(index)) {
    const operation = String(rawStep.operationType ?? rawStep.tipoOperacion ?? '').toLowerCase();
    if (operation.includes('swap') || operation.includes('intercambio')) {
      return SimulationColors.intercambio;
    }
    if (operation.includes('compare') || operation.includes('compar')) {
      return SimulationColors.comparacion;
    }
    if (operation.includes('sorted') || operation.includes('final')) {
      return SimulationColors.final;
    }
    return SimulationColors.comparacion;
  }

  return SimulationColors.idle;
}

// ─── Algoritmo de emparejamiento para animaciones fluidas ─────────────────────────

interface BarState {
  id: string;
  value: number;
  index: number;
}

/**
 * Empareja el nuevo estado del array con las barras del estado anterior.
 * Esto preserva la identidad de cada barra (mediante su ID único) y solo actualiza
 * su índice para lograr una animación fluida de deslizamiento horizontal (swaps).
 */
function matchNewArrayToBars(
  newArray: number[],
  prevBars: BarState[],
): BarState[] {
  const matchedBars: BarState[] = new Array(newArray.length);
  const availableBars = [...prevBars];

  for (let i = 0; i < newArray.length; i++) {
    const val = newArray[i];
    
    // Buscamos la mejor coincidencia en base al valor y la cercanía al índice anterior.
    let bestIdx = -1;
    let minDistance = Infinity;

    for (let j = 0; j < availableBars.length; j++) {
      if (availableBars[j].value === val) {
        const dist = Math.abs(availableBars[j].index - i);
        if (dist < minDistance) {
          minDistance = dist;
          bestIdx = j;
        }
      }
    }

    if (bestIdx !== -1) {
      const [bar] = availableBars.splice(bestIdx, 1);
      matchedBars[i] = {
        ...bar,
        index: i, // Actualizamos al nuevo índice
      };
    } else {
      // Generamos un fallback si ocurre un cambio drástico de datos (ej. datos manuales)
      matchedBars[i] = {
        id: `bar-${i}-${val}-${Math.random()}`,
        value: val,
        index: i,
      };
    }
  }

  return matchedBars;
}

// ─── Componente de barra individual ──────────────────────────────────────────

interface SingleBarProps {
  value: number;
  maxValue: number;
  color: string;
  label?: string;
  availableHeight: number;
  width: number;
  opacity?: number;
  index: number;
}

const SingleBar: React.FC<SingleBarProps> = ({
  value,
  maxValue,
  color,
  label,
  availableHeight,
  width,
  opacity = 1,
  index,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  // Animar posición horizontal (left)
  const xAnim = useRef(new Animated.Value(index * (width + 2))).current;

  const barHeight = Math.max(4, (value / maxValue) * availableHeight * 0.9);

  // Animación del alto
  useEffect(() => {
    Animated.spring(heightAnim, {
      toValue: barHeight,
      useNativeDriver: false,
      tension: 100,
      friction: 12,
    }).start();
  }, [barHeight]);

  // Animación del deslizamiento horizontal (X)
  useEffect(() => {
    Animated.spring(xAnim, {
      toValue: index * (width + 2),
      useNativeDriver: false,
      tension: 100,
      friction: 12,
    }).start();
  }, [index, width]);

  return (
    <Animated.View
      style={[
        barStyles.barContainer,
        {
          width,
          left: xAnim,
        },
      ]}
      accessibilityLabel={label ? `${label}, valor ${value}` : `Valor ${value}`}
    >
      <View style={barStyles.labelSlot}>
        {label ? (
          <Text
            style={[
              barStyles.variableLabel,
              { maxWidth: Math.max(width + 18, 42) },
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : null}
      </View>
      <Animated.View
        style={[
          barStyles.bar,
          {
            height: heightAnim,
            backgroundColor: color,
            width: width - 2,
            shadowColor: color,
            opacity: opacity,
          },
        ]}
      />
    </Animated.View>
  );
};

const barStyles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  labelSlot: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  variableLabel: {
    backgroundColor: 'rgba(8, 11, 15, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'center',
  },
  bar: {
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
});

// ─── Componente principal ─────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;

export const BarChart: React.FC<BarChartProps> = ({
  step,
  isCompleted,
  height = 220,
}) => {
  const rawStep = step as any;
  const currentArray: number[] = rawStep?.array ?? rawStep?.estadoArray ?? [];

  const [bars, setBars] = useState<BarState[]>([]);

  // Sincronizar el estado del array de simulación con nuestras barras identificadas únicas
  useEffect(() => {
    if (currentArray.length === 0) return;

    setBars((prevBars) => {
      // Si la longitud cambia o no hay barras previas, inicializamos de nuevo
      const isNewDataset = prevBars.length !== currentArray.length;
      if (isNewDataset) {
        return currentArray.map((value, index) => ({
          id: `bar-${index}-${value}-${Math.random()}`,
          value,
          index,
        }));
      }

      // De lo contrario, emparejamos manteniendo la identidad de cada barra
      return matchNewArrayToBars(currentArray, prevBars);
    });
  }, [currentArray]);

  if (currentArray.length === 0) {
    return <View style={[styles.container, { height }]} />;
  }

  const maxValue = Math.max(...currentArray);
  const barWidth = Math.min(40, Math.floor((SCREEN_WIDTH - 48) / currentArray.length));
  const markerView = getMarkerView(step);

  // Ancho total del contenedor para centrar los elementos de posición absoluta
  const totalWidth = currentArray.length * (barWidth + 2) - 2;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { height, width: totalWidth }]}>
        {bars.map((bar) => {
          const color = getBarColor(bar.index, step, isCompleted);
          const marker = step?.marcadores?.find((item) => item.index === bar.index);
          const isDiscarded = marker?.role === 'descartado';

          return (
            <SingleBar
              key={bar.id}
              value={bar.value}
              maxValue={maxValue}
              color={color}
              label={markerView[bar.index]?.label}
              availableHeight={height - 24}
              width={barWidth}
              opacity={isDiscarded ? 0.25 : 1}
              index={bar.index}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    position: 'relative',
  },
});
