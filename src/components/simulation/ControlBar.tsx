/**
 * ControlBar.tsx
 * BrainSort — Barra de control de simulación
 *
 * Implementa (HU-04, HU-06):
 *   - Botón Play / Pause
 *   - Botón paso anterior / siguiente (manual)
 *   - Botón Reiniciar
 *   - Stepper Pill de velocidad [0.25x → 2.0x] en incrementos de 0.25
 *   - Al completar: deshabilita Play, habilita Reiniciar (HU-06)
 *   - Variantes 'docked' (móvil/tablet) e 'inline' (tarjeta bajo canvas en escritorio)
 *
 * Referencia: library-simulation.spec.md §2 HU-04, HU-06
 *             constitution.md §3 velocidad [0.25, 2.0] incrementos 0.25
 */

import React from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Line, Path, Polygon, Rect } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { Semantic } from '../../styles/colors';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ControlBarProps {
  isPlaying: boolean;
  isCompleted: boolean;
  speed: number;
  hasSteps: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onSpeedChange: (speed: number) => void;
  showInlineValues?: boolean;
  onToggleInlineValues?: () => void;
  variant?: 'docked' | 'inline';
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const QUICK_SPEED_PRESETS = [0.5, 1.0, 1.5, 2.0, 3.0, 4.0];
const MIN_SPEED = 0.25;
const MAX_SPEED = 4.0;
const SPEED_STEP = 0.25;

// ─── Iconos vectoriales estilo Lucide ─────────────────────────────────────────

const SVG_STROKE = {
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
};

function SkipBackIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="19 20 9 12 19 4 19 20" stroke={color} {...SVG_STROKE} />
      <Line x1="5" y1="19" x2="5" y2="5" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function PlayIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="6 3 20 12 6 21 6 3" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function PauseIcon({ color, size = 22 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="6" y="4" width="4" height="16" rx="1" stroke={color} {...SVG_STROKE} />
      <Rect x="14" y="4" width="4" height="16" rx="1" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function SkipForwardIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polygon points="5 4 15 12 5 20 5 4" stroke={color} {...SVG_STROKE} />
      <Line x1="19" y1="5" x2="19" y2="19" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function RotateCcwIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke={color} {...SVG_STROKE} />
      <Path d="M3 3v5h5" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function CheckCircle2Icon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="10" stroke={color} {...SVG_STROKE} />
      <Path d="m9 12 2 2 4-4" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function MinusIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

function PlusIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} {...SVG_STROKE} />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} {...SVG_STROKE} />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    gap: Spacing[3],
  },
  containerDocked: {
    borderTopWidth: 1,
  },
  containerInline: {
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    padding: Spacing[4],
  },

  // Fila principal: prev | play/pause | next | reset
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },

  // Botón secundario (prev/next)
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  iconButtonDisabled: { opacity: 0.4 },

  // Botón Play/Pause (prominente)
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  playButtonDisabled: { opacity: 0.5 },

  // Botón Reset
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(208, 2, 27, 0.12)',
    borderWidth: BorderWidths.thin,
    borderColor: Semantic.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },

  // Fila secundaria: Stepper Pill de velocidad centrado
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  speedLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    borderWidth: BorderWidths.thin,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 32,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperDivider: {
    width: 1,
    height: 16,
  },
  stepperValueBtn: {
    paddingHorizontal: Spacing[2.5],
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 52,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  stepperValueText: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.xs,
    fontVariant: ['tabular-nums'],
  },

  // Pista sutil de atajos de teclado en pantallas anchas
  shortcutHint: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    textAlign: 'center',
    opacity: 0.75,
  },

  // Indicador de estado completado
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(126, 211, 33, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing[2],
    gap: Spacing[2],
  },
  completedText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
    color: '#7ED321',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  isCompleted,
  speed,
  hasSteps,
  onPlay,
  onPause,
  onReset,
  onPreviousStep,
  onNextStep,
  onSpeedChange,
  variant = 'docked',
}) => {
  const { theme } = useThemeContext();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const isWide = width >= 1024;
  const canPlay = hasSteps && !isCompleted;

  const isMinSpeed = speed <= MIN_SPEED;
  const isMaxSpeed = speed >= MAX_SPEED;

  const handleSpeedDown = () => {
    const next = Math.max(MIN_SPEED, Math.round((speed - SPEED_STEP) * 100) / 100);
    onSpeedChange(next);
  };

  const handleSpeedUp = () => {
    const next = Math.min(MAX_SPEED, Math.round((speed + SPEED_STEP) * 100) / 100);
    onSpeedChange(next);
  };

  const handleSpeedCycle = () => {
    const nextPreset =
      QUICK_SPEED_PRESETS.find((preset) => preset > speed) ??
      QUICK_SPEED_PRESETS[0];
    onSpeedChange(nextPreset);
  };

  return (
    <View
      style={[
        styles.container,
        variant === 'inline' ? styles.containerInline : styles.containerDocked,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderSubtle,
          borderTopColor: colors.borderSubtle,
        },
      ]}
    >
      {/* Banner de completado */}
      {isCompleted && (
        <View style={styles.completedBanner} accessibilityRole="text">
          <CheckCircle2Icon color="#7ED321" size={16} />
          <Text style={styles.completedText}>¡Algoritmo completado!</Text>
        </View>
      )}

      {/* Controles principales */}
      <View style={styles.controlRow}>
        {/* Anterior */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            !hasSteps && styles.iconButtonDisabled,
          ]}
          onPress={onPreviousStep}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Paso anterior"
          testID="btn-prev-step"
        >
          <SkipBackIcon color={colors.textPrimary} size={18} />
        </TouchableOpacity>

        {/* Play / Pause */}
        <TouchableOpacity
          style={[
            styles.playButton,
            { backgroundColor: colors.playButtonActive },
            !canPlay && [
              styles.playButtonDisabled,
              { backgroundColor: colors.playButtonDisabled },
            ],
          ]}
          onPress={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pausar' : 'Reproducir'}
          accessibilityState={{ disabled: !canPlay }}
          testID="btn-play-pause"
        >
          {isPlaying ? (
            <PauseIcon color={colors.textOnAccent} size={22} />
          ) : (
            <PlayIcon color={colors.textOnAccent} size={22} />
          )}
        </TouchableOpacity>

        {/* Siguiente */}
        <TouchableOpacity
          style={[
            styles.iconButton,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            !hasSteps && styles.iconButtonDisabled,
          ]}
          onPress={onNextStep}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Paso siguiente"
          testID="btn-next-step"
        >
          <SkipForwardIcon color={colors.textPrimary} size={18} />
        </TouchableOpacity>

        {/* Reiniciar */}
        <TouchableOpacity
          style={[styles.resetButton, !hasSteps && styles.iconButtonDisabled]}
          onPress={onReset}
          disabled={!hasSteps}
          accessibilityRole="button"
          accessibilityLabel="Reiniciar simulación"
          testID="btn-reset"
        >
          <RotateCcwIcon color={Semantic.error} size={18} />
        </TouchableOpacity>
      </View>

      {/* Pista de atajos de teclado en pantallas anchas */}
      {isWide && (
        <Text style={[styles.shortcutHint, { color: colors.textMuted }]}>
          Espacio: Play/Pausa · ← →: Paso · R: Reiniciar
        </Text>
      )}

      {/* Velocidad (Stepper Pill centrado) */}
      <View style={styles.secondaryRow}>
        <View style={styles.speedGroup}>
          <Text style={[styles.speedLabel, { color: colors.textMuted }]}>
            Velocidad
          </Text>
          <View
            style={[
              styles.stepperPill,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.stepperBtn,
                isMinSpeed && styles.stepperBtnDisabled,
              ]}
              onPress={handleSpeedDown}
              disabled={isMinSpeed}
              accessibilityRole="button"
              accessibilityLabel="Disminuir velocidad"
              testID="btn-speed-down"
            >
              <MinusIcon color={colors.textPrimary} size={14} />
            </TouchableOpacity>

            <View
              style={[
                styles.stepperDivider,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={styles.stepperValueBtn}
              onPress={handleSpeedCycle}
              accessibilityRole="button"
              accessibilityLabel={`Velocidad actual ${speed}x, tocar para cambiar`}
              testID="btn-speed-cycle"
            >
              <Text
                style={[styles.stepperValueText, { color: colors.brandAccent }]}
              >
                {speed}×
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.stepperDivider,
                { backgroundColor: colors.border },
              ]}
            />

            <TouchableOpacity
              style={[
                styles.stepperBtn,
                isMaxSpeed && styles.stepperBtnDisabled,
              ]}
              onPress={handleSpeedUp}
              disabled={isMaxSpeed}
              accessibilityRole="button"
              accessibilityLabel="Aumentar velocidad"
              testID="btn-speed-up"
            >
              <PlusIcon color={colors.textPrimary} size={14} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
