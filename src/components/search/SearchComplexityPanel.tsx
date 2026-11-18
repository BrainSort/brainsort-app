/**
 * SearchComplexityPanel.tsx
 * Panel didáctico interactivo que explica la complejidad temporal y espacial
 * comparando Búsqueda Lineal O(N) vs Búsqueda Binaria O(log N).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import { Semantic } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

interface SearchComplexityPanelProps {
  algorithmName?: string;
  arrayLength?: number;
}

export const SearchComplexityPanel: React.FC<SearchComplexityPanelProps> = ({
  algorithmName,
  arrayLength = 10,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const isBinary = algorithmName === 'Binary Search';
  const worstCaseLinear = arrayLength;
  const worstCaseBinary = Math.ceil(Math.log2(arrayLength || 1));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
      testID="search-complexity-panel"
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Complejidad Teórica & Comparativa
        </Text>
        <View
          style={[
            styles.badgeActive,
            {
              backgroundColor: colors.chipActiveBg,
              borderColor: colors.chipActiveBorder,
            },
          ]}
        >
          <Text style={[styles.badgeActiveText, { color: colors.brandAccent }]}>
            {isBinary ? 'O(log N) — Rápida' : 'O(N) — Secuencial'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Tarjeta Lineal */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
            !isBinary && {
              borderColor: colors.chipActiveBorder,
              backgroundColor: colors.chipActiveBg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.algoTitle,
                { color: !isBinary ? colors.brandAccent : colors.textSecondary },
              ]}
            >
              Búsqueda Lineal
            </Text>
            {!isBinary && (
              <Text
                style={[
                  styles.activeTag,
                  {
                    backgroundColor: colors.brandAccent,
                    color: colors.textInverse,
                  },
                ]}
              >
                Actual
              </Text>
            )}
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Tiempo (Peor Caso):
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              O(N)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Espacio:
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              O(1)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Condición previa:
            </Text>
            <Text style={styles.statConditionGood}>Ninguna (datos arbitrarios)</Text>
          </View>
          <View
            style={[
              styles.exampleRow,
              { borderTopColor: colors.borderSubtle },
            ]}
          >
            <Text style={[styles.exampleText, { color: colors.textMuted }]}>
              Para N = {arrayLength}: máx. {worstCaseLinear} comparaciones
            </Text>
          </View>
        </View>

        {/* Tarjeta Binaria */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
            isBinary && {
              borderColor: colors.chipActiveBorder,
              backgroundColor: colors.chipActiveBg,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text
              style={[
                styles.algoTitle,
                { color: isBinary ? colors.brandAccent : colors.textSecondary },
              ]}
            >
              Búsqueda Binaria
            </Text>
            {isBinary && (
              <Text
                style={[
                  styles.activeTag,
                  {
                    backgroundColor: colors.brandAccent,
                    color: colors.textInverse,
                  },
                ]}
              >
                Actual
              </Text>
            )}
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Tiempo (Peor Caso):
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              O(log N)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Espacio:
            </Text>
            <Text style={[styles.statValue, { color: colors.textPrimary }]}>
              O(1)
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Condición previa:
            </Text>
            <Text style={styles.statConditionRequired}>
              Arreglo ordenado obligatorio
            </Text>
          </View>
          <View
            style={[
              styles.exampleRow,
              { borderTopColor: colors.borderSubtle },
            ]}
          >
            <Text style={[styles.exampleText, { color: colors.textMuted }]}>
              Para N = {arrayLength}: máx. {worstCaseBinary} comparaciones
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
    marginVertical: Spacing[2],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  badgeActive: {
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
  },
  badgeActiveText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    flex: 1,
    minWidth: 260,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  algoTitle: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  activeTag: {
    fontFamily: FontFamilies.medium,
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
  },
  statValue: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  statConditionGood: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    color: Semantic.success,
  },
  statConditionRequired: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    color: Semantic.warning,
  },
  exampleRow: {
    marginTop: Spacing[1],
    paddingTop: Spacing[2],
    borderTopWidth: 1,
  },
  exampleText: {
    fontFamily: FontFamilies.mono,
    fontSize: 11,
  },
});
