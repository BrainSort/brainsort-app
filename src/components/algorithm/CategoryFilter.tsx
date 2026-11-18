/**
 * CategoryFilter.tsx
 * BrainSort — Filtro de categorías para la biblioteca de algoritmos
 *
 * task_breakdown.md T-FE-062
 *
 * Barra horizontal de chips filtrables:
 *   "Todos" | "Ordenamiento" | "Búsqueda" | "Estructuras Lineales"
 *
 * - Resalta el filtro activo con color de acento
 * - Emite `onSelect(categoria | undefined)` al padre
 * - Scroleable horizontalmente en móvil (showsHorizontalScrollIndicator=false)
 *
 * Referencia: library-simulation.spec.md §2 HU-01
 *             task_breakdown.md T-FE-062
 */

import React, { useCallback, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

/** Categorías según el backend spec */
export type Categoria =
  | 'Ordenamiento'
  | 'Busqueda'
  | 'EstructurasLineales'
  | 'EstructurasArboles';

export interface CategoryFilterProps {
  /** Categorías disponibles provenientes de la API */
  categorias: string[];
  /** Categoría actualmente seleccionada (undefined = Todos) */
  selected: string | undefined;
  /** Callback de selección. undefined significa "Todos" */
  onSelect: (categoria: string | undefined) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Mapa de labels amigables para el usuario */
const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras Lineales',
  EstructurasArboles: 'Estructuras de árboles',
};

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function CategoryIcon({
  category,
  color,
}: {
  category: string;
  color: string;
}) {
  const commonProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
  };

  const strokeProps = {
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (category === 'all') {
    return (
      <Svg {...commonProps}>
        <Rect x="3" y="3" width="7" height="7" rx="1.5" {...strokeProps} />
        <Rect x="14" y="3" width="7" height="7" rx="1.5" {...strokeProps} />
        <Rect x="3" y="14" width="7" height="7" rx="1.5" {...strokeProps} />
        <Rect x="14" y="14" width="7" height="7" rx="1.5" {...strokeProps} />
      </Svg>
    );
  }

  if (category === 'Ordenamiento') {
    return (
      <Svg {...commonProps}>
        <Path d="M7 18V6" {...strokeProps} />
        <Path d="M3.5 9.5L7 6l3.5 3.5" {...strokeProps} />
        <Path d="M17 6v12" {...strokeProps} />
        <Path d="M13.5 14.5L17 18l3.5-3.5" {...strokeProps} />
      </Svg>
    );
  }

  if (category === 'Busqueda') {
    return (
      <Svg {...commonProps}>
        <Circle cx="11" cy="11" r="7" {...strokeProps} />
        <Path d="M20 20l-3.5-3.5" {...strokeProps} />
      </Svg>
    );
  }

  if (category === 'EstructurasLineales') {
    return (
      <Svg {...commonProps}>
        <Path d="M4 7h16" {...strokeProps} />
        <Path d="M4 12h16" {...strokeProps} />
        <Path d="M4 17h16" {...strokeProps} />
      </Svg>
    );
  }

  if (category === 'EstructurasArboles') {
    return (
      <Svg {...commonProps}>
        <Circle cx="12" cy="5" r="2.5" {...strokeProps} />
        <Circle cx="6" cy="19" r="2.5" {...strokeProps} />
        <Circle cx="18" cy="19" r="2.5" {...strokeProps} />
        <Path d="M12 7.5V12M12 12H6v4.5M12 12h6v4.5" {...strokeProps} />
      </Svg>
    );
  }

  return (
    <Svg {...commonProps}>
      <Path d="M12 3l8 9-8 9-8-9 8-9z" {...strokeProps} />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing[3],
  },
  scrollContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    borderWidth: BorderWidths.thin,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'background-color, border-color, transform',
        transitionDuration: '160ms',
      } as any,
    }),
  },
  chipLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
  },
  chipLabelActive: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Filtro horizontal de categorías. Poner "Todos" primero siempre.
 *
 * @example
 * <CategoryFilter
 *   categorias={['Ordenamiento', 'Busqueda']}
 *   selected={activeCategory}
 *   onSelect={setActiveCategory}
 * />
 */
export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categorias,
  selected,
  onSelect,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const [focusedKey, setFocusedKey] = useState<string | null>(null);

  const handleAll = useCallback(() => onSelect(undefined), [onSelect]);

  const handleSelect = useCallback(
    (cat: string) => {
      // Toggle: si ya estaba seleccionada, vuelve a "Todos"
      onSelect(selected === cat ? undefined : cat);
    },
    [selected, onSelect],
  );

  const isAllActive = selected === undefined;

  return (
    <View style={styles.container} accessibilityRole="tablist">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Filtros de categoría"
      >
        {/* Chip "Todos" */}
        <Pressable
          style={({ pressed, hovered }: any) => [
            styles.chip,
            {
              backgroundColor: isAllActive
                ? colors.chipActiveBg
                : colors.chipBackground,
              borderColor: isAllActive
                ? colors.chipActiveBorder
                : hovered
                  ? colors.brandAccent
                  : colors.chipBorder,
              opacity: pressed ? 0.8 : 1,
            },
            Platform.OS === 'web' &&
              focusedKey === 'all' &&
              ({
                outlineWidth: 2,
                outlineStyle: 'solid',
                outlineColor: colors.brandAccent,
                outlineOffset: 2,
              } as any),
          ]}
          onPress={handleAll}
          onFocus={() => setFocusedKey('all')}
          onBlur={() => setFocusedKey(null)}
          accessibilityRole="tab"
          accessibilityState={{ selected: isAllActive }}
          accessibilityLabel="Todos los algoritmos"
          testID="category-filter-all"
        >
          <CategoryIcon
            category="all"
            color={isAllActive ? colors.brandAccent : colors.textMuted}
          />
          <Text
            style={[
              styles.chipLabel,
              {
                color: isAllActive
                  ? colors.brandAccent
                  : colors.textSecondary,
              },
              isAllActive && styles.chipLabelActive,
            ]}
          >
            Todos
          </Text>
        </Pressable>

        {/* Chips de categoría */}
        {categorias.map((cat) => {
          const isActive = selected === cat;
          const label = CATEGORY_LABELS[cat] ?? cat;

          return (
            <Pressable
              key={cat}
              style={({ pressed, hovered }: any) => [
                styles.chip,
                {
                  backgroundColor: isActive
                    ? colors.chipActiveBg
                    : colors.chipBackground,
                  borderColor: isActive
                    ? colors.chipActiveBorder
                    : hovered
                      ? colors.brandAccent
                      : colors.chipBorder,
                  opacity: pressed ? 0.8 : 1,
                },
                Platform.OS === 'web' &&
                  focusedKey === cat &&
                  ({
                    outlineWidth: 2,
                    outlineStyle: 'solid',
                    outlineColor: colors.brandAccent,
                    outlineOffset: 2,
                  } as any),
              ]}
              onPress={() => handleSelect(cat)}
              onFocus={() => setFocusedKey(cat)}
              onBlur={() => setFocusedKey(null)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`Filtrar por ${label}`}
              testID={`category-filter-${cat}`}
            >
              <CategoryIcon
                category={cat}
                color={isActive ? colors.brandAccent : colors.textMuted}
              />
              <Text
                style={[
                  styles.chipLabel,
                  {
                    color: isActive
                      ? colors.brandAccent
                      : colors.textSecondary,
                  },
                  isActive && styles.chipLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};
