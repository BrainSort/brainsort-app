/**
 * LibraryScreen.tsx
 * BrainSort — Pantalla principal de la Biblioteca de Algoritmos
 *
 * task_breakdown.md T-FE-095
 *
 * Implementa HU-01 (Navegar la Biblioteca) y HU-02 (Seleccionar Algoritmo).
 *
 * Características:
 *   - Grid responsive (useResponsiveColumns) con FlatList
 *   - Filtro por categoría (CategoryFilter) con estado local
 *   - Estado de carga con Spinner temático
 *   - Estado de error con botón de reintento
 *   - Mensaje "Sin conexión" si el fetch falla
 *   - Mensaje "No se encontraron algoritmos" cuando el filtro no da resultados
 *   - Navegación a AlgorithmDetailScreen al presionar una tarjeta
 *
 * Referencia: library-simulation.spec.md §2 HU-01, HU-02
 *             04-contratos-api.md §3 CO1 getLibrary()
 */

import React, { useCallback, useState } from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useLibrary } from '../../hooks/useLibrary';
import { useResponsiveColumns } from '../../hooks/useResponsiveColumns';
import { AlgorithmCard } from '../../components/algorithm/AlgorithmCard';
import { CategoryFilter } from '../../components/algorithm/CategoryFilter';
import { Spinner } from '../../components/common/Spinner';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { DarkSurfaces, DarkText, Neutral, Primary, Accent, Semantic } from '../../styles/colors';
import { BorderRadius, Spacing, SpacingAlias } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
  },

  // Header
  header: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[6],
    paddingBottom: Spacing[2],
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    ...TextVariants.h2,
    color: DarkText.primary,
  },
  headerSubtitle: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginTop: Spacing[1],
  },
  totalBadge: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderWidth: 1,
    borderColor: Accent[500],
  },
  totalBadgeText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: Accent[500],
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: DarkSurfaces.borderSubtle,
    marginHorizontal: SpacingAlias.screenPaddingX,
    marginVertical: Spacing[1],
  },

  // Grid
  listContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX - SpacingAlias.cardGap / 2,
    paddingTop: Spacing[3],
    paddingBottom: Spacing[12],
  },
  columnWrapper: {
    justifyContent: 'flex-start',
  },

  // Estado vacío
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[16],
    paddingHorizontal: SpacingAlias.screenPaddingX,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing[4],
  },
  emptyTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  emptyDescription: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    textAlign: 'center',
  },

  // Estado de error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SpacingAlias.screenPaddingX,
    gap: Spacing[4],
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    ...TextVariants.h4,
    color: Semantic.error,
    textAlign: 'center',
  },
  errorDesc: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: SpacingAlias.buttonPaddingX,
    paddingVertical: SpacingAlias.buttonPaddingY,
  },
  retryButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
    color: '#FFFFFF',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de biblioteca de algoritmos (HU-01).
 * Centraliza: fetch → filtrado → renderizado responsive.
 */
export default function LibraryScreen({ navigation }: Props) {
  // ─── Hooks ──────────────────────────────────────────────────────────────────
  const { algoritmos, categorias, totalAlgoritmos, isLoading, isError, filteredAlgoritmos } =
    useLibrary();
  const { numColumns } = useResponsiveColumns();

  // ─── Estado local ────────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Datos filtrados ─────────────────────────────────────────────────────────
  const displayedAlgoritmos = filteredAlgoritmos(selectedCategory);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleCardPress = useCallback(
    (algo: AlgoritmoEnBiblioteca) => {
      navigation.navigate('AlgorithmDetail', { algoritmoId: algo.id });
    },
    [navigation],
  );

  const handleCategorySelect = useCallback((cat: string | undefined) => {
    setSelectedCategory(cat);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // TanStack Query lo refetch automáticamente al invalidar
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  // ─── Render item ─────────────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AlgoritmoEnBiblioteca>) => (
      <AlgorithmCard algoritmo={item} onPress={handleCardPress} />
    ),
    [handleCardPress],
  );

  const keyExtractor = useCallback(
    (item: AlgoritmoEnBiblioteca) => item.id,
    [],
  );

  // ─── Estados de carga / error ────────────────────────────────────────────────
  if (isLoading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorIcon}>📡</Text>
        <Text style={styles.errorTitle}>Sin conexión</Text>
        <Text style={styles.errorDesc}>
          No se pudo cargar la biblioteca. Verifica tu conexión a internet e
          intenta de nuevo.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga de biblioteca"
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Render principal ────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Biblioteca</Text>
            <Text style={styles.headerSubtitle}>
              Explora y aprende algoritmos
            </Text>
          </View>
          {totalAlgoritmos !== undefined && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {totalAlgoritmos} algoritmos
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Filtros de categoría */}
      {categorias && categorias.length > 0 && (
        <>
          <CategoryFilter
            categorias={categorias}
            selected={selectedCategory}
            onSelect={handleCategorySelect}
          />
          <View style={styles.divider} />
        </>
      )}

      {/* Grid de algoritmos */}
      <FlatList<AlgoritmoEnBiblioteca>
        data={displayedAlgoritmos}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        key={`cols-${numColumns}`}          // Fuerza re-mount al cambiar columnas
        columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Accent[500]}
            colors={[Accent[500]]}
          />
        }
        // Estado vacío
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>
              No se encontraron algoritmos con ese criterio
            </Text>
            <Text style={styles.emptyDescription}>
              Prueba seleccionando otra categoría o eliminando el filtro.
            </Text>
          </View>
        }
        // Performance
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
      />
    </View>
  );
}
