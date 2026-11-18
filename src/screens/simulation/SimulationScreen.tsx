/**
 * SimulationScreen.tsx
 * BrainSort — Pantalla de simulación interactiva de algoritmos
 *
 * task_breakdown.md T-FE-097
 *
 * Implementa HU-03, HU-04, HU-06, HU-07:
 *
 * HU-03 — Datos predeterminados:
 *   - Genera arreglo aleatorio 8-15 elementos al cargar (useDataset)
 *   - Botón "Generar nuevos datos"
 *   - Input para datos personalizados (separados por coma)
 *
 * HU-04 — Control de animación:
 *   - Play / Pause con ControlBar
 *   - Velocidad [0.25x, 2.0x] en pasos de 0.25
 *   - BarChart con color-coding del spec
 *   - PseudocodePanel sincronizado con el paso actual
 *   - ≥24 FPS mediante RAF loop (useAnimationController)
 *
 * HU-06 — Seguimiento hasta finalización:
 *   - Todos los elementos verdes al terminar
 *   - Play deshabilitado, Reiniciar habilitado
 *   - Timeout de seguridad (10s) en useSimulationEngine
 *
 * HU-07 — Mensaje de finalización:
 *   - Toast "¡Algoritmo completado!" con opciones
 *   - Auto-desaparece a los 5 segundos
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useQueryClient } from '@tanstack/react-query';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { useSimulation } from '../../hooks/useSimulation';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import { useDataset } from '../../hooks/useDataset';
import { useAnimationController } from '../../hooks/useAnimationController';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { BarChart } from '../../components/simulation/BarChart';
import { ControlBar } from '../../components/simulation/ControlBar';
import { LinearStructureCanvas } from '../../components/simulation/LinearStructureCanvas';
import { TreeStructureCanvas } from '../../components/simulation/TreeStructureCanvas';
import { GraphRenderer } from '../../visualization/GraphRenderer';
import { FrontierPanel } from '../../components/simulation/FrontierPanel';
import { SearchArrayCanvas } from '../../components/search/SearchArrayCanvas';
import { SearchTargetInput } from '../../components/search/SearchTargetInput';
import { SearchResultBanner } from '../../components/search/SearchResultBanner';
import { PseudocodePanel } from '../../components/simulation/PseudocodePanel';
import {
  BadgeUnlockModal,
  UnlockedBadgeNotice,
} from '../../components/gamification/BadgeUnlockModal';
import { simulationService } from '../../services/simulation.service';
import { Spinner } from '../../components/common/Spinner';
import { AnimationEngine } from '../../visualization/AnimationEngine';
import { SearchVisualEngine } from '../../visualization/search/SearchVisualEngine';
import {
  DEFAULT_WEIGHTED_GRAFO,
  GrafoData,
  isPasoGrafo,
  parseUnweightedGraphInput,
  parseWeightedGraphInput,
} from '@brainsort/core';
import {
  isSortedAscending,
  sortAscending,
  pickSuggestedTarget,
  validateTargetInput,
} from '../../utils/search.utils';
import { useThemeContext } from '../../context/ThemeContext';
import type { ThemeColors } from '../../styles/theme';
import { Semantic } from '../../styles/colors';
import {
  BorderRadius,
  Spacing,
  SpacingAlias,
} from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

type SimulationContentProps = {
  algoritmoId: string;
  onRequestBack?: () => void;
  showAlgorithmHeader?: boolean;
};



function formatDataset(data: number[]): string {
  return data.join(', ');
}

function getComfortableDefaultSpeed(nombre?: string, categoria?: string): number {
  if (!nombre) return 1.0;

  const recursiveOrTree = new Set([
    'Merge Sort',
    'Quick Sort',
    'Segment Tree',
  ]);
  const denseStructures = new Set(['Heap Sort', 'Priority Queue']);
  const quickRead = new Set(['Linear Search', 'Binary Search', 'Stack', 'Queue', 'Deque']);

  if (recursiveOrTree.has(nombre) || categoria === 'EstructurasArboles') {
    return 0.5;
  }

  if (denseStructures.has(nombre)) {
    return 0.75;
  }

  if (quickRead.has(nombre)) {
    return 1.0;
  }

  return 0.75;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    // Scroll principal
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: SpacingAlias.screenPaddingX,
      paddingTop: Spacing[5],
      paddingBottom: Spacing[8],
      gap: Spacing[4],
      width: '100%',
      maxWidth: 1320,
      alignSelf: 'center',
    },
    workspaceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing[5],
    },
    leftColumn: {
      flex: 1.45,
      minWidth: 0,
      gap: Spacing[4],
    },
    rightColumn: {
      flex: 1,
      minWidth: 340,
      maxWidth: 480,
      gap: Spacing[4],
    },
    progressSection: {
      gap: Spacing[2],
    },
    progressMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressPercentText: {
      fontFamily: FontFamilies.mono,
      fontSize: FontSizes.xs,
      color: colors.brandAccent,
      fontVariant: ['tabular-nums'],
    },

    // Header del algoritmo
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    algoName: {
      ...TextVariants.h4,
      color: colors.textPrimary,
      flex: 1,
    },
    stepCounter: {
      fontFamily: FontFamilies.medium,
      fontWeight: FontWeights.medium,
      fontSize: FontSizes.sm,
      color: colors.textMuted,
    },

    // Progreso
    progressBar: {
      height: 3,
      backgroundColor: colors.border,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.brandAccent,
      borderRadius: BorderRadius.full,
    },

    // Canvas de barras
    canvasContainer: {
      backgroundColor: colors.surface,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: Spacing[5],
      overflow: 'hidden',
      alignItems: 'center',
      gap: Spacing[3],
    },

    // Leyenda de colores
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing[3],
      justifyContent: 'center',
    },
    legendIntegrated: {
      width: '100%',
      borderTopWidth: 1,
      borderTopColor: colors.borderSubtle,
      paddingTop: Spacing[3],
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[1],
    },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: {
      fontFamily: FontFamilies.regular,
      fontSize: FontSizes.xs,
      color: colors.textMuted,
    },

    // Input de datos personalizados
    dataInputSection: {
      gap: Spacing[3],
    },
    configCard: {
      backgroundColor: colors.surface,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: BorderRadius.xl,
      padding: Spacing[4],
    },
    dataInputLabel: {
      fontFamily: FontFamilies.medium,
      fontWeight: FontWeights.medium,
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
    },
    dataInputRow: {
      flexDirection: 'row',
      gap: Spacing[2],
    },
    dataInputShell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: BorderRadius.md,
      overflow: 'hidden',
    },
    dataInput: {
      flex: 1,
      paddingLeft: Spacing[4],
      paddingRight: Spacing[2],
      paddingVertical: Spacing[3],
      fontFamily: FontFamilies.mono,
      fontSize: FontSizes.sm,
      color: colors.inputText,
    },
    dataInputError: { borderColor: Semantic.error },
    diceButton: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      alignSelf: 'stretch',
      borderLeftWidth: 1,
      borderLeftColor: colors.border,
    },
    diceButtonText: {
      fontSize: 16,
    },
    applyButton: {
      backgroundColor: colors.primaryButton,
      borderRadius: BorderRadius.md,
      paddingHorizontal: Spacing[5],
      justifyContent: 'center',
    },
    applyButtonText: {
      fontFamily: FontFamilies.semiBold,
      fontWeight: FontWeights.semiBold,
      fontSize: FontSizes.sm,
      color: colors.primaryButtonText,
    },
    practiceButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.chipActiveBorder,
      backgroundColor: colors.chipActiveBg,
    },
    practiceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing[2],
    },
    practiceButtonText: {
      fontFamily: FontFamilies.semiBold,
      fontWeight: FontWeights.semiBold,
      fontSize: FontSizes.sm,
      color: colors.brandAccent,
    },
    ctaGroup: {
      gap: Spacing[3],
    },
    compareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Spacing[3.5],
      paddingHorizontal: Spacing[4],
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surface,
    },
    compareButtonText: {
      fontFamily: FontFamilies.semiBold,
      fontWeight: FontWeights.semiBold,
      fontSize: FontSizes.sm,
      color: colors.textPrimary,
    },
    comingSoonBadge: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing[2.5],
      paddingVertical: 2,
    },
    comingSoonText: {
      fontFamily: FontFamilies.medium,
      fontWeight: FontWeights.medium,
      fontSize: 11,
      color: colors.textMuted,
    },
    inputErrorText: {
      fontFamily: FontFamilies.regular,
      fontSize: FontSizes.xs,
      color: Semantic.error,
    },

    // Estado inicial / sin datos
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing[10],
      gap: Spacing[3],
    },
    emptyIcon: { fontSize: 36 },
    emptyText: { ...TextVariants.bodyMd, color: colors.textMuted, textAlign: 'center' },

    // Loading
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startNodeSection: {
      marginTop: Spacing[3],
      gap: Spacing[2],
    },
    startNodeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing[2],
    },
    startNodeChip: {
      minWidth: 38,
      height: 34,
      paddingHorizontal: Spacing[3],
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
    },
    startNodeChipActive: {
      borderColor: colors.chipActiveBorder,
      backgroundColor: colors.chipActiveBg,
    },
    startNodeText: {
      fontFamily: FontFamilies.semiBold,
      fontWeight: FontWeights.semiBold,
      fontSize: FontSizes.sm,
      color: colors.textSecondary,
    },
    startNodeTextActive: {
      color: colors.brandAccent,
    },
  });
}

function formatWeightedGraph(g: GrafoData): string {
  return g.aristas
    .map((e) => `[${e[0]}, ${e[1]}] ${(e as [string, string, number?])[2] ?? 1}`)
    .join(', ');
}

function formatUnweightedGraph(g: GrafoData): string {
  return g.aristas.map((e) => `[${e[0]}, ${e[1]}]`).join(', ');
}

const UNWEIGHTED_GRAPH_PRESETS: GrafoData[] = [
  {
    nodos: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    aristas: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'D'],
      ['B', 'E'],
      ['C', 'F'],
      ['C', 'G'],
    ],
    dirigido: false,
  },
  {
    nodos: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    aristas: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'D'],
      ['D', 'E'],
      ['D', 'F'],
      ['C', 'G'],
    ],
    dirigido: false,
  },
  {
    nodos: ['A', 'B', 'C', 'D', 'E', 'F'],
    aristas: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'D'],
      ['C', 'D'],
      ['B', 'E'],
      ['D', 'F'],
      ['E', 'F'],
    ],
    dirigido: false,
  },
];

const WEIGHTED_GRAPH_PRESETS: GrafoData[] = [
  DEFAULT_WEIGHTED_GRAFO,
  {
    nodos: ['A', 'B', 'C', 'D', 'E'],
    aristas: [
      ['A', 'B'],
      ['A', 'C'],
      ['B', 'C'],
      ['B', 'D'],
      ['C', 'D'],
      ['C', 'E'],
      ['D', 'E'],
    ],
    dirigido: false,
    pesos: {
      'A-B': 2,
      'B-A': 2,
      'A-C': 5,
      'C-A': 5,
      'B-C': 1,
      'C-B': 1,
      'B-D': 4,
      'D-B': 4,
      'C-D': 2,
      'D-C': 2,
      'C-E': 6,
      'E-C': 6,
      'D-E': 1,
      'E-D': 1,
    },
    aristasPonderadas: [
      ['A', 'B', 2],
      ['A', 'C', 5],
      ['B', 'C', 1],
      ['B', 'D', 4],
      ['C', 'D', 2],
      ['C', 'E', 6],
      ['D', 'E', 1],
    ],
  },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export function SimulationContent({
  algoritmoId,
  onRequestBack,
  showAlgorithmHeader = true,
}: SimulationContentProps) {

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { theme } = useThemeContext();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const navigation = useNavigation<NavigationProp<LibraryStackParamList>>();
  const { algoritmo, isLoading: algoLoading } = useAlgorithm(algoritmoId);
  const {
    steps,
    currentStep,
    grafo: simGrafo,
    isPlaying,
    speed,
    isCompleted,
    play,
    pause,
    nextStep,
    previousStep,
    setSpeed,
    resetSimulation,
    pseudocode,
    sesionId,
  } = useSimulation();
  const { executeAlgorithm, isExecuting } = useSimulationEngine();
  const {
    generateDefault,
    generateDefaultGraph,
    validateDataset,
    grafo,
    setGrafo,
    nodoInicio,
    setNodoInicio,
  } = useDataset();
  useAnimationController(); // RAF loop — maneja avance automático de frames

  // ─── Estado local ─────────────────────────────────────────────────────────
  const queryClient = useQueryClient();
  const [customInput, setCustomInput] = useState('');
  const [targetInput, setTargetInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [graphPresetIndex, setGraphPresetIndex] = useState(0);
  const [showInlineValues, setShowInlineValues] = useState(true);
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadgeNotice[]>([]);

  useEffect(() => {
    if (isCompleted && sesionId && steps.length > 0) {
      simulationService
        .updateSessionProgress(sesionId, steps.length)
        .then((res) => {
          queryClient.invalidateQueries({ queryKey: ['progreso', 'me'] });
          queryClient.invalidateQueries({ queryKey: ['badges', 'me'] });
          queryClient.invalidateQueries({ queryKey: ['ranking'] });
          if (res?.nuevasInsignias && res.nuevasInsignias.length > 0) {
            setUnlockedBadges(res.nuevasInsignias);
          }
        })
        .catch(() => {});
    }
  }, [isCompleted, sesionId, steps.length, queryClient]);

  const isSearch = AnimationEngine.isSearchAlgorithm(
    (algoritmo as any)?.categoria,
    algoritmo?.nombre,
  );
  const isBinary = algoritmo?.nombre === 'Binary Search';
  const isDijkstraAlgo =
    algoritmo?.nombre === 'Dijkstra' ||
    (algoritmo?.nombre?.toLowerCase().includes('dijkstra') ?? false) ||
    algoritmoId.toLowerCase().includes('dijkstra');
  const isGraphAlgo =
    (algoritmo as any)?.categoria === 'Grafos' ||
    algoritmo?.nombre === 'Breadth-First Search' ||
    algoritmo?.nombre === 'Depth-First Search' ||
    algoritmo?.nombre === 'BFS' ||
    algoritmo?.nombre === 'DFS' ||
    isDijkstraAlgo;

  // ─── Cargar datos al montar ───────────────────────────────────────────────
  useEffect(() => {
    if (algoritmo && !hasStarted) {
      if (isDijkstraAlgo) {
        const defaultG = DEFAULT_WEIGHTED_GRAFO;
        const start = nodoInicio ?? 'A';
        setGrafo(defaultG);
        setCustomInput(formatWeightedGraph(defaultG));
        executeAlgorithm(
          algoritmoId,
          { grafo: defaultG, nodoInicio: start },
          algoritmo.nombre,
        )
          .then(() => setHasStarted(true))
          .catch(() => {});
        return;
      }

      if (isGraphAlgo) {
        const defaultG = grafo ?? generateDefaultGraph(algoritmo.nombre);
        const start = nodoInicio ?? 'A';
        setCustomInput(formatUnweightedGraph(defaultG));
        executeAlgorithm(
          algoritmoId,
          { grafo: defaultG, nodoInicio: start },
          algoritmo.nombre,
        )
          .then(() => setHasStarted(true))
          .catch(() => {});
        return;
      }

      let initialData = generateDefault();
      let initialTarget: number | undefined;

      if (isSearch) {
        if (isBinary) {
          initialData = sortAscending(initialData);
        }
        initialTarget = pickSuggestedTarget(initialData, true);
        setTargetInput(String(initialTarget));
      }

      setCustomInput(formatDataset(initialData));
      executeAlgorithm(
        algoritmoId,
        {
          tipoOrigen: 'Personalizado',
          valores: initialData,
          tamano: initialData.length,
          objetivo: initialTarget,
        },
        algoritmo.nombre,
      )
        .then(() => setHasStarted(true))
        .catch(() => {});
    }
  }, [
    algoritmo,
    algoritmoId,
    hasStarted,
    generateDefault,
    generateDefaultGraph,
    executeAlgorithm,
    isSearch,
    isBinary,
    isGraphAlgo,
    isDijkstraAlgo,
    grafo,
    nodoInicio,
    setGrafo,
  ]);

  // Si cambia el algoritmo seleccionado, reinicia el arranque de simulación.
  useEffect(() => {
    setHasStarted(false);
    setCustomInput('');
    setTargetInput('');
    setInputError(null);
    resetSimulation();
  }, [algoritmoId, resetSimulation]);

  // Velocidad pedagógica por algoritmo: 1x ahora es legible, y los recursivos
  // arrancan más lento para que el usuario pueda seguir la pila de llamadas.
  useEffect(() => {
    setSpeed(getComfortableDefaultSpeed(algoritmo?.nombre, algoritmo?.categoria));
  }, [algoritmo?.nombre, algoritmo?.categoria, setSpeed]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerateNew = useCallback(() => {
    if (!algoritmo) return;
    if (isDijkstraAlgo) {
      const nextIdx = (graphPresetIndex + 1) % WEIGHTED_GRAPH_PRESETS.length;
      const g = WEIGHTED_GRAPH_PRESETS[nextIdx];
      const start =
        nodoInicio && g.nodos.includes(nodoInicio) ? nodoInicio : g.nodos[0];
      setGraphPresetIndex(nextIdx);
      setGrafo(g);
      setNodoInicio(start);
      setCustomInput(formatWeightedGraph(g));
      executeAlgorithm(
        algoritmoId,
        { grafo: g, nodoInicio: start },
        algoritmo.nombre,
      ).catch(() => {});
      setInputError(null);
      return;
    }

    if (isGraphAlgo) {
      const nextIdx = (graphPresetIndex + 1) % UNWEIGHTED_GRAPH_PRESETS.length;
      const g = UNWEIGHTED_GRAPH_PRESETS[nextIdx];
      const start =
        nodoInicio && g.nodos.includes(nodoInicio) ? nodoInicio : g.nodos[0];
      setGraphPresetIndex(nextIdx);
      setGrafo(g);
      setNodoInicio(start);
      setCustomInput(formatUnweightedGraph(g));
      executeAlgorithm(
        algoritmoId,
        { grafo: g, nodoInicio: start },
        algoritmo.nombre,
      ).catch(() => {});
      setInputError(null);
      return;
    }

    let data = generateDefault();
    let targetVal: number | undefined;

    if (isSearch) {
      if (isBinary) {
        data = sortAscending(data);
      }
      targetVal = pickSuggestedTarget(data, true);
      setTargetInput(String(targetVal));
    }

    setCustomInput(formatDataset(data));
    executeAlgorithm(
      algoritmoId,
      {
        tipoOrigen: 'Personalizado',
        valores: data,
        tamano: data.length,
        objetivo: targetVal,
      },
      algoritmo.nombre,
    ).catch(() => {});
    setInputError(null);
  }, [
    algoritmo,
    algoritmoId,
    generateDefault,
    executeAlgorithm,
    isSearch,
    isBinary,
    isGraphAlgo,
    isDijkstraAlgo,
    graphPresetIndex,
    nodoInicio,
    setGrafo,
    setNodoInicio,
  ]);

  const handleApplyCustom = useCallback(() => {
    if (!algoritmo || !customInput.trim()) return;

    if (isDijkstraAlgo) {
      const res = parseWeightedGraphInput(customInput);
      if (!res.valid || !res.grafo) {
        setInputError(res.errors?.[0] ?? 'Formato de grafo ponderado inválido.');
        return;
      }
      const newG = res.grafo;
      setGrafo(newG);
      const start =
        nodoInicio && newG.nodos.includes(nodoInicio)
          ? nodoInicio
          : newG.nodos[0];
      setNodoInicio(start);
      setInputError(null);
      executeAlgorithm(
        algoritmoId,
        { grafo: newG, nodoInicio: start },
        algoritmo.nombre,
      ).catch(() => {});
      return;
    }

    if (isGraphAlgo) {
      const res = parseUnweightedGraphInput(customInput);
      if (!res.valid || !res.grafo) {
        setInputError(res.errors?.[0] ?? 'Formato de grafo inválido.');
        return;
      }
      const newG = res.grafo;
      setGrafo(newG);
      const start =
        nodoInicio && newG.nodos.includes(nodoInicio)
          ? nodoInicio
          : newG.nodos[0];
      setNodoInicio(start);
      setInputError(null);
      executeAlgorithm(
        algoritmoId,
        { grafo: newG, nodoInicio: start },
        algoritmo.nombre,
      ).catch(() => {});
      return;
    }

    const parts = customInput.split(',').map((s) => Number(s.trim()));
    const error = validateDataset(parts);
    if (error) {
      setInputError(error.message);
      return;
    }

    let finalData = parts;
    let targetVal: number | undefined;

    if (isSearch) {
      // Validar target
      const targetRes = validateTargetInput(targetInput);
      if (targetRes.error) {
        setInputError(targetRes.error);
        return;
      }
      targetVal = targetRes.value;

      // Si es Búsqueda Binaria, auto-ordenar según decisión de UX
      if (isBinary && !isSortedAscending(parts)) {
        finalData = sortAscending(parts);
      }
    }

    setInputError(null);
    setCustomInput(formatDataset(finalData));
    executeAlgorithm(
      algoritmoId,
      {
        tipoOrigen: 'Personalizado',
        valores: finalData,
        tamano: finalData.length,
        objetivo: targetVal,
      },
      algoritmo.nombre,
    ).catch(() => {});
  }, [
    algoritmo,
    algoritmoId,
    customInput,
    targetInput,
    validateDataset,
    executeAlgorithm,
    isSearch,
    isBinary,
    isGraphAlgo,
    isDijkstraAlgo,
    nodoInicio,
    setGrafo,
    setNodoInicio,
  ]);

  const handleSelectStartNode = useCallback(
    (node: string) => {
      setNodoInicio(node);
      if (isGraphAlgo) {
        const currentG =
          grafo ??
          simGrafo ??
          (isDijkstraAlgo
            ? DEFAULT_WEIGHTED_GRAFO
            : generateDefaultGraph(algoritmo?.nombre));
        executeAlgorithm(
          algoritmoId,
          { grafo: currentG, nodoInicio: node },
          algoritmo?.nombre,
        ).catch(() => {});
      }
    },
    [
      setNodoInicio,
      isGraphAlgo,
      grafo,
      simGrafo,
      isDijkstraAlgo,
      generateDefaultGraph,
      algoritmo?.nombre,
      executeAlgorithm,
      algoritmoId,
    ],
  );

  const handleAutoSort = useCallback(() => {
    if (!customInput.trim()) return;
    const parts = customInput.split(',').map((s) => Number(s.trim()));
    const sorted = sortAscending(parts);
    setCustomInput(formatDataset(sorted));
    setInputError(null);

    let targetVal: number | undefined;
    if (targetInput.trim()) {
      const res = validateTargetInput(targetInput);
      if (!res.error) targetVal = res.value;
    }

    executeAlgorithm(
      algoritmoId,
      {
        tipoOrigen: 'Personalizado',
        valores: sorted,
        tamano: sorted.length,
        objetivo: targetVal,
      },
      algoritmo?.nombre,
    ).catch(() => {});
  }, [algoritmoId, algoritmo?.nombre, customInput, targetInput, executeAlgorithm]);

  const handleRandomTarget = useCallback(() => {
    if (!customInput.trim()) return;
    const parts = customInput.split(',').map((s) => Number(s.trim()));
    const randomTarget = pickSuggestedTarget(parts, true);
    setTargetInput(String(randomTarget));
    setInputError(null);

    executeAlgorithm(
      algoritmoId,
      {
        tipoOrigen: 'Personalizado',
        valores: parts,
        tamano: parts.length,
        objetivo: randomTarget,
      },
      algoritmo?.nombre,
    ).catch(() => {});
  }, [algoritmoId, algoritmo?.nombre, customInput, executeAlgorithm]);

  const handleReset = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);

  // Atajos de teclado en Web (Space, ArrowLeft, ArrowRight, KeyR)
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      const tag = activeEl?.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || activeEl?.isContentEditable) {
        return;
      }

      if (event.code === 'Space') {
        if (steps.length > 0 && !isCompleted) {
          event.preventDefault();
          if (isPlaying) {
            pause();
          } else {
            play();
          }
        }
      } else if (event.code === 'ArrowLeft') {
        if (steps.length > 0) {
          event.preventDefault();
          previousStep();
        }
      } else if (event.code === 'ArrowRight') {
        if (steps.length > 0) {
          event.preventDefault();
          nextStep();
        }
      } else if (event.code === 'KeyR') {
        if (steps.length > 0) {
          event.preventDefault();
          handleReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    steps.length,
    isCompleted,
    isPlaying,
    play,
    pause,
    previousStep,
    nextStep,
    handleReset,
  ]);



  // ─── Render ───────────────────────────────────────────────────────────────

  if (algoLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Spinner size="large" />
      </View>
    );
  }

  const currentStepData = currentStep.step;
  const pseudoLines = pseudocode;
  const hasSteps = steps.length > 0;
  const progressPercent = currentStep.progress;
  const rendererType = AnimationEngine.getRendererType(
    (algoritmo as any)?.categoria,
    algoritmo?.nombre,
  );
  const isTree = rendererType === 'tree';
  const isLinear = rendererType === 'linear';
  const activeGrafo =
    grafo ??
    simGrafo ??
    (isDijkstraAlgo ? DEFAULT_WEIGHTED_GRAFO : undefined);
  const legend = AnimationEngine.getLegend(
    (algoritmo as any)?.categoria,
    algoritmo?.nombre,
  );

  const searchFrame = isSearch
    ? SearchVisualEngine.buildFrame(
        currentStepData,
        algoritmo?.nombre,
        isCompleted,
      )
    : null;

  const parsedNumbers = customInput
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n));
  const isSorted = isSortedAscending(parsedNumbers);

  const canvasSection = (
    <View style={styles.canvasContainer}>
      {isExecuting ? (
        <View style={{ height: 240, alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="large" />
        </View>
      ) : hasSteps ? (
        isGraphAlgo ? (
          <GraphRenderer
            algorithmName={algoritmo?.nombre}
            step={currentStepData}
            isCompleted={isCompleted}
            grafo={activeGrafo}
            nodoInicio={nodoInicio}
            height={300}
          />
        ) : rendererType === 'search' ? (
          <SearchArrayCanvas
            algorithmName={algoritmo?.nombre}
            step={currentStepData}
            isCompleted={isCompleted}
            height={220}
          />
        ) : isTree ? (
          <TreeStructureCanvas
            step={currentStepData}
            isCompleted={isCompleted}
            algorithmName={algoritmo?.nombre ?? ''}
            height={220}
          />
        ) : isLinear ? (
          <LinearStructureCanvas
            step={currentStepData as any}
            isCompleted={isCompleted}
            algorithmName={algoritmo?.nombre ?? ''}
            height={220}
          />
        ) : (
          <BarChart
            algorithmName={algoritmo?.nombre}
            step={currentStepData}
            isCompleted={isCompleted}
            height={220}
          />
        )
      ) : (
        <View style={styles.emptyState}>
          <BarChartIcon size={36} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Genera datos para iniciar la simulación
          </Text>
        </View>
      )}

      {/* Leyenda integrada en pie del canvas en escritorio */}
      {isDesktop && (
        <View style={[styles.legend, styles.legendIntegrated]}>
          {legend.map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const dataConfigSection = (
    <View style={[styles.dataInputSection, isDesktop && styles.configCard]}>
      {isSearch && (
        <SearchTargetInput
          targetInput={targetInput}
          onTargetChange={(val) => {
            setTargetInput(val);
            setInputError(null);
          }}
          onRandomTarget={handleRandomTarget}
          isBinarySearch={isBinary}
          isSorted={isSorted}
          onAutoSort={handleAutoSort}
          disabled={isExecuting}
        />
      )}

      <Text style={styles.dataInputLabel}>
        {isGraphAlgo
          ? isDijkstraAlgo
            ? 'Grafo ponderado (Formato: [origen, destino] peso)'
            : 'Grafo personalizado (Formato: [origen, destino])'
          : 'Colección de datos'}
      </Text>
      <View style={styles.dataInputRow}>
        <View
          style={[
            styles.dataInputShell,
            inputError ? styles.dataInputError : null,
          ]}
        >
          <TextInput
            style={styles.dataInput}
            value={customInput}
            onChangeText={(text) => {
              setCustomInput(text);
              setInputError(null);
            }}
            placeholder={
              isGraphAlgo
                ? isDijkstraAlgo
                  ? '[A, B] 4, [A, C] 2, [B, D] 5'
                  : '[A, B], [A, C], [B, D], [B, E], [C, F]'
                : '5, 3, 8, 1, 9, 2'
            }
            placeholderTextColor={colors.inputPlaceholder}
            keyboardType="default"
            returnKeyType="done"
            onSubmitEditing={handleApplyCustom}
            accessibilityLabel={
              isGraphAlgo
                ? isDijkstraAlgo
                  ? 'Aristas ponderadas del grafo'
                  : 'Aristas del grafo'
                : 'Datos personalizados en formato CSV'
            }
            testID="input-custom-data"
          />
          <TouchableOpacity
            style={styles.diceButton}
            onPress={handleGenerateNew}
            disabled={isExecuting}
            accessibilityRole="button"
            accessibilityLabel={
              isGraphAlgo
                ? 'Restablecer grafo predeterminado'
                : 'Generar nuevos datos aleatorios'
            }
            testID="btn-generate-new"
          >
            <DicesIcon size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.applyButton}
          onPress={handleApplyCustom}
          disabled={!customInput.trim()}
          accessibilityRole="button"
          accessibilityLabel={
            isGraphAlgo ? 'Aplicar grafo' : 'Aplicar datos personalizados'
          }
          testID="btn-apply-data"
        >
          <Text style={styles.applyButtonText}>Aplicar</Text>
        </TouchableOpacity>
      </View>
      {inputError && (
        <Text style={styles.inputErrorText}>{inputError}</Text>
      )}

      {isGraphAlgo && activeGrafo && activeGrafo.nodos.length > 0 && (
        <View style={styles.startNodeSection}>
          <Text style={styles.dataInputLabel}>
            Nodo de inicio {isDijkstraAlgo ? 'del camino mínimo' : 'del recorrido'}
          </Text>
          <View style={styles.startNodeRow}>
            {activeGrafo.nodos.map((nodo) => {
              const isSelected = (nodoInicio ?? activeGrafo.nodos[0]) === nodo;
              return (
                <TouchableOpacity
                  key={nodo}
                  style={[
                    styles.startNodeChip,
                    isSelected && styles.startNodeChipActive,
                  ]}
                  onPress={() => handleSelectStartNode(nodo)}
                  disabled={isExecuting}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Seleccionar nodo de inicio ${nodo}`}
                >
                  <Text
                    style={[
                      styles.startNodeText,
                      isSelected && styles.startNodeTextActive,
                    ]}
                  >
                    {nodo}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  const practiceCtaButton = (
    <View style={styles.ctaGroup}>
      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.practiceButton,
          { opacity: pressed ? 0.85 : hovered ? 0.92 : 1 },
          Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
        ]}
        onPress={() => navigation.navigate('Exercise', { algoritmoId })}
        accessibilityRole="button"
        accessibilityLabel="Ir a ejercicios de práctica"
        testID="btn-practice"
      >
        <View style={styles.practiceLeft}>
          <GraduationCapIcon size={18} color={colors.brandAccent} />
          <Text style={styles.practiceButtonText}>Practicar ejercicios</Text>
        </View>
        <ChevronRightIcon size={18} color={colors.brandAccent} />
      </Pressable>

      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.compareButton,
          { opacity: pressed ? 0.85 : hovered ? 0.92 : 1 },
          Platform.OS === 'web' &&
            ({ cursor: 'pointer', outlineStyle: 'none', outlineWidth: 0 } as any),
        ]}
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityLabel="Comparar algoritmos (Próximamente)"
        testID="btn-compare"
      >
        <View style={styles.practiceLeft}>
          <CompareIcon size={18} color={colors.textSecondary} />
          <Text style={styles.compareButtonText}>Comparar</Text>
        </View>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Próximamente</Text>
        </View>
      </Pressable>
    </View>
  );

  const inspectorPanels = (
    <>
      {isGraphAlgo && currentStepData && isPasoGrafo(currentStepData) && (
        <FrontierPanel
          algorithmName={algoritmo?.nombre}
          step={currentStepData}
        />
      )}
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header: nombre */}
        {showAlgorithmHeader && (
          <View style={[styles.headerRow, { marginBottom: Spacing[1] }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[3] }}>
              <TouchableOpacity onPress={onRequestBack} accessibilityLabel="Volver">
                <ArrowLeftIcon size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.algoName, { fontSize: 20 }]} numberOfLines={1}>
                {algoritmo?.nombre ?? 'Simulación'}
              </Text>
            </View>
          </View>
        )}

        {/* Barra de progreso con contador siempre visible */}
        {hasSteps && (
          <View style={styles.progressSection}>
            <View style={styles.progressMetaRow}>
              <Text style={styles.stepCounter}>
                Paso {currentStep.displayNumber} de {currentStep.totalSteps}
              </Text>
              <Text style={styles.progressPercentText}>
                {Math.round(progressPercent)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>
        )}

        {/* Banner de resultado para búsqueda */}
        {isSearch && searchFrame && (
          <SearchResultBanner
            resultado={searchFrame.resultado}
            comparaciones={searchFrame.comparaciones}
            indiceEncontrado={searchFrame.indiceEncontrado}
            objetivo={searchFrame.objetivo}
            isCompleted={isCompleted}
          />
        )}

        {isDesktop ? (
          <View style={styles.workspaceRow}>
            {/* Columna izquierda: Canvas + ControlBar inline + Config */}
            <View style={styles.leftColumn}>
              {canvasSection}
              <ControlBar
                variant="inline"
                isPlaying={!!isPlaying}
                isCompleted={isCompleted}
                speed={speed}
                hasSteps={hasSteps}
                onPlay={play}
                onPause={pause}
                onReset={handleReset}
                onPreviousStep={previousStep}
                onNextStep={nextStep}
                onSpeedChange={setSpeed}
              />
              {dataConfigSection}
            </View>

            {/* Columna derecha: Inspector + Pseudocódigo + Practicar */}
            <View style={styles.rightColumn}>
              {inspectorPanels}
              {pseudoLines.length > 0 && (
                <PseudocodePanel
                  lines={pseudoLines}
                  currentStep={currentStepData}
                  showInlineValues={showInlineValues}
                  onToggleInlineValues={() => setShowInlineValues((prev) => !prev)}
                  maxHeight={360}
                />
              )}
              {practiceCtaButton}
            </View>
          </View>
        ) : (
          <>
            {canvasSection}

            {/* Leyenda de colores en móvil */}
            <View style={styles.legend}>
              {legend.map(({ color, label }) => (
                <View key={label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: color }]} />
                  <Text style={styles.legendText}>{label}</Text>
                </View>
              ))}
            </View>

            {inspectorPanels}

            {pseudoLines.length > 0 && (
              <PseudocodePanel
                lines={pseudoLines}
                currentStep={currentStepData}
                showInlineValues={showInlineValues}
                onToggleInlineValues={() => setShowInlineValues((prev) => !prev)}
              />
            )}

            {dataConfigSection}
            {practiceCtaButton}
          </>
        )}
      </ScrollView>

      {/* Barra de control — pegada al fondo solo en móvil/tablet */}
      {!isDesktop && (
        <ControlBar
          variant="docked"
          isPlaying={!!isPlaying}
          isCompleted={isCompleted}
          speed={speed}
          hasSteps={hasSteps}
          onPlay={play}
          onPause={pause}
          onReset={handleReset}
          onPreviousStep={previousStep}
          onNextStep={nextStep}
          onSpeedChange={setSpeed}
        />
      )}
      <BadgeUnlockModal
        visible={unlockedBadges.length > 0}
        badges={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
    </KeyboardAvoidingView>
  );
}

type LegacyScreenProps = {
  route: { params: { algoritmoId: string } };
  navigation: { goBack: () => void };
};

export default function SimulationScreen({ navigation, route }: LegacyScreenProps) {
  return (
    <SimulationContent
      algoritmoId={route.params.algoritmoId}
      onRequestBack={navigation.goBack}
      showAlgorithmHeader
    />
  );
}

// ─── Iconos SVG estilo Lucide ─────────────────────────────────────────────────

function ArrowLeftIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BarChartIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function DicesIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={3}
        width={18}
        height={18}
        rx={3}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={8.5} cy={8.5} r={1.2} fill={color} />
      <Circle cx={15.5} cy={8.5} r={1.2} fill={color} />
      <Circle cx={12} cy={12} r={1.2} fill={color} />
      <Circle cx={8.5} cy={15.5} r={1.2} fill={color} />
      <Circle cx={15.5} cy={15.5} r={1.2} fill={color} />
    </Svg>
  );
}

function GraduationCapIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12v5c3 3 9 3 12 0v-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CompareIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={5} cy={6} r={2.5} stroke={color} strokeWidth={2} />
      <Circle cx={19} cy={18} r={2.5} stroke={color} strokeWidth={2} />
      <Path
        d="M13 6h3a2 2 0 0 1 2 2v5M16 3l-3 3 3 3M11 18H8a2 2 0 0 1-2-2v-5M8 21l3-3-3-3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
