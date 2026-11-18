import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Accent, DarkSurfaces, DarkText } from '../../styles/colors';
import { FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { BadgeIcon } from './BadgeIcon';

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
  const isUnlocked = desbloqueada !== false;

  return (
    <View
      style={[
        styles.badgeItem,
        isUnlocked ? styles.badgeItemUnlocked : styles.badgeItemLocked,
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
          <View style={styles.lockOverlay}>
            <Text style={styles.lockText}>🔒</Text>
          </View>
        )}
      </View>

      <View style={styles.badgeInfo}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.badgeName,
              !isUnlocked && styles.badgeNameLocked,
            ]}
          >
            {nombre}
          </Text>
          {categoria ? (
            <View
              style={[
                styles.categoryPill,
                !isUnlocked && styles.categoryPillLocked,
              ]}
            >
              <Text style={styles.categoryText}>{categoria}</Text>
            </View>
          ) : null}
        </View>

        {isUnlocked ? (
          <>
            {descripcion ? (
              <Text style={styles.badgeDescription}>{descripcion}</Text>
            ) : null}
            {fechaObtencion ? (
              <Text style={styles.badgeDate}>
                ✓ Desbloqueada el{' '}
                {new Date(fechaObtencion).toLocaleDateString()}
              </Text>
            ) : (
              <Text style={styles.badgeDate}>✓ Desbloqueada</Text>
            )}
          </>
        ) : (
          <Text style={styles.badgeHint} testID="badge-locked-hint">
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
  badgeItemUnlocked: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderColor: Accent[500],
  },
  badgeItemLocked: {
    backgroundColor: DarkSurfaces.background,
    borderColor: DarkSurfaces.border,
    opacity: 0.65,
  },
  iconWrapper: {
    position: 'relative',
    marginRight: Spacing[3],
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: DarkSurfaces.surface,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
  },
  lockText: {
    fontSize: 10,
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
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
    flexShrink: 1,
  },
  badgeNameLocked: {
    color: DarkText.muted,
  },
  categoryPill: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryPillLocked: {
    backgroundColor: DarkSurfaces.surface,
  },
  categoryText: {
    ...TextVariants.labelSm,
    color: Accent[500],
  },
  badgeDescription: {
    ...TextVariants.bodySm,
    color: DarkText.secondary,
    marginBottom: 2,
  },
  badgeDate: {
    ...TextVariants.bodySm,
    color: Accent[500],
  },
  badgeHint: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    fontStyle: 'italic',
  },
});
