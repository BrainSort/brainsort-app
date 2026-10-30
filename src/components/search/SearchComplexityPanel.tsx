/**
 * SearchComplexityPanel.tsx
 * Panel didáctico interactivo que explica la complejidad temporal y espacial
 * comparando Búsqueda Lineal O(N) vs Búsqueda Binaria O(log N).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DarkSurfaces, DarkText, Accent, Semantic } from '../../styles/colors';
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
  const isBinary = algorithmName === 'Binary Search';
  const worstCaseLinear = arrayLength;
  const worstCaseBinary = Math.ceil(Math.log2(arrayLength || 1));

  return (
    <View style={styles.container} testID="search-complexity-panel">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Complejidad Teórica & Comparativa</Text>
        <View style={styles.badgeActive}>
          <Text style={styles.badgeActiveText}>
            {isBinary ? 'O(log N) — Rápida' : 'O(N) — Secuencial'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        {/* Tarjeta Lineal */}
        <View style={[styles.card, !isBinary && styles.cardHighlighted]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.algoTitle, !isBinary && styles.textAccent]}>
              Búsqueda Lineal
            </Text>
            {!isBinary && <Text style={styles.activeTag}>Actual</Text>}
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tiempo (Peor Caso):</Text>
            <Text style={styles.statValue}>O(N)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Espacio:</Text>
            <Text style={styles.statValue}>O(1)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Condición previa:</Text>
            <Text style={styles.statConditionGood}>Ninguna (datos arbitrarios)</Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleText}>
              Para N = {arrayLength}: máx. {worstCaseLinear} comparaciones
            </Text>
          </View>
        </View>

        {/* Tarjeta Binaria */}
        <View style={[styles.card, isBinary && styles.cardHighlighted]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.algoTitle, isBinary && styles.textAccent]}>
              Búsqueda Binaria
            </Text>
            {isBinary && <Text style={styles.activeTag}>Actual</Text>}
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Tiempo (Peor Caso):</Text>
            <Text style={styles.statValue}>O(log N)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Espacio:</Text>
            <Text style={styles.statValue}>O(1)</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Condición previa:</Text>
            <Text style={styles.statConditionRequired}>
              Arreglo ordenado obligatorio
            </Text>
          </View>
          <View style={styles.exampleRow}>
            <Text style={styles.exampleText}>
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
    backgroundColor: '#0F1318',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
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
    color: DarkText.primary,
  },
  badgeActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderColor: 'rgba(0, 212, 255, 0.35)',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
  },
  badgeActiveText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: Accent[500],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  card: {
    flex: 1,
    minWidth: 260,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    padding: Spacing[3],
    gap: Spacing[2],
  },
  cardHighlighted: {
    borderColor: Accent[500],
    backgroundColor: 'rgba(0, 212, 255, 0.04)',
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
    color: DarkText.secondary,
  },
  textAccent: {
    color: Accent[500],
  },
  activeTag: {
    fontFamily: FontFamilies.medium,
    fontSize: 10,
    backgroundColor: Accent[500],
    color: '#000000',
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
    color: DarkText.muted,
  },
  statValue: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    color: DarkText.primary,
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
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  exampleText: {
    fontFamily: FontFamilies.mono,
    fontSize: 11,
    color: DarkText.muted,
  },
});
