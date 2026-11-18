/**
 * ProgressScreen.tsx
 * BrainSort — Pantalla de progreso del usuario
 *
 * task_breakdown.md T-FE-099
 */

import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useProgress } from '../../hooks/useProgress';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { StreakCounter } from '../../components/gamification/StreakCounter';
import { BadgeCard } from '../../components/gamification/BadgeCard';
import { TierBadge } from '../../components/gamification/TierBadge';
import { XpProgressBar } from '../../components/gamification/XpProgressBar';
import { useThemeContext } from '../../context/ThemeContext';
import { calcularProgresoNivel, obtenerTier } from '../../utils/xp.utils';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';

function RefreshIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12a9 9 0 11-2.64-6.36"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 3v6h-6"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const ProgressScreen: React.FC = () => {
  const { theme } = useThemeContext();
  const colors = theme.colors;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isWideHero = width >= 860;
  const isFourColKpi = width >= 760;

  const {
    progreso,
    catalogoInsignias,
    isLoadingProgreso,
    refetchProgreso,
  } = useProgress();

  if (isLoadingProgreso) {
    return (
      <SafeAreaWrapper>
        {!isDesktop && <Header title="Mi Progreso" showBackButton />}
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.brandAccent} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!progreso) {
    return (
      <SafeAreaWrapper>
        {!isDesktop && <Header title="Mi Progreso" showBackButton />}
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            Error cargando progreso
          </Text>
          <Pressable
            onPress={() => refetchProgreso()}
            style={({ pressed }: any) => [
              styles.refreshButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
                marginTop: Spacing[4],
              },
            ]}
          >
            <RefreshIcon color={colors.brandAccent} />
            <Text style={[styles.refreshText, { color: colors.textPrimary }]}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      </SafeAreaWrapper>
    );
  }

  const tier = obtenerTier(progreso.nivelActual);
  const progresoNivel = calcularProgresoNivel(
    progreso.puntosTotales,
    progreso.nivelActual,
  );

  const badges =
    catalogoInsignias && catalogoInsignias.length > 0
      ? catalogoInsignias
      : (progreso.insignias ?? []).map((item: any) => ({
          ...item,
          desbloqueada: true,
        }));

  const kpis = [
    {
      label: 'Puntos totales',
      value: `${progreso.puntosTotales.toLocaleString('es-MX')} XP`,
      accent: colors.brandAccent,
    },
    {
      label: 'Simulaciones completadas',
      value: `${progreso.simulacionesCompletadas}`,
      accent: colors.textPrimary,
    },
    {
      label: 'Ejercicios correctos',
      value: `${progreso.ejerciciosCorrectos}/${progreso.ejerciciosTotales}`,
      accent: colors.textPrimary,
    },
    {
      label: 'Posición en ranking',
      value: `#${progreso.posicionRanking}`,
      accent: colors.complexityText,
    },
  ];

  return (
    <SafeAreaWrapper>
      {!isDesktop && <Header title="Mi Progreso" showBackButton />}
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
      >
        <View style={styles.container}>
          {/* Page Hero Header */}
          {isDesktop ? (
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text
                  style={[styles.heroTitle, { color: colors.textPrimary }]}
                  accessibilityRole="header"
                >
                  Mi progreso
                </Text>
                <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                  Resumen de experiencia, racha, estadísticas e insignias
                </Text>
              </View>
              <Pressable
                onPress={() => refetchProgreso()}
                style={({ pressed, hovered }: any) => [
                  styles.refreshButton,
                  {
                    backgroundColor: hovered
                      ? colors.surfaceElevated
                      : colors.surface,
                    borderColor: hovered ? colors.brandAccent : colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Actualizar progreso"
                testID="btn-refresh-progress"
              >
                <RefreshIcon color={colors.brandAccent} />
                <Text style={[styles.refreshText, { color: colors.textPrimary }]}>
                  Actualizar
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.mobileActionRow}>
              <Pressable
                onPress={() => refetchProgreso()}
                style={({ pressed }: any) => [
                  styles.refreshButton,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Actualizar progreso"
                testID="btn-refresh-progress"
              >
                <RefreshIcon color={colors.brandAccent} />
                <Text style={[styles.refreshText, { color: colors.textPrimary }]}>
                  Actualizar
                </Text>
              </Pressable>
            </View>
          )}

          {/* 4-column responsive KPI strip (2x2 on narrow screens) */}
          <View
            style={[
              styles.kpiStrip,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {kpis.map((kpi, idx) => (
              <View
                key={kpi.label}
                style={[
                  styles.kpiCell,
                  isFourColKpi ? styles.kpiCellQuarter : styles.kpiCellHalf,
                  {
                    borderColor: colors.borderSubtle,
                    borderRightWidth: isFourColKpi
                      ? idx < 3
                        ? 1
                        : 0
                      : idx % 2 === 0
                        ? 1
                        : 0,
                    borderBottomWidth: isFourColKpi ? 0 : idx < 2 ? 1 : 0,
                  },
                ]}
              >
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
                  {kpi.label}
                </Text>
                <Text style={[styles.kpiValue, { color: kpi.accent }]}>
                  {kpi.value}
                </Text>
              </View>
            ))}
          </View>

          {/* 2-column Hero Row: Level & XP (left) + StreakCounter (right) */}
          <View
            style={[
              styles.heroRow,
              isWideHero ? styles.heroRowDesktop : styles.heroRowMobile,
            ]}
          >
            <View
              style={[
                styles.xpCard,
                isWideHero && styles.xpCardDesktop,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.xpCardHeader}>
                <View>
                  <Text
                    style={[styles.cardEyebrow, { color: colors.textMuted }]}
                  >
                    Nivel y experiencia
                  </Text>
                  <Text
                    style={[styles.levelHeadline, { color: colors.textPrimary }]}
                  >
                    Nivel {progreso.nivelActual}
                  </Text>
                </View>
                <TierBadge tier={tier} size="sm" />
              </View>
              <XpProgressBar
                progresoNivel={progresoNivel}
                nivelActual={progreso.nivelActual}
              />
            </View>

            <View style={isWideHero ? styles.streakColDesktop : styles.streakColMobile}>
              <StreakCounter racha={progreso.rachaDias} />
            </View>
          </View>

          {/* Insignias section */}
          <View
            style={[
              styles.badgesSection,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.badgesHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Insignias
              </Text>
              <Text style={[styles.badgesCount, { color: colors.textMuted }]}>
                {badges.filter((b: any) => b.desbloqueada !== false).length} /{' '}
                {badges.length} desbloqueadas
              </Text>
            </View>

            {badges.length > 0 ? (
              <View style={styles.badgesGrid}>
                {badges.map((item: any, index: number) => (
                  <View
                    key={item.id ?? `${item.nombre}-${index}`}
                    style={
                      isWideHero ? styles.badgeGridColHalf : styles.badgeGridColFull
                    }
                  >
                    <BadgeCard
                      nombre={item.nombre}
                      imagen={item.imagen}
                      descripcion={item.descripcion}
                      criterioDesbloqueo={item.criterioDesbloqueo}
                      categoria={item.categoria}
                      desbloqueada={item.desbloqueada}
                      fechaObtencion={item.fechaObtencion}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Sin insignias aún
              </Text>
            )}
          </View>
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
    padding: Spacing[4],
    paddingBottom: Spacing[10],
  },
  scrollContentDesktop: {
    paddingHorizontal: Spacing[7],
    paddingTop: Spacing[7],
    paddingBottom: Spacing[12],
  },
  container: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TextVariants.bodyMd,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[4],
    marginBottom: Spacing[6],
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: FontFamilies.extraBold,
    fontWeight: FontWeights.extraBold,
    fontSize: 30,
    lineHeight: 36,
    marginBottom: Spacing[1],
  },
  heroSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  mobileActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing[3],
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[2],
    minHeight: 40,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  refreshText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  kpiStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing[5],
    overflow: 'hidden',
  },
  kpiCell: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    justifyContent: 'center',
  },
  kpiCellQuarter: {
    width: '25%',
  },
  kpiCellHalf: {
    width: '50%',
  },
  kpiLabel: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    marginBottom: Spacing[1],
  },
  kpiValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes['2xl'],
    fontVariant: ['tabular-nums'],
  },
  heroRow: {
    gap: Spacing[4],
    marginBottom: Spacing[5],
  },
  heroRowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroRowMobile: {
    flexDirection: 'column',
  },
  xpCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    justifyContent: 'space-between',
  },
  xpCardDesktop: {
    flex: 1.4,
  },
  xpCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  cardEyebrow: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  levelHeadline: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xl,
  },
  streakColDesktop: {
    flex: 1,
  },
  streakColMobile: {
    width: '100%',
  },
  badgesSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
  },
  badgesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
    gap: Spacing[2],
  },
  sectionTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xl,
  },
  badgesCount: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    fontVariant: ['tabular-nums'],
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing[1.5],
  },
  badgeGridColHalf: {
    width: '50%',
    paddingHorizontal: Spacing[1.5],
  },
  badgeGridColFull: {
    width: '100%',
    paddingHorizontal: Spacing[1.5],
  },
  emptyText: {
    ...TextVariants.bodyMd,
    textAlign: 'center',
    paddingVertical: Spacing[4],
  },
});
