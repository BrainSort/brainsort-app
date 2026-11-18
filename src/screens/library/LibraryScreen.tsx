/**
 * LibraryScreen.tsx
 * BrainSort — Dashboard principal de biblioteca.
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useLibrary } from '../../hooks/useLibrary';
import { useProgress } from '../../hooks/useProgress';
import { AlgorithmCard } from '../../components/algorithm/AlgorithmCard';
import { CategoryFilter } from '../../components/algorithm/CategoryFilter';
import { Spinner } from '../../components/common/Spinner';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { LibraryStackParamList } from '../../navigation/LibraryStackNavigator';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import { useThemeContext } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<LibraryStackParamList, 'Library'>;
type MainTabNav = BottomTabNavigationProp<MainTabParamList>;
type StatIconName = 'library' | 'check' | 'exercise' | 'streak';
type DifficultyFilter = 'Todas' | 'Facil' | 'Medio' | 'Dificil';
type SortOrder = 'Recomendado' | 'AZ' | 'Progreso';

const DIFFICULTY_OPTIONS: { value: DifficultyFilter; label: string }[] = [
  { value: 'Todas', label: 'Todas' },
  { value: 'Facil', label: 'Fácil' },
  { value: 'Medio', label: 'Medio' },
  { value: 'Dificil', label: 'Difícil' },
];

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'Recomendado', label: 'Recomendado' },
  { value: 'AZ', label: 'A-Z' },
  { value: 'Progreso', label: 'Progreso' },
];

const PREFERRED_ORDER: Record<string, number> = {
  'Bubble Sort': 1,
  'Insertion Sort': 2,
  'Selection Sort': 3,
  'Linked List': 4,
  Queue: 5,
  Stack: 6,
  'Segment Tree': 7,
};

function normalizeDifficulty(value?: string): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export default function LibraryScreen({ navigation }: Props) {
  const tabNavigation = useNavigation<MainTabNav>();
  const { theme } = useThemeContext();
  const { colors } = theme;
  const {
    categorias,
    totalAlgoritmos,
    isLoading,
    isError,
    filteredAlgoritmos,
  } = useLibrary();
  const { progreso, isLoadingProgreso } = useProgress();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const isTwoColKpi = width < 768;
  const numColumns = width >= 1180 ? 3 : width >= 720 ? 2 : 1;

  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchText, setSearchText] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyFilter>('Todas');
  const [sortOrder, setSortOrder] = useState<SortOrder>('Recomendado');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const completedSimulations = progreso?.simulacionesCompletadas;
  const correctExercises = progreso?.ejerciciosCorrectos;
  const totalExercises = progreso?.ejerciciosTotales;
  const metricSimulations = isLoadingProgreso ? '...' : String(completedSimulations ?? 0);
  const metricExercises = isLoadingProgreso
    ? '...'
    : `${correctExercises ?? 0}/${totalExercises ?? 0}`;
  const metricStreak = isLoadingProgreso ? '...' : `${progreso?.rachaDias ?? 0} días`;

  const progressRatioById = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of progreso?.algoritmosProgreso ?? []) {
      const ratio =
        item.ejerciciosTotales > 0
          ? item.ejerciciosCorrectos / item.ejerciciosTotales
          : 0;
      map.set(item.algoritmoId, ratio);
    }
    return map;
  }, [progreso?.algoritmosProgreso]);

  const hasActiveExtraFilters =
    selectedDifficulty !== 'Todas' || sortOrder !== 'Recomendado';
  const hasAnyFilter =
    searchText.trim().length > 0 ||
    selectedCategory !== undefined ||
    hasActiveExtraFilters;

  const handleCardPress = useCallback(
    (algo: AlgoritmoEnBiblioteca) => {
      navigation.navigate('AlgorithmDetail', { algoritmoId: algo.id });
    },
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchText('');
    setSelectedCategory(undefined);
    setSelectedDifficulty('Todas');
    setSortOrder('Recomendado');
  }, []);

  const displayedAlgoritmos = useMemo(() => {
    const needle = searchText.trim().toLowerCase();
    const targetDifficulty = normalizeDifficulty(selectedDifficulty);

    return filteredAlgoritmos(selectedCategory)
      .filter((algo) => {
        if (selectedDifficulty !== 'Todas') {
          if (normalizeDifficulty(algo.dificultad) !== targetDifficulty) {
            return false;
          }
        }
        if (!needle) return true;
        return [
          algo.nombre,
          algo.descripcion,
          algo.categoria,
          ...(algo.tags ?? []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(needle);
      })
      .sort((a, b) => {
        if (sortOrder === 'AZ') {
          return a.nombre.localeCompare(b.nombre);
        }
        if (sortOrder === 'Progreso') {
          const diff =
            (progressRatioById.get(b.id) ?? 0) -
            (progressRatioById.get(a.id) ?? 0);
          if (diff !== 0) return diff;
        }
        return (
          (PREFERRED_ORDER[a.nombre] ?? 99) - (PREFERRED_ORDER[b.nombre] ?? 99) ||
          a.nombre.localeCompare(b.nombre)
        );
      });
  }, [
    filteredAlgoritmos,
    progressRatioById,
    searchText,
    selectedCategory,
    selectedDifficulty,
    sortOrder,
  ]);

  const kpis: {
    key: StatIconName;
    label: string;
    value: string;
    accentColor: string;
  }[] = [
    {
      key: 'library',
      label: 'Algoritmos disponibles',
      value: `${totalAlgoritmos ?? 0}`,
      accentColor: colors.textSecondary,
    },
    {
      key: 'check',
      label: 'Simulaciones completadas',
      value: metricSimulations,
      accentColor: colors.success,
    },
    {
      key: 'exercise',
      label: 'Ejercicios correctos',
      value: metricExercises,
      accentColor: colors.warning,
    },
    {
      key: 'streak',
      label: 'Racha actual',
      value: metricStreak,
      accentColor: colors.brandAccent,
    },
  ];

  if (isLoading && !isRefreshing) {
    return (
      <View
        style={[
          styles.screen,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <Spinner size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[
          styles.screen,
          styles.errorState,
          { backgroundColor: colors.background },
        ]}
      >
        <OfflineIcon color={colors.brandAccent} size={48} />
        <Text style={[styles.errorTitle, { color: colors.error }]}>
          Sin conexión
        </Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>
          No se pudo cargar la biblioteca. Verifica el backend y vuelve a intentar.
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: colors.ctaPrimary,
              borderColor: colors.ctaPrimaryBorder,
              opacity: pressed ? 0.86 : 1,
            },
            webInteractiveStyle,
          ]}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Reintentar carga de biblioteca"
        >
          <Text
            style={[
              styles.primaryButtonText,
              { color: colors.primaryButtonText },
            ]}
          >
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.main}
        contentContainerStyle={[
          styles.mainContent,
          isDesktop ? styles.mainContentDesktop : styles.mainContentMobile,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.brandAccent}
            colors={[colors.brandAccent]}
          />
        }
      >
        <View style={[styles.header, !isDesktop && styles.headerMobile]}>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              Biblioteca
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Explora algoritmos y estructuras de datos. Aprende, practica y domina.
            </Text>
          </View>

          <View
            style={[
              styles.headerActions,
              !isDesktop && styles.headerActionsMobile,
            ]}
          >
            <View
              style={[
                styles.searchBox,
                !isDesktop && styles.searchBoxMobile,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: isSearchFocused
                    ? colors.inputBorderFocused
                    : colors.inputBorder,
                },
                isSearchFocused &&
                  Platform.select({
                    web: {
                      boxShadow: `0 0 0 3px ${colors.brandAccent}26`,
                    } as any,
                  }),
              ]}
            >
              <View style={styles.searchIcon}>
                <SearchIcon
                  color={isSearchFocused ? colors.brandAccent : colors.textMuted}
                  size={17}
                />
              </View>
              <TextInput
                value={searchText}
                onChangeText={setSearchText}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Buscar algoritmo o estructura..."
                placeholderTextColor={colors.inputPlaceholder}
                style={[
                  styles.searchInput,
                  { color: colors.inputText },
                  Platform.select({
                    web: { outlineStyle: 'none' } as any,
                  }),
                ]}
                autoCapitalize="none"
                accessibilityLabel="Buscar algoritmo o estructura"
              />
              {searchText.length > 0 && (
                <Pressable
                  onPress={() => setSearchText('')}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.clearButton,
                    {
                      backgroundColor: colors.surfaceHighlight,
                      opacity: pressed ? 0.7 : 1,
                    },
                    webInteractiveStyle,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Limpiar búsqueda"
                >
                  <CloseIcon color={colors.textSecondary} size={12} />
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed, hovered }: any) => [
                styles.routeButton,
                !isDesktop && styles.routeButtonMobile,
                {
                  backgroundColor: colors.ctaPrimary,
                  borderColor: colors.ctaPrimaryBorder,
                  opacity: pressed ? 0.88 : hovered ? 0.94 : 1,
                },
                webInteractiveStyle,
              ]}
              onPress={() => tabNavigation.navigate('Ruta')}
              accessibilityRole="button"
              accessibilityLabel="Continuar ruta de aprendizaje"
            >
              <Text
                style={[
                  styles.routeButtonText,
                  { color: colors.primaryButtonText },
                ]}
              >
                Continuar ruta
              </Text>
              <ChevronRightIcon color={colors.primaryButtonText} size={16} />
            </Pressable>
          </View>
        </View>

        <View
          style={[
            styles.kpiStrip,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          {kpis.map((kpi, index) => {
            const dividerStyle = isTwoColKpi
              ? {
                  width: '50%' as const,
                  borderRightWidth: index % 2 === 0 ? 1 : 0,
                  borderBottomWidth: index < 2 ? 1 : 0,
                }
              : {
                  width: '25%' as const,
                  borderRightWidth: index < 3 ? 1 : 0,
                  borderBottomWidth: 0,
                };

            return (
              <View
                key={kpi.key}
                style={[
                  styles.kpiCell,
                  dividerStyle,
                  { borderColor: colors.borderSubtle },
                ]}
              >
                <View
                  style={[
                    styles.kpiIconWrap,
                    { backgroundColor: colors.surfaceElevated },
                  ]}
                >
                  <DashboardStatIcon
                    name={kpi.key}
                    color={kpi.accentColor}
                    size={18}
                  />
                </View>
                <View style={styles.kpiCopy}>
                  <Text
                    style={[styles.kpiValue, { color: colors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {kpi.value}
                  </Text>
                  <Text
                    style={[styles.kpiLabel, { color: colors.textMuted }]}
                    numberOfLines={1}
                  >
                    {kpi.label}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.filtersSection}>
          <View style={[styles.filterRow, !isDesktop && styles.filterRowMobile]}>
            <View style={styles.categoryWrap}>
              <CategoryFilter
                categorias={categorias ?? []}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </View>

            <Pressable
              style={({ pressed, hovered }: any) => {
                const isActive = showMoreFilters || hasActiveExtraFilters;
                return [
                  styles.moreFilters,
                  {
                    backgroundColor: isActive
                      ? colors.chipActiveBg
                      : hovered
                        ? colors.surfaceElevated
                        : colors.chipBackground,
                    borderColor: isActive
                      ? colors.chipActiveBorder
                      : colors.chipBorder,
                    opacity: pressed ? 0.85 : 1,
                  },
                  webInteractiveStyle,
                ];
              }}
              onPress={() => setShowMoreFilters((prev) => !prev)}
              accessibilityRole="button"
              accessibilityState={{ expanded: showMoreFilters }}
              accessibilityLabel="Mostrar más filtros de dificultad y orden"
            >
              <SlidersIcon
                color={
                  showMoreFilters || hasActiveExtraFilters
                    ? colors.brandAccent
                    : colors.textSecondary
                }
                size={16}
              />
              <Text
                style={[
                  styles.moreFiltersText,
                  {
                    color:
                      showMoreFilters || hasActiveExtraFilters
                        ? colors.brandAccent
                        : colors.textPrimary,
                  },
                ]}
              >
                Más filtros
              </Text>
              {hasActiveExtraFilters && (
                <View
                  style={[
                    styles.activeDot,
                    { backgroundColor: colors.brandAccent },
                  ]}
                />
              )}
            </Pressable>
          </View>

          {showMoreFilters && (
            <View
              style={[
                styles.moreFiltersPanel,
                {
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.filterGroup}>
                <Text
                  style={[styles.filterGroupLabel, { color: colors.textMuted }]}
                >
                  Dificultad
                </Text>
                <View style={styles.filterPillsWrap}>
                  {DIFFICULTY_OPTIONS.map((opt) => {
                    const active = selectedDifficulty === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setSelectedDifficulty(opt.value)}
                        style={({ pressed, hovered }: any) => [
                          styles.subFilterChip,
                          {
                            backgroundColor: active
                              ? colors.chipActiveBg
                              : hovered
                                ? colors.surfaceElevated
                                : colors.chipBackground,
                            borderColor: active
                              ? colors.chipActiveBorder
                              : colors.chipBorder,
                            opacity: pressed ? 0.85 : 1,
                          },
                          webInteractiveStyle,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          style={[
                            styles.subFilterText,
                            {
                              color: active
                                ? colors.brandAccent
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text
                  style={[styles.filterGroupLabel, { color: colors.textMuted }]}
                >
                  Ordenar por
                </Text>
                <View style={styles.filterPillsWrap}>
                  {SORT_OPTIONS.map((opt) => {
                    const active = sortOrder === opt.value;
                    return (
                      <Pressable
                        key={opt.value}
                        onPress={() => setSortOrder(opt.value)}
                        style={({ pressed, hovered }: any) => [
                          styles.subFilterChip,
                          {
                            backgroundColor: active
                              ? colors.chipActiveBg
                              : hovered
                                ? colors.surfaceElevated
                                : colors.chipBackground,
                            borderColor: active
                              ? colors.chipActiveBorder
                              : colors.chipBorder,
                            opacity: pressed ? 0.85 : 1,
                          },
                          webInteractiveStyle,
                        ]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                      >
                        <Text
                          style={[
                            styles.subFilterText,
                            {
                              color: active
                                ? colors.brandAccent
                                : colors.textSecondary,
                            },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {hasActiveExtraFilters && (
                <Pressable
                  onPress={() => {
                    setSelectedDifficulty('Todas');
                    setSortOrder('Recomendado');
                  }}
                  style={({ pressed }) => [
                    styles.resetExtraButton,
                    { opacity: pressed ? 0.75 : 1 },
                    webInteractiveStyle,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Restablecer filtros avanzados"
                >
                  <Text
                    style={[
                      styles.resetExtraText,
                      { color: colors.brandAccent },
                    ]}
                  >
                    Restablecer
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {displayedAlgoritmos.length === 0 ? (
          <View
            style={[
              styles.emptyState,
              {
                borderColor: colors.cardBorder,
                backgroundColor: colors.cardBackground,
              },
            ]}
          >
            <SearchIcon color={colors.brandAccent} size={40} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              No se encontraron algoritmos
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Prueba con otra búsqueda o cambia los filtros aplicados.
            </Text>
            {hasAnyFilter && (
              <Pressable
                style={({ pressed, hovered }: any) => [
                  styles.clearFiltersButton,
                  {
                    backgroundColor: colors.chipActiveBg,
                    borderColor: colors.chipActiveBorder,
                    opacity: pressed ? 0.85 : hovered ? 0.92 : 1,
                  },
                  webInteractiveStyle,
                ]}
                onPress={handleClearFilters}
                accessibilityRole="button"
                accessibilityLabel="Limpiar todos los filtros"
              >
                <Text
                  style={[
                    styles.clearFiltersText,
                    { color: colors.brandAccent },
                  ]}
                >
                  Limpiar filtros
                </Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {displayedAlgoritmos.map((algo) => {
              const algoProg = progreso?.algoritmosProgreso?.find(
                (p) => p.algoritmoId === algo.id,
              );
              return (
                <View
                  key={algo.id}
                  style={[
                    styles.cardColumn,
                    { width: `${100 / numColumns}%` as any },
                  ]}
                >
                  <AlgorithmCard
                    algoritmo={algo}
                    onPress={handleCardPress}
                    progreso={algoProg}
                  />
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function DashboardStatIcon({
  name,
  color,
  size,
}: {
  name: StatIconName;
  color: string;
  size: number;
}) {
  if (name === 'streak') {
    return <Text style={{ fontSize: size, lineHeight: size + 4 }}>🔥</Text>;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'library' && (
        <>
          <Path
            d="M12 4 4.5 7.7 12 11.4l7.5-3.7L12 4Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinejoin="round"
          />
          <Path
            d="M4.5 12.1 12 15.8l7.5-3.7M4.5 16.4 12 20l7.5-3.6"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'check' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.75} />
          <Path
            d="M7.8 12.3 10.7 15.1 16.3 8.9"
            stroke={color}
            strokeWidth={1.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'exercise' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.75} />
          <Path
            d="M12 7v5.2l3.8 2.2"
            stroke={color}
            strokeWidth={1.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}

function SearchIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.8} cy={10.8} r={6.2} stroke={color} strokeWidth={1.75} />
      <Path
        d="M15.4 15.4 20 20"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CloseIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 6l12 12M18 6 6 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 6l6 6-6 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SlidersIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M4 17h16"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <Rect
        x={7}
        y={4.5}
        width={4}
        height={5}
        rx={1.5}
        stroke={color}
        strokeWidth={1.75}
      />
      <Rect
        x={13}
        y={14.5}
        width={4}
        height={5}
        rx={1.5}
        stroke={color}
        strokeWidth={1.75}
      />
    </Svg>
  );
}

function OfflineIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M7.3 17.5h9.3a4 4 0 0 0 .3-8 5.6 5.6 0 0 0-10.7 1.7A3.2 3.2 0 0 0 7.3 17.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4 4l16 16"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const webInteractiveStyle = Platform.select({
  web: {
    cursor: 'pointer',
    transitionDuration: '150ms',
  } as any,
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  main: {
    flex: 1,
  },
  mainContent: {
    width: '100%',
    maxWidth: 1240,
    alignSelf: 'center',
    gap: Spacing[5],
  },
  mainContentDesktop: {
    paddingHorizontal: Spacing[8],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[8],
  },
  mainContentMobile: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[4],
    paddingBottom: 104,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing[6],
  },
  headerMobile: {
    flexDirection: 'column',
    gap: Spacing[4],
  },
  titleBlock: {
    flexShrink: 1,
  },
  title: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    marginTop: Spacing[1],
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing[3],
    alignItems: 'center',
  },
  headerActionsMobile: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  searchBox: {
    minWidth: 300,
    maxWidth: 360,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[3],
    gap: Spacing[2],
  },
  searchBoxMobile: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%' as any,
  },
  searchIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    height: 42,
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeButton: {
    height: 44,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing[5],
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    minWidth: 176,
  },
  routeButtonMobile: {
    width: '100%',
    minWidth: 0,
  },
  routeButtonText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  kpiStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kpiCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
  },
  kpiIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiCopy: {
    flex: 1,
    minWidth: 0,
  },
  kpiValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
    lineHeight: 24,
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    marginTop: 2,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    lineHeight: 16,
  },
  filtersSection: {
    gap: Spacing[3],
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing[3],
  },
  filterRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  categoryWrap: {
    flex: 1,
  },
  moreFilters: {
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[4],
    alignSelf: 'flex-start',
  },
  moreFiltersText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
  },
  moreFiltersPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[4],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing[5],
  },
  filterGroup: {
    gap: Spacing[2],
  },
  filterGroupLabel: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  filterPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  subFilterChip: {
    height: 32,
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subFilterText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  resetExtraButton: {
    marginLeft: 'auto' as any,
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[2],
  },
  resetExtraText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing[2],
    rowGap: Spacing[4],
  },
  cardColumn: {
    paddingHorizontal: Spacing[2],
  },
  errorState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
  },
  errorTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 24,
    marginTop: Spacing[4],
  },
  errorText: {
    textAlign: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[5],
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  primaryButton: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
  },
  primaryButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing[10],
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
    marginTop: Spacing[3],
  },
  emptyText: {
    marginTop: Spacing[2],
    textAlign: 'center',
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  clearFiltersButton: {
    marginTop: Spacing[5],
    height: 40,
    paddingHorizontal: Spacing[5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFiltersText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
});
