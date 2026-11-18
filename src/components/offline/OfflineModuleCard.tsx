/**
 * OfflineModuleCard.tsx
 * BrainSort — Tarjeta de módulo offline descargable
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import type { ModuloOfflineInfo } from '../../services/offline.service';
import type { DownloadProgress as DownloadProgressState } from '../../hooks/useOfflineModules';
import { DownloadProgress } from './DownloadProgress';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface OfflineModuleItem extends ModuloOfflineInfo {
  categoria?: string;
}

export interface OfflineModuleCardProps {
  modulo: OfflineModuleItem;
  progress?: DownloadProgressState;
  onDownload: () => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onSimulate?: () => void;
}

const CloudDownloadIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 13v8m0 0-3-3m3 3 3-3M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckCircleIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
    <Path
      d="m8.5 12.5 2.5 2.5 4.5-5"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrashIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PlayIcon = ({ color, size = 15 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 5.5v13l11-6.5-11-6.5Z"
      stroke={color}
      strokeWidth={1.75}
      strokeLinejoin="round"
    />
  </Svg>
);

export const OfflineModuleCard: React.FC<OfflineModuleCardProps> = ({
  modulo,
  progress,
  onDownload,
  onDelete,
  onSimulate,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;

  const isDownloading = Boolean(progress?.isDownloading);
  const isDownloaded = modulo.descargado;

  const formatSize = (kb: number) =>
    kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDownloaded ? colors.brandAccent : colors.border,
        },
      ]}
    >
      {/* Top badges */}
      <View style={styles.topRow}>
        {modulo.categoria ? (
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.textSecondary }]} numberOfLines={1}>
              {modulo.categoria}
            </Text>
          </View>
        ) : (
          <View />
        )}

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isDownloaded ? colors.successLight : colors.surfaceElevated,
              borderColor: isDownloaded ? colors.success : colors.borderSubtle,
            },
          ]}
        >
          {isDownloaded && <CheckCircleIcon color={colors.success} size={13} />}
          <Text
            style={[
              styles.statusText,
              { color: isDownloaded ? colors.success : colors.textMuted },
            ]}
          >
            {isDownloaded ? 'Disponible offline' : 'En la nube'}
          </Text>
        </View>
      </View>

      {/* Title & metadata */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>
          {modulo.nombre}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.metaMono, { color: colors.textSecondary }]}>
            v{modulo.version}
          </Text>
          <Text style={[styles.metaDot, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.metaMono, { color: colors.brandAccent }]}>
            {formatSize(modulo.tamanoKB)}
          </Text>
        </View>
      </View>

      {/* Active download progress */}
      {(isDownloading || progress?.error) && progress && (
        <DownloadProgress
          progress={progress.progress}
          isDownloading={progress.isDownloading}
          error={progress.error}
        />
      )}

      {/* Actions */}
      <View style={styles.actionsRow}>
        {isDownloaded ? (
          <>
            {onSimulate && (
              <Pressable
                onPress={onSimulate}
                accessibilityRole="button"
                accessibilityLabel={`Simular ${modulo.nombre} sin conexión`}
                style={(state) => {
                  const hovered = (state as { hovered?: boolean }).hovered;
                  return [
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.ctaPrimary,
                      borderColor: colors.ctaPrimaryBorder,
                      opacity: state.pressed ? 0.85 : hovered ? 0.92 : 1,
                    },
                    Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  ];
                }}
              >
                <PlayIcon color="#FFFFFF" size={15} />
                <Text style={styles.primaryBtnText}>Simular</Text>
              </Pressable>
            )}
            <Pressable
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={`Eliminar módulo ${modulo.nombre}`}
              style={(state) => {
                const hovered = (state as { hovered?: boolean }).hovered;
                return [
                  styles.secondaryBtn,
                  {
                    backgroundColor: hovered ? colors.errorLight : colors.surfaceElevated,
                    borderColor: colors.border,
                    opacity: state.pressed ? 0.8 : 1,
                  },
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                ];
              }}
            >
              <TrashIcon color={colors.error} size={16} />
              <Text style={[styles.deleteBtnText, { color: colors.error }]}>
                Eliminar
              </Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            onPress={onDownload}
            disabled={isDownloading}
            accessibilityRole="button"
            accessibilityLabel={`Descargar módulo ${modulo.nombre}`}
            style={(state) => {
              const hovered = (state as { hovered?: boolean }).hovered;
              return [
                styles.primaryBtn,
                {
                  backgroundColor: colors.ctaPrimary,
                  borderColor: colors.ctaPrimaryBorder,
                  opacity: isDownloading ? 0.6 : state.pressed ? 0.85 : hovered ? 0.92 : 1,
                },
                Platform.OS === 'web' && ({ cursor: isDownloading ? 'not-allowed' : 'pointer' } as any),
              ];
            }}
          >
            <CloudDownloadIcon color="#FFFFFF" size={16} />
            <Text style={styles.primaryBtnText}>
              {isDownloading ? 'Descargando...' : 'Descargar'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: Spacing[4],
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    flexWrap: 'wrap',
  },
  categoryPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  categoryText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing[2],
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
  },
  body: {
    gap: Spacing[1],
  },
  title: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  metaMono: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  metaDot: {
    fontSize: FontSizes.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginTop: Spacing[1],
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    minHeight: 40,
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  primaryBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[1],
    minHeight: 40,
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  deleteBtnText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
  },
});

export default OfflineModuleCard;
