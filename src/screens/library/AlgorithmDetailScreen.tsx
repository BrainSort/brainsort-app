/**
 * AlgorithmDetailScreen.tsx
 * BrainSort — Pantalla de detalle de un algoritmo
 *
 * task_breakdown.md T-FE-096
 *
 * Implementa HU-02 (Seleccionar un Algoritmo):
 *   - Muestra título del algoritmo en la barra de navegación
 *   - Spinner temático durante carga
 *   - Descripción completa del algoritmo
 *   - Complejidades de tiempo y espacio (Big O)
 *   - Modal "Próximamente" si el algoritmo no está activo
 *   - Botón "Iniciar Simulación" que navega a SimulationScreen
 *
 * Referencia: library-simulation.spec.md §2 HU-02
 *             04-contratos-api.md §3 CO2 getAlgoritmo()
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { AlgorithmTheory } from '../../components/algorithm/AlgorithmTheory';
import { Spinner } from '../../components/common/Spinner';
import {
  DifficultyBadge,
  normalizeDificultad,
} from '../../components/algorithm/DifficultyBadge';
import { useThemeContext } from '../../context/ThemeContext';
import { Semantic, SimulationColors } from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing, SpacingAlias } from '../../styles/spacing';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  TextVariants,
} from '../../styles/typography';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import { SimulationContent } from '../simulation/SimulationScreen';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<LibraryStackParamList, 'AlgorithmDetail'>;

const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras Lineales',
  EstructurasArboles: 'Estructuras de Árboles',
  EstructurasDeDatos: 'Estructuras de Datos',
  Grafos: 'Grafos',
};

function formatCategoryLabel(categoria: string): string {
  if (!categoria) return '';
  if (CATEGORY_LABELS[categoria]) return CATEGORY_LABELS[categoria];
  return categoria.replace(/([a-z])([A-Z])/g, '$1 $2');
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[16],
  },

  heroCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing[5],
    marginBottom: Spacing[5],
  },
  breadcrumbText: {
    ...TextVariants.bodyMd,
    marginBottom: Spacing[2],
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[2],
  },
  title: {
    ...TextVariants.h1,
    flex: 1,
  },
  descriptionTopText: {
    ...TextVariants.bodyMd,
    lineHeight: 24,
  },
  complexityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: Spacing[2],
    marginBottom: Spacing[6],
  },
  complexityCardIndividual: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  complexityIconBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  complexityIconText: {
    fontSize: 16,
  },
  complexityContent: {
    flex: 1,
  },
  complexityLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    marginBottom: 2,
  },
  complexityValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
  },

  descriptionText: {
    ...TextVariants.bodyLg,
    lineHeight: 26,
    marginBottom: Spacing[6],
  },

  // Botón principal
  startButton: {
    flex: 1.35,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  startButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  footerButtonsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing[3],
  },
  practiceDetailButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing[3.5],
    paddingHorizontal: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  practiceDetailButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  simulationSection: {
    marginTop: Spacing[6],
    gap: Spacing[4],
  },
  simulationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepCounter: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
  },
  progressBar: {
    height: 3,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  canvasContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    padding: Spacing[3],
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[1],
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
  },
  dataInputSection: {
    gap: Spacing[2],
  },
  dataInputLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
  },
  dataInputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dataInput: {
    flex: 1,
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    minHeight: 44,
  },
  dataInputError: {
    borderColor: Semantic.error,
  },
  applyButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    justifyContent: 'center',
    minHeight: 44,
  },
  applyButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
  },
  generateButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
  },
  inputErrorText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: Semantic.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[10],
    gap: Spacing[3],
  },
  emptyIcon: { fontSize: 36 },
  emptyText: { ...TextVariants.bodyMd, textAlign: 'center' },
  toastContainer: {
    position: 'absolute',
    top: Spacing[4],
    left: Spacing[4],
    right: Spacing[4],
    backgroundColor: 'rgba(30, 40, 30, 0.96)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: SimulationColors.final,
    padding: Spacing[4],
    gap: Spacing[3],
    zIndex: 100,
  },
  toastTitle: {
    ...TextVariants.h4,
    color: SimulationColors.final,
    textAlign: 'center',
  },
  toastActions: {
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  toastBtn: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
  },
  toastBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  toastBtnTextPrimary: { color: '#FFFFFF' },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpacingAlias.screenPaddingX,
    gap: Spacing[4],
  },
  errorText: {
    ...TextVariants.h4,
    color: Semantic.error,
    textAlign: 'center',
  },

  // Modal "Próximamente"
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  modalCard: {
    borderRadius: BorderRadius.xl,
    padding: SpacingAlias.modalPadding,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    gap: Spacing[4],
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    ...TextVariants.h3,
    textAlign: 'center',
  },
  modalDesc: {
    ...TextVariants.bodyMd,
    textAlign: 'center',
  },
  modalClose: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: SpacingAlias.buttonPaddingX,
    paddingVertical: SpacingAlias.buttonPaddingY,
    marginTop: Spacing[2],
  },
  modalCloseText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },
  fixedFooter: {
    width: '100%',
    padding: Spacing[4],
    borderTopWidth: 1,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  footerInner: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  theoryWrapper: {
    marginTop: Spacing[6],
    paddingTop: Spacing[6],
    borderTopWidth: 1,
  },
});



// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de detalle de algoritmo (HU-02).
 */
export default function AlgorithmDetailScreen({ navigation, route }: Props) {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const { algoritmoId } = route.params;
  const { algoritmo, isLoading, isError } = useAlgorithm(algoritmoId);
  const [showProximamente, setShowProximamente] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  useEffect(() => {
    if (algoritmo?.nombre) {
      navigation.setOptions({ title: algoritmo.nombre });
    }
  }, [algoritmo?.nombre, navigation]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !algoritmo) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>
          No se pudo cargar el algoritmo.{'\n'}Intenta de nuevo más tarde.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.modalClose, { backgroundColor: colors.primaryButton }]}
          accessibilityRole="button"
          accessibilityLabel="Volver a la biblioteca"
        >
          <Text style={styles.modalCloseText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  try {
    const dificultad = normalizeDificultad(algoritmo.dificultad);
    const esActivo = (algoritmo as any).activo !== false;

    const handleStartSimulation = () => {
      if (!esActivo) {
        setShowProximamente(true);
        return;
      }
      setShowSimulation(true);
    };

    if (showSimulation && esActivo) {
      return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <SimulationContent
            algoritmoId={algoritmoId}
            onRequestBack={() => setShowSimulation(false)}
            showAlgorithmHeader={false}
          />
        </View>
      );
    }

    const startButtonElement = (
      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.startButton,
          {
            backgroundColor: colors.ctaPrimary,
            opacity: !esActivo ? 0.6 : pressed ? 0.86 : hovered ? 0.94 : 1,
          },
          Platform.OS === 'web' &&
            ({ cursor: 'pointer', outlineStyle: 'none', outlineWidth: 0 } as any),
        ]}
        onPress={handleStartSimulation}
        accessibilityRole="button"
        accessibilityLabel={
          esActivo ? `Iniciar simulación de ${algoritmo.nombre}` : `${algoritmo.nombre} no disponible aún`
        }
        testID="btn-start-simulation"
      >
        <PlayIcon size={17} color="#FFFFFF" />
        <Text style={styles.startButtonText}>
          {esActivo
            ? showSimulation
              ? 'Simulación activa'
              : 'Iniciar Simulación'
            : 'Próximamente'}
        </Text>
      </Pressable>
    );

    const categoryLabel = formatCategoryLabel(algoritmo.categoria);

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Text style={[styles.breadcrumbText, { color: colors.textMuted }]}>
                Biblioteca / {categoryLabel} / {algoritmo.nombre}
              </Text>

              <View style={styles.titleRow}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>
                  {algoritmo.nombre}
                </Text>
                <DifficultyBadge dificultad={dificultad} />
              </View>

              <Text style={[styles.descriptionTopText, { color: colors.textSecondary }]}>
                {algoritmo.descripcion}
              </Text>
            </View>

            <View style={styles.complexityRow}>
              <View
                style={[
                  styles.complexityCardIndividual,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.complexityIconBox,
                    { backgroundColor: colors.chipActiveBg },
                  ]}
                >
                  <ClockIcon size={17} color={colors.brandAccent} />
                </View>
                <View style={styles.complexityContent}>
                  <Text style={[styles.complexityLabel, { color: colors.textMuted }]}>
                    Tiempo
                  </Text>
                  <Text
                    style={[
                      styles.complexityValue,
                      {
                        color: colors.textPrimary,
                        fontSize:
                          algoritmo.complejidadTiempo.length > 18
                            ? FontSizes.sm
                            : FontSizes.lg,
                      },
                    ]}
                  >
                    {algoritmo.complejidadTiempo}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.complexityCardIndividual,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.complexityIconBox,
                    { backgroundColor: colors.chipActiveBg },
                  ]}
                >
                  <BoxIcon size={17} color={colors.brandAccent} />
                </View>
                <View style={styles.complexityContent}>
                  <Text style={[styles.complexityLabel, { color: colors.textMuted }]}>
                    Espacio
                  </Text>
                  <Text
                    style={[
                      styles.complexityValue,
                      { color: colors.textPrimary, fontSize: FontSizes.lg },
                    ]}
                  >
                    {algoritmo.complejidadEspacio}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.complexityCardIndividual,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <View
                  style={[
                    styles.complexityIconBox,
                    { backgroundColor: colors.chipActiveBg },
                  ]}
                >
                  <LayersIcon size={17} color={colors.brandAccent} />
                </View>
                <View style={styles.complexityContent}>
                  <Text style={[styles.complexityLabel, { color: colors.textMuted }]}>
                    Categoría
                  </Text>
                  <Text
                    style={[
                      styles.complexityValue,
                      { color: colors.textPrimary, fontSize: FontSizes.md },
                    ]}
                    numberOfLines={1}
                  >
                    {categoryLabel}
                  </Text>
                </View>
              </View>
            </View>

            {algoritmo?.nombre && (
              <View
                style={[
                  styles.theoryWrapper,
                  { borderTopColor: colors.borderSubtle },
                ]}
              >
                <AlgorithmTheory algoritmoNombre={algoritmo.nombre} />
              </View>
            )}
          </ScrollView>
        </View>

        {/* Barra inferior de acciones */}
        <View
          style={[
            styles.fixedFooter,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
          ]}
        >
          <View style={styles.footerInner}>
            <View style={styles.footerButtonsRow}>
              {esActivo && (
                <Pressable
                  style={({ pressed, hovered }: any) => [
                    styles.practiceDetailButton,
                    {
                      backgroundColor: colors.chipActiveBg,
                      borderColor: colors.chipActiveBorder,
                      opacity: pressed ? 0.85 : hovered ? 0.92 : 1,
                    },
                    Platform.OS === 'web' &&
                      ({ cursor: 'pointer', outlineStyle: 'none', outlineWidth: 0 } as any),
                  ]}
                  onPress={() => navigation.navigate('Exercise', { algoritmoId })}
                  accessibilityRole="button"
                  accessibilityLabel={`Practicar ejercicios de ${algoritmo.nombre}`}
                  testID="btn-detail-practice"
                >
                  <GraduationCapIcon size={18} color={colors.brandAccent} />
                  <Text
                    style={[
                      styles.practiceDetailButtonText,
                      { color: colors.brandAccent },
                    ]}
                  >
                    Practicar
                  </Text>
                </Pressable>
              )}
              {startButtonElement}
            </View>
          </View>
        </View>

        <Modal
          visible={showProximamente}
          transparent
          animationType="fade"
          onRequestClose={() => setShowProximamente(false)}
          accessibilityViewIsModal
        >
          <Pressable
            style={[
              styles.modalOverlay,
              { backgroundColor: colors.overlayBackground },
            ]}
            onPress={() => setShowProximamente(false)}
            accessibilityLabel="Cerrar modal"
          >
            <Pressable
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => {}}
            >
              <Text style={styles.modalIcon}>🚧</Text>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Próximamente
              </Text>
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                Este algoritmo estará disponible muy pronto. Mientras tanto,
                explora los demás algoritmos de la biblioteca.
              </Text>
              <TouchableOpacity
                style={[
                  styles.modalClose,
                  { backgroundColor: colors.primaryButton },
                ]}
                onPress={() => setShowProximamente(false)}
                accessibilityRole="button"
                accessibilityLabel="Cerrar"
              >
                <Text style={styles.modalCloseText}>Entendido</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  } catch (e: any) {
    console.error("DEBUG ERROR IN RENDER:", e);
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0E17', padding: 24, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#FF4A4A', fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>
          Error de Renderizado (Debug)
        </Text>
        <Text style={{ color: '#E2E8F0', fontSize: 16, fontFamily: 'monospace', marginBottom: 16, textAlign: 'center' }}>
          {e?.message || String(e)}
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 12, fontFamily: 'monospace', width: '100%', backgroundColor: '#1E293B', padding: 12, borderRadius: 8 }}>
          {e?.stack || 'No stack trace available'}
        </Text>
      </View>
    );
  }
}

// ─── Iconos SVG estilo Lucide ─────────────────────────────────────────────────

function ClockIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Path
        d="M12 7v5l3 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BoxIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m3.3 7 8.7 5 8.7-5M12 22V12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function LayersIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points="12 2 2 7 12 12 22 7 12 2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="m2 17 10 5 10-5M2 12l10 5 10-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlayIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points="6 3 20 12 6 21 6 3"
        fill={color}
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function GraduationCapIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 10v6M2 10l10-5 10 5-10 5-10-5Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6 12v5c3 3 9 3 12 0v-5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
