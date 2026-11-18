/**
 * ProfileStatsCard.tsx
 * BrainSort — Card de estadísticas resumidas del perfil
 */

import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';

export interface ProfileStatsCardProps {
  simulacionesCompletadas: number;
  ejerciciosCorrectos: number;
  ejerciciosTotales: number;
  posicionRanking: number;
  puntosTotales: number;
}

type StatIconKind = 'play' | 'target' | 'trophy';

function StatSvgIcon({ kind, color }: { kind: StatIconKind; color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {kind === 'play' && (
        <Polygon
          points="7,5 19,12 7,19"
          stroke={color}
          strokeWidth={1.85}
          strokeLinejoin="round"
        />
      )}
      {kind === 'target' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.85} />
          <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={1.85} />
          <Circle cx={12} cy={12} r={1.5} fill={color} />
        </>
      )}
      {kind === 'trophy' && (
        <>
          <Path
            d="M8 4h8v5a4 4 0 0 1-8 0V4Z"
            stroke={color}
            strokeWidth={1.85}
            strokeLinejoin="round"
          />
          <Path
            d="M8 6H5.5a1.5 1.5 0 0 0-1.5 1.5v1A3.5 3.5 0 0 0 7.5 12H8M16 6h2.5A1.5 1.5 0 0 1 20 7.5v1A3.5 3.5 0 0 1 16.5 12H16M12 13v4M9 20h6M9.5 17h5"
            stroke={color}
            strokeWidth={1.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}

interface StatItemProps {
  icon: StatIconKind;
  valor: string;
  etiqueta: string;
  color: string;
  tintBg: string;
  labelColor: string;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  valor,
  etiqueta,
  color,
  tintBg,
  labelColor,
}) => (
  <View style={statStyles.item}>
    <View style={[statStyles.iconBox, { backgroundColor: tintBg }]}>
      <StatSvgIcon kind={icon} color={color} />
    </View>
    <Text style={[statStyles.value, { color }]}>{valor}</Text>
    <Text style={[statStyles.label, { color: labelColor }]}>{etiqueta}</Text>
  </View>
);

const statStyles = StyleSheet.create({
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  value: {
    ...TextVariants.h3,
    fontWeight: FontWeights.bold,
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
  label: {
    ...TextVariants.labelSm,
    textAlign: 'center',
    marginTop: Spacing[1],
  },
});

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  simulacionesCompletadas,
  ejerciciosCorrectos,
  ejerciciosTotales,
  posicionRanking,
  puntosTotales,
}) => {
  const { theme } = useThemeContext();
  const colors = theme.colors;

  const precisionEjercicios =
    ejerciciosTotales > 0
      ? Math.round((ejerciciosCorrectos / ejerciciosTotales) * 100)
      : 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.textSecondary }]}>
        Estadísticas
      </Text>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.row}>
        <StatItem
          icon="play"
          valor={String(simulacionesCompletadas)}
          etiqueta="Simulaciones"
          color={colors.brandAccent}
          tintBg={colors.infoLight}
          labelColor={colors.textMuted}
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <StatItem
          icon="target"
          valor={`${precisionEjercicios}%`}
          etiqueta="Precisión"
          color={precisionEjercicios >= 70 ? colors.success : colors.warning}
          tintBg={
            precisionEjercicios >= 70 ? colors.successLight : colors.warningLight
          }
          labelColor={colors.textMuted}
        />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <StatItem
          icon="trophy"
          valor={posicionRanking > 0 ? `#${posicionRanking}` : '—'}
          etiqueta="Ranking"
          color={
            posicionRanking > 0 && posicionRanking <= 3
              ? colors.warning
              : colors.brandAccent
          }
          tintBg={
            posicionRanking > 0 && posicionRanking <= 3
              ? colors.warningLight
              : colors.infoLight
          }
          labelColor={colors.textMuted}
        />
      </View>

      <View style={[styles.exerciseRow, { borderTopColor: colors.border }]}>
        <Text style={styles.exerciseText}>
          <Text
            style={[
              styles.exerciseHighlight,
              { color: colors.brandAccent },
            ]}
          >
            {ejerciciosCorrectos}
          </Text>
          <Text style={[styles.exerciseMuted, { color: colors.textMuted }]}>
            {' '}/ {ejerciciosTotales} ejercicios correctos
          </Text>
        </Text>
        <Text style={[styles.exerciseMuted, styles.tabular, { color: colors.textMuted }]}>
          {puntosTotales.toLocaleString('es-MX')} XP totales
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  title: {
    ...TextVariants.h4,
    marginBottom: Spacing[3],
  },
  divider: {
    height: 1,
    marginBottom: Spacing[3],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 54,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: 1,
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  exerciseText: {
    flexShrink: 1,
  },
  exerciseHighlight: {
    ...TextVariants.bodyMd,
    fontWeight: FontWeights.bold,
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
  exerciseMuted: {
    ...TextVariants.bodySm,
  },
  tabular: {
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
});

export default ProfileStatsCard;
