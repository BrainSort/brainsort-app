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
import {
  BadgeUnlockModal,
  UnlockedBadgeNotice,
} from '../../components/gamification/BadgeUnlockModal';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Button } from '../../components/common/Button';
import { useExercise } from '../../hooks/useExercise';
import { useLibrary } from '../../hooks/useLibrary';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { learningPathService } from '../../services/learning-path.service';
import { useThemeContext } from '../../context/ThemeContext';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';
import { TextVariants, FontFamilies } from '../../styles/typography';

interface ExerciseScreenParams {
  algoritmoId?: string;
}

type Props = NativeStackScreenProps<LibraryStackParamList, 'Exercise'>;

export const ExerciseScreen: React.FC<Props> = ({ route, navigation }) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
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
  const [unlockedBadges, setUnlockedBadges] = useState<UnlockedBadgeNotice[]>([]);

  useEffect(() => {
    setCurrentExerciseIndex(0);
    setIsSessionCompleted(false);
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

  if (isLoadingExercises) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandAccent} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!ejercicios || ejercicios.length === 0) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Sin ejercicios disponibles
            </Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No hay ejercicios disponibles para{' '}
              {algoritmo?.nombre ?? 'este algoritmo'} por el momento.
            </Text>
            <Button
              title="Volver"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.emptyBackButton}
            />
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (isSessionCompleted) {
    return (
      <SafeAreaWrapper>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.centeredContainer}>
            <View
              style={[
                styles.completedCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={[styles.completedTitle, { color: colors.brandAccent }]}>
              ¡Práctica Completada!
            </Text>
            <Text style={[styles.completedSubtitle, { color: colors.textSecondary }]}>
              Has terminado con éxito todos los ejercicios de{' '}
              <Text style={[styles.highlightText, { color: colors.textPrimary }]}>
                {algoritmo?.nombre ?? 'este algoritmo'}
              </Text>
              .
            </Text>

            {/* Stats section */}
            <View
              style={[
                styles.statsContainer,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.brandPrimary }]}>
                  {ejercicios.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Ejercicios
                </Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.brandPrimary }]}>
                  100%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>
                  Progreso
                </Text>
              </View>
            </View>

            <View style={styles.actionSection}>
              {nextAlgoInPath && (
                <Button
                  title={`Siguiente en tu Ruta: ${nextAlgoInPath.nombre}`}
                  onPress={() => {
                    navigation.navigate('AlgorithmDetail', { algoritmoId: nextAlgoInPath.id });
                  }}
                  variant="primary"
                  style={styles.actionButton}
                />
              )}

              {nextAlgoInLibrary && (
                <Button
                  title={`Siguiente en Biblioteca: ${nextAlgoInLibrary.nombre}`}
                  onPress={() => {
                    navigation.navigate('AlgorithmDetail', { algoritmoId: nextAlgoInLibrary.id });
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
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    );
  }

  const currentExercise = ejercicios[currentExerciseIndex];

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.centeredContainer}>
          <View style={styles.exerciseBlock}>
            <View style={styles.exerciseHeaderRow}>
              <Text style={[styles.exerciseTitle, { color: colors.textPrimary }]}>
                Sesión de práctica
              </Text>
              {algoritmo?.nombre ? (
                <View
                  style={[
                    styles.algoBadge,
                    {
                      backgroundColor: colors.chipActiveBg,
                      borderColor: colors.chipActiveBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.algoBadgeText, { color: colors.brandAccent }]}
                    numberOfLines={1}
                  >
                    {algoritmo.nombre}
                  </Text>
                </View>
              ) : null}
            </View>
            <PredictionExercise
            tipo={currentExercise.tipo}
            pregunta={currentExercise.pregunta}
            opciones={currentExercise.opciones}
            contenido={currentExercise.contenido}
            algorithmName={algoritmo?.nombre}
            progressCurrent={currentExerciseIndex + 1}
            progressTotal={ejercicios.length}
            isSubmittingAnswer={isSubmittingAnswer}
            lastResult={lastResult}
            onSubmit={async (respuesta) => {
              const res = await responderEjercicio(currentExercise.id, respuesta);
              if (res?.nuevasInsignias && res.nuevasInsignias.length > 0) {
                setUnlockedBadges(res.nuevasInsignias);
              }
            }}
            onNext={handleNext}
            isLastExercise={currentExerciseIndex >= ejercicios.length - 1}
          />
          </View>
        </View>
      </ScrollView>
      <BadgeUnlockModal
        visible={unlockedBadges.length > 0}
        badges={unlockedBadges}
        onClose={() => setUnlockedBadges([])}
      />
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
  centeredContainer: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SpacingAlias.screenPaddingX,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[6],
    alignItems: 'center',
    gap: Spacing[3],
  },
  emptyTitle: {
    ...TextVariants.h4,
    textAlign: 'center',
  },
  emptyText: {
    ...TextVariants.bodyMd,
    textAlign: 'center',
  },
  emptyBackButton: {
    marginTop: Spacing[2],
    minWidth: 140,
  },
  exerciseBlock: {
    gap: Spacing[3],
    marginBottom: Spacing[3],
  },
  exerciseHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  exerciseTitle: {
    ...TextVariants.h4,
  },
  algoBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    maxWidth: 260,
  },
  algoBadgeText: {
    ...TextVariants.labelSm,
    fontFamily: FontFamilies.semiBold,
  },
  // Nuevos estilos para la pantalla de completado
  completedCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    marginTop: Spacing[4],
  },
  completedIcon: {
    fontSize: 56,
    marginBottom: Spacing[4],
  },
  completedTitle: {
    ...TextVariants.h3,
    textAlign: 'center',
    marginBottom: Spacing[2],
    fontFamily: FontFamilies.bold,
  },
  completedSubtitle: {
    ...TextVariants.bodyMd,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing[6],
  },
  highlightText: {
    fontFamily: FontFamilies.semiBold,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    marginBottom: Spacing[6],
    width: '100%',
    borderWidth: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...TextVariants.h3,
    fontFamily: FontFamilies.bold,
  },
  statLabel: {
    ...TextVariants.labelSm,
    marginTop: Spacing[1],
  },
  statDivider: {
    width: 1,
    height: 40,
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
