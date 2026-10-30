/**
 * SearchTargetInput.tsx
 * Control interactivo para:
 * 1. Establecer el valor objetivo (target) a buscar.
 * 2. Sugerir un objetivo aleatorio con 🎲.
 * 3. Notificar y ofrecer botón "Ordenar datos" si el arreglo está desordenado para Búsqueda Binaria.
 */

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
} from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

interface SearchTargetInputProps {
  targetInput: string;
  onTargetChange: (value: string) => void;
  onRandomTarget: () => void;
  isBinarySearch: boolean;
  isSorted: boolean;
  onAutoSort: () => void;
  disabled?: boolean;
}

export const SearchTargetInput: React.FC<SearchTargetInputProps> = ({
  targetInput,
  onTargetChange,
  onRandomTarget,
  isBinarySearch,
  isSorted,
  onAutoSort,
  disabled = false,
}) => {
  return (
    <View style={styles.container} testID="search-target-section">
      <View style={styles.row}>
        {/* Input Target */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor objetivo (Target)</Text>
          <View style={styles.inputShell}>
            <TextInput
              style={styles.textInput}
              value={targetInput}
              onChangeText={onTargetChange}
              placeholder="Ej. 42"
              placeholderTextColor={DarkText.muted}
              keyboardType="numeric"
              editable={!disabled}
              testID="input-target-value"
              accessibilityLabel="Valor objetivo a buscar"
            />
            <TouchableOpacity
              style={styles.diceButton}
              onPress={onRandomTarget}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Elegir objetivo aleatorio del arreglo"
              testID="btn-random-target"
            >
              <Text style={styles.diceIcon}>🎲</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Acciones adicionales o botón de auto-ordenar */}
        {isBinarySearch && (
          <View style={styles.sortActionGroup}>
            <Text style={styles.label}>Requisito de orden</Text>
            <TouchableOpacity
              style={[
                styles.sortButton,
                isSorted ? styles.sortButtonDisabled : styles.sortButtonActive,
              ]}
              onPress={onAutoSort}
              disabled={disabled || isSorted}
              accessibilityRole="button"
              testID="btn-auto-sort"
            >
              <Text style={styles.sortButtonIcon}>{isSorted ? '✓' : '⚡'}</Text>
              <Text
                style={[
                  styles.sortButtonText,
                  isSorted && styles.sortButtonTextDisabled,
                ]}
              >
                {isSorted ? 'Arreglo ordenado' : 'Ordenar datos'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Nota educativa para búsqueda binaria */}
      {isBinarySearch && !isSorted && (
        <View style={styles.unsortedWarning}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            La Búsqueda Binaria requiere datos ordenados. Si inicias la búsqueda, se auto-ordenará automáticamente.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing[2],
    marginVertical: Spacing[1],
  },
  row: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  inputGroup: {
    flex: 1,
    minWidth: 160,
    gap: Spacing[1],
  },
  sortActionGroup: {
    minWidth: 160,
    gap: Spacing[1],
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
    color: DarkText.secondary,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1318',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 42,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: Spacing[3],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.primary,
  },
  diceButton: {
    width: 40,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: DarkSurfaces.border,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  diceIcon: {
    fontSize: 16,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    height: 42,
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sortButtonActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderColor: Accent[500],
  },
  sortButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: DarkSurfaces.border,
  },
  sortButtonIcon: {
    fontSize: 14,
    color: Accent[500],
  },
  sortButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    color: Accent[500],
  },
  sortButtonTextDisabled: {
    color: DarkText.muted,
  },
  unsortedWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
    borderColor: 'rgba(245, 166, 35, 0.3)',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing[2],
  },
  warningIcon: {
    fontSize: 14,
  },
  warningText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: Semantic.warning,
    flex: 1,
  },
});
