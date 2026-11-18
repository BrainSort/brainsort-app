import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../common/Button';
import { useThemeContext } from '../../context/ThemeContext';
import { Semantic } from '../../styles/colors';
import { FontFamilies, FontSizes, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';
import type {
  BarsExerciseContent,
  GraphExerciseContent,
  PseudocodeExerciseContent,
  TipoEjercicio,
} from '../../services/exercise.service';

export interface PredictionExerciseProps {
  tipo: TipoEjercicio;
  pregunta: string;
  opciones?: string[];
  contenido?:
    | PseudocodeExerciseContent
    | BarsExerciseContent
    | GraphExerciseContent
    | null;
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

export const PredictionExercise: React.FC<PredictionExerciseProps> = ({
  tipo,
  pregunta,
  opciones,
  contenido,
  progressCurrent,
  progressTotal,
  isSubmittingAnswer,
  lastResult,
  onSubmit,
  onNext,
  isLastExercise,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const [respuesta, setRespuesta] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [bars, setBars] = useState<number[]>([]);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [selectedSequence, setSelectedSequence] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const barsContent = tipo === 'OrdenarBarras' ? (contenido as BarsExerciseContent | null) : null;
  const pseudoContent =
    tipo === 'CompletarPseudocodigo' ? (contenido as PseudocodeExerciseContent | null) : null;
  const graphContent =
    tipo === 'SecuenciaGrafos' ? (contenido as GraphExerciseContent | null) : null;

  useEffect(() => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setSelectedSequence([]);
    setShowResult(false);
    setBars(barsContent?.inicial ?? []);
  }, [barsContent?.inicial, pregunta]);

  const isModoSeleccion = tipo === 'OrdenarBarras' && (contenido as any)?.modoSeleccion;

  const progressPercent = progressTotal > 0 ? progressCurrent / progressTotal : 0;
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
      if (selectedBarIndex === index) {
        setSelectedBarIndex(null);
      } else {
        setSelectedBarIndex(index);
      }
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

    await onSubmit(payload);
    setShowResult(true);
  };

  const handleNext = () => {
    setRespuesta('');
    setSelectedOption(null);
    setSelectedBarIndex(null);
    setSelectedSequence([]);
    setShowResult(false);
    onNext();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>
          {progressCurrent}/{progressTotal}
        </Text>
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
                width: `${Math.round(progressPercent * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      <Text style={[styles.typeLabel, { color: colors.brandAccent }]}>
        {getTypeLabel(tipo, isModoSeleccion)}
      </Text>
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
                        ]}
                      />
                      <Text
                        style={[styles.barValue, { color: colors.textSecondary }]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={[styles.barsHint, { color: colors.textMuted }]}>
                {isModoSeleccion
                  ? 'Toca la barra que corresponde a la respuesta.'
                  : 'Toca dos barras para intercambiarlas.'}
              </Text>
            </View>
          )}

          {tipo === 'SecuenciaGrafos' && (
            <View style={styles.sequenceBox}>
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
          {lastResult?.correcto ? (
            <>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                Correcto
              </Text>
              <Text style={[styles.resultText, styles.success]}>
                {lastResult.feedbackPositivo ?? lastResult.feedback}
              </Text>
              <View style={styles.statsRow}>
                <Text style={[styles.stat, { color: colors.brandAccent }]}>
                  +{lastResult.puntosGanados} XP
                </Text>
                <Text style={[styles.stat, { color: colors.brandAccent }]}>
                  Racha: {lastResult.rachaDias} días
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>
                Intenta ajustar tu idea
              </Text>
              <Text style={[styles.resultText, styles.error]}>
                {lastResult?.feedbackNegativo ?? lastResult?.feedback}
              </Text>
            </>
          )}

          {!lastResult?.correcto && (
            <View style={{ marginBottom: Spacing[3], width: '100%' }}>
              <Button
                title="Volver a intentar"
                onPress={() => setShowResult(false)}
                variant="primary"
                size="large"
              />
            </View>
          )}

          <Button
            title={isLastExercise ? 'Terminar sesión' : 'Siguiente'}
            onPress={handleNext}
            variant="secondary"
            size="large"
          />
        </View>
      )}
    </View>
  );
};

function getTypeLabel(tipo: TipoEjercicio, isModoSeleccion?: boolean): string {
  switch (tipo) {
    case 'CompletarPseudocodigo':
      return 'Completa el pseudocódigo';
    case 'OrdenarBarras':
      return isModoSeleccion ? 'Selecciona la barra correcta' : 'Predice el estado visual';
    case 'SecuenciaGrafos':
      return 'Reto de Secuencia de Recorrido';
    default:
      return 'Predicción';
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
  },
  progressHeader: {
    width: 150,
    marginBottom: Spacing[5],
    gap: Spacing[1],
  },
  progressText: {
    ...TextVariants.labelSm,
  },
  progressTrack: {
    height: 8,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  typeLabel: {
    ...TextVariants.labelMd,
    marginBottom: Spacing[2],
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
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  blank: {
    fontFamily: FontFamilies.bold,
  },
  optionGrid: {
    gap: Spacing[3],
  },
  optionChip: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  optionText: {
    ...TextVariants.bodyMd,
  },
  barsExercise: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  stepHint: {
    ...TextVariants.labelMd,
  },
  barsRow: {
    minHeight: 180,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  barSlot: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing[2],
  },
  bar: {
    width: 32,
    borderRadius: BorderRadius.sm,
  },
  barValue: {
    ...TextVariants.labelSm,
  },
  barsHint: {
    ...TextVariants.bodySm,
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultTitle: {
    ...TextVariants.h3,
    marginBottom: Spacing[4],
  },
  resultText: {
    ...TextVariants.bodyMd,
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
  },
  sequenceBox: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
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
