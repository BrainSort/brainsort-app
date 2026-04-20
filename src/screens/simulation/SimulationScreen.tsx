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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { useSimulation } from '../../hooks/useSimulation';
import { useSimulationEngine } from '../../hooks/useSimulationEngine';
import { useDataset } from '../../hooks/useDataset';
import { useAnimationController } from '../../hooks/useAnimationController';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { BarChart } from '../../visualization/components/BarChart';
import { ControlBar } from '../../visualization/components/ControlBar';
import { PseudocodePanel } from '../../visualization/components/PseudocodePanel';
import { Spinner } from '../../components/common/Spinner';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
  SimulationColors,
} from '../../styles/colors';
import {
  BorderRadius,
  BorderWidths,
  Spacing,
  SpacingAlias,
} from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<LibraryStackParamList, 'Simulation'>;

// ─── Constantes ───────────────────────────────────────────────────────────────

const COMPLETION_TOAST_DURATION = 5000; // 5 segundos (HU-07)

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },

  // Scroll principal
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[4],
    paddingBottom: Spacing[6],
    gap: Spacing[4],
  },

  // Header del algoritmo
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  algoName: {
    ...TextVariants.h4,
    color: DarkText.primary,
    flex: 1,
  },
  stepCounter: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.muted,
  },

  // Progreso
  progressBar: {
    height: 3,
    backgroundColor: DarkSurfaces.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },

  // Canvas de barras
  canvasContainer: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    padding: Spacing[3],
    overflow: 'hidden',
  },

  // Leyenda de colores
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
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
    color: DarkText.muted,
  },

  // Input de datos personalizados
  dataInputSection: {
    gap: Spacing[2],
  },
  dataInputLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  dataInputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dataInput: {
    flex: 1,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.primary,
    minHeight: 44,
  },
  dataInputError: { borderColor: Semantic.error },
  applyButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    justifyContent: 'center',
    minHeight: 44,
  },
  applyButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
  },
  generateButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
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
  emptyText: { ...TextVariants.bodyMd, color: DarkText.muted, textAlign: 'center' },

  // Completado modal (HU-07)
  toastContainer: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    right: Spacing[4],
    backgroundColor: 'rgba(30, 40, 30, 0.96)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: SimulationColors.final,
    padding: Spacing[4],
    gap: Spacing[3],
    zIndex: 100,
  },
  toastTitle: {
    ...TextVariants.h4,
    color: SimulationColors.final,
    textAlign: 'center',
  },
  toastActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  toastBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    backgroundColor: DarkSurfaces.surface,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
  },
  toastBtnPrimary: {
    backgroundColor: Primary[500],
    borderColor: Primary[500],
  },
  toastBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  toastBtnTextPrimary: { color: '#FFFFFF' },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export default function SimulationScreen({ navigation, route }: Props) {
  const { algoritmoId } = route.params;

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { algoritmo, isLoading: algoLoading } = useAlgorithm(algoritmoId);
  const {
    steps,
    currentStep,
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
  } = useSimulation();
  const { executeAlgorithm, isExecuting } = useSimulationEngine();
  const { generateDefault, validateDataset } = useDataset();
  useAnimationController(); // RAF loop — maneja avance automático de frames

  // ─── Estado local ─────────────────────────────────────────────────────────
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // ─── Header dinámico ──────────────────────────────────────────────────────
  useEffect(() => {
    if (algoritmo?.nombre) {
      navigation.setOptions({ title: algoritmo.nombre });
    }
  }, [algoritmo?.nombre, navigation]);

  // ─── Cargar datos al montar ───────────────────────────────────────────────
  useEffect(() => {
    if (algoritmo && !hasStarted) {
      const initialData = generateDefault();
      executeAlgorithm(algoritmo.nombre, initialData)
        .then(() => setHasStarted(true))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoritmo]);

  // ─── Mostrar toast al completar (HU-07) ───────────────────────────────────
  useEffect(() => {
    if (isCompleted && hasStarted) {
      setShowToast(true);
      toastTimer.current = setTimeout(() => {
        setShowToast(false);
      }, COMPLETION_TOAST_DURATION);
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [isCompleted, hasStarted]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleGenerateNew = useCallback(() => {
    if (!algoritmo) return;
    const data = generateDefault();
    executeAlgorithm(algoritmo.nombre, data).catch(() => {});
    setCustomInput('');
    setInputError(null);
    setShowToast(false);
  }, [algoritmo, generateDefault, executeAlgorithm]);

  const handleApplyCustom = useCallback(() => {
    if (!algoritmo || !customInput.trim()) return;
    const parts = customInput.split(',').map((s) => Number(s.trim()));
    const error = validateDataset(parts);
    if (error) {
      setInputError(error.message);
      return;
    }
    setInputError(null);
    executeAlgorithm(algoritmo.nombre, parts).catch(() => {});
    setShowToast(false);
  }, [algoritmo, customInput, validateDataset, executeAlgorithm]);

  const handleReset = useCallback(() => {
    resetSimulation();
    setShowToast(false);
  }, [resetSimulation]);

  const handleNextAlgorithm = useCallback(() => {
    setShowToast(false);
    navigation.goBack();
  }, [navigation]);

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Toast de completado (HU-07) */}
      {showToast && (
        <View style={styles.toastContainer} accessibilityRole="alert">
          <Text style={{ fontSize: 32, textAlign: 'center' }}>🎉</Text>
          <Text style={styles.toastTitle}>¡Algoritmo completado!</Text>
          <View style={styles.toastActions}>
            <TouchableOpacity
              style={styles.toastBtn}
              onPress={handleReset}
              testID="toast-btn-restart"
            >
              <Text style={styles.toastBtnText}>↺ Reiniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toastBtn}
              onPress={handleGenerateNew}
              testID="toast-btn-new-data"
            >
              <Text style={styles.toastBtnText}>🎲 Nuevos datos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toastBtn, styles.toastBtnPrimary]}
              onPress={handleNextAlgorithm}
              testID="toast-btn-next"
            >
              <Text style={styles.toastBtnTextPrimary}>← Volver</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header: nombre + contador de paso */}
        <View style={styles.headerRow}>
          <Text style={styles.algoName} numberOfLines={1}>
            {algoritmo?.nombre ?? 'Simulación'}
          </Text>
          {hasSteps && (
            <Text style={styles.stepCounter}>
              {currentStep.displayNumber} / {currentStep.totalSteps}
            </Text>
          )}
        </View>

        {/* Barra de progreso */}
        {hasSteps && (
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercent}%` }]}
            />
          </View>
        )}

        {/* Canvas de barras */}
        <View style={styles.canvasContainer}>
          {isExecuting ? (
            <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
              <Spinner size="large" />
            </View>
          ) : hasSteps ? (
            <BarChart
              step={currentStepData}
              isCompleted={isCompleted}
              height={220}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📊</Text>
              <Text style={styles.emptyText}>
                Genera datos para iniciar la simulación
              </Text>
            </View>
          )}
        </View>

        {/* Leyenda de colores */}
        <View style={styles.legend}>
          {[
            { color: SimulationColors.idle, label: 'Inactivo' },
            { color: SimulationColors.comparacion, label: 'Comparando' },
            { color: SimulationColors.intercambio, label: 'Intercambiando' },
            { color: SimulationColors.final, label: 'Finalizado' },
          ].map(({ color, label }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Pseudocódigo */}
        {pseudoLines.length > 0 && (
          <PseudocodePanel lines={pseudoLines} currentStep={currentStepData} />
        )}

        {/* Input de datos personalizados */}
        <View style={styles.dataInputSection}>
          <Text style={styles.dataInputLabel}>Datos personalizados</Text>
          <View style={styles.dataInputRow}>
            <TextInput
              style={[
                styles.dataInput,
                inputError ? styles.dataInputError : null,
              ]}
              value={customInput}
              onChangeText={(text) => {
                setCustomInput(text);
                setInputError(null);
              }}
              placeholder="5, 3, 8, 1, 9, 2"
              placeholderTextColor={DarkText.muted}
              keyboardType="default"
              returnKeyType="done"
              onSubmitEditing={handleApplyCustom}
              accessibilityLabel="Datos personalizados en formato CSV"
              testID="input-custom-data"
            />
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApplyCustom}
              disabled={!customInput.trim()}
              accessibilityRole="button"
              accessibilityLabel="Aplicar datos personalizados"
              testID="btn-apply-data"
            >
              <Text style={styles.applyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
          {inputError && (
            <Text style={styles.inputErrorText}>{inputError}</Text>
          )}

          {/* Botón Generar nuevos datos */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateNew}
            disabled={isExecuting}
            accessibilityRole="button"
            accessibilityLabel="Generar nuevos datos aleatorios"
            testID="btn-generate-new"
          >
            <Text style={{ fontSize: 16 }}>🎲</Text>
            <Text style={styles.generateButtonText}>Generar nuevos datos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Barra de control — pegada al fondo */}
      <ControlBar
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
    </KeyboardAvoidingView>
  );
}
