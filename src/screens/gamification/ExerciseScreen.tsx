import React, { useEffect, useState, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PredictionExercise } from '../../components/gamification/PredictionExercise';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Button } from '../../components/common/Button';
import { useExercise } from '../../hooks/useExercise';
import { useLibrary } from '../../hooks/useLibrary';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { learningPathService } from '../../services/learning-path.service';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { Accent, DarkText, DarkSurfaces, Primary } from '../../styles/colors';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';
import { TextVariants, FontFamilies } from '../../styles/typography';

interface ExerciseScreenParams {
  algoritmoId?: string;
}

type Props = NativeStackScreenProps<LibraryStackParamList, 'Exercise'>;

type SessionExerciseProgress = {
  attempts: number;
  correct: boolean;
  firstTry: boolean;
  repaired: boolean;
};

export const ExerciseScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route.params as ExerciseScreenParams;
  const algoritmoId = params?.algoritmoId;

  const {
    ejercicios,
    isLoadingExercises,
    responderEjercicio,
    isSubmittingAnswer,
    lastResult,
  } = useExercise(algoritmoId);

  const { algoritmo } = useAlgorithm(algoritmoId);
  const { algoritmos } = useLibrary();

  const { data: ruta } = useQuery({
    queryKey: ['ruta-aprendizaje'],
    queryFn: learningPathService.getMiRuta,
    staleTime: 1000 * 60 * 5,
  });

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [sessionProgress, setSessionProgress] = useState<
    Record<string, SessionExerciseProgress>
  >({});

  useEffect(() => {
    setCurrentExerciseIndex(0);
    setIsSessionCompleted(false);
    setSessionProgress({});
  }, [algoritmoId]);

  const handleNext = () => {
    if (!ejercicios || currentExerciseIndex >= ejercicios.length - 1) {
      setIsSessionCompleted(true);
      return;
    }

    setCurrentExerciseIndex((prev) => prev + 1);
  };

  const nextAlgoInPath = useMemo(() => {
    if (!ruta?.algoritmos || !algoritmoId) return null;
    const index = ruta.algoritmos.findIndex((a) => a.id === algoritmoId);
    if (index !== -1 && index < ruta.algoritmos.length - 1) {
      return ruta.algoritmos[index + 1];
    }
    return null;
  }, [ruta, algoritmoId]);

  const nextAlgoInLibrary = useMemo(() => {
    if (!algoritmos || !algoritmoId) return null;
    const index = algoritmos.findIndex((a) => a.id === algoritmoId);
    if (index !== -1 && index < algoritmos.length - 1) {
      return algoritmos[index + 1];
    }
    return null;
  }, [algoritmos, algoritmoId]);

  const handleGoToRuta = () => {
    navigation.popToTop();
    navigation.getParent()?.navigate('Ruta');
  };

  const handleGoToLibrary = () => {
    navigation.popToTop();
  };

  const sessionSummary = useMemo(() => {
    const values = Object.values(sessionProgress);
    const dominados = values.filter((item) => item.correct).length;
    const primerIntento = values.filter((item) => item.firstTry).length;
    const erroresReparados = values.filter((item) => item.repaired).length;
    const total = ejercicios?.length ?? 0;
    const dominio = total > 0 ? Math.round((dominados / total) * 100) : 0;
    const recomendacion =
      erroresReparados > 0
        ? 'Repasa mañana los ejercicios que reparaste para consolidar memoria.'
        : dominados === total
          ? 'Buen cierre: estás listo para un desafío de mayor dificultad.'
          : 'Completa todos los ejercicios para cerrar dominio real.';

    return {
      dominados,
      primerIntento,
      erroresReparados,
      dominio,
      recomendacion,
    };
  }, [ejercicios?.length, sessionProgress]);

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
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            No hay ejercicios disponibles para este algoritmo
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (isSessionCompleted) {
    return (
      <SafeAreaWrapper>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={styles.completedTitle}>¡Práctica Completada!</Text>
            <Text style={styles.completedSubtitle}>
              Has terminado con éxito todos los ejercicios de{' '}
              <Text style={styles.highlightText}>
                {algoritmo?.nombre ?? 'este algoritmo'}
              </Text>
              .
            </Text>

            {/* Stats section */}
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {sessionSummary.dominados}/{ejercicios.length}
                </Text>
                <Text style={styles.statLabel}>Dominados</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{sessionSummary.dominio}%</Text>
                <Text style={styles.statLabel}>Dominio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>
                  {sessionSummary.primerIntento}
                </Text>
                <Text style={styles.statLabel}>1er intento</Text>
              </View>
            </View>
            <Text style={styles.masteryNote}>
              {sessionSummary.erroresReparados} errores reparados.{' '}
              {sessionSummary.recomendacion}
            </Text>

            <View style={styles.actionSection}>
              {nextAlgoInPath && (
                <Button
                  title={`Siguiente en tu Ruta: ${nextAlgoInPath.nombre}`}
                  onPress={() => {
                    navigation.navigate('AlgorithmDetail', {
                      algoritmoId: nextAlgoInPath.id,
                    });
                  }}
                  variant="primary"
                  style={styles.actionButton}
                />
              )}

              {nextAlgoInLibrary && (
                <Button
                  title={`Siguiente en Biblioteca: ${nextAlgoInLibrary.nombre}`}
                  onPress={() => {
                    navigation.navigate('AlgorithmDetail', {
                      algoritmoId: nextAlgoInLibrary.id,
                    });
                  }}
                  variant="secondary"
                  style={styles.actionButton}
                />
              )}

              <Button
                title="Volver a Mi Ruta"
                onPress={handleGoToRuta}
                variant="ghost"
                style={styles.menuButton}
              />

              <Button
                title="Volver a la Biblioteca"
                onPress={handleGoToLibrary}
                variant="ghost"
                style={styles.menuButton}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    );
  }

  const currentExercise = ejercicios[currentExerciseIndex];

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.exerciseBlock}>
          <Text style={styles.exerciseTitle}>Sesión de práctica</Text>
          <PredictionExercise
            tipo={currentExercise.tipo}
            pregunta={currentExercise.pregunta}
            opciones={currentExercise.opciones}
            contenido={currentExercise.contenido}
            progressCurrent={currentExerciseIndex + 1}
            progressTotal={ejercicios.length}
            isSubmittingAnswer={isSubmittingAnswer}
            lastResult={lastResult}
            onSubmit={async (respuesta) => {
              const exerciseId = currentExercise.id;
              const attemptsBefore = sessionProgress[exerciseId]?.attempts ?? 0;
              const nextAttempts = attemptsBefore + 1;
              const result = await responderEjercicio(exerciseId, respuesta);
              setSessionProgress((prev) => {
                const previous = prev[exerciseId];
                const wasCorrect = previous?.correct ?? false;
                return {
                  ...prev,
                  [exerciseId]: {
                    attempts: nextAttempts,
                    correct: wasCorrect || result.correcto,
                    firstTry:
                      previous?.firstTry ||
                      (result.correcto && nextAttempts === 1),
                    repaired:
                      previous?.repaired ||
                      (result.correcto && nextAttempts > 1),
                  },
                };
              });
            }}
            onNext={handleNext}
            isLastExercise={currentExerciseIndex >= ejercicios.length - 1}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

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
  // Nuevos estilos para la pantalla de completado
  completedCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    marginTop: Spacing[4],
  },
  completedIcon: {
    fontSize: 56,
    marginBottom: Spacing[4],
  },
  completedTitle: {
    ...TextVariants.h3,
    color: Accent[500],
    textAlign: 'center',
    marginBottom: Spacing[2],
    fontFamily: FontFamilies.bold,
  },
  completedSubtitle: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[6],
  },
  highlightText: {
    color: DarkText.primary,
    fontFamily: FontFamilies.semiBold,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[6],
    width: '100%',
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TextVariants.h3,
    color: Primary[500],
    fontFamily: FontFamilies.bold,
  },
  statLabel: {
    ...TextVariants.labelSm,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: DarkSurfaces.border,
  },
  masteryNote: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  actionSection: {
    width: '100%',
    gap: Spacing[3],
  },
  actionButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: BorderRadius.md,
  },
  menuButton: {
    width: '100%',
    minHeight: 44,
    marginTop: Spacing[1],
  },
});
