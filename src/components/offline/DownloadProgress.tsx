/**
 * DownloadProgress.tsx
 * BrainSort — Indicador de progreso de descarga de módulo offline
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface DownloadProgressProps {
  progress: number;
  isDownloading?: boolean;
  error?: Error | null;
  label?: string;
}

export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  progress,
  isDownloading = false,
  error = null,
  label,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  const statusText = error
    ? 'Error al descargar'
    : label ?? (isDownloading ? 'Descargando módulo...' : 'Descarga completa');

  const fillColor = error
    ? colors.error
    : clamped >= 100
      ? colors.progressFill
      : colors.brandAccent;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.label,
            { color: error ? colors.error : colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {statusText}
        </Text>
        <Text
          style={[
            styles.percent,
            { color: error ? colors.error : colors.textPrimary },
          ]}
        >
          {clamped}%
        </Text>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: colors.progressTrack },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: clamped }}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing[1],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  label: {
    flex: 1,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  percent: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 6,
    width: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});

export default DownloadProgress;
