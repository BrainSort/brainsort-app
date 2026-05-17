/**
 * LinearStructureCanvas.tsx
 * BrainSort — Canvas de animación para Estructuras Lineales
 *
 * Renderiza visualmente:
 *   - Stack: bloques apilados verticalmente, top resaltado
 *   - Queue: nodos en fila horizontal con punteros head/tail
 *   - Linked List: cajas de nodos conectadas con flechas
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Accent, DarkSurfaces, DarkText, Semantic, SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SimulationStep {
  tipoOperacion: 'comparacion' | 'intercambio' | 'insercion' | 'final' | 'idle';
  indicesActivos: number[];
  estadoArray: number[];
  lineaPseudocodigo?: number;
}

interface Props {
  step: SimulationStep | null;
  isCompleted: boolean;
  algorithmName: string; // 'Stack' | 'Queue' | 'Linked List'
  height?: number;
}

// ─── Colores ──────────────────────────────────────────────────────────────────

const getNodeColor = (
  idx: number,
  indicesActivos: number[],
  tipoOperacion: string,
  isCompleted: boolean,
) => {
  if (isCompleted) return SimulationColors.final;
  if (!indicesActivos.includes(idx)) return DarkSurfaces.surface;
  if (tipoOperacion === 'insercion') return Accent[500];
  if (tipoOperacion === 'intercambio') return Semantic.error;
  if (tipoOperacion === 'comparacion') return SimulationColors.comparacion;
  return DarkSurfaces.surfaceHighlight;
};

const getNodeBorderColor = (
  idx: number,
  indicesActivos: number[],
  tipoOperacion: string,
  isCompleted: boolean,
) => {
  if (isCompleted) return SimulationColors.final;
  if (indicesActivos.includes(idx)) {
    if (tipoOperacion === 'insercion') return Accent[500];
    if (tipoOperacion === 'intercambio') return Semantic.error;
    return SimulationColors.comparacion;
  }
  return DarkSurfaces.border;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StackCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';
  const topIdx = items.length - 1;

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Stack vacío</Text>
      </View>
    );
  }

  return (
    <View style={styles.stackContainer}>
      {/* Label HEAD */}
      <View style={styles.pointerRow}>
        <Text style={styles.pointerLabel}>← TOP</Text>
      </View>

      {/* Renderizar items de arriba a abajo (top primero) */}
      {[...items].reverse().map((val, reversedIdx) => {
        const idx = items.length - 1 - reversedIdx;
        const isTop = idx === topIdx;
        const bgColor = getNodeColor(idx, active, op, isCompleted);
        const borderColor = getNodeBorderColor(idx, active, op, isCompleted);

        return (
          <View
            key={`stack-${idx}-${val}`}
            style={[
              styles.stackNode,
              { backgroundColor: bgColor, borderColor },
              isTop && styles.stackNodeTop,
            ]}
          >
            <Text style={styles.nodeValue}>{val}</Text>
            {isTop && <Text style={styles.topLabel}>TOP</Text>}
          </View>
        );
      })}

      {/* Base de la pila */}
      <View style={styles.stackBase} />
    </View>
  );
}

function QueueCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Queue vacía</Text>
      </View>
    );
  }

  return (
    <View style={styles.queueWrapper}>
      {/* Puntero HEAD */}
      <View style={styles.queuePointers}>
        <Text style={styles.pointerLabel}>HEAD ↓</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.pointerLabel}>↓ TAIL</Text>
      </View>

      {/* Nodos de la cola */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.queueContainer}>
        {items.map((val, idx) => {
          const bgColor = getNodeColor(idx, active, op, isCompleted);
          const borderColor = getNodeBorderColor(idx, active, op, isCompleted);
          const isHead = idx === 0;
          const isTail = idx === items.length - 1;

          return (
            <View key={`queue-${idx}-${val}`} style={styles.queueNodeWrapper}>
              <View style={[styles.queueNode, { backgroundColor: bgColor, borderColor }]}>
                <Text style={styles.nodeValue}>{val}</Text>
                {isHead && <Text style={styles.topLabel}>H</Text>}
                {isTail && <Text style={[styles.topLabel, { color: Accent[300] }]}>T</Text>}
              </View>
              {/* Flecha → entre nodos */}
              {idx < items.length - 1 && (
                <Text style={styles.arrow}>→</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Dirección etiquetas */}
      <View style={styles.queueDirectionLabels}>
        <Text style={styles.directionLabel}>↑ dequeue()</Text>
        <View style={{ flex: 1 }} />
        <Text style={styles.directionLabel}>enqueue() ↑</Text>
      </View>
    </View>
  );
}

function LinkedListCanvas({ step, isCompleted }: { step: SimulationStep | null; isCompleted: boolean }) {
  const items = step?.estadoArray ?? [];
  const active = step?.indicesActivos ?? [];
  const op = step?.tipoOperacion ?? 'idle';

  if (items.length === 0) {
    return (
      <View style={styles.emptyMessage}>
        <Text style={styles.emptyText}>Lista vacía</Text>
      </View>
    );
  }

  return (
    <View style={styles.linkedListWrapper}>
      {/* Puntero HEAD */}
      <Text style={styles.pointerLabel}>HEAD</Text>
      <Text style={[styles.pointerLabel, { marginBottom: 8 }]}>↓</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linkedListContainer}>
        {items.map((val, idx) => {
          const bgColor = getNodeColor(idx, active, op, isCompleted);
          const borderColor = getNodeBorderColor(idx, active, op, isCompleted);
          const isHead = idx === 0;

          return (
            <View key={`node-${idx}-${val}`} style={styles.llNodeWrapper}>
              {/* Nodo: [valor | →] */}
              <View style={[styles.llNode, { borderColor }]}>
                <View style={[styles.llNodeValue, { backgroundColor: bgColor }]}>
                  <Text style={styles.nodeValue}>{val}</Text>
                  {isHead && <Text style={styles.topLabel}>HEAD</Text>}
                </View>
                <View style={styles.llNodePointer}>
                  <Text style={styles.llPointerText}>→</Text>
                </View>
              </View>

              {/* Flecha entre nodos */}
              {idx < items.length - 1 && (
                <Text style={styles.llArrow}>─</Text>
              )}
            </View>
          );
        })}

        {/* NULL terminal */}
        <View style={styles.llNullNode}>
          <Text style={styles.llNullText}>NULL</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export function LinearStructureCanvas({ step, isCompleted, algorithmName, height = 220 }: Props) {
  const renderCanvas = () => {
    switch (algorithmName) {
      case 'Stack':
        return <StackCanvas step={step} isCompleted={isCompleted} />;
      case 'Queue':
        return <QueueCanvas step={step} isCompleted={isCompleted} />;
      case 'Linked List':
        return <LinkedListCanvas step={step} isCompleted={isCompleted} />;
      default:
        return (
          <View style={styles.emptyMessage}>
            <Text style={styles.emptyText}>Estructura no reconocida: {algorithmName}</Text>
          </View>
        );
    }
  };

  // Badge de operación actual
  const opLabel = step ? {
    insercion: '⬆ Push / Insert',
    intercambio: '⬇ Pop / Dequeue',
    comparacion: '👁 Inspeccionar',
    final: '✅ Completado',
    idle: '',
  }[step.tipoOperacion] : '';

  return (
    <View style={[styles.container, { minHeight: height }]}>
      {opLabel ? (
        <View style={styles.opBadge}>
          <Text style={styles.opBadgeText}>{opLabel}</Text>
        </View>
      ) : null}
      {renderCanvas()}
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
  },
  emptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[6],
  },
  emptyText: {
    color: DarkText.muted,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.regular,
  },
  opBadge: {
    position: 'absolute',
    top: 4,
    right: 8,
    backgroundColor: 'rgba(0,212,255,0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Accent[500],
  },
  opBadgeText: {
    color: Accent[400],
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
  },

  // Stack styles
  stackContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing[4],
  },
  pointerRow: {
    alignSelf: 'flex-start',
    marginLeft: 80,
    marginBottom: 2,
  },
  pointerLabel: {
    color: Accent[400],
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
  },
  stackNode: {
    width: 120,
    height: 40,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    flexDirection: 'row',
    gap: Spacing[2],
    paddingHorizontal: Spacing[2],
  },
  stackNodeTop: {
    borderStyle: 'dashed' as any,
    shadowColor: Accent[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  topLabel: {
    color: Accent[300],
    fontSize: 9,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },
  stackBase: {
    width: 130,
    height: 4,
    backgroundColor: DarkText.muted,
    borderRadius: 2,
    marginTop: 2,
  },
  nodeValue: {
    color: DarkText.primary,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
  },

  // Queue styles
  queueWrapper: {
    width: '100%',
    paddingHorizontal: Spacing[2],
  },
  queuePointers: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[2],
    marginBottom: 2,
  },
  queueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
  },
  queueNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueNode: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    color: DarkText.muted,
    fontSize: FontSizes.lg,
    marginHorizontal: 2,
  },
  queueDirectionLabels: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[2],
    marginTop: 4,
  },
  directionLabel: {
    color: DarkText.muted,
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.regular,
  },

  // Linked List styles
  linkedListWrapper: {
    width: '100%',
    paddingHorizontal: Spacing[2],
    alignItems: 'flex-start',
  },
  linkedListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[1],
  },
  llNodeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  llNode: {
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    height: 56,
  },
  llNodeValue: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  llNodePointer: {
    width: 28,
    backgroundColor: DarkSurfaces.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: DarkSurfaces.border,
  },
  llPointerText: {
    color: Accent[400],
    fontSize: FontSizes.sm,
  },
  llArrow: {
    color: DarkText.muted,
    fontSize: FontSizes.lg,
    marginHorizontal: 1,
    letterSpacing: -2,
  },
  llNullNode: {
    width: 52,
    height: 56,
    borderWidth: 2,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed' as any,
    marginLeft: 2,
  },
  llNullText: {
    color: DarkText.muted,
    fontSize: 10,
    fontFamily: FontFamilies.mono,
  },
});
