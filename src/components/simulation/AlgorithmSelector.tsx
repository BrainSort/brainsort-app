import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/colors';
import { FontFamilies, FontSizes } from '../../styles/typography';

export type AlgorithmType = 'Bubble Sort' | 'Selection Sort' | 'Insertion Sort';

interface AlgorithmOption {
  id: AlgorithmType;
  name: string;
  description: string;
}

const ALGORITHMS: AlgorithmOption[] = [
  {
    id: 'Bubble Sort',
    name: 'Bubble Sort',
    description: 'Ordena comparando elementos adyacentes e intercambiándolos si están en el orden incorrecto.',
  },
  {
    id: 'Selection Sort',
    name: 'Selection Sort',
    description: 'Encuentra el elemento más pequeño y lo coloca al principio en cada iteración.',
  },
  {
    id: 'Insertion Sort',
    name: 'Insertion Sort',
    description: 'Construye la lista ordenada de uno en uno, insertando cada elemento en su lugar correcto.',
  },
];

interface AlgorithmSelectorProps {
  selectedId: AlgorithmType;
  onSelect: (id: AlgorithmType) => void;
}

/**
 * Selector de algoritmos con estilo de Chips horizontales
 * T-FE-065: Implementación de selección según HU-01
 */
export const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedId,
  onSelect,
}) => {
  const selectedAlgorithm = ALGORITHMS.find(a => a.id === selectedId);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecciona un algoritmo:</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
      >
        {ALGORITHMS.map((algo) => {
          const isSelected = algo.id === selectedId;
          return (
            <TouchableOpacity
              key={algo.id}
              style={[
                styles.chip,
                isSelected && styles.selectedChip
              ]}
              onPress={() => onSelect(algo.id)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                isSelected && styles.selectedChipText
              ]}>
                {algo.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedAlgorithm && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {selectedAlgorithm.description}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    color: ThemeColors.textSecondary,
    marginBottom: 10,
    marginLeft: 4,
  },
  chipsContainer: {
    paddingHorizontal: 4,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedChip: {
    backgroundColor: ThemeColors.primary,
    borderColor: ThemeColors.primary,
    // Efecto de brillo sutil
    shadowColor: ThemeColors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  chipText: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    color: ThemeColors.textSecondary,
  },
  selectedChipText: {
    color: ThemeColors.white,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: ThemeColors.primary,
  },
  descriptionText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: ThemeColors.textSecondary,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
