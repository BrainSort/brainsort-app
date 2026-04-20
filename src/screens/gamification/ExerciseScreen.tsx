/**
 * ExerciseScreen.tsx
 * BrainSort — Pantalla de ejercicio de predicción
 *
 * task_breakdown.md T-FE-098
 *
 * Implementa:
 *   - Muestra pregunta del ejercicio
 *   - Input para respuesta del usuario
 *   - Llama useExercise().responderEjercicio()
 *   - Muestra feedback (positivo/negativo)
 *   - Muestra puntos ganados y racha
 *
 * Referencia: 02-frontend-app.md §1 screens/gamification/ExerciseScreen.tsx
 *            hooks/useExercise.ts
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { PredictionExercise } from '../../components/gamification/PredictionExercise';
import { StepIndicator } from '../../components/simulation/StepIndicator';
import { ComplexityInfo } from '../../components/simulation/ComplexityInfo';
import { SimulationCanvas } from '../../components/simulation/SimulationCanvas';
import { PseudocodePanel } from '../../components/simulation/PseudocodePanel';
import { ControlBar } from '../../components/simulation/ControlBar';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  SimulationColors,
} from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias } from '../../styles/spacing';
import {
  BubbleSortEngine,
  SelectionSortEngine,
  InsertionSortEngine,
  MergeSortEngine,
} from '@brainsort/core';
import type { SortEngine, SimulationStep } from '@brainsort/core';
import type { OperationType } from '../../types/simulation';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { MOCK_EXERCISES, MOCK_ANSWERS } from '../../data/exercises.mock';
import type { Ejercicio } from '../../services/exercise.service';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ExerciseScreenParams {
  algoritmoId?: string;
}

type Props = NativeStackScreenProps<LibraryStackParamList, 'Exercise'>;

const ENGINE_REGISTRY: Record<string, new () => SortEngine> = {
  'Bubble Sort': BubbleSortEngine,
  'Selection Sort': SelectionSortEngine,
  'Insertion Sort': InsertionSortEngine,
  'Merge Sort': MergeSortEngine,
};

function createDefaultDataset(size = 9): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
}

function getOperationLabel(tipo: string): string {
  switch (tipo) {
    case 'comparacion':
      return 'Comparación entre elementos';
    case 'intercambio':
      return 'Intercambio de posiciones';
    case 'insercion':
      return 'Inserción de elemento';
    case 'final':
      return 'Estado final ordenado';
    default:
      return 'Inicialización o avance general';
  }
}

const ExerciseSimulationCard: React.FC<{ algoritmoId: string }> = ({ algoritmoId }) => {
  const { algoritmo, isLoading } = useAlgorithm(algoritmoId);
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!algoritmo?.nombre) {
      return;
    }
    const EngineClass = ENGINE_REGISTRY[algoritmo.nombre];
    if (!EngineClass) {
      setSteps([]);
      return;
    }
    const engine = new EngineClass();
    const generatedSteps = engine.execute(createDefaultDataset());
    setSteps(generatedSteps);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
  }, [algoritmo?.nombre]);

  useEffect(() => {
    if (!isPlaying || steps.length === 0) {
      return;
    }
    if (currentStepIndex >= steps.length - 1) {
      setIsPlaying(false);
      setIsCompleted(true);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1);
    }, 900 / speed);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isPlaying, speed, steps.length]);

  const currentStep = steps[currentStepIndex];
  const activePseudoLine = useMemo(
    () => algoritmo?.pseudocode.find((line) => line.line === currentStep?.lineaPseudocodigo),
    [algoritmo?.pseudocode, currentStep?.lineaPseudocodigo],
  );

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
  };

  const handleTogglePlay = () => {
    if (!steps.length) {
      return;
    }
    setIsPlaying((prev) => !prev);
  };

  if (isLoading) {
    return (
      <View style={styles.simulationLoading}>
        <ActivityIndicator color={Accent[500]} />
      </View>
    );
  }

  if (!algoritmo || steps.length === 0 || !currentStep) {
    return (
      <View style={styles.simulationUnavailable}>
        <Text style={styles.simulationUnavailableText}>
          Simulación no disponible para este ejercicio.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.simulationCard}>
      <Text style={styles.simulationTitle}>Simulación del algoritmo</Text>
      <StepIndicator current={currentStepIndex + 1} total={steps.length} />

      <ComplexityInfo
        time={algoritmo.complejidadTiempo}
        space={algoritmo.complejidadEspacio}
      />

      <SimulationCanvas
        algorithmName={algoritmo.nombre}
        data={currentStep.estadoArray}
        indicesActivos={currentStep.indicesActivos}
        tipoOperacion={currentStep.tipoOperacion as OperationType}
        isCompleted={isCompleted}
      />

      <PseudocodePanel
        lines={algoritmo.pseudocode}
        activeLine={currentStep.lineaPseudocodigo}
      />

      <View style={styles.pseudoDescriptionBox}>
        <Text style={styles.pseudoDescriptionTitle}>Descripción del pseudocódigo</Text>
        <Text style={styles.pseudoDescriptionText}>{algoritmo.descripcion}</Text>
        <Text style={styles.pseudoDescriptionText}>
          Paso actual: {getOperationLabel(currentStep.tipoOperacion)}.
        </Text>
        {activePseudoLine && (
          <Text style={styles.pseudoActiveLine}>
            Línea activa ({activePseudoLine.line}): {activePseudoLine.text}
          </Text>
        )}
      </View>

      <ControlBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        onReset={handleReset}
        isFinished={isCompleted}
      />

      <View style={styles.speedActions}>
        {[0.5, 1, 1.5, 2].map((value) => (
          <TouchableOpacity
            key={value}
            style={[
              styles.speedBtn,
              speed === value ? styles.speedBtnActive : null,
            ]}
            onPress={() => setSpeed(value)}
          >
            <Text
              style={[
                styles.speedBtnText,
                speed === value ? styles.speedBtnTextActive : null,
              ]}
            >
              {value}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de ejercicio de predicción.
 *
 * @example
 * <ExerciseScreen
 *   route={{ params: { algoritmoId: 'uuid-bubble' } }}
 * />
 */
export const ExerciseScreen: React.FC<Props> = ({ route }) => {
  const params = route.params as ExerciseScreenParams;
  const algoritmoId = params?.algoritmoId;

  const { algoritmo, isLoading: algoLoading } = useAlgorithm(algoritmoId);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [lastResult, setLastResult] = useState<{
    correcto: boolean;
    feedbackPositivo?: string;
    feedbackNegativo?: string;
    puntosGanados: number;
    rachaDias: number;
  } | null>(null);

  // Get mock exercises based on algorithm name
  const ejercicios: Ejercicio[] = useMemo(() => {
    if (!algoritmo?.nombre) return [];
    return MOCK_EXERCISES[algoritmo.nombre] || [];
  }, [algoritmo?.nombre]);

  const handleResponderEjercicio = async (ejercicioId: string, respuesta: string) => {
    setIsSubmittingAnswer(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockAnswer = MOCK_ANSWERS[ejercicioId];
    if (!mockAnswer) {
      setIsSubmittingAnswer(false);
      return;
    }

    const isCorrect = respuesta.toLowerCase().trim() === mockAnswer.correcta.toLowerCase().trim();

    setLastResult({
      correcto: isCorrect,
      feedbackPositivo: mockAnswer.feedbackPositivo,
      feedbackNegativo: mockAnswer.feedbackNegativo,
      puntosGanados: isCorrect ? 10 : 0,
      rachaDias: 1,
    });

    setIsSubmittingAnswer(false);
  };

  const handleNext = () => {
    setLastResult(null);
  };

  if (algoLoading) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!ejercicios || ejercicios.length === 0) {
    return (
      <SafeAreaWrapper>
        <Header title="Ejercicios" showBackButton />
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay ejercicios disponibles para este algoritmo</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Ejercicio" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {ejercicios.map((ejercicio) => (
          <View key={ejercicio.id} style={styles.exerciseBlock}>
            <Text style={styles.exerciseTitle}>Ejercicio de predicción</Text>
            <PredictionExercise
              pregunta={ejercicio.pregunta}
              isSubmittingAnswer={isSubmittingAnswer}
              lastResult={lastResult}
              onSubmit={(respuesta) => handleResponderEjercicio(ejercicio.id, respuesta)}
              onNext={handleNext}
            />
            <ExerciseSimulationCard algoritmoId={ejercicio.algoritmoId} />
          </View>
        ))}
      </ScrollView>
    </SafeAreaWrapper>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SpacingAlias.screenPaddingX,
    gap: Spacing[5],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  exerciseBlock: {
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  exerciseTitle: {
    ...TextVariants.h4,
    color: DarkText.primary,
  },
  simulationCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: 14,
    padding: Spacing[4],
    gap: Spacing[3],
  },
  simulationTitle: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: DarkText.primary,
  },
  pseudoDescriptionBox: {
    backgroundColor: 'rgba(74, 144, 217, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 217, 0.35)',
    borderRadius: 10,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  pseudoDescriptionTitle: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: Accent[300],
  },
  pseudoDescriptionText: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
  },
  pseudoActiveLine: {
    ...TextVariants.bodySm,
    color: SimulationColors.comparacion,
  },
  simulationLoading: {
    paddingVertical: Spacing[5],
    alignItems: 'center',
  },
  simulationUnavailable: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: 10,
    padding: Spacing[3],
  },
  simulationUnavailableText: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
  speedActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  speedBtn: {
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: 16,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    backgroundColor: DarkSurfaces.surfaceElevated,
  },
  speedBtnActive: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  speedBtnText: {
    ...TextVariants.labelSm,
    color: DarkText.secondary,
  },
  speedBtnTextActive: {
    color: Accent[300],
  },
});
