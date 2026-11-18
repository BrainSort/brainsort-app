/**
 * DifficultyBadge.tsx
 * BrainSort — Indicador visual de dificultad de algoritmo
 *
 * task_breakdown.md T-FE-063
 *
 * Muestra un chip de color con el nivel de dificultad:
 *   - Facil   → Verde semántico
 *   - Medio   → Cian semántico
 *   - Dificil → Rojo semántico
 *
 * Adapta los colores al modo activo (dark / light) para garantizar
 * contraste WCAG AA (>= 4.5:1) sobre el fondo de la píldora.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeContext } from '../../context/ThemeContext';
import type { ThemeMode } from '../../styles/theme';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Dificultad = 'Facil' | 'Medio' | 'Dificil';

export interface DifficultyBadgeProps {
  dificultad: Dificultad;
}

export interface DifficultyStyleConfig {
  label: string;
  color: string;
  background: string;
  border: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const DIFFICULTY_THEME_CONFIG: Record<
  ThemeMode,
  Record<Dificultad, DifficultyStyleConfig>
> = {
  dark: {
    Facil: {
      label: 'Fácil',
      color: '#B7FF55',
      background: 'rgba(166, 255, 46, 0.16)',
      border: 'rgba(166, 255, 46, 0.38)',
    },
    Medio: {
      label: 'Medio',
      color: '#3CE2F5',
      background: 'rgba(25, 191, 210, 0.16)',
      border: 'rgba(25, 191, 210, 0.38)',
    },
    Dificil: {
      label: 'Difícil',
      color: '#FF6B7A',
      background: 'rgba(255, 107, 122, 0.16)',
      border: 'rgba(255, 107, 122, 0.40)',
    },
  },
  light: {
    Facil: {
      label: 'Fácil',
      color: '#1E6B12',
      background: 'rgba(91, 190, 55, 0.14)',
      border: 'rgba(30, 107, 18, 0.28)',
    },
    Medio: {
      label: 'Medio',
      color: '#096875',
      background: 'rgba(25, 191, 210, 0.14)',
      border: 'rgba(9, 104, 117, 0.28)',
    },
    Dificil: {
      label: 'Difícil',
      color: '#A80016',
      background: 'rgba(208, 2, 27, 0.10)',
      border: 'rgba(168, 0, 22, 0.28)',
    },
  },
};

/** Alias de compatibilidad hacia atrás (modo oscuro por defecto) */
export const DIFFICULTY_CONFIG: Record<Dificultad, DifficultyStyleConfig> =
  DIFFICULTY_THEME_CONFIG.dark;

/** Normaliza valores de API o legacy al enum de dificultad. */
export function normalizeDificultad(value?: string): Dificultad {
  if (!value) return 'Facil';
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (normalized.includes('dific')) return 'Dificil';
  if (normalized.includes('medi')) return 'Medio';
  return 'Facil';
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1.5],
    borderWidth: 1,
    maxWidth: 152,
  },
  label: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.sm,
    lineHeight: 14,
    letterSpacing: 0.2,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Chip de nivel de dificultad con color semántico y contraste >= 4.5:1.
 *
 * @example
 * <DifficultyBadge dificultad="Facil" />
 * <DifficultyBadge dificultad="Dificil" />
 */
export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  dificultad,
}) => {
  const { mode } = useThemeContext();
  const config = DIFFICULTY_THEME_CONFIG[mode][dificultad];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.background,
          borderColor: config.border,
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
