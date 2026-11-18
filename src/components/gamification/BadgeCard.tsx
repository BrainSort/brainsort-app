import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { getTheme } from '../../styles/theme';
import { FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { BadgeIcon } from './BadgeIcon';

function useSafeColors() {
  try {
    return useThemeContext().theme.colors;
  } catch {
    return getTheme('dark').colors;
  }
}

export interface BadgeCardProps {
  nombre: string;
  imagen: string;
  descripcion?: string;
  criterioDesbloqueo?: string;
  categoria?: string;
  desbloqueada?: boolean;
  fechaObtencion?: string | Date;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  nombre,
  imagen,
  descripcion,
  criterioDesbloqueo,
  categoria,
  desbloqueada = true,
  fechaObtencion,
}) => {
  const colors = useSafeColors();
  const isUnlocked = desbloqueada !== false;

  return (
    <View
      style={[
        styles.badgeItem,
        isUnlocked
          ? {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.brandAccent,
            }
          : {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: 0.65,
            },
      ]}
      testID={isUnlocked ? 'badge-card-unlocked' : 'badge-card-locked'}
      accessibilityLabel={
        isUnlocked
          ? `Insignia desbloqueada: ${nombre}`
          : `Insignia bloqueada: ${nombre}. Pista: ${criterioDesbloqueo ?? descripcion ?? ''}`
      }
    >
      <View style={styles.iconWrapper}>
        <BadgeIcon imagen={imagen} desbloqueada={isUnlocked} size={48} />
        {!isUnlocked && (
          <View
            style={[
              styles.lockOverlay,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Svg
              width={11}
              height={11}
              viewBox="0 0 24 24"
              fill="none"
              testID="badge-lock-icon"
            >
              <Rect
                x="5"
                y="11"
                width="14"
                height="10"
                rx="2"
                stroke={colors.textMuted}
                strokeWidth={2}
              />
              <Path
                d="M8 11V7a4 4 0 018 0v4"
                stroke={colors.textMuted}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
        )}
      </View>

      <View style={styles.badgeInfo}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.badgeName,
              { color: isUnlocked ? colors.textPrimary : colors.textMuted },
            ]}
          >
            {nombre}
          </Text>
          {categoria ? (
            <View
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isUnlocked
                    ? colors.chipActiveBg
                    : colors.surface,
                },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.brandAccent }]}>
                {categoria}
              </Text>
            </View>
          ) : null}
        </View>

        {isUnlocked ? (
          <>
            {descripcion ? (
              <Text
                style={[styles.badgeDescription, { color: colors.textSecondary }]}
              >
                {descripcion}
              </Text>
            ) : null}
            {fechaObtencion ? (
              <Text style={[styles.badgeDate, { color: colors.brandAccent }]}>
                ✓ Desbloqueada el{' '}
                {new Date(fechaObtencion).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={[styles.badgeDate, { color: colors.brandAccent }]}>
                ✓ Desbloqueada
              </Text>
            )}
          </>
        ) : (
          <Text
            style={[styles.badgeHint, { color: colors.textMuted }]}
            testID="badge-locked-hint"
          >
            Pista: {criterioDesbloqueo || descripcion || 'Cumple el hito correspondiente'}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing[2],
  },
  iconWrapper: {
    position: 'relative',
    marginRight: Spacing[3],
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[2],
    marginBottom: 2,
  },
  badgeName: {
    ...TextVariants.bodyMd,
    fontWeight: FontWeights.bold,
    flexShrink: 1,
  },
  categoryPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    ...TextVariants.labelSm,
  },
  badgeDescription: {
    ...TextVariants.bodySm,
    marginBottom: 2,
  },
  badgeDate: {
    ...TextVariants.bodySm,
  },
  badgeHint: {
    ...TextVariants.bodySm,
    fontStyle: 'italic',
  },
});
