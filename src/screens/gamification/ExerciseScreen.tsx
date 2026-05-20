import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PredictionExercise } from '../../components/gamification/PredictionExercise';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useExercise } from '../../hooks/useExercise';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { Accent, DarkText } from '../../styles/colors';
import { Spacing, SpacingAlias } from '../../styles/spacing';
import { TextVariants } from '../../styles/typography';

interface ExerciseScreenParams {
  algoritmoId?: string;
}

type Props = NativeStackScreenProps<LibraryStackParamList, 'Exercise'>;

export const ExerciseScreen: React.FC<Props> = ({ route }) => {
  const params = route.params as ExerciseScreenParams;
  const algoritmoId = params?.algoritmoId;
  const navigation = useNavigation();
  const {
    ejercicios,
    isLoadingExercises,
    responderEjercicio,
    isSubmittingAnswer,
    lastResult,
  } = useExercise(algoritmoId);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  useEffect(() => {
    setCurrentExerciseIndex(0);
  }, [algoritmoId]);

  const handleNext = () => {
    if (!ejercicios || currentExerciseIndex >= ejercicios.length - 1) {
      navigation.goBack();
      return;
    }

    setCurrentExerciseIndex((prev) => prev + 1);
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
        <View style={styles.center}>
          <Text style={styles.emptyText}>No hay ejercicios disponibles para este algoritmo</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const currentExercise = ejercicios[currentExerciseIndex];

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
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
              await responderEjercicio(currentExercise.id, respuesta);
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
});
