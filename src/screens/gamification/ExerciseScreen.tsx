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

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useExercise } from '../../hooks/useExercise';
import { Button } from '../../components/common/Button';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { PredictionExercise } from '../../components/gamification/PredictionExercise';
import {
  DarkText,
  Accent,
} from '../../styles/colors';
import { TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias } from '../../styles/spacing';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ExerciseScreenParams {
  algoritmoId?: string;
}

type Props = NativeStackScreenProps<any, 'Exercise'>;

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

  const {
    ejercicios,
    isLoadingExercises,
    responderEjercicio,
    isSubmittingAnswer,
    lastResult,
  } = useExercise(algoritmoId);

  const handleSubmit = async (respuesta: string) => {
    if (!ejercicios || ejercicios.length === 0) {
      return;
    }
    const ejercicio = ejercicios[0];
    await responderEjercicio(ejercicio.id, respuesta);
  };

  const handleNext = () => {
    // Reserved for future "next exercise" behavior once backend supports sequencing.
  };

  if (isLoadingExercises) {
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
          <Text style={styles.emptyText}>No hay ejercicios disponibles</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const ejercicio = ejercicios[0];

  return (
    <SafeAreaWrapper>
      <Header title="Ejercicio" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <PredictionExercise
          pregunta={ejercicio.pregunta}
          isSubmittingAnswer={isSubmittingAnswer}
          lastResult={lastResult}
          onSubmit={handleSubmit}
          onNext={handleNext}
        />
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
});
