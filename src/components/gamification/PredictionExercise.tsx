import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { Button } from '../common/Button';
import { GraphRenderer } from '../../visualization/GraphRenderer';
import { useThemeContext } from '../../context/ThemeContext';
import { Semantic } from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';
import type {
  BarsExerciseContent,
  DificultadEjercicio,
  GraphExerciseContent,
  PseudocodeExerciseContent,
  TipoEjercicio,
} from '../../services/exercise.service';

export interface PredictionExerciseProps {
  tipo: TipoEjercicio;
  dificultad?: DificultadEjercicio;
  pregunta: string;
  opciones?: string[];
  contenido?:
    | PseudocodeExerciseContent
    | BarsExerciseContent
    | GraphExerciseContent
    | null;
  algorithmName?: string;
  progressCurrent: number;
  progressTotal: number;
  isSubmittingAnswer: boolean;
  lastResult: {
    correcto: boolean;
    feedback?: string;
    feedbackPositivo?: string;
    feedbackNegativo?: string;
    puntosGanados: number;
    rachaDias: number;
  } | null;
  onSubmit: (respuesta: string) => Promise<void>;
  onNext: () => void;
  isLastExercise?: boolean;
}

function CheckCircle2Icon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m9 12 2 2 4-4"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlertCircleIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="12"
        y1="8"
        x2="12"
        y2="12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
      <Line
        x1="12"
        y1="16"
        x2="12.01"
        y2="16"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export const PredictionExercise: React.FC<PredictionExerciseProps> = ({
  tipo,
  dificultad,
  pregunta,
  opciones,
  contenido,
  algorithmName,
  progressCurrent,
  progressTotal,
  isSubmittingAnswer,
  lastResult,
  onSubmit,
  onNext,
  isLastExercise,
}) => {
  const { theme, mode } = useThemeContext();
  const { colors } = theme;
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isTwoColOptions = width >= 640;

  const [respuesta, setRespuesta] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>([]);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const barsContent =
    tipo === 'OrdenarBarras' ? (contenido as BarsExerciseContent | null) : null;
  const pseudoContent =
    tipo === 'CompletarPseudocodigo'
      ? (contenido as PseudocodeExerciseContent | null)
      : null;
  const graphContent =
    tipo === 'SecuenciaGrafos' ? (contenido as GraphExerciseContent | null) : null;

  useEffect(() => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setSelectedSequence([]);
    setShowResult(false);
    setSubmitError(null);
    setBars(barsContent?.inicial ?? []);
  }, [barsContent?.inicial, pregunta]);

  const isModoSeleccion =
    tipo === 'OrdenarBarras' && (contenido as any)?.modoSeleccion;

  const progressPercent = progressTotal > 0 ? progressCurrent / progressTotal : 0;
  const progressPctRounded = Math.round(progressPercent * 100);
  const maxBarValue = useMemo(() => Math.max(...bars, 1), [bars]);
  const canSubmit =
    tipo === 'CompletarPseudocodigo'
      ? !!selectedOption
      : tipo === 'OrdenarBarras'
        ? isModoSeleccion
          ? selectedBarIndex !== null
          : bars.length > 0
        : tipo === 'SecuenciaGrafos'
          ? selectedSequence.length > 0
          : !!respuesta.trim();

  const handleBarPress = (index: number) => {
    if (isModoSeleccion) {
      setSelectedBarIndex((prev) => (prev === index ? null : index));
      return;
    }

    if (selectedBarIndex === null) {
      setSelectedBarIndex(index);
      return;
    }

    if (selectedBarIndex === index) {
      setSelectedBarIndex(null);
      return;
    }

    setBars((current) => {
      const next = [...current];
      const temp = next[selectedBarIndex];
      next[selectedBarIndex] = next[index];
      next[index] = temp;
      return next;
    });
    setSelectedBarIndex(null);
  };

  const handleNodeSequencePress = (nodeId: string) => {
    if (isSubmittingAnswer) return;
    if (selectedSequence.includes(nodeId)) {
      setSelectedSequence((curr) => curr.filter((id) => id !== nodeId));
    } else {
      setSelectedSequence((curr) => [...curr, nodeId]);
    }
  };

  const handleResetSequence = () => {
    if (isSubmittingAnswer) return;
    setSelectedSequence([]);
  };

  const handleSubmit = async () => {
    if (isSubmittingAnswer) return;
    const payload =
      tipo === 'CompletarPseudocodigo'
        ? selectedOption ?? ''
        : tipo === 'OrdenarBarras'
          ? isModoSeleccion
            ? String(selectedBarIndex)
            : JSON.stringify(bars)
          : tipo === 'SecuenciaGrafos'
            ? JSON.stringify(selectedSequence)
            : respuesta;

    setSubmitError(null);
    try {
      await onSubmit(payload);
      setShowResult(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo comprobar tu respuesta. Intenta de nuevo.',
      );
    }
  };

  const handleNext = () => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setSelectedSequence([]);
    setShowResult(false);
    setSubmitError(null);
    onNext();
  };

  const isCorrect = Boolean(lastResult?.correcto);
  const resultSemanticColor = isCorrect
    ? isDark
      ? '#8FE830'
      : '#1E6B12'
    : isDark
      ? '#FF6B7A'
      : '#A80016';
  const resultCardBg = isCorrect
    ? isDark
      ? 'rgba(126, 211, 33, 0.10)'
      : 'rgba(126, 211, 33, 0.12)'
    : isDark
      ? 'rgba(208, 2, 27, 0.12)'
      : 'rgba(208, 2, 27, 0.08)';
  const resultCardBorder = isCorrect
    ? 'rgba(126, 211, 33, 0.42)'
    : 'rgba(208, 2, 27, 0.42)';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Cabecera y barra de progreso al 100% */}
      <View style={styles.progressHeader}>
        <View style={styles.progressTopRow}>
          <Text style={[styles.progressText, { color: colors.textMuted }]}>
            Ejercicio {progressCurrent} de {progressTotal}
          </Text>
          <Text style={[styles.progressPercentText, { color: colors.brandAccent }]}>
            {progressPctRounded}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.surfaceElevated },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.brandAccent,
                width: `${progressPctRounded}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Badge pills de tipo y dificultad del ejercicio */}
      <View style={styles.badgesRow}>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: colors.chipActiveBg,
              borderColor: colors.chipActiveBorder,
            },
          ]}
        >
          <Text style={[styles.typeLabel, { color: colors.brandAccent }]}>
            {getTypeLabel(tipo, isModoSeleccion)}
          </Text>
        </View>
        {dificultad ? (
          <View
            testID="exercise-difficulty-badge"
            style={[
              styles.typeBadge,
              {
                backgroundColor: getDifficultyMeta(dificultad, isDark).bg,
                borderColor: getDifficultyMeta(dificultad, isDark).border,
              },
            ]}
          >
            <Text
              style={[
                styles.typeLabel,
                { color: getDifficultyMeta(dificultad, isDark).text },
              ]}
            >
              {getDifficultyMeta(dificultad, isDark).label}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={[styles.question, { color: colors.textPrimary }]}>
        {pregunta}
      </Text>

      {!showResult ? (
        <>
          {tipo === 'CompletarPseudocodigo' && (
            <View style={styles.pseudocodeBox}>
              <Text
                style={[
                  styles.codeLine,
                  {
                    borderColor: colors.chipActiveBorder,
                    backgroundColor: colors.chipActiveBg,
                    color: colors.textPrimary,
                  },
                ]}
              >
                {pseudoContent?.antes}
                <Text style={[styles.blank, { color: colors.brandAccent }]}>
                  {' '}
                  __________
                  {' '}
                </Text>
                {pseudoContent?.despues}
              </Text>
              <View style={styles.optionGrid}>
                {(opciones ?? []).map((option) => {
                  const active = selectedOption === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.optionChip,
                        isTwoColOptions && styles.optionChipTwoCol,
                        {
                          borderColor: active
                            ? colors.chipActiveBorder
                            : colors.border,
                          backgroundColor: active
                            ? colors.chipActiveBg
                            : colors.surfaceElevated,
                        },
                      ]}
                      onPress={() => setSelectedOption(option)}
                      activeOpacity={0.82}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: active
                              ? colors.textPrimary
                              : colors.textSecondary,
                          },
                        ]}
                      >
                        {option}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {tipo === 'OrdenarBarras' && (
            <View style={styles.barsExercise}>
              {barsContent?.pasoObjetivo && (
                <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
                  {barsContent.pasoObjetivo}
                </Text>
              )}
              <View
                style={[
                  styles.barsRow,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                {bars.map((value, index) => {
                  const selected = selectedBarIndex === index;
                  return (
                    <TouchableOpacity
                      key={`${value}-${index}`}
                      style={styles.barSlot}
                      onPress={() => handleBarPress(index)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.bar,
                          {
                            height: 42 + (value / maxBarValue) * 96,
                            backgroundColor: selected
                              ? Semantic.warning
                              : colors.brandAccent,
                          },
                          selected && styles.barSelectedRing,
                        ]}
                      />
                      <Text
                        style={[styles.barValue, { color: colors.textPrimary }]}
                      >
                        {value}
                      </Text>
                      <Text
                        style={[styles.barIndex, { color: colors.textMuted }]}
                      >
                        [{index}]
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.barsHint, { color: colors.textMuted }]}>
                {selectedBarIndex !== null
                  ? isModoSeleccion
                    ? `Barra ${bars[selectedBarIndex]} seleccionada`
                    : `Barra ${bars[selectedBarIndex]} seleccionada — toca otra para intercambiar`
                  : isModoSeleccion
                    ? 'Toca la barra que corresponde a la respuesta.'
                    : 'Toca dos barras para intercambiarlas.'}
              </Text>
            </View>
          )}

          {tipo === 'SecuenciaGrafos' && (
            <View style={styles.sequenceBox}>
              {graphContent?.grafo && (
                <View
                  style={[
                    styles.graphPreviewBox,
                    {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <GraphRenderer
                    algorithmName={algorithmName}
                    grafo={{
                      ...graphContent.grafo,
                      dirigido: Boolean(graphContent.grafo.dirigido),
                    }}
                    nodoInicio={graphContent.nodoInicio}
                    step={null}
                    height={210}
                  />
                </View>
              )}

              <View
                style={[
                  styles.sequenceResultTrack,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.sequenceLabel, { color: colors.textMuted }]}>
                  Tu secuencia seleccionada:
                </Text>
                {selectedSequence.length > 0 ? (
                  <View style={styles.sequenceNodesRow}>
                    {selectedSequence.map((nodeId, idx) => (
                      <View
                        key={`${nodeId}-${idx}`}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <View
                          style={[
                            styles.sequenceBadge,
                            {
                              backgroundColor: colors.chipActiveBg,
                              borderColor: colors.chipActiveBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.sequenceBadgeIndex,
                              { color: colors.brandAccent },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                          <Text
                            style={[
                              styles.sequenceBadgeText,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {nodeId}
                          </Text>
                        </View>
                        {idx < selectedSequence.length - 1 && (
                          <Text
                            style={[
                              styles.sequenceArrow,
                              { color: colors.textMuted },
                            ]}
                          >
                            →
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text
                    style={[styles.sequenceEmptyText, { color: colors.textMuted }]}
                  >
                    Toca los nodos en el orden en que el algoritmo los visita
                  </Text>
                )}
              </View>

              {selectedSequence.length > 0 && (
                <TouchableOpacity
                  style={styles.undoButton}
                  onPress={handleResetSequence}
                  disabled={isSubmittingAnswer}
                  accessibilityRole="button"
                  accessibilityLabel="Reiniciar orden de nodos"
                >
                  <Text
                    style={[
                      styles.undoButtonText,
                      { color: colors.brandAccent },
                    ]}
                  >
                    ↺ Reiniciar orden
                  </Text>
                </TouchableOpacity>
              )}

              <Text
                style={[styles.nodesPoolLabel, { color: colors.textSecondary }]}
              >
                Nodos del grafo (toca en orden):
              </Text>
              <View style={styles.nodesPoolRow}>
                {(graphContent?.grafo?.nodos ?? ['A', 'B', 'C', 'D']).map((nodeId) => {
                  const isSelected = selectedSequence.includes(nodeId);
                  const selectedIndex = selectedSequence.indexOf(nodeId);
                  return (
                    <TouchableOpacity
                      key={nodeId}
                      style={[
                        styles.nodeChip,
                        {
                          backgroundColor: isSelected
                            ? colors.chipActiveBg
                            : colors.surfaceElevated,
                          borderColor: isSelected
                            ? colors.chipActiveBorder
                            : colors.border,
                        },
                      ]}
                      onPress={() => handleNodeSequencePress(nodeId)}
                      disabled={isSubmittingAnswer}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Nodo ${nodeId}`}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.nodeOrderNumber,
                            { backgroundColor: colors.brandAccent },
                          ]}
                        >
                          <Text
                            style={[
                              styles.nodeOrderNumberText,
                              { color: colors.textInverse },
                            ]}
                          >
                            {selectedIndex + 1}
                          </Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.nodeChipText,
                          {
                            color: isSelected
                              ? colors.textPrimary
                              : colors.textSecondary,
                          },
                          isSelected && styles.nodeChipTextSelected,
                        ]}
                      >
                        Nodo {nodeId}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {tipo === 'PrediccionTexto' && (
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorder,
                  color: colors.inputText,
                },
              ]}
              placeholder="Tu respuesta..."
              placeholderTextColor={colors.inputPlaceholder}
              value={respuesta}
              onChangeText={setRespuesta}
              multiline
              numberOfLines={3}
            />
          )}

          {submitError && (
            <Text
              accessibilityRole="alert"
              testID="exercise-submit-error"
              style={[
                styles.submitErrorText,
                { color: isDark ? '#FF6B7A' : '#A80016' },
              ]}
            >
              {submitError}
            </Text>
          )}

          <Button
            title="Comprobar"
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmittingAnswer}
            loading={isSubmittingAnswer}
            size="large"
          />
        </>
      ) : (
        <View style={styles.resultContainer}>
          <View
            style={[
              styles.resultBanner,
              {
                backgroundColor: resultCardBg,
                borderColor: resultCardBorder,
              },
            ]}
          >
            <View style={styles.resultHeaderRow}>
              {isCorrect ? (
                <CheckCircle2Icon color={resultSemanticColor} size={24} />
              ) : (
                <AlertCircleIcon color={resultSemanticColor} size={24} />
              )}
              <Text style={[styles.resultTitle, { color: resultSemanticColor }]}>
                {isCorrect ? '¡Correcto!' : 'Intenta ajustar tu idea'}
              </Text>
            </View>

            <Text style={[styles.resultText, { color: colors.textPrimary }]}>
              {isCorrect
                ? (lastResult?.feedbackPositivo ?? lastResult?.feedback)
                : (lastResult?.feedbackNegativo ?? lastResult?.feedback)}
            </Text>

            {isCorrect && lastResult && (
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.statPillText, { color: colors.brandAccent }]}>
                    +{lastResult.puntosGanados} XP
                  </Text>
                </View>
                <View
                  style={[
                    styles.statPill,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.borderSubtle,
                    },
                  ]}
                >
                  <Text style={[styles.statPillText, { color: colors.textPrimary }]}>
                    🔥 Racha: {lastResult.rachaDias} días
                  </Text>
                </View>
              </View>
            )}
          </View>

          {!isCorrect && (
            <View style={{ marginBottom: Spacing[3], width: '100%' }}>
              <Button
                title="Volver a intentar"
                onPress={() => setShowResult(false)}
                variant="primary"
                size="large"
              />
            </View>
          )}

          <View style={{ width: '100%' }}>
            <Button
              title={isLastExercise ? 'Terminar sesión' : 'Siguiente'}
              onPress={handleNext}
              variant="secondary"
              size="large"
            />
          </View>
        </View>
      )}
    </View>
  );
};

function getDifficultyMeta(
  dificultad: DificultadEjercicio,
  isDark: boolean,
): { label: string; bg: string; border: string; text: string } {
  switch (dificultad) {
    case 'Facil':
      return {
        label: 'Fácil · +10 XP',
        bg: isDark ? 'rgba(126, 211, 33, 0.14)' : 'rgba(126, 211, 33, 0.16)',
        border: 'rgba(126, 211, 33, 0.45)',
        text: isDark ? '#8FE830' : '#1E6B12',
      };
    case 'Medio':
      return {
        label: 'Medio · +20 XP',
        bg: isDark ? 'rgba(245, 158, 11, 0.14)' : 'rgba(245, 158, 11, 0.16)',
        border: 'rgba(245, 158, 11, 0.48)',
        text: isDark ? '#FBBF24' : '#92400E',
      };
    case 'Dificil':
      return {
        label: 'Difícil · +30 XP',
        bg: isDark ? 'rgba(244, 63, 94, 0.14)' : 'rgba(208, 2, 27, 0.10)',
        border: 'rgba(244, 63, 94, 0.45)',
        text: isDark ? '#FF6B7A' : '#A80016',
      };
  }
}

function getTypeLabel(tipo: TipoEjercicio, isModoSeleccion?: boolean): string {
  switch (tipo) {
    case 'CompletarPseudocodigo':
      return 'Completa el pseudocódigo';
    case 'OrdenarBarras':
      return isModoSeleccion
        ? 'Selecciona la barra correcta'
        : 'Predice el estado visual';
    case 'SecuenciaGrafos':
      return 'Reto de Secuencia de Recorrido';
    default:
      return 'Predicción';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[6],
  },
  progressHeader: {
    width: '100%',
    marginBottom: Spacing[4],
    gap: Spacing[1.5],
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    ...TextVariants.labelSm,
    fontVariant: ['tabular-nums'],
  },
  progressPercentText: {
    ...TextVariants.labelSm,
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  typeLabel: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  question: {
    ...TextVariants.bodyLg,
    marginBottom: Spacing[5],
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    marginBottom: Spacing[4],
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pseudocodeBox: {
    gap: Spacing[4],
    marginBottom: Spacing[4],
  },
  codeLine: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[4],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.md,
  },
  blank: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.bold,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  optionChip: {
    width: '100%',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  optionChipTwoCol: {
    width: '48.5%',
  },
  optionText: {
    ...TextVariants.bodyMd,
    fontFamily: FontFamilies.mono,
  },
  barsExercise: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  stepHint: {
    ...TextVariants.labelMd,
  },
  barsRow: {
    minHeight: 190,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing[4],
  },
  barSlot: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing[1.5],
  },
  bar: {
    minWidth: 34,
    borderRadius: BorderRadius.md,
  },
  barSelectedRing: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  barValue: {
    ...TextVariants.labelSm,
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  barIndex: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  barsHint: {
    ...TextVariants.bodySm,
  },
  submitErrorText: {
    ...TextVariants.bodySm,
    marginBottom: Spacing[3],
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resultBanner: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    marginBottom: Spacing[5],
    gap: Spacing[3],
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
  },
  resultTitle: {
    ...TextVariants.h3,
  },
  resultText: {
    ...TextVariants.bodyMd,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2.5],
    marginTop: Spacing[1],
  },
  statPill: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  statPillText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    fontVariant: ['tabular-nums'],
  },
  sequenceBox: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  graphPreviewBox: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[2],
    overflow: 'hidden',
  },
  sequenceResultTrack: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  sequenceLabel: {
    ...TextVariants.labelSm,
  },
  sequenceNodesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[2],
  },
  sequenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  sequenceBadgeIndex: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.xs,
  },
  sequenceBadgeText: {
    fontFamily: FontFamilies.bold,
    fontSize: FontSizes.sm,
  },
  sequenceArrow: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  sequenceEmptyText: {
    ...TextVariants.bodySm,
    fontStyle: 'italic',
  },
  undoButton: {
    alignSelf: 'flex-start',
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
  },
  undoButtonText: {
    ...TextVariants.labelSm,
  },
  nodesPoolLabel: {
    ...TextVariants.labelSm,
    marginTop: Spacing[1],
  },
  nodesPoolRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  nodeChip: {
    minWidth: 70,
    height: 48,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: Spacing[3],
    position: 'relative',
  },
  nodeChipText: {
    ...TextVariants.labelMd,
  },
  nodeChipTextSelected: {
    fontWeight: 'bold',
  },
  nodeOrderNumber: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeOrderNumberText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
