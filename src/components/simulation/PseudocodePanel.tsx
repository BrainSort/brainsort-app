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

import React, { useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { DarkSurfaces, DarkText, Accent } from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { PseudocodeLine } from '../../services/library.service';
import type { SimulationStep } from '@brainsort/core';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface PseudocodePanelProps {
  lines: PseudocodeLine[];
  currentStep: SimulationStep | null;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const INDENT_UNIT = 16; // dp por nivel de indentación
const LINE_HEIGHT = 26;
const VISIBLE_CODE_HEIGHT = 170;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F1318',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkSurfaces.borderSubtle,
    maxHeight: 220,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: BorderWidths.thin,
    borderBottomColor: DarkSurfaces.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  headerText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
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
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: Accent[500],
  },
  lineNumber: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
    color: DarkText.disabled,
    width: 28,
    textAlign: 'right',
    paddingRight: Spacing[2],
  },
  lineNumberActive: { color: Accent[500] },
  lineText: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
    flex: 1,
  },
  lineTextActive: { color: '#FFFFFF', fontWeight: FontWeights.semiBold },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  lines,
  currentStep,
}) => {
  const scrollRef = useRef<ScrollView>(null);
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>📋</Text>
        <Text style={styles.headerText}>Pseudocódigo</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {lines.map((lineObj) => {
          const isActive = lineObj.line === activeLine;
          return (
            <View
              key={lineObj.line}
              style={[styles.line, isActive && styles.lineActive]}
              accessibilityLabel={`Línea ${lineObj.line}: ${lineObj.text}`}
            >
              <Text
                style={[
                  styles.lineNumber,
                  isActive && styles.lineNumberActive,
                ]}
              >
                {lineObj.line}
              </Text>
              <Text
                style={[
                  styles.lineText,
                  isActive && styles.lineTextActive,
                  { paddingLeft: lineObj.indent * INDENT_UNIT },
                ]}
                numberOfLines={1}
              >
                {lineObj.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};
