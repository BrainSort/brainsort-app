/**
 * PseudocodePanel.tsx
 * BrainSort — Panel de pseudocódigo sincronizado con la simulación
 *
 * Resalta la línea activa del pseudocódigo según el paso actual.
 * Usa ScrollView para algoritmos con muchas líneas.
 * Indentación proporcional al nivel del código.
 *
 * Referencia: library-simulation.spec.md §2 HU-04
 *             library.service.ts PseudocodeLine interface
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { PseudocodeLine } from '../../services/library.service';
import type { SimulationStep } from '@brainsort/core';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PseudocodePanelProps {
  lines: PseudocodeLine[];
  currentStep: SimulationStep | null;
  showInlineValues?: boolean;
  onToggleInlineValues?: () => void;
  maxHeight?: number;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const INDENT_UNIT = 16; // dp por nivel de indentación
const LINE_HEIGHT = 26;
const VISIBLE_CODE_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: BorderWidths.thin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  scroll: { flex: 1 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: Spacing[3],
    minHeight: LINE_HEIGHT,
  },
  lineActive: {
    borderLeftWidth: 3,
  },
  lineNumber: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
    width: 28,
    textAlign: 'right',
    paddingRight: Spacing[2],
  },
  lineText: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
  },
  lineTextActive: { fontWeight: FontWeights.semiBold },
  inlineVal: {
    fontSize: 11,
    opacity: 0.55,
    fontFamily: FontFamilies.mono,
  },
  inlineValLow: {
    color: '#38BDF8',
  },
  inlineValHigh: {
    color: '#C084FC',
  },
  inlineValMid: {
    color: '#FB923C',
  },
  zoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1.5],
  },
  zoomButton: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    borderWidth: BorderWidths.thin,
  },
  zoomButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.bold,
    fontSize: 10,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  lines,
  currentStep,
  showInlineValues = false,
  onToggleInlineValues,
  maxHeight = 220,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const scrollRef = useRef<ScrollView>(null);
  const [baseFontSize, setBaseFontSize] = useState(13); // Default 13px

  const handleZoomIn = () => {
    setBaseFontSize((prev) => Math.min(20, prev + 1));
  };
  const handleZoomOut = () => {
    setBaseFontSize((prev) => Math.max(10, prev - 1));
  };

  const lineFontSize = baseFontSize;
  const inlineValFontSize = Math.max(8, baseFontSize - 2);

  const renderLineText = (text: string) => {
    if (!showInlineValues) {
      return text;
    }

    const variables: Record<string, number> = {};

    // 1. Extract values from stepMarkers
    const stepMarkers = currentStep?.marcadores ?? (currentStep as any)?.markers;
    if (currentStep && stepMarkers) {
      for (const m of stepMarkers) {
        const label = m.label;
        const index = m.index;

        if (label === 'low') {
          variables['low'] = index;
        } else if (label === 'high') {
          variables['high'] = index;
        } else if (label === 'mid') {
          variables['mid'] = index;
        } else if (label === 'L/H') {
          variables['low'] = index;
          variables['high'] = index;
        } else if (label === 'L/M/H') {
          variables['low'] = index;
          variables['high'] = index;
          variables['mid'] = index;
        } else if (label === 'L/M') {
          variables['low'] = index;
          variables['mid'] = index;
        } else if (label === 'M/H') {
          variables['mid'] = index;
          variables['high'] = index;
        } else if (label) {
          variables[label.toLowerCase()] = index;
        }
      }
    }

    // 2. Extract array length as 'n'
    const arrLength =
      (currentStep as any)?.valores?.length ??
      (currentStep as any)?.estadoArray?.length ??
      null;
    if (arrLength !== null) {
      variables['n'] = arrLength;
    }

    const varNames = Object.keys(variables);
    if (varNames.length === 0) {
      return text;
    }

    const getVariableColor = (name: string) => {
      switch (name) {
        case 'low':
          return '#00D4FF'; // Cyan
        case 'high':
          return '#A855F7'; // Purple
        case 'mid':
          return '#FB923C'; // Orange
        case 'i':
          return '#F43F5E'; // Rose
        case 'j':
          return '#10B981'; // Emerald
        case 'n':
          return '#3B82F6'; // Blue
        default:
          return '#94A3B8'; // Slate/Muted
      }
    };

    // Sort variable names by length descending to prevent substring mismatch (e.g. 'mid' before 'm')
    const sortedVarNames = [...varNames].sort((a, b) => b.length - a.length);

    // Escape variable names for RegExp
    const escapedNames = sortedVarNames.map((name) =>
      name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    );

    const regex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'g');
    const parts = text.split(regex);

    return parts.map((part, idx) => {
      const cleanPart = part.toLowerCase();
      if (variables[cleanPart] !== undefined) {
        const val = variables[cleanPart];
        return (
          <Text key={idx}>
            {part}
            <Text style={[styles.inlineVal, { color: getVariableColor(cleanPart), fontSize: inlineValFontSize }]}>
              :{val}
            </Text>
          </Text>
        );
      }
      return part;
    });
  };
  const activeLine =
    (currentStep as any)?.pseudocodeLine ??
    (currentStep as any)?.lineaPseudocodigo ??
    -1;
  const activeIndex = lines.findIndex((lineObj) => lineObj.line === activeLine);

  // Auto-scroll a la línea activa
  useEffect(() => {
    if (activeIndex >= 0 && scrollRef.current) {
      const centeredOffset = activeIndex * LINE_HEIGHT - VISIBLE_CODE_HEIGHT / 2 + LINE_HEIGHT / 2;
      scrollRef.current.scrollTo({
        y: Math.max(0, centeredOffset),
        animated: true,
      });
    }
  }, [activeIndex, lines.length]);

  if (!lines || lines.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        {
          maxHeight,
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
        },
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing[2] }}>
          <Svg width={15} height={15} viewBox="0 0 24 24" fill="none">
            <Path
              d="m18 16 4-4-4-4"
              stroke={colors.brandAccent}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="m6 8-4 4 4 4"
              stroke={colors.brandAccent}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="m14.5 4-5 16"
              stroke={colors.brandAccent}
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text style={[styles.headerText, { color: colors.textMuted }]}>
            Pseudocódigo
          </Text>
        </View>
        <View style={styles.zoomRow}>
          {onToggleInlineValues && (
            <TouchableOpacity
              style={[
                styles.zoomButton,
                {
                  borderColor: showInlineValues
                    ? colors.chipActiveBorder
                    : colors.border,
                  backgroundColor: showInlineValues
                    ? colors.chipActiveBg
                    : colors.surfaceElevated,
                },
                Platform.OS === 'web'
                  ? ({ outlineStyle: 'none', outlineWidth: 0 } as any)
                  : null,
              ]}
              onPress={onToggleInlineValues}
              accessibilityRole="button"
              accessibilityLabel="Activar/desactivar valores de variables inline"
              testID="btn-toggle-vars"
            >
              <Text
                style={[
                  styles.zoomButtonText,
                  {
                    color: showInlineValues
                      ? colors.brandAccent
                      : colors.textSecondary,
                  },
                ]}
              >
                {showInlineValues ? 'Var: On' : 'Var: Off'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.zoomButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceElevated,
              },
            ]}
            onPress={handleZoomOut}
            accessibilityRole="button"
            accessibilityLabel="Disminuir tamaño de letra"
            testID="btn-zoom-out"
          >
            <Text style={[styles.zoomButtonText, { color: colors.textSecondary }]}>
              A-
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.zoomButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceElevated,
              },
            ]}
            onPress={handleZoomIn}
            accessibilityRole="button"
            accessibilityLabel="Aumentar tamaño de letra"
            testID="btn-zoom-in"
          >
            <Text style={[styles.zoomButtonText, { color: colors.textSecondary }]}>
              A+
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={true}
        persistentScrollbar={true}
        nestedScrollEnabled
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          nestedScrollEnabled
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ flexGrow: 1 }}>
            {lines.map((lineObj) => {
              const isActive = lineObj.line === activeLine;
              return (
                <View
                  key={lineObj.line}
                  style={[
                    styles.line,
                    isActive && [
                      styles.lineActive,
                      {
                        backgroundColor: colors.chipActiveBg,
                        borderLeftColor: colors.brandAccent,
                      },
                    ],
                  ]}
                  accessibilityLabel={`Línea ${lineObj.line}: ${lineObj.text}`}
                >
                  <Text
                    style={[
                      styles.lineNumber,
                      {
                        color: isActive ? colors.brandAccent : colors.textDisabled,
                        fontSize: lineFontSize - 2,
                      },
                    ]}
                  >
                    {lineObj.line}
                  </Text>
                  <Text
                    style={[
                      styles.lineText,
                      isActive && styles.lineTextActive,
                      {
                        color: isActive ? colors.textPrimary : colors.textSecondary,
                        paddingLeft: lineObj.indent * INDENT_UNIT,
                        fontSize: lineFontSize,
                      },
                    ]}
                  >
                    {renderLineText(lineObj.text)}
                  </Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
};
