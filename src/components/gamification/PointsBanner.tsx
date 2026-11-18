import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { FontWeights, FontSizes, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface PointsBannerProps {
  puntos: number;
  nivel: number;
}

export const PointsBanner: React.FC<PointsBannerProps> = ({ puntos, nivel }) => {
  const { theme } = useThemeContext();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
        Puntos Totales
      </Text>
      <Text style={[styles.pointsValue, { color: colors.brandAccent }]}>
        {puntos.toLocaleString('es-MX')}
      </Text>
      <Text style={[styles.levelLabel, { color: colors.textMuted }]}>
        Nivel {nivel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.labelMd,
    marginBottom: Spacing[2],
  },
  pointsValue: {
    ...TextVariants.display,
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  levelLabel: {
    ...TextVariants.labelMd,
    marginTop: Spacing[1],
  },
});
