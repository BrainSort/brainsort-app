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
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
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

const EMPTY_ARRAY: number[] = [];

const BAR_COLOR_STOPS = [
  SimulationColors.idle,
  SimulationColors.comparacion,
  SimulationColors.intercambio,
  SimulationColors.final,
];

function getColorStopIndex(color: string): number {
  const normalizedColor = color.toLowerCase();
  const exactIndex = BAR_COLOR_STOPS.findIndex(
    (item) => item.toLowerCase() === normalizedColor,
  );

  return exactIndex === -1 ? 0 : exactIndex;
}

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

// ─── Helper: identidad estable para swaps fluidos ────────────────────────────

interface BarState {
  id: string;
  value: number;
  index: number;
}

function getValueCounts(values: number[]): Map<number, number> {
  return values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map<number, number>());
}

function hasSameMultiset(nextArray: number[], prevBars: BarState[]): boolean {
  if (nextArray.length !== prevBars.length) return false;

  const nextCounts = getValueCounts(nextArray);
  const prevCounts = getValueCounts(prevBars.map((bar) => bar.value));

  if (nextCounts.size !== prevCounts.size) return false;

  for (const [value, count] of nextCounts.entries()) {
    if (prevCounts.get(value) !== count) return false;
  }

  return true;
}

function matchArrayToExistingBars(
  nextArray: number[],
  prevBars: BarState[],
): BarState[] {
  const availableBars = [...prevBars];

  return nextArray.map((value, index) => {
    let bestBarIndex = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let candidateIndex = 0; candidateIndex < availableBars.length; candidateIndex += 1) {
      const candidate = availableBars[candidateIndex];
      if (candidate.value !== value) continue;

      const distance = Math.abs(candidate.index - index);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestBarIndex = candidateIndex;
      }
    }

    if (bestBarIndex === -1) {
      return {
        id: `fallback-${index}-${value}`,
        value,
        index,
      };
    }

    const [bar] = availableBars.splice(bestBarIndex, 1);
    return { ...bar, index };
  });
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
  slotWidth: number;
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
  slotWidth,
}) => {
  const heightAnim = useRef(new Animated.Value(0)).current;
  const xAnim = useRef(new Animated.Value(index * slotWidth)).current;
  const liftAnim = useRef(new Animated.Value(0)).current;
  const colorAnim = useRef(new Animated.Value(getColorStopIndex(color))).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const previousIndexRef = useRef(index);

  const safeMaxValue = Math.max(1, maxValue);
  const barHeight = Math.max(4, (value / safeMaxValue) * availableHeight * 0.9);

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: barHeight,
      useNativeDriver: false,
      duration: 260,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [barHeight, heightAnim]);

  useEffect(() => {
    const didMove = previousIndexRef.current !== index;
    previousIndexRef.current = index;

    Animated.parallel([
      Animated.timing(xAnim, {
        toValue: index * slotWidth,
        useNativeDriver: true,
        duration: didMove ? 420 : 220,
        easing: Easing.inOut(Easing.cubic),
      }),
      Animated.sequence([
        Animated.timing(liftAnim, {
          toValue: didMove ? 1 : 0,
          useNativeDriver: true,
          duration: didMove ? 120 : 1,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(liftAnim, {
          toValue: 0,
          useNativeDriver: true,
          duration: didMove ? 300 : 1,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: didMove ? 1 : 0.35,
          useNativeDriver: false,
          duration: didMove ? 140 : 110,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          useNativeDriver: false,
          duration: didMove ? 360 : 180,
          easing: Easing.out(Easing.cubic),
        }),
      ]),
    ]).start();
  }, [glowAnim, index, liftAnim, slotWidth, xAnim]);

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: getColorStopIndex(color),
      useNativeDriver: false,
      duration: 240,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [color, colorAnim]);

  const lift = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  const barScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.06],
  });

  const animatedColor = colorAnim.interpolate({
    inputRange: BAR_COLOR_STOPS.map((_, stopIndex) => stopIndex),
    outputRange: BAR_COLOR_STOPS,
  });

  const animatedShadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.95],
  });

  const shineOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.18, 0.5],
  });

  return (
    <Animated.View
      style={[
        barStyles.barContainer,
        {
          width,
          transform: [{ translateX: xAnim }, { translateY: lift }],
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
            backgroundColor: animatedColor,
            width: width - 2,
            shadowColor: animatedColor as any,
            shadowOpacity: animatedShadowOpacity,
            opacity: opacity,
            transform: [{ scaleX: barScale }],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            barStyles.barShine,
            {
              opacity: shineOpacity,
              width: Math.max(3, Math.floor(width * 0.22)),
            },
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const barStyles = StyleSheet.create({
  barContainer: {
    position: 'absolute',
    left: 0,
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
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
  },
  barShine: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    bottom: 4,
    position: 'absolute',
    right: 3,
    top: 4,
  },
});

// ─── Componente principal ─────────────────────────────────────────────────────

export const BarChart: React.FC<BarChartProps> = ({
  step,
  isCompleted,
  height = 220,
}) => {
  const nextBarIdRef = useRef(0);
  const { width: windowWidth } = useWindowDimensions();
  const [bars, setBars] = useState<BarState[]>([]);
  const [canvasWidth, setCanvasWidth] = useState(0);

  const rawStep = step as any;
  const currentArray: number[] = rawStep?.array ?? rawStep?.estadoArray ?? EMPTY_ARRAY;

  const handleCanvasLayout = (event: LayoutChangeEvent) => {
    setCanvasWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    setBars((prevBars) => {
      if (currentArray.length === 0) return [];

      if (!hasSameMultiset(currentArray, prevBars)) {
        return currentArray.map((value, index) => ({
          id: `bar-${nextBarIdRef.current++}`,
          value,
          index,
        }));
      }

      return matchArrayToExistingBars(currentArray, prevBars);
    });
  }, [currentArray]);

  if (currentArray.length === 0) {
    return <View style={[styles.emptyContainer, { height }]} />;
  }

  const maxValue = Math.max(...currentArray);
  const availableWidth = Math.max(160, canvasWidth || windowWidth - 48);
  const gap = 4;
  const barWidth = Math.max(
    12,
    Math.min(
      40,
      Math.floor((availableWidth - gap * (currentArray.length - 1)) / currentArray.length),
    ),
  );
  const slotWidth = barWidth + gap;
  const totalWidth = currentArray.length * slotWidth - gap;
  const markerView = getMarkerView(step);

  return (
    <View style={styles.wrapper} onLayout={handleCanvasLayout}>
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
              slotWidth={slotWidth}
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
    alignItems: 'flex-end',
    position: 'relative',
  },
  emptyContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
