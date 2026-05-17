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
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAlgorithm } from '../../hooks/useAlgorithm';
import { Spinner } from '../../components/common/Spinner';
import { DifficultyBadge, Dificultad } from '../../components/algorithm/DifficultyBadge';
import {
  DarkSurfaces,
  DarkText,
  Primary,
  Accent,
  Semantic,
  SimulationColors,
} from '../../styles/colors';
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

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[16],
  },

  // Encabezado del contenido
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  title: {
    ...TextVariants.h2,
    color: DarkText.primary,
    flex: 1,
  },

  // Tarjeta de complejidades
  complexityCard: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    padding: Spacing[4],
    marginBottom: Spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  complexityItem: {
    alignItems: 'center',
    flex: 1,
  },
  complexityDivider: {
    width: 1,
    backgroundColor: DarkSurfaces.border,
    marginVertical: Spacing[1],
  },
  complexityLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: DarkText.muted,
    marginBottom: Spacing[1],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  complexityValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xl,
    color: Accent[300],
  },

  // Sección de descripción
  sectionTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[2],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: FontSizes.xs,
  },
  descriptionText: {
    ...TextVariants.bodyLg,
    color: DarkText.primary,
    lineHeight: 26,
    marginBottom: Spacing[6],
  },

  // Características del algoritmo
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.borderSubtle,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureText: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    flex: 1,
  },

  // Botón principal
  startButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    marginTop: Spacing[6],
  },
  startButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  startButtonIcon: {
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },
  startButtonDisabled: {
    opacity: 0.6,
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
    color: DarkText.muted,
  },
  progressBar: {
    height: 3,
    backgroundColor: DarkSurfaces.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Accent[500],
    borderRadius: BorderRadius.full,
  },
  canvasContainer: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
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
    color: DarkText.muted,
  },
  dataInputSection: {
    gap: Spacing[2],
  },
  dataInputLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
  },
  dataInputRow: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  dataInput: {
    flex: 1,
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.sm,
    color: DarkText.primary,
    minHeight: 44,
  },
  dataInputError: {
    borderColor: Semantic.error,
  },
  applyButton: {
    backgroundColor: Primary[500],
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
    borderColor: DarkSurfaces.border,
  },
  generateButtonText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
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
  emptyText: { ...TextVariants.bodyMd, color: DarkText.muted, textAlign: 'center' },
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
    backgroundColor: DarkSurfaces.surface,
    borderWidth: BorderWidths.thin,
    borderColor: DarkSurfaces.border,
  },
  toastBtnPrimary: {
    backgroundColor: Primary[500],
    borderColor: Primary[500],
  },
  toastBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: DarkText.secondary,
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
    backgroundColor: 'rgba(8,11,15,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  modalCard: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderRadius: BorderRadius.xl,
    padding: SpacingAlias.modalPadding,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    gap: Spacing[4],
  },
  modalIcon: {
    fontSize: 48,
  },
  modalTitle: {
    ...TextVariants.h3,
    color: DarkText.primary,
    textAlign: 'center',
  },
  modalDesc: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
  },
  modalClose: {
    backgroundColor: Primary[500],
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
  consejoCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    padding: Spacing[4],
    marginTop: Spacing[5],
    marginBottom: Spacing[3],
  },
  consejoText: {
    ...TextVariants.bodyMd,
    color: '#00D4FF',
    lineHeight: 22,
    fontFamily: FontFamilies.medium,
  },
});

// ─── Auxiliar Didáctico ───────────────────────────────────────────────────────

interface DidacticaItem {
  icon: string;
  text: string;
}

interface DidacticaConfig {
  tituloLeyenda: string;
  items: DidacticaItem[];
  consejoDidactico: string;
}

const getDidactica = (nombre: string, categoria: string): DidacticaConfig => {
  const normalizado = nombre.toLowerCase();
  
  if (categoria === 'EstructurasLineales') {
    if (normalizado.includes('stack') || normalizado.includes('pila')) {
      return {
        tituloLeyenda: 'Visualización de la Pila (Stack)',
        items: [
          { icon: '🔵', text: 'Azul — Elemento almacenado en la Pila' },
          { icon: '🟡', text: 'Amarillo (TOP) — Elemento en el tope (único accesible)' },
          { icon: '🟢', text: 'Verde — Elemento activo en push o pop' },
        ],
        consejoDidactico: '💡 Principio LIFO (Last In, First Out): El último elemento en entrar es el primero en salir. Imagina una pila de platos donde solo puedes interactuar con el plato superior.',
      };
    }
    if (normalizado.includes('queue') || normalizado.includes('cola')) {
      return {
        tituloLeyenda: 'Visualización de la Cola (Queue)',
        items: [
          { icon: '🔵', text: 'Azul — Elemento esperando en la Cola' },
          { icon: '🟡', text: 'Amarillo (HEAD) — Frente de la cola, próximo a salir' },
          { icon: '🟠', text: 'Naranja (TAIL) — Final de la cola, donde se inserta' },
        ],
        consejoDidactico: '💡 Principio FIFO (First In, First Out): El primer elemento en entrar es el primero en salir. Funciona exactamente como una cola de supermercado.',
      };
    }
    // Linked List
    return {
      tituloLeyenda: 'Visualización de la Lista Enlazada',
      items: [
        { icon: '🟣', text: 'Púrpura (HEAD) — Apunta al nodo inicial de la lista' },
        { icon: '🔵', text: 'Azul (Nodo) — Caja con el dato y puntero "siguiente"' },
        { icon: '🟡', text: 'Amarillo (Visita) — Nodo visitado durante el recorrido' },
        { icon: '⚪', text: 'Blanco (NULL) — Fin de la lista, no apunta a nada' },
      ],
      consejoDidactico: '💡 Enlace Dinámico: A diferencia de los arreglos, los nodos de una lista enlazada están dispersos en memoria y se conectan dinámicamente mediante punteros.',
    };
  }

  // Ordenamiento (Sorting)
  let consejo = '💡 Ordenamiento de Arreglos: Reorganiza los elementos en un orden específico (ascendente o descendente) comparando valores.';
  if (normalizado.includes('bubble')) {
    consejo = '💡 Comparación Adyacente: Bubble Sort recorre el arreglo comparando pares vecinos e intercambiándolos si están en orden incorrecto. El elemento mayor "flota" al final en cada pasada.';
  } else if (normalizado.includes('selection')) {
    consejo = '💡 Selección Mínima: Selection Sort busca repetidamente el valor mínimo de la sección desordenada y lo intercambia con el primer elemento desordenado, construyendo la lista ordenada de izquierda a derecha.';
  } else if (normalizado.includes('insertion')) {
    consejo = '💡 Inserción en Sublista: Insertion Sort funciona como ordenar cartas en la mano. Toma cada elemento y lo inserta en su posición correcta dentro de la sublista que ya está ordenada.';
  } else if (normalizado.includes('merge')) {
    consejo = '💡 Divide y Vencerás: Merge Sort divide recursivamente el arreglo por la mitad hasta obtener subarreglos de un solo elemento, y luego los fusiona (merge) ordenadamente.';
  }

  return {
    tituloLeyenda: 'Estados en la Simulación',
    items: [
      { icon: '🔵', text: 'Azul — Elemento en reposo / base' },
      { icon: '🟡', text: 'Amarillo — Comparando elementos' },
      { icon: '🔴', text: 'Rojo — Intercambiando posiciones' },
      { icon: '🟢', text: 'Verde — Posición final confirmado' },
    ],
    consejoDidactico: consejo,
  };
};

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de detalle de algoritmo (HU-02).
 */
export default function AlgorithmDetailScreen({ navigation, route }: Props) {
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
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !algoritmo) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={{ fontSize: 48 }}>⚠️</Text>
        <Text style={styles.errorText}>
          No se pudo cargar el algoritmo.{'\n'}Intenta de nuevo más tarde.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.modalClose}
          accessibilityRole="button"
          accessibilityLabel="Volver a la biblioteca"
        >
          <Text style={styles.modalCloseText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dificultad =
    ((algoritmo as any).dificultad as Dificultad | undefined) ?? 'Facil';
  const esActivo = (algoritmo as any).activo !== false;
  const didactica = getDidactica(algoritmo.nombre, algoritmo.categoria);

  const handleStartSimulation = () => {
    if (!esActivo) {
      setShowProximamente(true);
      return;
    }
    setShowSimulation(true);
  };

  if (showSimulation && esActivo) {
    return (
      <View style={styles.container}>
        <SimulationContent
          algoritmoId={algoritmoId}
          onRequestBack={() => setShowSimulation(false)}
          showAlgorithmHeader={false}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>{algoritmo.nombre}</Text>
          <DifficultyBadge dificultad={dificultad} />
        </View>

        <View style={styles.complexityCard}>
          <View style={styles.complexityItem}>
            <Text style={styles.complexityLabel}>Tiempo</Text>
            <Text style={styles.complexityValue}>{algoritmo.complejidadTiempo}</Text>
          </View>
          <View style={styles.complexityDivider} />
          <View style={styles.complexityItem}>
            <Text style={styles.complexityLabel}>Espacio</Text>
            <Text style={styles.complexityValue}>{algoritmo.complejidadEspacio}</Text>
          </View>
          <View style={styles.complexityDivider} />
          <View style={styles.complexityItem}>
            <Text style={styles.complexityLabel}>Categoría</Text>
            <Text style={[styles.complexityValue, { fontSize: FontSizes.sm }]} numberOfLines={2}>
              {algoritmo.categoria}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.descriptionText}>{algoritmo.descripcion}</Text>

        <Text style={styles.sectionTitle}>{didactica.tituloLeyenda}</Text>
        {didactica.items.map(({ icon, text }) => (
          <View key={text} style={styles.featureRow}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureText}>{text}</Text>
          </View>
        ))}

        <View style={styles.consejoCard}>
          <Text style={styles.consejoText}>{didactica.consejoDidactico}</Text>
        </View>

        <TouchableOpacity
          style={[styles.startButton, !esActivo ? styles.startButtonDisabled : null]}
          onPress={handleStartSimulation}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={
            esActivo ? `Iniciar simulación de ${algoritmo.nombre}` : `${algoritmo.nombre} no disponible aún`
          }
          testID="btn-start-simulation"
        >
          <Text style={styles.startButtonIcon}>▶</Text>
          <Text style={styles.startButtonText}>
            {esActivo
              ? showSimulation
                ? 'Simulación activa'
                : 'Iniciar Simulación'
              : 'Próximamente'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      <Modal
        visible={showProximamente}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProximamente(false)}
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowProximamente(false)}
          accessibilityLabel="Cerrar modal"
        >
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalIcon}>🚧</Text>
            <Text style={styles.modalTitle}>Próximamente</Text>
            <Text style={styles.modalDesc}>
              Este algoritmo estará disponible muy pronto. Mientras tanto,
              explora los demás algoritmos de la biblioteca.
            </Text>
            <TouchableOpacity
              style={styles.modalClose}
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
}
