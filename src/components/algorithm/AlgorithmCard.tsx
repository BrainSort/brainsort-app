/**
 * AlgorithmCard.tsx
 * BrainSort — Tarjeta de algoritmo en la biblioteca
 *
 * task_breakdown.md T-FE-061
 *
 * Muestra (HU-01):
 *   - Nombre del algoritmo
 *   - DifficultyBadge con nivel de dificultad
 *   - Descripción corta (truncada a ≤140 chars)
 *   - Complejidad de tiempo y espacio (Big O)
 *
 * Implementa press (HU-02) que navega al detalle del algoritmo.
 * Soporta Lazy Loading de imagen (si la hay en el futuro).
 *
 * Referencia: library-simulation.spec.md §2 HU-01, HU-02
 */

import React, { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { DifficultyBadge, Dificultad } from './DifficultyBadge';
import { DarkSurfaces, DarkText, Neutral, Primary, Accent } from '../../styles/colors';
import { BorderRadius, Shadows, Spacing, SpacingAlias } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AlgorithmCardProps {
  algoritmo: AlgoritmoEnBiblioteca;
  onPress: (algoritmo: AlgoritmoEnBiblioteca) => void;
  /** Ancho del contenedor para calcular tamaño relativo en grid */
  width?: number;
}

// ─── Constante ────────────────────────────────────────────────────────────────

const MAX_DESC_CHARS = 140;

/** Mapea el campo dificultad del backend al tipo del badge */
const normalizeDificultad = (raw: string | undefined): Dificultad => {
  if (raw === 'Medio') return 'Medio';
  if (raw === 'Dificil') return 'Dificil';
  return 'Facil';
};

/** Mapa de ícono de categoría */
const CATEGORY_ICON: Record<string, string> = {
  Ordenamiento: '⇅',
  Busqueda: '⌕',
  EstructurasLineales: '≡',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    padding: SpacingAlias.cardPadding,
    margin: SpacingAlias.cardGap / 2,
    ...Platform.select({
      ios: Shadows.sm,
      android: { elevation: Shadows.sm.elevation },
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.28)' } as any,
    }),
  },
  cardPressed: {
    backgroundColor: DarkSurfaces.surfaceHighlight,
    borderColor: Primary[400],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(74, 156, 249, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 18,
    color: Accent[500],
  },
  name: {
    ...TextVariants.h4,
    color: DarkText.primary,
    marginBottom: Spacing[1],
    flex: 1,
    marginRight: Spacing[2],
  },
  description: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    lineHeight: 20,
    marginBottom: Spacing[3],
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto' as any,
    paddingTop: Spacing[2],
    borderTopWidth: 1,
    borderTopColor: DarkSurfaces.borderSubtle,
  },
  complexityGroup: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  complexityItem: {
    alignItems: 'center',
  },
  complexityLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    marginBottom: 2,
  },
  complexityValue: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: Accent[300],
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Primary[500],
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Tarjeta de algoritmo para la biblioteca (HU-01, HU-02).
 *
 * @example
 * <AlgorithmCard
 *   algoritmo={algo}
 *   onPress={(a) => navigation.navigate('AlgorithmDetail', { id: a.id })}
 * />
 */
export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algoritmo,
  onPress,
}) => {
  const [pressed, setPressed] = React.useState(false);

  const handlePress = useCallback(() => {
    onPress(algoritmo);
  }, [algoritmo, onPress]);

  const truncatedDesc =
    algoritmo.descripcion.length > MAX_DESC_CHARS
      ? `${algoritmo.descripcion.slice(0, MAX_DESC_CHARS - 3)}...`
      : algoritmo.descripcion;

  const dificultad = normalizeDificultad((algoritmo as any).dificultad);
  const categoryIcon = CATEGORY_ICON[algoritmo.categoria] ?? '◈';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      accessibilityRole="button"
      accessibilityLabel={`Ver algoritmo ${algoritmo.nombre}, dificultad ${dificultad}`}
      accessibilityHint="Toca dos veces para abrir el detalle del algoritmo"
      testID={`algorithm-card-${algoritmo.id}`}
    >
      <View style={[styles.card, pressed && styles.cardPressed]}>
        {/* Línea de acento superior */}
        <View style={styles.accentLine} />

        {/* Fila superior: icono de categoría + badge de dificultad */}
        <View style={styles.topRow}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryIconText}>{categoryIcon}</Text>
          </View>
          <DifficultyBadge dificultad={dificultad} />
        </View>

        {/* Nombre */}
        <Text style={styles.name} numberOfLines={2}>
          {algoritmo.nombre}
        </Text>

        {/* Descripción truncada */}
        <Text style={styles.description} numberOfLines={3}>
          {truncatedDesc}
        </Text>

        {/* Footer: complejidades */}
        <View style={styles.footer}>
          <View style={styles.complexityGroup}>
            <View style={styles.complexityItem}>
              <Text style={styles.complexityLabel}>Tiempo</Text>
              <Text style={styles.complexityValue}>
                {algoritmo.complejidadTiempo}
              </Text>
            </View>
            <View style={styles.complexityItem}>
              <Text style={styles.complexityLabel}>Espacio</Text>
              <Text style={styles.complexityValue}>
                {algoritmo.complejidadEspacio}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
