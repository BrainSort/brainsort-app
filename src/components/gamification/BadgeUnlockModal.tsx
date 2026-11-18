import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Accent, DarkSurfaces, DarkText, Primary } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontWeights, TextVariants } from '../../styles/typography';
import { BadgeIcon } from './BadgeIcon';

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

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  visible,
  badges,
  onClose,
}) => {
  if (!visible || !badges || badges.length === 0) {
    return null;
  }

  const primaryBadge = badges[0];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} testID="badge-unlock-modal">
        <View style={styles.card}>
          <Text style={styles.kicker}>🏆 ¡Logro Desbloqueado!</Text>

          <View style={styles.iconContainer}>
            <BadgeIcon
              imagen={primaryBadge.imagen}
              desbloqueada={true}
              size={72}
            />
          </View>

          <Text style={styles.title} testID="badge-unlock-title">
            {primaryBadge.nombre}
          </Text>

          {primaryBadge.categoria ? (
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>
                {primaryBadge.categoria}
              </Text>
            </View>
          ) : null}

          {primaryBadge.descripcion ? (
            <Text style={styles.description}>{primaryBadge.descripcion}</Text>
          ) : null}

          {badges.length > 1 ? (
            <Text style={styles.extraCount}>
              +{badges.length - 1} insignia(s) adicional(es) desbloqueada(s)
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar notificación de insignia"
            testID="badge-unlock-close-btn"
          >
            <Text style={styles.buttonText}>¡Excelente!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 11, 15, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: Accent[500],
    padding: Spacing[6],
    alignItems: 'center',
  },
  kicker: {
    ...TextVariants.labelMd,
    color: Accent[500],
    fontWeight: FontWeights.bold,
    marginBottom: Spacing[3],
    textTransform: 'uppercase',
  },
  iconContainer: {
    marginVertical: Spacing[3],
  },
  title: {
    ...TextVariants.h3,
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  categoryTag: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    paddingHorizontal: Spacing[3],
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing[3],
  },
  categoryTagText: {
    ...TextVariants.labelSm,
    color: Accent[500],
  },
  description: {
    ...TextVariants.bodyMd,
    color: DarkText.secondary,
    textAlign: 'center',
    marginBottom: Spacing[5],
  },
  extraCount: {
    ...TextVariants.bodySm,
    color: Accent[500],
    marginBottom: Spacing[4],
  },
  button: {
    backgroundColor: Primary[500],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    ...TextVariants.bodyMd,
    color: '#FFFFFF',
    fontWeight: FontWeights.bold,
  },
});
