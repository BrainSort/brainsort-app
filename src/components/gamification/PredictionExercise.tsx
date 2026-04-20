import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { Button } from '../common/Button';
import { DarkSurfaces, DarkText, Accent, Semantic } from '../../styles/colors';
import { FontFamilies, FontSizes, TextVariants } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export interface PredictionExerciseProps {
  pregunta: string;
  isSubmittingAnswer: boolean;
  lastResult: {
    correcto: boolean;
    feedbackPositivo?: string;
    feedbackNegativo?: string;
    puntosGanados: number;
    rachaDias: number;
  } | null;
  onSubmit: (respuesta: string) => Promise<void>;
  onNext: () => void;
}

export const PredictionExercise: React.FC<PredictionExerciseProps> = ({
  pregunta,
  isSubmittingAnswer,
  lastResult,
  onSubmit,
  onNext,
}) => {
  const [respuesta, setRespuesta] = useState('');
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async () => {
    await onSubmit(respuesta);
    setShowResult(true);
  };

  const handleNext = () => {
    setRespuesta('');
    setShowResult(false);
    onNext();
  };

  return (
    <View style={styles.card}>
      <Text style={styles.question}>{pregunta}</Text>

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
                <Text style={styles.stat}>+{lastResult.puntosGanados} XP</Text>
                <Text style={styles.stat}>Racha: {lastResult.rachaDias} días</Text>
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
  );
};

const styles = StyleSheet.create({
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
