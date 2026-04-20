import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { SimulationCanvas } from '../components/simulation/SimulationCanvas';
import { ControlBar } from '../components/simulation/ControlBar';
import { SpeedSlider } from '../components/simulation/SpeedSlider';
import { StepIndicator } from '../components/simulation/StepIndicator';
import { PseudocodePanel } from '../components/simulation/PseudocodePanel';
import { ComplexityInfo } from '../components/simulation/ComplexityInfo';
import { CompletionOverlay } from '../components/simulation/CompletionOverlay';
import { generateBubbleSortSteps, BUBBLE_SORT_PSEUDOCODE } from '../engine/mock-bubble-sort';
import { ThemeColors } from '../constants/colors';

const INITIAL_DATA = [45, 12, 89, 34, 67, 23, 56, 9, 78];

export const SimulationPlayground: React.FC = () => {
  const [data] = useState(INITIAL_DATA);
  
  console.warn("SYSTEM UPDATED V2.2 - RESTARTING CONTROLS"); // Force Yellow Box in Dev Mode

  const steps = useMemo(() => {
    console.log('DEBUG: Generating steps for', data.length, 'items');
    return generateBubbleSortSteps(data);
  }, [data]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    // Animation Loop Logic
    if (isPlaying && currentStepIndex < steps.length - 1 && !isCompleted) {
      const duration = 1000 / speed;
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex((prev) => prev + 1);
      }, duration);
    } else if (currentStepIndex === steps.length - 1 && !isCompleted) {
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
        <StepIndicator current={currentStepIndex + 1} total={steps.length} />
        
        <ComplexityInfo time="O(n²)" space="O(1)" />
        
        <SimulationCanvas
          data={currentStep.estadoArray}
          indicesActivos={currentStep.indicesActivos}
          tipoOperacion={currentStep.tipoOperacion}
          isCompleted={isCompleted}
        />

        <PseudocodePanel
          lines={BUBBLE_SORT_PSEUDOCODE}
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
        onNext={() => alert('Próximo algoritmo...')}
        onViewCode={() => alert('Mostrando código fuente...')}
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
    flex: 1, // This is key for making the footer stay at the bottom
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20, // Reduced as it's no longer overlapping
  },
  stickyFooter: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)', // More opaque for better readability
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
});
