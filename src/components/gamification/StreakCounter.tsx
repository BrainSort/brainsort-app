import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface StreakCounterProps {
  racha: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ racha }) => {
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
        Racha de Días
      </Text>
      <View style={styles.streakRow}>
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={styles.streakCopy}>
          <Text style={[styles.streakValue, { color: colors.brandAccent }]}>
            {racha}
          </Text>
          <Text style={[styles.streakUnit, { color: colors.textMuted }]}>
            {racha === 1 ? 'día consecutivo' : 'días consecutivos'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    justifyContent: 'center',
  },
  cardTitle: {
    ...TextVariants.labelMd,
    marginBottom: Spacing[3],
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  streakIcon: {
    fontSize: 32,
  },
  streakCopy: {
    flexDirection: 'column',
  },
  streakValue: {
    ...TextVariants.h2,
    fontWeight: FontWeights.bold,
    fontVariant: ['tabular-nums'],
  },
  streakUnit: {
    ...TextVariants.bodySm,
  },
});
