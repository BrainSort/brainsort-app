/**
 * SyncStatusBanner.tsx
 * BrainSort — Banner de estado de sincronización offline
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import type { SyncState } from '../../hooks/useSync';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export interface SyncStatusBannerProps {
  syncState: SyncState;
  onSyncPress: () => void | Promise<void>;
}

const SyncIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 12a9 9 0 0 1-15.5 6.36L3 16M3 12a9 9 0 0 1 15.5-6.36L21 8"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 20v-4h4M21 4v4h-4"
      stroke={color}
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

function formatLastSync(date: Date | null): string {
  if (!date) return 'Sin sincronizar aún';
  try {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Sincronizado';
  }
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({
  syncState,
  onSyncPress,
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const { isConnected, isSyncing, lastSyncTime, pendingItems, error } = syncState;

  const statusColor = isConnected ? colors.success : colors.warning;
  const statusLabel = isConnected ? 'En línea' : 'Sin conexión';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.infoGroup}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>
            {statusLabel}
          </Text>
          {pendingItems > 0 && (
            <View
              style={[
                styles.pendingPill,
                {
                  backgroundColor: colors.warningLight,
                  borderColor: colors.warning,
                },
              ]}
            >
              <Text style={[styles.pendingText, { color: colors.warning }]}>
                {pendingItems} pendiente{pendingItems === 1 ? '' : 's'}
              </Text>
            </View>
          )}
        </View>

        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          Última sincronización: {formatLastSync(lastSyncTime)}
          {error ? ` · Error: ${error.message}` : ''}
        </Text>
      </View>

      <Pressable
        onPress={onSyncPress}
        disabled={isSyncing || !isConnected}
        accessibilityRole="button"
        accessibilityLabel="Sincronizar progreso offline"
        style={(state) => {
          const hovered = (state as { hovered?: boolean }).hovered;
          return [
            styles.syncBtn,
            {
              backgroundColor: colors.ctaPrimary,
              borderColor: colors.ctaPrimaryBorder,
              opacity: isSyncing || !isConnected ? 0.55 : state.pressed ? 0.85 : hovered ? 0.92 : 1,
            },
            Platform.OS === 'web' && ({ cursor: isSyncing || !isConnected ? 'not-allowed' : 'pointer' } as any),
          ];
        }}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <SyncIcon color="#FFFFFF" size={16} />
        )}
        <Text style={styles.syncBtnText}>
          {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: 14,
    borderWidth: 1,
  },
  infoGroup: {
    flex: 1,
    minWidth: 220,
    gap: Spacing[1],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: BorderRadius.full,
  },
  statusTitle: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  pendingPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pendingText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },
  metaText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    minHeight: 40,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  syncBtnText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#FFFFFF',
  },
});

export default SyncStatusBanner;
