/**
 * theme.ts
 * BrainSort — Tema unificado Web/Móvil (dark/light)
 *
 * task_breakdown.md T-FE-026
 *
 * Composición de los tokens de colors.ts, typography.ts y spacing.ts
 * en un objeto de tema cohesivo. Consumido por ThemeContext.tsx (T-FE-033).
 *
 * Dos modos: 'dark' (modo predeterminado, acorde a la estética premium de BrainSort)
 *             y 'light' (alternativa accesible).
 *
 * Uso:
 *   const { theme } = useTheme();  // desde ThemeContext
 *   <View style={{ backgroundColor: theme.colors.background }} />
 */

import {
  DarkSurfaces,
  DarkText,
  LightSurfaces,
  LightText,
  SimulationColors,
  Semantic,
  Primary,
  Accent,
  Neutral,
  Gradients,
} from './colors';
import {
  FontFamilies,
  FontSizes,
  FontWeights,
  LineHeights,
  LetterSpacings,
  TextVariants,
} from './typography';
import {
  Spacing,
  SpacingAlias,
  BorderRadius,
  BorderWidths,
  IconSizes,
  LayoutSizes,
  Shadows,
  ZIndex,
  Breakpoints,
} from './spacing';

// ─── Theme Mode ───────────────────────────────────────────────────────────────

export type ThemeMode = 'dark' | 'light';

// ─── Theme Shape ──────────────────────────────────────────────────────────────

export interface ThemeColors {
  // Surfaces & backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  border: string;
  borderSubtle: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textDisabled: string;
  textInverse: string;
  textOnAccent: string;

  // Brand
  brandPrimary: string;
  brandAccent: string;

  // Semantic
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Simulation (Canon — per Constitution §3)
  simulationIdle: string;
  simulationComparacion: string;
  simulationIntercambio: string;
  simulationFinal: string;

  // Interactive states
  primaryButton: string;
  primaryButtonText: string;
  primaryButtonDisabled: string;
  secondaryButton: string;
  secondaryButtonBorder: string;
  secondaryButtonText: string;

  // Input
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputText: string;
  inputPlaceholder: string;

  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Sidebar (Desktop)
  sidebarBackground: string;
  sidebarBorder: string;
  sidebarActiveBg: string;
  sidebarActiveBorder: string;
  sidebarText: string;
  sidebarTextActive: string;

  // Filter chips
  chipBackground: string;
  chipBorder: string;
  chipActiveBg: string;
  chipActiveBorder: string;

  // Card
  cardBackground: string;
  cardBorder: string;

  // Progress & metrics
  progressTrack: string;
  progressFill: string;
  complexityText: string;

  // Primary CTA
  ctaPrimary: string;
  ctaPrimaryBorder: string;

  // Overlay
  overlayBackground: string;

  // Control bar (simulation)
  controlBarBackground: string;
  controlBarBorder: string;
  playButtonActive: string;
  playButtonDisabled: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  fonts: typeof FontFamilies;
  fontSizes: typeof FontSizes;
  fontWeights: typeof FontWeights;
  lineHeights: typeof LineHeights;
  letterSpacings: typeof LetterSpacings;
  textVariants: typeof TextVariants;
  spacing: typeof Spacing;
  spacingAlias: typeof SpacingAlias;
  borderRadius: typeof BorderRadius;
  borderWidths: typeof BorderWidths;
  iconSizes: typeof IconSizes;
  layout: typeof LayoutSizes;
  breakpoints: typeof Breakpoints;
  shadows: typeof Shadows;
  zIndex: typeof ZIndex;
  gradients: typeof Gradients;
}

// ─── Dark Theme ───────────────────────────────────────────────────────────────

const DarkThemeColors: ThemeColors = {
  // Surfaces
  background: DarkSurfaces.background,
  surface: DarkSurfaces.surface,
  surfaceElevated: DarkSurfaces.surfaceElevated,
  surfaceHighlight: DarkSurfaces.surfaceHighlight,
  border: DarkSurfaces.border,
  borderSubtle: DarkSurfaces.borderSubtle,

  // Text
  textPrimary: DarkText.primary,
  textSecondary: DarkText.secondary,
  textMuted: DarkText.muted,
  textDisabled: DarkText.disabled,
  textInverse: DarkText.inverse,
  textOnAccent: DarkText.onAccent,

  // Brand
  brandPrimary: Primary[400],
  brandAccent: Accent[500],

  // Semantic
  success: Semantic.success,
  successLight: '#2A4A0A',      // Muted green surface for dark mode
  warning: Semantic.warning,
  warningLight: '#4A2E00',      // Muted amber surface for dark mode
  error: Semantic.error,
  errorLight: '#4A0A10',        // Muted red surface for dark mode
  info: Semantic.info,
  infoLight: '#0A2A4A',         // Muted blue surface for dark mode

  // Simulation (always the canonical spec hex codes — never themed)
  simulationIdle: SimulationColors.idle,
  simulationComparacion: SimulationColors.comparacion,
  simulationIntercambio: SimulationColors.intercambio,
  simulationFinal: SimulationColors.final,

  // Interactive
  primaryButton: Primary[500],
  primaryButtonText: Neutral[0],
  primaryButtonDisabled: Neutral[700],
  secondaryButton: 'transparent',
  secondaryButtonBorder: Primary[400],
  secondaryButtonText: Primary[400],

  // Input
  inputBackground: DarkSurfaces.surfaceElevated,
  inputBorder: DarkSurfaces.border,
  inputBorderFocused: Accent[500],
  inputText: DarkText.primary,
  inputPlaceholder: DarkText.muted,

  // Tab bar
  tabBarBackground: '#071320',
  tabBarBorder: 'rgba(126, 157, 183, 0.18)',
  tabBarActive: Accent[500],
  tabBarInactive: DarkText.muted,

  // Sidebar (Desktop)
  sidebarBackground: '#071320',
  sidebarBorder: 'rgba(126, 157, 183, 0.18)',
  sidebarActiveBg: 'rgba(0, 212, 255, 0.12)',
  sidebarActiveBorder: 'rgba(0, 212, 255, 0.42)',
  sidebarText: DarkText.muted,
  sidebarTextActive: DarkText.primary,

  // Filter chips
  chipBackground: '#0C1826',
  chipBorder: 'rgba(126, 157, 183, 0.24)',
  chipActiveBg: 'rgba(0, 212, 255, 0.14)',
  chipActiveBorder: Accent[500],

  // Card
  cardBackground: '#0C1826',
  cardBorder: 'rgba(126, 157, 183, 0.22)',

  // Progress & metrics
  progressTrack: 'rgba(126, 157, 183, 0.20)',
  progressFill: '#8FE830',
  complexityText: '#A6FF2E',

  // Primary CTA
  ctaPrimary: '#237FFF',
  ctaPrimaryBorder: 'rgba(114, 178, 251, 0.45)',

  // Overlay
  overlayBackground: 'rgba(4, 9, 17, 0.78)',

  // Control bar
  controlBarBackground: DarkSurfaces.surface,
  controlBarBorder: DarkSurfaces.border,
  playButtonActive: Accent[500],
  playButtonDisabled: Neutral[600],
};

// ─── Light Theme ──────────────────────────────────────────────────────────────

const LightThemeColors: ThemeColors = {
  // Surfaces
  background: LightSurfaces.background,
  surface: LightSurfaces.surface,
  surfaceElevated: LightSurfaces.surfaceElevated,
  surfaceHighlight: LightSurfaces.surfaceHighlight,
  border: LightSurfaces.border,
  borderSubtle: LightSurfaces.borderSubtle,

  // Text
  textPrimary: LightText.primary,
  textSecondary: LightText.secondary,
  textMuted: LightText.muted,
  textDisabled: LightText.disabled,
  textInverse: LightText.inverse,
  textOnAccent: LightText.onAccent,

  // Brand
  brandPrimary: Primary[600],
  brandAccent: Accent[700],

  // Semantic
  success: Semantic.success,
  successLight: Semantic.successLight,
  warning: Semantic.warning,
  warningLight: Semantic.warningLight,
  error: Semantic.error,
  errorLight: Semantic.errorLight,
  info: Semantic.info,
  infoLight: Semantic.infoLight,

  // Simulation (same canonical hex — never themed)
  simulationIdle: SimulationColors.idle,
  simulationComparacion: SimulationColors.comparacion,
  simulationIntercambio: SimulationColors.intercambio,
  simulationFinal: SimulationColors.final,

  // Interactive
  primaryButton: Primary[600],
  primaryButtonText: Neutral[0],
  primaryButtonDisabled: Neutral[300],
  secondaryButton: 'transparent',
  secondaryButtonBorder: Primary[600],
  secondaryButtonText: Primary[600],

  // Input
  inputBackground: Neutral[0],
  inputBorder: Neutral[300],
  inputBorderFocused: Primary[600],
  inputText: Neutral[900],
  inputPlaceholder: LightText.muted,

  // Tab bar
  tabBarBackground: Neutral[0],
  tabBarBorder: Neutral[200],
  tabBarActive: Primary[600],
  tabBarInactive: LightText.muted,

  // Sidebar (Desktop)
  sidebarBackground: Neutral[0],
  sidebarBorder: Neutral[200],
  sidebarActiveBg: Primary[50],
  sidebarActiveBorder: Primary[600],
  sidebarText: LightText.secondary,
  sidebarTextActive: Primary[700],

  // Filter chips
  chipBackground: Neutral[0],
  chipBorder: Neutral[200],
  chipActiveBg: Primary[50],
  chipActiveBorder: Primary[500],

  // Card
  cardBackground: Neutral[0],
  cardBorder: Neutral[200],

  // Progress & metrics
  progressTrack: Neutral[200],
  progressFill: '#3F8E16',
  complexityText: '#2D6A0E',

  // Primary CTA
  ctaPrimary: Primary[600],
  ctaPrimaryBorder: Primary[700],

  // Overlay
  overlayBackground: 'rgba(0, 0, 0, 0.5)',

  // Control bar
  controlBarBackground: Neutral[100],
  controlBarBorder: Neutral[200],
  playButtonActive: Primary[600],
  playButtonDisabled: Neutral[300],
};

// ─── Shared tokens (mode-agnostic) ───────────────────────────────────────────

const sharedTokens = {
  fonts: FontFamilies,
  fontSizes: FontSizes,
  fontWeights: FontWeights,
  lineHeights: LineHeights,
  letterSpacings: LetterSpacings,
  textVariants: TextVariants,
  spacing: Spacing,
  spacingAlias: SpacingAlias,
  borderRadius: BorderRadius,
  borderWidths: BorderWidths,
  iconSizes: IconSizes,
  layout: LayoutSizes,
  breakpoints: Breakpoints,
  shadows: Shadows,
  zIndex: ZIndex,
  gradients: Gradients,
};

// ─── Exported Themes ──────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  mode: 'dark',
  colors: DarkThemeColors,
  ...sharedTokens,
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: LightThemeColors,
  ...sharedTokens,
};

/**
 * Helper to retrieve a theme object by mode string.
 * Defaults to 'dark' as per BrainSort design first choices.
 */
export function getTheme(mode: ThemeMode = 'dark'): Theme {
  return mode === 'light' ? lightTheme : darkTheme;
}

/**
 * Default theme export — dark mode (BrainSort's primary aesthetic).
 */
export const defaultTheme: Theme = darkTheme;
