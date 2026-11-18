/**
 * DesktopSidebar.tsx
 * BrainSort — Persistent desktop navigation sidebar
 */

import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, G, Path, Polyline } from 'react-native-svg';
import { BrainSortLogo } from './BrainSortLogo';
import { useThemeContext } from '../../context/ThemeContext';
import { useLibrary } from '../../hooks/useLibrary';
import { useProgress } from '../../hooks/useProgress';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

export type NavTabName = keyof MainTabParamList;

interface SidebarNavItem {
  label: string;
  tab: NavTabName;
  accessibilityLabel: string;
}

const SIDEBAR_NAV_ITEMS: SidebarNavItem[] = [
  { label: 'Biblioteca', tab: 'Biblioteca', accessibilityLabel: 'Biblioteca de algoritmos' },
  { label: 'Ruta', tab: 'Ruta', accessibilityLabel: 'Mi ruta de aprendizaje' },
  { label: 'Progreso', tab: 'Progreso', accessibilityLabel: 'Mi progreso' },
  { label: 'Offline', tab: 'Offline', accessibilityLabel: 'Módulos sin conexión' },
  { label: 'Perfil', tab: 'Perfil', accessibilityLabel: 'Mi perfil' },
];

export interface NavTabIconProps {
  tab: NavTabName;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export const NavTabIcon: React.FC<NavTabIconProps> = ({
  tab,
  color,
  size = 20,
  strokeWidth = 1.75,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {tab === 'Biblioteca' && (
      <>
        <Path
          d="M5 5.5C5 4.7 5.7 4 6.5 4H10c1.1 0 2 .9 2 2v13c0-1.1-.9-2-2-2H6.5C5.7 17 5 16.3 5 15.5v-10Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19 5.5C19 4.7 18.3 4 17.5 4H14c-1.1 0-2 .9-2 2v13c0-1.1.9-2 2-2h3.5c.8 0 1.5-.7 1.5-1.5v-10Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {tab === 'Ruta' && (
      <>
        <Circle cx={6.5} cy={6.5} r={2.1} stroke={color} strokeWidth={strokeWidth} />
        <Circle cx={17.5} cy={17.5} r={2.1} stroke={color} strokeWidth={strokeWidth} />
        <Path
          d="M8.6 6.5h3.8c2.3 0 3.6 1.1 3.6 3 0 2-1.3 3-3.6 3H11c-2.2 0-3.4 1-3.4 3v2"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {tab === 'Progreso' && (
      <>
        <Polyline
          points="4,16 8.5,11.5 12,14.5 19,7.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15.5 7.5H19V11"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {tab === 'Offline' && (
      <>
        <Path
          d="M7.3 17.5h9.3a4 4 0 0 0 .3-8 5.6 5.6 0 0 0-10.7 1.7A3.2 3.2 0 0 0 7.3 17.5Z"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12 10.5v5.5M9.5 13.5 12 16l2.5-2.5"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {tab === 'Perfil' && (
      <>
        <Circle cx={12} cy={8.2} r={3.2} stroke={color} strokeWidth={strokeWidth} />
        <Path
          d="M5.8 19.5c.8-3.1 3.1-4.9 6.2-4.9s5.4 1.8 6.2 4.9"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
  </Svg>
);

function ThemeIcon({ mode, color }: { mode: 'dark' | 'light'; color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {mode === 'dark' ? (
        <Path
          d="M20.2 14.5A8.2 8.2 0 0 1 9.5 3.8a8.5 8.5 0 1 0 10.7 10.7Z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.75} />
          <Path
            d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

function ProgressRing({
  percent,
  trackColor,
  fillColor,
  textColor,
  captionColor,
}: {
  percent: number;
  trackColor: string;
  fillColor: string;
  textColor: string;
  captionColor: string;
}) {
  const size = 98;
  const strokeWidth = 8;
  const radius = 40;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(100, percent));
  const strokeDashoffset = circumference * (1 - normalized / 100);

  return (
    <View style={[styles.progressRingWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {normalized > 0 && (
          <G rotation="-90" origin={`${center},${center}`}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={fillColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              fill="none"
            />
          </G>
        )}
      </Svg>
      <View style={styles.progressRingCenter}>
        <Text style={[styles.progressPercent, { color: textColor }]}>
          {normalized}%
        </Text>
        <Text style={[styles.progressCaption, { color: captionColor }]}>
          completado
        </Text>
      </View>
    </View>
  );
}

export interface DesktopSidebarProps {
  activeTab: NavTabName;
  onNavigate: (tab: NavTabName) => void;
  completionPercent?: number;
  progressCount?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  onNavigate,
  completionPercent: completionPercentProp,
  progressCount: progressCountProp,
}) => {
  const { mode, theme, toggleTheme } = useThemeContext();
  const { totalAlgoritmos } = useLibrary();
  const { progreso } = useProgress();
  const colors = theme.colors;

  const completedSimulations = progreso?.simulacionesCompletadas;
  const correctExercises = progreso?.ejerciciosCorrectos;
  const totalExercises = progreso?.ejerciciosTotales;

  const computedPercent =
    totalExercises && totalExercises > 0
      ? Math.round(((correctExercises ?? 0) / totalExercises) * 100)
      : totalAlgoritmos && totalAlgoritmos > 0 && completedSimulations !== undefined
        ? Math.min(100, Math.round((completedSimulations / totalAlgoritmos) * 100))
        : 0;

  const computedCount =
    totalExercises && totalExercises > 0
      ? `${correctExercises ?? 0} / ${totalExercises} ejercicios`
      : completedSimulations !== undefined
        ? `${completedSimulations} simulaciones`
        : 'Sin progreso';

  const completionPercent = completionPercentProp ?? computedPercent;
  const progressCount = progressCountProp ?? computedCount;
  const streakDays = progreso?.rachaDias ?? 0;

  const webInteractiveStyle =
    Platform.OS === 'web'
      ? ({ cursor: 'pointer', transitionDuration: '150ms' } as any)
      : undefined;

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: colors.sidebarBackground,
          borderRightColor: colors.sidebarBorder,
        },
      ]}
    >
      <View style={styles.brand}>
        <BrainSortLogo size={40} />
        <Text style={[styles.brandText, { color: colors.textPrimary }]}>
          BrainSort
        </Text>
      </View>

      <View style={styles.sideNav}>
        {SIDEBAR_NAV_ITEMS.map(({ label, tab, accessibilityLabel }) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => onNavigate(tab)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={accessibilityLabel}
              style={(state: any) => [
                styles.sideItem,
                webInteractiveStyle,
                active && {
                  backgroundColor: colors.sidebarActiveBg,
                  borderWidth: 1,
                  borderColor: colors.sidebarActiveBorder,
                },
                !active &&
                  state.hovered && {
                    backgroundColor: colors.surfaceHighlight,
                  },
                state.pressed && { opacity: 0.82 },
                state.focused &&
                  Platform.OS === 'web' && {
                    outlineWidth: 2,
                    outlineStyle: 'solid',
                    outlineColor: colors.brandAccent,
                  },
              ]}
            >
              <View
                style={[
                  styles.sideIconBox,
                  active && { backgroundColor: colors.sidebarActiveBg },
                ]}
              >
                <NavTabIcon
                  tab={tab}
                  color={active ? colors.sidebarTextActive : colors.sidebarText}
                  size={20}
                  strokeWidth={1.75}
                />
              </View>
              <Text
                style={[
                  styles.sideLabel,
                  { color: active ? colors.sidebarTextActive : colors.sidebarText },
                  active && styles.sideTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sidebarBottom}>
        <View
          style={[
            styles.progressPanel,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <Text style={[styles.progressTitle, { color: colors.textMuted }]}>
            Tu progreso general
          </Text>
          <ProgressRing
            percent={completionPercent}
            trackColor={colors.progressTrack}
            fillColor={colors.progressFill}
            textColor={colors.textPrimary}
            captionColor={colors.textSecondary}
          />
          <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
            {progressCount}
          </Text>
        </View>

        <View
          style={[
            styles.streakPanel,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.streakIconWrap}>
            <Text style={{ fontSize: 22, lineHeight: 26 }}>🔥</Text>
          </View>
          <View style={styles.streakTextBlock}>
            <Text style={[styles.streakLabel, { color: colors.textMuted }]}>
              Racha actual
            </Text>
            <Text style={[styles.streakValue, { color: colors.warning }]}>
              {streakDays} {streakDays === 1 ? 'día' : 'días'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          }
          style={(state: any) => [
            styles.themeIconBtn,
            webInteractiveStyle,
            Platform.OS === 'web' &&
              ({ outlineStyle: 'none', outlineWidth: 0 } as any),
            state.hovered && { opacity: 0.78 },
            state.pressed && { opacity: 0.6 },
          ]}
        >
          <ThemeIcon mode={mode} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    borderRightWidth: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[6],
    paddingBottom: Spacing[5],
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[8],
  },
  brandText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 22,
  },
  sideNav: {
    gap: Spacing[2],
  },
  sideItem: {
    minHeight: 46,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sideIconBox: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideLabel: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  sideTextActive: {
    fontWeight: FontWeights.bold,
  },
  sidebarBottom: {
    marginTop: 'auto' as any,
    gap: Spacing[3],
    paddingTop: Spacing[4],
  },
  progressPanel: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
  },
  progressTitle: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
    marginBottom: Spacing[3],
  },
  progressRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[2],
  },
  progressRingCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 22,
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
  progressCaption: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.xs,
  },
  progressCount: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  streakPanel: {
    minHeight: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  streakIconWrap: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTextBlock: {
    flex: 1,
    gap: 1,
  },
  streakLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
  },
  streakValue: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
  themeIconBtn: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});

export default DesktopSidebar;
