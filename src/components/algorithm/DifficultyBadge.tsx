/**
 * DifficultyBadge.tsx
 * BrainSort — Indicador visual de dificultad de algoritmo
 *
 * task_breakdown.md T-FE-063
 *
 * Muestra un chip de color con el nivel de dificultad:
 *   - Facil   → Verde (#7ED321)
 *   - Medio   → Amarillo (#F5A623)
 *   - Dificil → Rojo (#D0021B)
 *
 * Intencionalmente no usa ThemeContext para poder ser un
 * componente "dumb" puro, sin dependencias de contexto.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Dificultad = 'Facil' | 'Medio' | 'Dificil';

export interface DifficultyBadgeProps {
  dificultad: Dificultad;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<
  Dificultad,
  { label: string; color: string; background: string }
> = {
  Facil: {
    label: 'Fácil',
    color: SimulationColors.final,         // #7ED321 verde
    background: 'rgba(126, 211, 33, 0.15)',
  },
  Medio: {
    label: 'Medio',
    color: SimulationColors.comparacion,   // #F5A623 amarillo
    background: 'rgba(245, 166, 35, 0.15)',
  },
  Dificil: {
    label: 'Difícil',
    color: SimulationColors.intercambio,   // #D0021B rojo
    background: 'rgba(208, 2, 27, 0.15)',
  },
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[2],   // 8 dp
    paddingVertical: Spacing[1],     // 4 dp
    borderWidth: 1,
  },
  label: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,          // 10 dp — caption size
    letterSpacing: 0.4,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Chip de nivel de dificultad con color semántico.
 *
 * @example
 * <DifficultyBadge dificultad="Facil" />
 * <DifficultyBadge dificultad="Dificil" />
 */
export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  dificultad,
}) => {
  const config = DIFFICULTY_CONFIG[dificultad];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.background,
          borderColor: config.color,
        },
      ]}
      accessibilityLabel={`Dificultad: ${config.label}`}
      accessibilityRole="text"
    >
      <Text style={[styles.label, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};
