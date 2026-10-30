/**
 * SearchResultBanner.tsx
 * Notificación visual del resultado de la búsqueda:
 * - Elemento encontrado (índice exacto y número de comparaciones).
 * - Elemento no encontrado (tras agotar comparaciones, sin bloqueos).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Semantic } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

interface SearchResultBannerProps {
  resultado: 'buscando' | 'encontrado' | 'noEncontrado' | 'idle';
  comparaciones: number;
  indiceEncontrado?: number;
  objetivo?: number;
  isCompleted?: boolean;
}

export const SearchResultBanner: React.FC<SearchResultBannerProps> = ({
  resultado,
  comparaciones,
  indiceEncontrado,
  objetivo,
  isCompleted,
}) => {
  if (resultado !== 'encontrado' && resultado !== 'noEncontrado' && !isCompleted) {
    return null;
  }

  const isFound = resultado === 'encontrado';

  return (
    <View
      style={[
        styles.container,
        isFound ? styles.containerSuccess : styles.containerNotFound,
      ]}
      testID="search-result-banner"
      accessibilityRole="alert"
    >
      <View style={styles.iconSlot}>
        <Text style={styles.icon}>{isFound ? '✅' : '❌'}</Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, isFound ? styles.titleSuccess : styles.titleNotFound]}>
          {isFound
            ? `¡Elemento ${objetivo !== undefined ? `"${objetivo}" ` : ''}encontrado!`
            : `Elemento ${objetivo !== undefined ? `"${objetivo}" ` : ''}no encontrado`}
        </Text>
        <Text style={styles.details}>
          {isFound
            ? `Ubicado en el índice ${indiceEncontrado} tras ${comparaciones} ${comparaciones === 1 ? 'comparación' : 'comparaciones'}.`
            : `Se agotaron las comparaciones (${comparaciones}) sin localizar el valor en la colección.`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing[2],
    gap: Spacing[3],
  },
  containerSuccess: {
    backgroundColor: 'rgba(126, 211, 33, 0.1)',
    borderColor: 'rgba(126, 211, 33, 0.4)',
  },
  containerNotFound: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderColor: 'rgba(231, 76, 60, 0.4)',
  },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  titleSuccess: {
    color: Semantic.success,
  },
  titleNotFound: {
    color: Semantic.error,
  },
  details: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: '#DCE6F1',
    lineHeight: 16,
  },
});
