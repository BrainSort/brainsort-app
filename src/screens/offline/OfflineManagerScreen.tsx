/**
 * OfflineManagerScreen.tsx
 * BrainSort — Pantalla de gestión de módulos sin conexión
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { SyncStatusBanner } from '../../components/offline/SyncStatusBanner';
import {
  OfflineModuleCard,
  OfflineModuleItem,
} from '../../components/offline/OfflineModuleCard';
import { useOfflineModules } from '../../hooks/useOfflineModules';
import { useSync } from '../../hooks/useSync';
import { useLibrary } from '../../hooks/useLibrary';
import { useThemeContext } from '../../context/ThemeContext';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

const CloudOffEmptyIcon = ({ color, size = 36 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 2l20 20M16.5 16.5H6a4 4 0 0 1-.88-7.9M9.34 5.34A7 7 0 0 1 20 11a4.5 4.5 0 0 1-.5 8.97"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const OfflineManagerScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const navigation = useNavigation<any>();
  const { theme } = useThemeContext();
  const { colors } = theme;

  const {
    modulos,
    isLoadingModulos,
    downloadProgress,
    downloadModulo,
    deleteModulo,
  } = useOfflineModules();
  const { syncState, syncNow } = useSync();
  const { algoritmos, isLoading: isLoadingLibrary } = useLibrary();

  // Seguimiento local optimista para reflejar descargas/eliminaciones de inmediato
  const [downloadedOverrides, setDownloadedOverrides] = useState<
    Record<string, boolean>
  >({});

  const mergedModules = useMemo<OfflineModuleItem[]>(() => {
    const byId = new Map<string, OfflineModuleItem>();

    if (algoritmos) {
      for (const algo of algoritmos) {
        byId.set(algo.id, {
          algoritmoId: algo.id,
          nombre: algo.nombre,
          categoria: algo.categoria,
          tamanoKB: 48,
          version: '1.0.0',
          descargado: downloadedOverrides[algo.id] ?? false,
        });
      }
    }

    if (modulos) {
      for (const mod of modulos) {
        const existing = byId.get(mod.algoritmoId);
        byId.set(mod.algoritmoId, {
          ...existing,
          ...mod,
          descargado:
            downloadedOverrides[mod.algoritmoId] !== undefined
              ? downloadedOverrides[mod.algoritmoId]
              : mod.descargado,
        });
      }
    }

    return Array.from(byId.values());
  }, [algoritmos, modulos, downloadedOverrides]);

  const handleDownload = useCallback(
    async (algoritmoId: string) => {
      try {
        await downloadModulo(algoritmoId);
        setDownloadedOverrides((prev) => ({ ...prev, [algoritmoId]: true }));
      } catch {
        // Fallback local si la API offline aún no está disponible
        setDownloadedOverrides((prev) => ({ ...prev, [algoritmoId]: true }));
      }
    },
    [downloadModulo],
  );

  const handleDelete = useCallback(
    async (algoritmoId: string) => {
      try {
        await deleteModulo(algoritmoId);
      } finally {
        setDownloadedOverrides((prev) => ({ ...prev, [algoritmoId]: false }));
      }
    },
    [deleteModulo],
  );

  const handleSimulate = useCallback(
    (algoritmoId: string) => {
      navigation.navigate('Biblioteca', {
        screen: 'Simulation',
        params: { algoritmoId },
      });
    },
    [navigation],
  );

  const downloadedCount = useMemo(
    () => mergedModules.filter((m) => m.descargado).length,
    [mergedModules],
  );

  const totalLocalKB = useMemo(
    () =>
      mergedModules
        .filter((m) => m.descargado)
        .reduce((acc, m) => acc + (m.tamanoKB || 0), 0),
    [mergedModules],
  );

  const formattedStorage =
    totalLocalKB >= 1024
      ? `${(totalLocalKB / 1024).toFixed(1)} MB`
      : `${totalLocalKB} KB`;

  const gridColumns = width >= 1120 ? 3 : width >= 680 ? 2 : 1;
  const cardWidthStyle =
    gridColumns === 3
      ? { width: '32%' as const }
      : gridColumns === 2
        ? { width: '48.8%' as const }
        : { width: '100%' as const };

  const isLoading = isLoadingModulos && isLoadingLibrary && mergedModules.length === 0;

  return (
    <SafeAreaWrapper edges={isDesktop ? [] : ['top']}>
      {!isDesktop && <Header title="Módulos sin conexión" showBackButton />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop && styles.scrollContentDesktop,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContainer}>
          {isDesktop && (
            <View style={styles.heroHeader}>
              <Text
                accessibilityRole="header"
                style={[styles.heroTitle, { color: colors.textPrimary }]}
              >
                Módulos sin conexión
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
                Descarga algoritmos para consultar teoría y ejecutar simulaciones locales sin internet
              </Text>
            </View>
          )}

          {/* 3-column KPI strip */}
          <View
            style={[
              styles.kpiStrip,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
              width < 640 && styles.kpiStripMobile,
            ]}
          >
            <View style={styles.kpiCell}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
                Estado de sincronización
              </Text>
              <Text
                style={[
                  styles.kpiValue,
                  { color: syncState.isConnected ? colors.success : colors.warning },
                ]}
              >
                {syncState.isSyncing
                  ? 'Sincronizando'
                  : syncState.isConnected
                    ? 'Sincronizado'
                    : 'Modo offline'}
              </Text>
            </View>

            <View
              style={[
                styles.kpiDivider,
                { backgroundColor: colors.borderSubtle },
                width < 640 && styles.kpiDividerHidden,
              ]}
            />

            <View style={styles.kpiCell}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
                Módulos descargados
              </Text>
              <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                {downloadedCount} / {mergedModules.length}
              </Text>
            </View>

            <View
              style={[
                styles.kpiDivider,
                { backgroundColor: colors.borderSubtle },
                width < 640 && styles.kpiDividerHidden,
              ]}
            />

            <View style={styles.kpiCell}>
              <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>
                Almacenamiento local
              </Text>
              <Text style={[styles.kpiValue, { color: colors.brandAccent }]}>
                {formattedStorage}
              </Text>
            </View>
          </View>

          <SyncStatusBanner syncState={syncState} onSyncPress={syncNow} />

          {/* Modules grid */}
          {isLoading ? (
            <View
              style={[
                styles.stateCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <ActivityIndicator size="large" color={colors.brandAccent} />
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                Cargando módulos disponibles...
              </Text>
            </View>
          ) : mergedModules.length === 0 ? (
            <View
              style={[
                styles.stateCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <CloudOffEmptyIcon color={colors.textMuted} size={38} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                No hay módulos disponibles
              </Text>
              <Text style={[styles.stateText, { color: colors.textMuted }]}>
                Conéctate a internet o sincroniza la biblioteca para descargar módulos locales.
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {mergedModules.map((modulo) => (
                <View key={modulo.algoritmoId} style={cardWidthStyle}>
                  <OfflineModuleCard
                    modulo={modulo}
                    progress={downloadProgress.get(modulo.algoritmoId)}
                    onDownload={() => handleDownload(modulo.algoritmoId)}
                    onDelete={() => handleDelete(modulo.algoritmoId)}
                    onSimulate={() => handleSimulate(modulo.algoritmoId)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[4],
    paddingBottom: Spacing[10],
  },
  scrollContentDesktop: {
    padding: Spacing[6],
    paddingBottom: Spacing[12],
  },
  centeredContainer: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    gap: Spacing[4],
  },
  heroHeader: {
    gap: Spacing[1],
    marginBottom: Spacing[1],
  },
  heroTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes['3xl'],
  },
  heroSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  kpiStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  kpiStripMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing[3],
  },
  kpiCell: {
    flex: 1,
    gap: 4,
  },
  kpiDivider: {
    width: 1,
    height: 36,
    marginHorizontal: Spacing[4],
  },
  kpiDividerHidden: {
    display: 'none',
  },
  kpiLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  kpiValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xl,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  stateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[8],
    borderRadius: 14,
    borderWidth: 1,
    gap: Spacing[2],
  },
  emptyTitle: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.lg,
  },
  stateText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    textAlign: 'center',
  },
});

export default OfflineManagerScreen;
