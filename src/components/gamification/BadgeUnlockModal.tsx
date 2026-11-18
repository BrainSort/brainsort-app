import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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

export const BadgeUnlockModal: React.FC<BadgeUnlockModalProps> = ({
  visible,
  badges,
  onClose,
}) => {
  const colors = useSafeColors();

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
      <View
        style={[styles.overlay, { backgroundColor: colors.overlayBackground }]}
        testID="badge-unlock-modal"
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.brandAccent,
            },
          ]}
        >
          <Text style={[styles.kicker, { color: colors.brandAccent }]}>
            🏆 ¡Logro Desbloqueado!
          </Text>

          <View style={styles.iconContainer}>
            <BadgeIcon
              imagen={primaryBadge.imagen}
              desbloqueada={true}
              size={72}
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
              +{badges.length - 1} insignia(s) adicional(es) desbloqueada(s)
            </Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primaryButton }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Cerrar notificación de insignia"
            testID="badge-unlock-close-btn"
          >
            <Text
              style={[styles.buttonText, { color: colors.primaryButtonText }]}
            >
              ¡Excelente!
            </Text>
          </TouchableOpacity>
        </View>
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
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    padding: Spacing[6],
    alignItems: 'center',
  },
  kicker: {
    ...TextVariants.labelMd,
    fontWeight: FontWeights.bold,
    marginBottom: Spacing[3],
    textTransform: 'uppercase',
  },
  iconContainer: {
    marginVertical: Spacing[3],
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
