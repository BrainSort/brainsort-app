import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SimulationStep, isPasoGrafo } from '@brainsort/core';
import { useThemeContext } from '../../context/ThemeContext';
import { SimulationColors } from '../../styles/colors';
import { AccessibilityIcons } from '../../visualization/AccessibilityIcons';
import { ColorMapper } from '../../visualization/ColorMapper';

export interface FrontierPanelProps {
  algorithmName?: string;
  step: SimulationStep | null;
}

/**
 * T-FE-07: Panel pedagógico que muestra en tiempo real la frontera activa
 * (Cola en BFS / Pila en DFS) y la secuencia cronológica de nodos visitados.
 */
export const FrontierPanel: React.FC<FrontierPanelProps> = ({
  algorithmName = '',
  step,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  if (!step || !isPasoGrafo(step)) {
    return null;
  }

  const isDfs =
    algorithmName.includes('Depth') ||
    algorithmName.includes('DFS') ||
    step.tipoOperacion === 'apilar' ||
    step.tipoOperacion === 'desapilar';

  const isDijkstra =
    algorithmName.toLowerCase().includes('dijkstra') ||
    step.distancias !== undefined;

  const structureTitle = isDijkstra
    ? 'Cola de Prioridad (Min-Heap)'
    : isDfs
    ? 'Pila (LIFO)'
    : 'Cola (FIFO)';
  const frontera = step.frontera ?? [];
  const visitados = step.visitados ?? [];
  const opConfig = ColorMapper.getConfigForOperation(step.tipoOperacion);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Cabecera con nodo actual y tipo de operación */}
      <View style={styles.headerRow}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: colors.surfaceHighlight },
          ]}
        >
          <AccessibilityIcons
            operation={step.tipoOperacion}
            size={14}
            color={colors.textPrimary}
          />
          <Text style={[styles.statusText, { color: colors.textPrimary }]}>
            {opConfig.label}:{' '}
            <Text style={{ color: opConfig.color, fontWeight: '700' }}>
              {step.nodoActual ? `Nodo ${step.nodoActual}` : 'FIN'}
            </Text>
          </Text>
        </View>

        {step.aristaActiva ? (
          <View style={styles.edgeBadge}>
            <Text style={styles.edgeText}>
              Arista activa: {step.aristaActiva[0]} → {step.aristaActiva[1]}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Frontera: Cola, Pila o Min-Heap */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          {structureTitle}:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillContainer}
        >
          {frontera.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              (vacía)
            </Text>
          ) : (
            frontera.map((nodeId, idx) => {
              const nodeDist = step.distancias?.[nodeId] as
                | number
                | null
                | undefined;
              const distLabel =
                nodeDist !== undefined
                  ? ` (d: ${
                      nodeDist === null || !Number.isFinite(nodeDist)
                        ? '∞'
                        : nodeDist
                    })`
                  : '';
              return (
                <View
                  key={`front-${nodeId}-${idx}`}
                  style={[
                    styles.frontierPill,
                    {
                      backgroundColor: colors.chipActiveBg,
                      borderColor: colors.brandAccent,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.frontierPillText,
                      { color: colors.brandAccent },
                    ]}
                  >
                    {nodeId}
                    {distLabel}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>

      {/* Distancias Mínimas Calculadas (para Dijkstra) */}
      {step.distancias && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
            Distancias Mínimas:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillContainer}
          >
            {Object.entries(step.distancias).map(([node, d]) => {
              const distVal = d as number | null | undefined;
              const formattedDist =
                distVal === null ||
                distVal === undefined ||
                !Number.isFinite(distVal)
                  ? '∞'
                  : distVal;
              return (
                <View
                  key={`dist-${node}`}
                  style={[
                    styles.distPill,
                    {
                      backgroundColor: colors.chipActiveBg,
                      borderColor: colors.chipActiveBorder,
                    },
                  ]}
                >
                  <Text
                    style={[styles.distPillText, { color: colors.brandAccent }]}
                  >
                    {node}: {formattedDist}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Secuencia acumulada de visitados */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
          Visitados ({visitados.length}):
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillContainer}
        >
          {visitados.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              (ninguno aún)
            </Text>
          ) : (
            visitados.map((nodeId, idx) => (
              <React.Fragment key={`vis-${nodeId}-${idx}`}>
                <View style={styles.visitedPill}>
                  <Text style={styles.visitedPillText}>{nodeId}</Text>
                </View>
                {idx < visitados.length - 1 ? (
                  <Text
                    style={[styles.arrowSeparator, { color: colors.textMuted }]}
                  >
                    →
                  </Text>
                ) : null}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
  },
  edgeBadge: {
    backgroundColor: 'rgba(245, 166, 35, 0.15)',
    borderColor: SimulationColors.comparacion,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  edgeText: {
    color: SimulationColors.comparacion,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  frontierPill: {
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 6,
    minWidth: 28,
    alignItems: 'center',
  },
  frontierPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  distPill: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    alignItems: 'center',
  },
  distPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  visitedPill: {
    backgroundColor: 'rgba(126, 211, 33, 0.15)',
    borderColor: SimulationColors.final,
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: 'center',
  },
  visitedPillText: {
    color: SimulationColors.final,
    fontSize: 12,
    fontWeight: '700',
  },
  arrowSeparator: {
    fontSize: 12,
    marginHorizontal: 4,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
