/**
 * AuthBackdrop.tsx
 * BrainSort — Fondo atmosférico arquitectónico para pantallas de autenticación
 *
 * Incluye:
 *   - Degradados radiales suaves en esquinas opuestas (SVG)
 *   - Retícula técnica de puntos (SVG Pattern)
 *   - 4 figuras wireframe flotantes de estructuras de datos en el perímetro
 *   - Animación sinusoidal lenta respetando AccessibilityInfo.isReduceMotionEnabled()
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function BinaryTreeMotif({ color }: { color: string }) {
  return (
    <Svg width={132} height={110} viewBox="0 0 132 110" fill="none">
      <Line x1="66" y1="24" x2="32" y2="76" stroke={color} strokeWidth={1.6} />
      <Line x1="66" y1="24" x2="100" y2="76" stroke={color} strokeWidth={1.6} />
      <Circle cx="66" cy="24" r="14" stroke={color} strokeWidth={1.75} />
      <Circle cx="32" cy="76" r="14" stroke={color} strokeWidth={1.75} />
      <Circle cx="100" cy="76" r="14" stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}

function LinkedListMotif({ color }: { color: string }) {
  return (
    <Svg width={168} height={64} viewBox="0 0 168 64" fill="none">
      {/* Node 1 */}
      <Rect x="6" y="16" width="36" height="28" rx="6" stroke={color} strokeWidth={1.6} />
      <Line x1="29" y1="16" x2="29" y2="44" stroke={color} strokeWidth={1.3} />
      <Circle cx="35.5" cy="30" r="2.2" fill={color} />
      {/* Arrow 1 -> 2 */}
      <Line x1="42" y1="30" x2="62" y2="30" stroke={color} strokeWidth={1.5} />
      <Path d="M57 25L63 30L57 35" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Node 2 */}
      <Rect x="64" y="16" width="36" height="28" rx="6" stroke={color} strokeWidth={1.6} />
      <Line x1="87" y1="16" x2="87" y2="44" stroke={color} strokeWidth={1.3} />
      <Circle cx="93.5" cy="30" r="2.2" fill={color} />
      {/* Arrow 2 -> 3 */}
      <Line x1="100" y1="30" x2="120" y2="30" stroke={color} strokeWidth={1.5} />
      <Path d="M115 25L121 30L115 35" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Node 3 */}
      <Rect x="122" y="16" width="36" height="28" rx="6" stroke={color} strokeWidth={1.6} />
      <Line x1="145" y1="16" x2="145" y2="44" stroke={color} strokeWidth={1.3} />
      <Circle cx="151.5" cy="30" r="2.2" fill={color} />
    </Svg>
  );
}

function WeightedGraphMotif({ color }: { color: string }) {
  return (
    <Svg width={144} height={124} viewBox="0 0 144 124" fill="none">
      {/* Diamond/triangular mesh edges */}
      <Line x1="72" y1="18" x2="24" y2="62" stroke={color} strokeWidth={1.5} />
      <Line x1="72" y1="18" x2="120" y2="62" stroke={color} strokeWidth={1.5} />
      <Line x1="24" y1="62" x2="120" y2="62" stroke={color} strokeWidth={1.4} strokeDasharray="4 4" />
      <Line x1="24" y1="62" x2="72" y2="106" stroke={color} strokeWidth={1.5} />
      <Line x1="120" y1="62" x2="72" y2="106" stroke={color} strokeWidth={1.5} />
      {/* Subtle weights */}
      <SvgText x="41" y="36" fill={color} fontSize="10" fontWeight="700">2</SvgText>
      <SvgText x="99" y="36" fill={color} fontSize="10" fontWeight="700">5</SvgText>
      <SvgText x="72" y="57" fill={color} fontSize="10" fontWeight="700" textAnchor="middle">3</SvgText>
      <SvgText x="41" y="92" fill={color} fontSize="10" fontWeight="700">1</SvgText>
      {/* Nodes */}
      <Circle cx="72" cy="18" r="10" stroke={color} strokeWidth={1.75} />
      <Circle cx="24" cy="62" r="10" stroke={color} strokeWidth={1.75} />
      <Circle cx="120" cy="62" r="10" stroke={color} strokeWidth={1.75} />
      <Circle cx="72" cy="106" r="10" stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}

function BarsStackMotif({ color }: { color: string }) {
  return (
    <Svg width={144} height={106} viewBox="0 0 144 106" fill="none">
      <Line x1="10" y1="92" x2="134" y2="92" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
      <Rect x="16" y="64" width="18" height="28" rx="4" stroke={color} strokeWidth={1.6} />
      <Rect x="42" y="46" width="18" height="46" rx="4" stroke={color} strokeWidth={1.6} />
      <Rect x="68" y="30" width="18" height="62" rx="4" stroke={color} strokeWidth={1.6} />
      <Rect x="94" y="14" width="18" height="78" rx="4" stroke={color} strokeWidth={1.6} />
      <Rect x="120" y="52" width="14" height="40" rx="4" stroke={color} strokeWidth={1.4} strokeDasharray="3 3" />
    </Svg>
  );
}

export const AuthBackdrop: React.FC = () => {
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [reduceMotion, setReduceMotion] = useState(false);

  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const floatC = useRef(new Animated.Value(0)).current;
  const floatD = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      })
      .catch(() => {});

    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => {
        if (mounted) setReduceMotion(Boolean(enabled));
      },
    );

    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      floatA.setValue(0);
      floatB.setValue(0);
      floatC.setValue(0);
      floatD.setValue(0);
      return;
    }

    const createFloatLoop = (
      anim: Animated.Value,
      amplitude: number,
      halfDurationMs: number,
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -amplitude,
            duration: halfDurationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(anim, {
            toValue: amplitude,
            duration: halfDurationMs,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      );

    const animA = createFloatLoop(floatA, 9, 2800);
    const animB = createFloatLoop(floatB, 11, 3400);
    const animC = createFloatLoop(floatC, 10, 3100);
    const animD = createFloatLoop(floatD, 8, 3900);

    animA.start();
    animB.start();
    animC.start();
    animD.start();

    return () => {
      animA.stop();
      animB.stop();
      animC.stop();
      animD.stop();
    };
  }, [floatA, floatB, floatC, floatD, reduceMotion]);

  const primaryGlow = isDark ? '#00B4D8' : '#0284C7';
  const secondaryGlow = isDark ? '#7ED321' : '#0284C7';
  const dotColor = isDark ? '#7CC8E8' : '#475569';
  const wireframeColor = isDark ? '#38BDF8' : '#0284C7';
  const motifOpacity = isWide ? (isDark ? 0.15 : 0.13) : isDark ? 0.08 : 0.07;

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.root}
    >
      {/* Atmospheric radial gradients + subtle technical dot grid */}
      <Svg
        width="100%"
        height="100%"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <RadialGradient id="authGlowTopLeft" cx="14%" cy="16%" r="58%">
            <Stop
              offset="0%"
              stopColor={primaryGlow}
              stopOpacity={isDark ? 0.12 : 0.1}
            />
            <Stop offset="100%" stopColor={primaryGlow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="authGlowBottomRight" cx="86%" cy="84%" r="58%">
            <Stop
              offset="0%"
              stopColor={secondaryGlow}
              stopOpacity={isDark ? 0.06 : 0.05}
            />
            <Stop offset="100%" stopColor={secondaryGlow} stopOpacity={0} />
          </RadialGradient>
          <Pattern
            id="authDotGrid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <Circle
              cx="14"
              cy="14"
              r="1"
              fill={dotColor}
              fillOpacity={isDark ? 0.18 : 0.22}
            />
          </Pattern>
        </Defs>

        <Rect width="100%" height="100%" fill="url(#authDotGrid)" />
        <Rect width="100%" height="100%" fill="url(#authGlowTopLeft)" />
        <Rect width="100%" height="100%" fill="url(#authGlowBottomRight)" />
      </Svg>

      {/* Top-left: Binary Tree wireframe */}
      <Animated.View
        style={[
          styles.motifTopLeft,
          {
            opacity: motifOpacity,
            transform: [{ translateY: floatA }],
          },
        ]}
      >
        <BinaryTreeMotif color={wireframeColor} />
      </Animated.View>

      {/* Bottom-left: Linked List wireframe */}
      <Animated.View
        style={[
          styles.motifBottomLeft,
          {
            opacity: motifOpacity,
            transform: [{ translateY: floatB }],
          },
        ]}
      >
        <LinkedListMotif color={wireframeColor} />
      </Animated.View>

      {/* Top-right: Weighted Graph wireframe */}
      <Animated.View
        style={[
          styles.motifTopRight,
          {
            opacity: motifOpacity,
            transform: [{ translateY: floatC }],
          },
        ]}
      >
        <WeightedGraphMotif color={wireframeColor} />
      </Animated.View>

      {/* Bottom-right: Stack / Stepped Bars wireframe */}
      <Animated.View
        style={[
          styles.motifBottomRight,
          {
            opacity: motifOpacity,
            transform: [{ translateY: floatD }],
          },
        ]}
      >
        <BarsStackMotif color={wireframeColor} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  motifTopLeft: {
    position: 'absolute',
    top: 32,
    left: 28,
  },
  motifBottomLeft: {
    position: 'absolute',
    bottom: 36,
    left: 32,
  },
  motifTopRight: {
    position: 'absolute',
    top: 44,
    right: 40,
  },
  motifBottomRight: {
    position: 'absolute',
    bottom: 32,
    right: 36,
  },
});

export default AuthBackdrop;
