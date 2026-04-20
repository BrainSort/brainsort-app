import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { ControlBar } from '../components/simulation/ControlBar';
import { SpeedSlider } from '../components/simulation/SpeedSlider';
import { StepIndicator } from '../components/simulation/StepIndicator';
import { PseudocodePanel } from '../components/simulation/PseudocodePanel';
import { ComplexityInfo } from '../components/simulation/ComplexityInfo';
import { CompletionOverlay } from '../components/simulation/CompletionOverlay';
import { AlgorithmSelector, AlgorithmType } from '../components/simulation/AlgorithmSelector';
import { generateBubbleSortSteps, BUBBLE_SORT_PSEUDOCODE } from '../engine/mock-bubble-sort';
import { generateSelectionSortSteps, SELECTION_SORT_PSEUDOCODE } from '../engine/mock-selection-sort';
import { generateInsertionSortSteps, INSERTION_SORT_PSEUDOCODE } from '../engine/mock-insertion-sort';
import { ThemeColors } from '../constants/colors';

const INITIAL_DATA = [45, 12, 89, 34, 67, 23, 56, 9, 78];

export const SimulationPlayground: React.FC = () => {
  const [data] = useState(INITIAL_DATA);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('Bubble Sort');

  const { steps, pseudocode, complexity } = useMemo(() => {
    switch (selectedAlgorithm) {
      case 'Selection Sort':
        return {
          steps: generateSelectionSortSteps(data),
          pseudocode: SELECTION_SORT_PSEUDOCODE,
          complexity: { time: 'O(n²)', space: 'O(1)' }
        };
      case 'Insertion Sort':
        return {
          steps: generateInsertionSortSteps(data),
          pseudocode: INSERTION_SORT_PSEUDOCODE,
          complexity: { time: 'O(n²)', space: 'O(1)' }
        };
      case 'Bubble Sort':
      default:
        return {
          steps: generateBubbleSortSteps(data),
          pseudocode: BUBBLE_SORT_PSEUDOCODE,
          complexity: { time: 'O(n²)', space: 'O(1)' }
        };
    }
  }, [data, selectedAlgorithm]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[currentStepIndex];

  // Reset simulation when algorithm changes
  useEffect(() => {
    handleReset();
  }, [selectedAlgorithm]);

  useEffect(() => {
    // Animation Loop Logic
    if (isPlaying && currentStepIndex < steps.length - 1 && !isCompleted) {
      const duration = 1000 / speed;
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, duration);
    } else if (currentStepIndex === steps.length - 1 && !isCompleted && steps.length > 0) {
      // Termination Condition
      setIsPlaying(false);
      setIsCompleted(true);
      setShowOverlay(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, speed, steps.length, isCompleted]);

  const handleTogglePlay = React.useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleReset = React.useCallback(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setShowOverlay(false);
  }, []);

  const handleCloseOverlay = React.useCallback(() => {
    setShowOverlay(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <AlgorithmSelector 
            selectedId={selectedAlgorithm} 
            onSelect={setSelectedAlgorithm} 
          />

          <StepIndicator current={currentStepIndex + 1} total={steps.length} />
          
          <ComplexityInfo time={complexity.time} space={complexity.space} />
          
          <SimulationCanvas
            algorithmName={selectedAlgorithm}
            data={currentStep.estadoArray}
            indicesActivos={currentStep.indicesActivos}
            tipoOperacion={currentStep.tipoOperacion}
            isCompleted={isCompleted}
          />

          <PseudocodePanel
            lines={pseudocode}
            activeLine={currentStep.lineaPseudocodigo}
          />
        </ScrollView>

        <View style={styles.stickyFooter}>
          <ControlBar
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onReset={handleReset}
            isFinished={isCompleted}
          />
          <SpeedSlider speed={speed} onSpeedChange={setSpeed} />
        </View>
      </View>

      <CompletionOverlay
        visible={showOverlay}
        onClose={handleCloseOverlay}
        onRestart={handleReset}
        onNext={() => Alert.alert('Próximo algoritmo', 'Esta opción estará disponible pronto.')}
        onViewCode={() => Alert.alert('Código fuente', 'Esta opción estará disponible pronto.')}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: ThemeColors.background,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  stickyFooter: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});

