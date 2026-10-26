/**
 * SearchArrayCanvas.tsx
 * Canvas interactivo para la visualización de algoritmos de Búsqueda Lineal y Binaria.
 * Muestra:
 * - Celdas individuales con su valor y su índice.
 * - Punteros activos: i (Lineal), L, M, R (Binaria).
 * - Celdas descartadas: atenuadas con opacidad reducida y marca de descarte.
 * - Celda encontrada: resaltada en verde con halo de éxito.
 * - Scroll horizontal fluido para cualquier cantidad de elementos.
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SimulationStep } from '@brainsort/core';
import { SearchVisualEngine, SearchCellVisual } from '../../visualization/search/SearchVisualEngine';
import { SearchColors } from '../../visualization/search/searchPalette';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

interface SearchArrayCanvasProps {
  algorithmName?: string;
  step: SimulationStep | null;
  isCompleted: boolean;
  height?: number;
}

export const SearchArrayCanvas: React.FC<SearchArrayCanvasProps> = ({
  algorithmName,
  step,
  isCompleted,
  height = 220,
}) => {
  const frame = SearchVisualEngine.buildFrame(step, algorithmName, isCompleted);
  const isBinary = algorithmName === 'Binary Search';

  if (frame.cells.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>Genera datos para iniciar la búsqueda</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]} testID="search-array-canvas">
      {/* Indicador de estado superior: Objetivo y Comparaciones */}
      <View style={styles.topInfoBar}>
        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeLabel}>Objetivo:</Text>
          <Text style={styles.infoBadgeValue}>
            {frame.objetivo !== undefined ? frame.objetivo : '—'}
          </Text>
        </View>

        <View style={styles.infoBadge}>
          <Text style={styles.infoBadgeLabel}>Comparaciones:</Text>
          <Text style={styles.infoBadgeValue}>{frame.comparaciones}</Text>
        </View>

        {isBinary && frame.mid !== undefined && (
          <View style={[styles.infoBadge, styles.infoBadgeMid]}>
            <Text style={styles.infoBadgeLabel}>mid calculado:</Text>
            <Text style={[styles.infoBadgeValue, { color: SearchColors.mid }]}>
              {frame.mid}
            </Text>
          </View>
        )}
      </View>

      {/* Contenedor scrolleable con las celdas */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.cellsRow}>
          {frame.cells.map((cell: SearchCellVisual) => {
            const isFound = cell.state === 'encontrado';
            const isMid = cell.state === 'mid';
            const isEvaluating = cell.state === 'evaluando';
            const isDiscarded = cell.state === 'descartado';

            return (
              <View key={cell.index} style={styles.cellColumn}>
                {/* 1. Ranura superior de punteros (L, M, R, i) */}
                <View style={styles.pointerSlot}>
                  {cell.pointerLabels.length > 0 && (
                    <View
                      style={[
                        styles.pointerBadge,
                        isFound && styles.pointerFound,
                        isMid && styles.pointerMid,
                        isEvaluating && styles.pointerEvaluating,
                      ]}
                    >
                      <Text
                        style={[
                          styles.pointerText,
                          isFound && styles.pointerTextFound,
                        ]}
                        numberOfLines={1}
                      >
                        {cell.pointerLabels.join('/')}
                      </Text>
                      <Text style={styles.arrowDown}>▼</Text>
                    </View>
                  )}
                </View>

                {/* 2. Caja de la celda con el valor */}
                <View
                  style={[
                    styles.cellBox,
                    isFound && styles.cellBoxFound,
                    isMid && styles.cellBoxMid,
                    isEvaluating && styles.cellBoxEvaluating,
                    isDiscarded && styles.cellBoxDiscarded,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellValue,
                      isFound && styles.cellValueFound,
                      isDiscarded && styles.cellValueDiscarded,
                    ]}
                  >
                    {cell.value}
                  </Text>

                  {/* Línea diagonal para marcar visualmente el descarte */}
                  {isDiscarded && <View style={styles.strikethrough} />}
                </View>

                {/* 3. Índice abajo de la celda */}
                <View style={styles.indexSlot}>
                  <Text
                    style={[
                      styles.indexText,
                      (isFound || isMid || isEvaluating) && styles.indexTextActive,
                      isDiscarded && styles.indexTextDiscarded,
                    ]}
                  >
                    [{cell.index}]
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingVertical: Spacing[2],
  },
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[3],
    flexWrap: 'wrap',
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
  },
  infoBadgeMid: {
    borderColor: 'rgba(0, 212, 255, 0.3)',
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
  },
  infoBadgeLabel: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    color: '#8E9AA8',
  },
  infoBadgeValue: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    color: '#FFFFFF',
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[4],
    minWidth: '100%',
  },
  cellsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  cellColumn: {
    alignItems: 'center',
    width: 48,
  },
  pointerSlot: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  pointerBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    borderColor: SearchColors.activo,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  pointerMid: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderColor: SearchColors.mid,
  },
  pointerEvaluating: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)',
    borderColor: SearchColors.activo,
  },
  pointerFound: {
    backgroundColor: 'rgba(126, 211, 33, 0.25)',
    borderColor: SearchColors.encontrado,
  },
  pointerText: {
    fontFamily: FontFamilies.mono,
    fontWeight: '700',
    fontSize: 10,
    color: '#FFFFFF',
  },
  pointerTextFound: {
    color: SearchColors.encontrado,
  },
  arrowDown: {
    fontSize: 8,
    color: '#FFFFFF',
    marginTop: -2,
  },
  cellBox: {
    width: 44,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(47, 128, 237, 0.2)',
    borderWidth: 1.5,
    borderColor: SearchColors.idle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cellBoxMid: {
    backgroundColor: 'rgba(0, 212, 255, 0.25)',
    borderColor: SearchColors.mid,
    borderWidth: 2,
    shadowColor: SearchColors.mid,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  cellBoxEvaluating: {
    backgroundColor: 'rgba(245, 166, 35, 0.3)',
    borderColor: SearchColors.activo,
    borderWidth: 2,
  },
  cellBoxFound: {
    backgroundColor: 'rgba(126, 211, 33, 0.35)',
    borderColor: SearchColors.encontrado,
    borderWidth: 2.5,
    shadowColor: SearchColors.encontrado,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
  cellBoxDiscarded: {
    backgroundColor: '#0B1017',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    opacity: 0.3,
  },
  cellValue: {
    fontFamily: FontFamilies.mono,
    fontWeight: '700',
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
  cellValueFound: {
    color: SearchColors.encontrado,
    fontWeight: '800',
  },
  cellValueDiscarded: {
    color: '#657383',
  },
  strikethrough: {
    position: 'absolute',
    width: '120%',
    height: 1.5,
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
    transform: [{ rotate: '45deg' }],
  },
  indexSlot: {
    marginTop: 6,
    alignItems: 'center',
  },
  indexText: {
    fontFamily: FontFamilies.mono,
    fontSize: 10,
    color: '#8E9AA8',
  },
  indexTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  indexTextDiscarded: {
    color: '#414D5C',
  },
  emptyText: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    color: '#8E9AA8',
    textAlign: 'center',
    marginVertical: Spacing[10],
  },
});
