/**
 * AuthSimulationPreview.tsx
 * BrainSort — Non-interactive live sorting simulation preview card for Auth screens
 */

import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

type BarState = 'idle' | 'comparacion' | 'intercambio' | 'final';

interface SimulationFrame {
  values: number[];
  states: BarState[];
}

interface AlgorithmSpec {
  id: 'bubble' | 'insertion' | 'selection' | 'quick' | 'merge';
  name: string;
  complexity: string;
  generate: (input: number[]) => SimulationFrame[];
}

const BASE_VALUES = [20, 28, 36, 44, 52, 60, 68, 76, 86];
const STEP_MS = 260;
const HOLD_MS = 1400;

function shuffleArray(source: number[]): number[] {
  const arr = [...source];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const alreadySorted = arr.every((val, idx) => idx === 0 || arr[idx - 1] <= val);
  if (alreadySorted && arr.length > 1) {
    [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
  }
  return arr;
}

function makeStates(length: number, overrides?: Record<number, BarState>, sortedIndices?: Set<number>): BarState[] {
  return Array.from({ length }, (_, idx) => {
    if (overrides && overrides[idx]) return overrides[idx];
    if (sortedIndices?.has(idx)) return 'final';
    return 'idle';
  });
}

function bubbleSortFrames(input: number[]): SimulationFrame[] {
  const arr = [...input];
  const n = arr.length;
  const sorted = new Set<number>();
  const frames: SimulationFrame[] = [{ values: [...arr], states: makeStates(n) }];

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({
        values: [...arr],
        states: makeStates(n, { [j]: 'comparacion', [j + 1]: 'comparacion' }, sorted),
      });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push({
          values: [...arr],
          states: makeStates(n, { [j]: 'intercambio', [j + 1]: 'intercambio' }, sorted),
        });
      }
    }
    sorted.add(n - 1 - i);
  }
  sorted.add(0);
  frames.push({ values: [...arr], states: Array(n).fill('final') });
  return frames;
}

function insertionSortFrames(input: number[]): SimulationFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: SimulationFrame[] = [{ values: [...arr], states: makeStates(n) }];

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    frames.push({
      values: [...arr],
      states: makeStates(n, { [i]: 'comparacion' }),
    });
    while (j >= 0 && arr[j] > key) {
      frames.push({
        values: [...arr],
        states: makeStates(n, { [j]: 'comparacion', [j + 1]: 'comparacion' }),
      });
      arr[j + 1] = arr[j];
      arr[j] = key;
      frames.push({
        values: [...arr],
        states: makeStates(n, { [j]: 'intercambio', [j + 1]: 'intercambio' }),
      });
      j--;
    }
  }
  frames.push({ values: [...arr], states: Array(n).fill('final') });
  return frames;
}

function selectionSortFrames(input: number[]): SimulationFrame[] {
  const arr = [...input];
  const n = arr.length;
  const sorted = new Set<number>();
  const frames: SimulationFrame[] = [{ values: [...arr], states: makeStates(n) }];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      frames.push({
        values: [...arr],
        states: makeStates(n, { [minIdx]: 'comparacion', [j]: 'comparacion' }, sorted),
      });
      if (arr[j] < arr[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      frames.push({
        values: [...arr],
        states: makeStates(n, { [i]: 'intercambio', [minIdx]: 'intercambio' }, sorted),
      });
    }
    sorted.add(i);
  }
  sorted.add(n - 1);
  frames.push({ values: [...arr], states: Array(n).fill('final') });
  return frames;
}

function quickSortFrames(input: number[]): SimulationFrame[] {
  const arr = [...input];
  const n = arr.length;
  const sorted = new Set<number>();
  const frames: SimulationFrame[] = [{ values: [...arr], states: makeStates(n) }];

  function sort(low: number, high: number) {
    if (low > high) return;
    if (low === high) {
      sorted.add(low);
      return;
    }
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      frames.push({
        values: [...arr],
        states: makeStates(n, { [j]: 'comparacion', [high]: 'comparacion' }, sorted),
      });
      if (arr[j] <= pivot) {
        i++;
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          frames.push({
            values: [...arr],
            states: makeStates(n, { [i]: 'intercambio', [j]: 'intercambio' }, sorted),
          });
        }
      }
    }
    const pivotPos = i + 1;
    if (pivotPos !== high) {
      [arr[pivotPos], arr[high]] = [arr[high], arr[pivotPos]];
      frames.push({
        values: [...arr],
        states: makeStates(n, { [pivotPos]: 'intercambio', [high]: 'intercambio' }, sorted),
      });
    }
    sorted.add(pivotPos);
    sort(low, pivotPos - 1);
    sort(pivotPos + 1, high);
  }

  sort(0, n - 1);
  frames.push({ values: [...arr], states: Array(n).fill('final') });
  return frames;
}

function mergeSortFrames(input: number[]): SimulationFrame[] {
  const arr = [...input];
  const n = arr.length;
  const frames: SimulationFrame[] = [{ values: [...arr], states: makeStates(n) }];

  function merge(left: number, mid: number, right: number) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0;
    let j = 0;
    let k = left;

    while (i < leftArr.length && j < rightArr.length) {
      frames.push({
        values: [...arr],
        states: makeStates(n, { [left + i]: 'comparacion', [mid + 1 + j]: 'comparacion' }),
      });
      if (leftArr[i] <= rightArr[j]) {
        arr[k] = leftArr[i++];
      } else {
        arr[k] = rightArr[j++];
      }
      frames.push({
        values: [...arr],
        states: makeStates(n, { [k]: 'intercambio' }),
      });
      k++;
    }
    while (i < leftArr.length) {
      arr[k] = leftArr[i++];
      frames.push({
        values: [...arr],
        states: makeStates(n, { [k]: 'intercambio' }),
      });
      k++;
    }
    while (j < rightArr.length) {
      arr[k] = rightArr[j++];
      frames.push({
        values: [...arr],
        states: makeStates(n, { [k]: 'intercambio' }),
      });
      k++;
    }
  }

  function sort(left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, n - 1);
  frames.push({ values: [...arr], states: Array(n).fill('final') });
  return frames;
}

const ALGORITHMS: AlgorithmSpec[] = [
  { id: 'bubble', name: 'Bubble Sort', complexity: 'O(n²)', generate: bubbleSortFrames },
  { id: 'insertion', name: 'Insertion Sort', complexity: 'O(n²)', generate: insertionSortFrames },
  { id: 'selection', name: 'Selection Sort', complexity: 'O(n²)', generate: selectionSortFrames },
  { id: 'quick', name: 'Quick Sort', complexity: 'O(n log n)', generate: quickSortFrames },
  { id: 'merge', name: 'Merge Sort', complexity: 'O(n log n)', generate: mergeSortFrames },
];

function pickNextAlgorithm(excludeId?: AlgorithmSpec['id']): AlgorithmSpec {
  const candidates = excludeId
    ? ALGORITHMS.filter((algo) => algo.id !== excludeId)
    : ALGORITHMS;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function createRun(excludeId?: AlgorithmSpec['id']): {
  algo: AlgorithmSpec;
  frames: SimulationFrame[];
} {
  const algo = pickNextAlgorithm(excludeId);
  const frames = algo.generate(shuffleArray(BASE_VALUES));
  return { algo, frames };
}

export const AuthSimulationPreview: React.FC = () => {
  const { theme } = useThemeContext();
  const colors = theme.colors;

  const [run, setRun] = useState(() => createRun());
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const isLastFrame = frameIndex >= run.frames.length - 1;
    const timer = setTimeout(
      () => {
        if (isLastFrame) {
          setRun((prev) => createRun(prev.algo.id));
          setFrameIndex(0);
        } else {
          setFrameIndex((prev) => prev + 1);
        }
      },
      isLastFrame ? HOLD_MS : STEP_MS,
    );

    return () => clearTimeout(timer);
  }, [frameIndex, run]);

  const currentFrame = run.frames[Math.min(frameIndex, run.frames.length - 1)];

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
          Simulación activa · {run.algo.name}
        </Text>
        <Text
          style={[
            styles.complexity,
            { color: colors.complexityText },
          ]}
        >
          {run.algo.complexity}
        </Text>
      </View>

      <Svg width="100%" height={92} viewBox="0 0 288 92">
        {currentFrame.values.map((val, idx) => {
          const state = currentFrame.states[idx] ?? 'idle';
          return (
            <Rect
              key={idx}
              x={idx * 32 + 4}
              y={90 - val}
              width={22}
              height={val}
              rx={4}
              fill={SimulationColors[state]}
              opacity={0.92}
            />
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl ?? 16,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
    ...(Platform.OS === 'web' ? ({ userSelect: 'none' } as any) : {}),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  label: {
    flex: 1,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  complexity: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
});

export default AuthSimulationPreview;
