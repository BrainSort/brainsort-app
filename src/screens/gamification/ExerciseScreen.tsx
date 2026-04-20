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
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useExercise } from '../../hooks/useExercise';
import { Button } from '../../components/common/Button';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  Semantic,
} from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
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
  const [respuesta, setRespuesta] = useState('');
  const [showResult, setShowResult] = useState(false);

  const {
    ejercicios,
    isLoadingExercises,
    responderEjercicio,
    isSubmittingAnswer,
    lastResult,
  } = useExercise(algoritmoId);

  const handleSubmit = async () => {
    if (!ejercicios || ejercicios.length === 0) return;

    const ejercicio = ejercicios[0];
    await responderEjercicio(ejercicio.id, respuesta);
    setShowResult(true);
  };

  const handleNext = () => {
    setRespuesta('');
    setShowResult(false);
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
        <View style={styles.card}>
          <Text style={styles.question}>{ejercicio.pregunta}</Text>

          {!showResult ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Tu respuesta..."
                placeholderTextColor={DarkText.muted}
                value={respuesta}
                onChangeText={setRespuesta}
                multiline
                numberOfLines={3}
              />

              <Button
                title="Enviar Respuesta"
                onPress={handleSubmit}
                disabled={!respuesta.trim() || isSubmittingAnswer}
                loading={isSubmittingAnswer}
                size="large"
              />
            </>
          ) : (
            <View style={styles.resultContainer}>
              {lastResult?.correcto ? (
                <>
                  <Text style={styles.resultTitle}>¡Correcto!</Text>
                  <Text style={[styles.resultText, styles.success]}>
                    {lastResult.feedbackPositivo}
                  </Text>
                  <View style={styles.statsRow}>
                    <Text style={styles.stat}>
                      +{lastResult.puntosGanados} XP
                    </Text>
                    <Text style={styles.stat}>
                      Racha: {lastResult.rachaDias} días
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>Incorrecto</Text>
                  <Text style={[styles.resultText, styles.error]}>
                    {lastResult?.feedbackNegativo}
                  </Text>
                </>
              )}

              <Button
                title="Siguiente Ejercicio"
                onPress={handleNext}
                variant="secondary"
                size="large"
              />
            </View>
          )}
        </View>
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
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: 16,
    padding: Spacing[6],
  },
  question: {
    ...TextVariants.bodyLg,
    color: DarkText.primary,
    marginBottom: Spacing[6],
  },
  input: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: 8,
    padding: Spacing[4],
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    marginBottom: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultTitle: {
    ...TextVariants.h3,
    color: DarkText.primary,
    marginBottom: Spacing[4],
  },
  resultText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  success: {
    color: Semantic.success,
  },
  error: {
    color: Semantic.error,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Spacing[6],
  },
  stat: {
    ...TextVariants.labelMd,
    color: Accent[500],
  },
});
