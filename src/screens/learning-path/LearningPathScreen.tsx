import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect, CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import {
  learningPathService,
  RutaAprendizajeResponse,
} from '../../services/learning-path.service';
import {
  progressService,
  UsuarioProgreso,
} from '../../services/progress.service';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import {
  DifficultyBadge,
  normalizeDificultad,
} from '../../components/algorithm/DifficultyBadge';
import { useThemeContext } from '../../context/ThemeContext';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

type LearningPathNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Ruta'>,
  NativeStackNavigationProp<Record<string, object | undefined>>
>;

type Props = {
  navigation: LearningPathNav;
};

const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras Lineales',
  EstructurasArboles: 'Estructuras de árboles',
  Grafos: 'Grafos',
};

export default function LearningPathScreen({ navigation }: Props) {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isCompactKpi = width < 768;

  const [ruta, setRuta] = useState<RutaAprendizajeResponse | null>(null);
  const [progreso, setProgreso] = useState<UsuarioProgreso | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError(false);
      Promise.all([
        learningPathService.getMiRuta(),
        progressService.getUserProgress(),
      ])
        .then(([rutaRes, progresoRes]) => {
          setRuta(rutaRes);
          setProgreso(progresoRes);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    }, []),
  );

  const { completedCount, nextAlgorithmId, nextAlgorithmName } = useMemo(() => {
    if (!ruta?.algoritmos?.length) {
      return {
        completedCount: 0,
        nextAlgorithmId: null as string | null,
        nextAlgorithmName: 'Ruta completada',
      };
    }

    let completed = 0;
    let firstPendingId: string | null = null;
    let firstPendingName = 'Ruta completada';

    for (const algo of ruta.algoritmos) {
      const algoProg = progreso?.algoritmosProgreso?.find(
        (ap) => ap.algoritmoId === algo.id,
      );
      const corrects = algoProg?.ejerciciosCorrectos ?? 0;
      const totals = algoProg?.ejerciciosTotales ?? 0;
      const done = totals > 0 && corrects >= totals;
      if (done) {
        completed += 1;
      } else if (firstPendingId === null) {
        firstPendingId = algo.id;
        firstPendingName = algo.nombre;
      }
    }

    return {
      completedCount: completed,
      nextAlgorithmId: firstPendingId,
      nextAlgorithmName: firstPendingName,
    };
  }, [ruta, progreso]);

  const handleDiagnosticPress = useCallback(() => {
    navigation.getParent()?.navigate('DiagnosticTest');
  }, [navigation]);

  if (loading) {
    return (
      <SafeAreaWrapper>
        {!isDesktop && <Header title="Mi Ruta" />}
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.centeredWrap}>
            <View style={styles.centerInner}>
              <ActivityIndicator color={colors.brandAccent} size="large" />
              <Text style={[styles.loadingText, { color: colors.textMuted }]}>
                Cargando tu ruta personalizada...
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  if (error || !ruta) {
    return (
      <SafeAreaWrapper>
        {!isDesktop && <Header title="Mi Ruta" />}
        <View
          style={[
            styles.centerContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.centeredWrap}>
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.emptyIconBox,
                  {
                    backgroundColor: colors.chipActiveBg,
                    borderColor: colors.chipActiveBorder,
                  },
                ]}
              >
                <CompassIcon color={colors.brandAccent} size={32} />
              </View>
              <Text
                style={[styles.emptyTitle, { color: colors.textPrimary }]}
                accessibilityRole="header"
              >
                Ruta no asignada
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Aún no tienes una ruta de aprendizaje. Realiza el test
                diagnóstico para que podamos recomendarte algoritmos adaptados a
                tu nivel.
              </Text>
              <Pressable
                style={({ pressed, hovered }: any) => [
                  styles.primaryCtaButton,
                  {
                    backgroundColor: colors.ctaPrimary,
                    borderColor: colors.ctaPrimaryBorder,
                    opacity: pressed ? 0.86 : hovered ? 0.94 : 1,
                  },
                  webInteractiveStyle,
                ]}
                onPress={handleDiagnosticPress}
                accessibilityRole="button"
                accessibilityLabel="Hacer Test Diagnóstico"
              >
                <Text
                  style={[
                    styles.primaryCtaText,
                    { color: colors.primaryButtonText },
                  ]}
                >
                  Hacer Test Diagnóstico
                </Text>
                <ArrowRightIcon color={colors.primaryButtonText} size={16} />
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaWrapper>
    );
  }

  const kpis = [
    {
      key: 'score',
      label: 'Puntaje diagnóstico',
      value: ruta.diagnostico ? `${ruta.diagnostico.puntaje}%` : 'Pendiente',
      accent: colors.brandAccent,
    },
    {
      key: 'completed',
      label: 'Pasos completados',
      value: `${completedCount} / ${ruta.algoritmos.length}`,
      accent: colors.success,
    },
    {
      key: 'next',
      label: 'Siguiente paso',
      value: nextAlgorithmName,
      accent: colors.textPrimary,
    },
  ];

  return (
    <SafeAreaWrapper>
      {!isDesktop && <Header title="Mi Ruta" />}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollDesktop : styles.scrollMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredWrap}>
          {/* Page Hero Header (Desktop) */}
          {isDesktop && (
            <View style={styles.heroHeader}>
              <View style={styles.heroTextBlock}>
                <Text
                  style={[styles.heroTitle, { color: colors.textPrimary }]}
                  accessibilityRole="header"
                >
                  Ruta de aprendizaje
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                  Secuencia pedagógica adaptada a tu diagnóstico y progreso
                </Text>
              </View>

              <Pressable
                style={({ pressed, hovered }: any) => [
                  styles.retakeHeroButton,
                  {
                    backgroundColor: hovered
                      ? colors.surfaceHighlight
                      : colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                  webInteractiveStyle,
                ]}
                onPress={handleDiagnosticPress}
                accessibilityRole="button"
                accessibilityLabel="Repetir diagnóstico"
              >
                <RefreshIcon color={colors.brandAccent} size={16} />
                <Text
                  style={[
                    styles.retakeHeroText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Repetir diagnóstico
                </Text>
              </Pressable>
            </View>
          )}

          {/* 3-Column KPI Summary Strip */}
          <View
            style={[
              styles.kpiStrip,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.cardBorder,
                flexDirection: isCompactKpi ? 'column' : 'row',
              },
            ]}
          >
            {kpis.map((kpi, idx) => (
              <View
                key={kpi.key}
                style={[
                  styles.kpiCell,
                  isCompactKpi
                    ? {
                        borderBottomWidth: idx < kpis.length - 1 ? 1 : 0,
                        borderBottomColor: colors.borderSubtle,
                      }
                    : {
                        flex: 1,
                        borderRightWidth: idx < kpis.length - 1 ? 1 : 0,
                        borderRightColor: colors.borderSubtle,
                      },
                ]}
              >
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
                  {kpi.label}
                </Text>
                <Text
                  style={[styles.kpiValue, { color: kpi.accent }]}
                  numberOfLines={1}
                >
                  {kpi.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Diagnostic Card on Mobile (< 980) */}
          {!isDesktop && ruta.diagnostico && (
            <View
              style={[
                styles.bannerCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.bannerHeader}>
                <Text
                  style={[styles.bannerTitle, { color: colors.textPrimary }]}
                >
                  Evaluación Diagnóstica
                </Text>
                <View
                  style={[
                    styles.bannerBadge,
                    {
                      backgroundColor: colors.chipActiveBg,
                      borderColor: colors.chipActiveBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bannerBadgeText,
                      { color: colors.brandAccent },
                    ]}
                  >
                    {ruta.diagnostico.puntaje}% Score
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.bannerText, { color: colors.textSecondary }]}
              >
                Evaluado el{' '}
                {new Date(
                  ruta.diagnostico.fechaEvaluacion,
                ).toLocaleDateString()}
                . En base a esto secuenciamos pedagógicamente tu ruta.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.retakeMobileButton,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: pressed ? 0.85 : 1,
                  },
                  webInteractiveStyle,
                ]}
                onPress={handleDiagnosticPress}
                accessibilityRole="button"
                accessibilityLabel="Repetir diagnóstico"
              >
                <RefreshIcon color={colors.brandAccent} size={16} />
                <Text
                  style={[
                    styles.retakeMobileText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Repetir diagnóstico
                </Text>
              </Pressable>
            </View>
          )}

          {/* Section Title */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Tu camino a seguir
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Toca cualquier algoritmo para revisar su teoría, simularlo y
              practicar.
            </Text>
          </View>

          {/* Timeline */}
          <View
            style={[
              styles.timeline,
              { borderLeftColor: colors.border },
            ]}
          >
            {ruta.algoritmos.map((algo, idx) => {
              const algoProgreso = progreso?.algoritmosProgreso?.find(
                (ap) => ap.algoritmoId === algo.id,
              );
              const corrects = algoProgreso?.ejerciciosCorrectos ?? 0;
              const totals = algoProgreso?.ejerciciosTotales ?? 0;
              const pct = totals > 0 ? (corrects / totals) * 100 : 0;
              const isCompleted = totals > 0 && corrects >= totals;
              const isInProgress =
                totals > 0 && corrects > 0 && corrects < totals;
              const isNext = algo.id === nextAlgorithmId;

              let circleBg: string = colors.surfaceElevated;
              let circleBorder: string = colors.border;
              let stepColor: string = colors.textMuted;

              if (isCompleted) {
                circleBg = colors.success;
                circleBorder = colors.success;
                stepColor = colors.textOnAccent;
              } else if (isNext || isInProgress) {
                circleBg = colors.brandAccent;
                circleBorder = colors.brandAccent;
                stepColor = colors.textOnAccent;
              }

              return (
                <Pressable
                  key={algo.id}
                  style={({ pressed }) => [
                    styles.node,
                    { opacity: pressed ? 0.9 : 1 },
                    webInteractiveStyle,
                  ]}
                  onPress={() =>
                    navigation.navigate('Biblioteca', {
                      screen: 'AlgorithmDetail',
                      params: { algoritmoId: algo.id },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Paso ${idx + 1}: ${algo.nombre}`}
                >
                  {/* Visual Circle on Timeline */}
                  <View
                    style={[
                      styles.circle,
                      {
                        backgroundColor: circleBg,
                        borderColor: circleBorder,
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <CheckIcon color={stepColor} size={16} />
                    ) : (
                      <Text style={[styles.stepNum, { color: stepColor }]}>
                        {idx + 1}
                      </Text>
                    )}
                  </View>

                  {/* Node Card Info */}
                  <View
                    style={[
                      styles.infoCard,
                      {
                        backgroundColor: colors.cardBackground,
                        borderColor: isNext
                          ? colors.brandAccent
                          : colors.cardBorder,
                        borderWidth: isNext ? 1.5 : 1,
                      },
                    ]}
                  >
                    <View style={styles.nodeHeader}>
                      <View style={styles.nodeTitleGroup}>
                        <Text
                          style={[
                            styles.algoName,
                            { color: colors.textPrimary },
                          ]}
                        >
                          {algo.nombre}
                        </Text>
                        {isNext && (
                          <View
                            style={[
                              styles.nextTag,
                              {
                                backgroundColor: colors.chipActiveBg,
                                borderColor: colors.chipActiveBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.nextTagText,
                                { color: colors.brandAccent },
                              ]}
                            >
                              Siguiente
                            </Text>
                          </View>
                        )}
                      </View>
                      <DifficultyBadge
                        dificultad={normalizeDificultad(algo.dificultad || '')}
                      />
                    </View>

                    <Text style={[styles.algoCat, { color: colors.textMuted }]}>
                      {CATEGORY_LABELS[algo.categoria] ?? algo.categoria}
                    </Text>

                    {algo.descripcion ? (
                      <Text
                        style={[
                          styles.algoDesc,
                          { color: colors.textSecondary },
                        ]}
                        numberOfLines={2}
                      >
                        {algo.descripcion}
                      </Text>
                    ) : null}

                    {/* Progress Indicator + Practicar CTA */}
                    <View style={styles.nodeFooter}>
                      <View style={styles.nodeProgressContainer}>
                        <View style={styles.nodeProgressTextRow}>
                          <Text
                            style={[
                              styles.nodeProgressText,
                              { color: colors.textMuted },
                            ]}
                          >
                            Progreso: {corrects}/{totals} ejercicios
                          </Text>
                          <Text
                            style={[
                              styles.nodeProgressPercent,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {Math.round(pct)}%
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.nodeProgressTrack,
                            { backgroundColor: colors.progressTrack },
                          ]}
                        >
                          <View
                            style={[
                              styles.nodeProgressFill,
                              {
                                width: `${pct}%`,
                                backgroundColor: isCompleted
                                  ? colors.success
                                  : colors.brandAccent,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      <View style={styles.practiceCtaRow}>
                        <Text
                          style={[
                            styles.practiceCtaText,
                            { color: colors.brandAccent },
                          ]}
                        >
                          Practicar
                        </Text>
                        <ArrowRightIcon color={colors.brandAccent} size={14} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function CompassIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
      <Polygon
        points="15.8,8.2 13.7,13.7 8.2,15.8 10.3,10.3"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function RefreshIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 11a8 8 0 0 0-14.3-4.8L4 8M4 4v4h4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 13a8 8 0 0 0 14.3 4.8L20 16M20 20v-4h-4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12.5 9.8 17 19 7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRightIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 6l6 6-6 6"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const webInteractiveStyle = Platform.select({
  web: {
    cursor: 'pointer',
    transitionDuration: '150ms',
  } as any,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredWrap: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  centerInner: {
    alignItems: 'center',
    gap: Spacing[3],
  },
  loadingText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    marginTop: Spacing[2],
  },
  emptyCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing[8],
    alignItems: 'center',
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
    gap: Spacing[3],
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  emptyTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 24,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 22,
    textAlign: 'center',
  },
  primaryCtaButton: {
    marginTop: Spacing[2],
    height: 44,
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  primaryCtaText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollDesktop: {
    paddingHorizontal: Spacing[8],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[10],
  },
  scrollMobile: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: 104,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[5],
    marginBottom: Spacing[5],
  },
  heroTextBlock: {
    flex: 1,
    gap: Spacing[1],
  },
  heroTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 32,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  retakeHeroButton: {
    height: 42,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  retakeHeroText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  kpiStrip: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing[6],
  },
  kpiCell: {
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    gap: Spacing[1],
  },
  kpiLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
  },
  kpiValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  bannerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    borderWidth: 1,
    marginBottom: Spacing[5],
    gap: Spacing[3],
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
  bannerBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  bannerBadgeText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  bannerText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  retakeMobileButton: {
    height: 40,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  retakeMobileText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  sectionHeader: {
    marginBottom: Spacing[4],
    gap: Spacing[1],
  },
  sectionTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
  },
  sectionSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  timeline: {
    paddingLeft: Spacing[5],
    borderLeftWidth: 2,
    marginLeft: Spacing[3],
    gap: Spacing[5],
  },
  node: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginLeft: -27,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
    marginTop: Spacing[4],
  },
  stepNum: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
    fontVariant: ['tabular-nums'],
  },
  infoCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[2],
  },
  nodeTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  algoName: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
  },
  nextTag: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  nextTagText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  algoCat: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
  },
  algoDesc: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  nodeFooter: {
    marginTop: Spacing[2],
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing[4],
    flexWrap: 'wrap',
  },
  nodeProgressContainer: {
    flex: 1,
    minWidth: 180,
    gap: Spacing[1],
  },
  nodeProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeProgressText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  nodeProgressPercent: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  nodeProgressTrack: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  nodeProgressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  practiceCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  practiceCtaText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
});
