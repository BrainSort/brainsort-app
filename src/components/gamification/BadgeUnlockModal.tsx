import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontWeights, TextVariants } from '../../styles/typography';
import { BadgeIcon } from './BadgeIcon';

function useSafeColors() {
  try {
    return useThemeContext().theme.colors;
  } catch {
    return getTheme('dark').colors;
  }
}

export interface UnlockedBadgeNotice {
  id?: string;
  nombre: string;
  descripcion?: string;
  imagen: string;
  categoria?: string;
}

export interface BadgeUnlockModalProps {
  visible: boolean;
  badges: UnlockedBadgeNotice[];
  onClose: () => void;
}

const CONFETTI_COLORS = [
  '#00D4FF',
  '#7ED321',
  '#F59E0B',
  '#A855F7',
  '#F43F5E',
  '#38BDF8',
];

interface ConfettiSpec {
  id: number;
  color: string;
  dx: number;
  peakY: number;
  endY: number;
  rot: string;
  width: number;
  height: number;
  isCircle: boolean;
  wave: 1 | 2;
}

const CONFETTI_PIECES: ConfettiSpec[] = Array.from({ length: 32 }, (_, i) => {
  const wave: 1 | 2 = i < 18 ? 1 : 2;
  const idx = wave === 1 ? i : i - 18;
  const totalInWave = wave === 1 ? 18 : 14;
  // Spread across full 360° with wider horizontal reach so pieces clear the 380px card
  const angle = (idx / totalInWave) * Math.PI * 2 + (wave === 2 ? 0.22 : 0);
  const horizRadius = 180 + (i % 5) * 34;
  const dx = Math.round(Math.cos(angle) * horizRadius);
  const verticalBias = Math.sin(angle);
  const peakY = Math.round(verticalBias * 150 - 150 - (i % 3) * 28);
  const endY = Math.round(peakY + 220 + (i % 4) * 35);
  const baseSize = 9 + (i % 3) * 2;
  const isCircle = i % 4 === 0;
  return {
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    dx,
    peakY,
    endY,
    rot: `${(i % 2 === 0 ? 1 : -1) * (240 + i * 24)}deg`,
    width: isCircle ? baseSize : baseSize + 3,
    height: isCircle ? baseSize : Math.round(baseSize * 0.6),
    isCircle,
    wave,
  };
});

function TrophyIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function useUnlockAnimations(visible: boolean) {
  // Guarded so non-dispatcher test renderers (e.g. BadgeCard.test.tsx renderTree) fall back gracefully.
  /* eslint-disable react-hooks/rules-of-hooks */
  try {
    const [reduceMotion, setReduceMotion] = useState(false);
    const cardScale = useRef(new Animated.Value(0.82)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const haloScale = useRef(new Animated.Value(1)).current;
    const haloOpacity = useRef(new Animated.Value(0.35)).current;
    const burstProgress = useRef(new Animated.Value(0)).current;
    const confettiProgress = useRef(new Animated.Value(0)).current;
    const confettiWave2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      let mounted = true;
      AccessibilityInfo?.isReduceMotionEnabled?.()
        .then((enabled) => {
          if (mounted) setReduceMotion(Boolean(enabled));
        })
        .catch(() => {});
      return () => {
        mounted = false;
      };
    }, []);

    useEffect(() => {
      if (!visible || !Animated?.parallel) {
        return;
      }

      if (reduceMotion) {
        cardScale.setValue(1);
        cardOpacity.setValue(1);
        haloScale.setValue(1);
        haloOpacity.setValue(0.28);
        burstProgress.setValue(0);
        confettiProgress.setValue(0);
        confettiWave2.setValue(0);
        return;
      }

      cardScale.setValue(0.82);
      cardOpacity.setValue(0);
      burstProgress.setValue(0);
      confettiProgress.setValue(0);
      confettiWave2.setValue(0);

      const entranceAnim = Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          tension: 58,
          friction: 6.5,
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.sequence([
          Animated.delay(80),
          Animated.timing(burstProgress, {
            toValue: 1,
            duration: 850,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.delay(100),
          Animated.timing(confettiProgress, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
        Animated.sequence([
          Animated.delay(340),
          Animated.timing(confettiWave2, {
            toValue: 1,
            duration: 2300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]);

      const haloLoop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 1.2,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.14,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
          Animated.parallel([
            Animated.timing(haloScale, {
              toValue: 1,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(haloOpacity, {
              toValue: 0.38,
              duration: 1100,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]),
        ]),
      );

      entranceAnim.start();
      haloLoop.start();

      return () => {
        entranceAnim.stop();
        haloLoop.stop();
      };
    }, [
      visible,
      reduceMotion,
      cardScale,
      cardOpacity,
      haloScale,
      haloOpacity,
      burstProgress,
      confettiProgress,
      confettiWave2,
    ]);

    return {
      hasAnimated: Boolean(Animated?.View),
      reduceMotion,
      cardScale,
      cardOpacity,
      haloScale,
      haloOpacity,
      burstProgress,
      confettiProgress,
      confettiWave2,
    };
  } catch {
    return {
      hasAnimated: false,
      reduceMotion: true,
      cardScale: null,
      cardOpacity: null,
      haloScale: null,
      haloOpacity: null,
      burstProgress: null,
      confettiProgress: null,
      confettiWave2: null,
    };
  }
  /* eslint-enable react-hooks/rules-of-hooks */
}

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  visible,
  badges,
  onClose,
}) => {
  const colors = useSafeColors();
  const anim = useUnlockAnimations(visible);

  /* eslint-disable react-hooks/rules-of-hooks */
  let currentIndex = 0;
  let setCurrentIndex: (idx: number) => void = () => {};
  try {
    const [idx, setIdx] = useState(0);
    currentIndex = idx;
    setCurrentIndex = setIdx;
    useEffect(() => {
      if (visible) {
        setIdx(0);
      }
    }, [visible, badges?.length]);
  } catch {
    currentIndex = 0;
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  if (!visible || !badges || badges.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, badges.length - 1);
  const primaryBadge = badges[safeIndex];
  const hasMoreBadges = safeIndex < badges.length - 1;
  const AnimatedView: any = anim.hasAnimated ? Animated.View : View;

  const cardAnimatedStyle =
    anim.hasAnimated && !anim.reduceMotion && anim.cardScale && anim.cardOpacity
      ? {
          opacity: anim.cardOpacity,
          transform: [{ scale: anim.cardScale }],
        }
      : undefined;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={[styles.overlay, { backgroundColor: colors.overlayBackground }]}
        testID="badge-unlock-modal"
      >
        {/* Confetti burst layer */}
        {anim.hasAnimated &&
          !anim.reduceMotion &&
          anim.confettiProgress &&
          anim.confettiWave2 && (
            <View style={[styles.confettiLayer, { pointerEvents: 'none' }]}>
              {CONFETTI_PIECES.map((piece) => {
                const driver =
                  piece.wave === 1
                    ? anim.confettiProgress!
                    : anim.confettiWave2!;
                const translateX = driver.interpolate({
                  inputRange: [0, 0.45, 1],
                  outputRange: [0, piece.dx * 0.72, piece.dx],
                });
                const translateY = driver.interpolate({
                  inputRange: [0, 0.38, 1],
                  outputRange: [0, piece.peakY, piece.endY],
                });
                const opacity = driver.interpolate({
                  inputRange: [0, 0.08, 0.78, 1],
                  outputRange: [0, 1, 0.95, 0],
                });
                const rotate = driver.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', piece.rot],
                });
                return (
                  <Animated.View
                    key={piece.id}
                    style={[
                      styles.confettiPiece,
                      {
                        width: piece.width,
                        height: piece.height,
                        borderRadius: piece.isCircle ? piece.width / 2 : 2,
                        backgroundColor: piece.color,
                        opacity,
                        transform: [
                          { translateX },
                          { translateY },
                          { rotate },
                        ],
                      },
                    ]}
                  />
                );
              })}
            </View>
          )}

        <AnimatedView
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.brandAccent,
            },
            cardAnimatedStyle,
          ]}
        >
          <View
            style={[
              styles.kickerPill,
              {
                backgroundColor: colors.chipActiveBg,
                borderColor: colors.chipActiveBorder,
              },
            ]}
          >
            <TrophyIcon color={colors.brandAccent} size={15} />
            <Text style={[styles.kicker, { color: colors.brandAccent }]}>
              ¡Logro Desbloqueado!
            </Text>
          </View>

          <View style={styles.iconContainer}>
            {anim.hasAnimated && !anim.reduceMotion && anim.burstProgress && (
              <Animated.View
                style={[
                  styles.haloRing,
                  {
                    pointerEvents: 'none',
                    borderWidth: 2,
                    borderColor: colors.brandAccent,
                    backgroundColor: 'transparent',
                    opacity: anim.burstProgress.interpolate({
                      inputRange: [0, 0.2, 1],
                      outputRange: [0, 0.7, 0],
                    }),
                    transform: [
                      {
                        scale: anim.burstProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.75, 1.9],
                        }),
                      },
                    ],
                  },
                ]}
              />
            )}
            {anim.hasAnimated && anim.haloScale && anim.haloOpacity && (
              <Animated.View
                style={[
                  styles.haloRing,
                  {
                    pointerEvents: 'none',
                    backgroundColor: colors.brandAccent,
                    opacity: anim.haloOpacity,
                    transform: [{ scale: anim.haloScale }],
                  },
                ]}
              />
            )}
            <BadgeIcon
              imagen={primaryBadge.imagen}
              desbloqueada={true}
              size={88}
            />
          </View>

          <Text
            style={[styles.title, { color: colors.textPrimary }]}
            testID="badge-unlock-title"
          >
            {primaryBadge.nombre}
          </Text>

          {primaryBadge.categoria ? (
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: colors.chipActiveBg },
              ]}
            >
              <Text
                style={[styles.categoryTagText, { color: colors.brandAccent }]}
              >
                {primaryBadge.categoria}
              </Text>
            </View>
          ) : null}

          {primaryBadge.descripcion ? (
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {primaryBadge.descripcion}
            </Text>
          ) : null}

          {badges.length > 1 ? (
            <Text style={[styles.extraCount, { color: colors.brandAccent }]}>
              Insignia {safeIndex + 1} de {badges.length}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryButton }]}
            onPress={() => {
              if (hasMoreBadges) {
                setCurrentIndex(safeIndex + 1);
              } else {
                onClose();
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={
              hasMoreBadges
                ? 'Ver siguiente insignia desbloqueada'
                : 'Cerrar notificación de insignia'
            }
            testID="badge-unlock-close-btn"
          >
            <Text
              style={[styles.buttonText, { color: colors.primaryButtonText }]}
            >
              {hasMoreBadges ? 'Siguiente insignia' : '¡Excelente!'}
            </Text>
          </TouchableOpacity>
        </AnimatedView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  confettiPiece: {
    position: 'absolute',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing[6],
    alignItems: 'center',
    zIndex: 2,
  },
  kickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[3.5],
    paddingVertical: Spacing[1.5],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing[3],
  },
  kicker: {
    ...TextVariants.labelMd,
    fontWeight: FontWeights.bold,
    textTransform: 'uppercase',
  },
  iconContainer: {
    marginVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  title: {
    ...TextVariants.h3,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  categoryTag: {
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing[3],
  },
  categoryTagText: {
    ...TextVariants.labelSm,
  },
  description: {
    ...TextVariants.bodyMd,
    textAlign: 'center',
    marginBottom: Spacing[5],
  },
  extraCount: {
    ...TextVariants.bodySm,
    marginBottom: Spacing[4],
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...TextVariants.bodyMd,
    fontWeight: FontWeights.bold,
  },
});
