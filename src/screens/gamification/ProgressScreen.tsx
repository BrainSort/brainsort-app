/**
 * ProgressScreen.tsx
 * BrainSort — Pantalla de progreso del usuario
 *
 * task_breakdown.md T-FE-099
 *
 * Implementa:
 *   - Muestra puntos totales y nivel actual
 *   - Muestra racha de días
 *   - Muestra insignias desbloqueadas
 *   - Muestra estadísticas (simulaciones completadas, ejercicios correctos)
 *   - Llama useProgress() para obtener datos
 *
 * Referencia: 02-frontend-app.md §1 screens/gamification/ProgressScreen.tsx
 *            hooks/useProgress.ts
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useProgress } from '../../hooks/useProgress';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  Primary,
} from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de progreso del usuario.
 *
 * @example
 * <ProgressScreen />
 */
export const ProgressScreen: React.FC = () => {
  const {
    progreso,
    isLoadingProgreso,
    refetchProgreso,
  } = useProgress();

  if (isLoadingProgreso) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!progreso) {
    return (
      <SafeAreaWrapper>
        <Header title="Mi Progreso" showBackButton />
        <View style={styles.center}>
          <Text style={styles.errorText}>Error cargando progreso</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Mi Progreso" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Points Banner */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Puntos Totales</Text>
          <Text style={styles.pointsValue}>{progreso.puntosTotales}</Text>
          <Text style={styles.levelLabel}>Nivel {progreso.nivelActual}</Text>
        </View>

        {/* Streak Counter */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Racha de Días</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakValue}>{progreso.rachaDias}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Estadísticas</Text>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progreso.simulacionesCompletadas}</Text>
              <Text style={styles.statLabel}>Simulaciones</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progreso.ejerciciosCorrectos}</Text>
              <Text style={styles.statLabel}>Ejercicios Correctos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{progreso.ejerciciosTotales}</Text>
              <Text style={styles.statLabel}>Ejercicios Totales</Text>
            </View>
          </View>
        </View>

        {/* Badges */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Insignias</Text>
          {progreso.insignias && progreso.insignias.length > 0 ? (
            <FlatList
              data={progreso.insignias}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>{item.imagen}</Text>
                  <View style={styles.badgeInfo}>
                    <Text style={styles.badgeName}>{item.nombre}</Text>
                    <Text style={styles.badgeDate}>
                      {new Date(item.fechaObtencion).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
            />
          ) : (
            <Text style={styles.emptyText}>Sin insignias aún</Text>
          )}
        </View>

        {/* Ranking Position */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Posición en Ranking</Text>
          <Text style={styles.rankValue}>#{progreso.posicionRanking}</Text>
        </View>

        <Button
          title="Refrescar"
          onPress={() => refetchProgreso()}
          variant="secondary"
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
    paddingBottom: Spacing[8],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[3],
  },
  pointsValue: {
    ...TextVariants.display,
    fontSize: FontSizes['4xl'],
    color: Accent[500],
    fontWeight: FontWeights.bold,
  },
  levelLabel: {
    ...TextVariants.labelMd,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 32,
    marginRight: Spacing[2],
  },
  streakValue: {
    ...TextVariants.h2,
    color: Accent[500],
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...TextVariants.h3,
    color: Primary[500],
  },
  statLabel: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },
  statDivider: {
    width: 1,
    backgroundColor: DarkSurfaces.border,
    height: 40,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  badgeIcon: {
    fontSize: 32,
    marginRight: Spacing[3],
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
    fontWeight: FontWeights.medium,
  },
  badgeDate: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
  },
  emptyText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
    textAlign: 'center',
    paddingVertical: Spacing[3],
  },
  rankValue: {
    ...TextVariants.h2,
    color: Accent[500],
    textAlign: 'center',
  },
});
