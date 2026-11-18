import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { FontWeights, TextVariants } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export interface LeaderboardRowProps {
  posicion: number;
  nombre: string;
  puntos: number;
  nivel: number;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  posicion,
  nombre,
  puntos,
  nivel,
}) => {
  const { theme } = useThemeContext();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.leaderboardRow,
        { borderBottomColor: colors.border },
      ]}
    >
      <View style={[styles.rankBadge, { backgroundColor: colors.brandAccent }]}>
        <Text style={[styles.rankNumber, { color: colors.textOnAccent }]}>
          {posicion}
        </Text>
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowName, { color: colors.textPrimary }]}>
          {nombre}
        </Text>
        <Text style={[styles.rowLevel, { color: colors.textMuted }]}>
          Nivel {nivel}
        </Text>
      </View>
      <View style={styles.rowPoints}>
        <Text style={[styles.pointsValue, { color: colors.brandAccent }]}>
          {puntos}
        </Text>
        <Text style={[styles.pointsLabel, { color: colors.textMuted }]}>
          XP
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  leaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[3],
  },
  rankNumber: {
    ...TextVariants.labelMd,
    fontWeight: FontWeights.bold,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    ...TextVariants.bodyMd,
    fontWeight: FontWeights.medium,
  },
  rowLevel: {
    ...TextVariants.bodySm,
  },
  rowPoints: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    ...TextVariants.labelMd,
    fontWeight: FontWeights.bold,
  },
  pointsLabel: {
    ...TextVariants.caption,
  },
});
