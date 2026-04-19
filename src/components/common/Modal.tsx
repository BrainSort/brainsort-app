/**
 * Modal.tsx
 * BrainSort — Componente modal reutilizable
 *
 * task_breakdown.md T-FE-060
 *
 * Props:
 *   • visible: Control de visibilidad
 *   • onClose: Callback al cerrar
 *   • title: Título del modal
 *   • children: Contenido
 *   • buttons: Acciones del modal
 *
 * Se usa para: diálogos de confirmación, "Próximamente", opciones.
 *
 * Referencia: 02-frontend-app.md §1 components/common/Modal.tsx
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import { Button } from './Button';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ModalButton {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  buttons?: ModalButton[];
  closeButtonText?: string;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    minWidth: '80%',
    maxWidth: 500,
  },
  title: {
    ...typography.heading2,
    color: colors.gray900,
    marginBottom: spacing.md,
  },
  body: {
    marginBottom: spacing.lg,
  },
  bodyText: {
    ...typography.body,
    color: colors.gray700,
    lineHeight: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.gray500,
    fontWeight: '300',
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Componente modal reutilizable para diálogos y confirmaciones.
 *
 * @example
 * const [visible, setVisible] = useState(false);
 *
 * <Modal
 *   visible={visible}
 *   onClose={() => setVisible(false)}
 *   title="Confirmar acción"
 *   buttons={[
 *     { label: 'Cancelar', onPress: () => setVisible(false) },
 *     { label: 'Confirmar', onPress: handleConfirm, variant: 'primary' },
 *   ]}
 * >
 *   <Text>¿Deseas continuar?</Text>
 * </Modal>
 *
 * @example
 * <Modal
 *   visible={showComingSoon}
 *   onClose={() => setShowComingSoon(false)}
 *   title="Próximamente"
 * >
 *   <Text>Este algoritmo estará disponible pronto.</Text>
 * </Modal>
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  buttons = [],
  closeButtonText = '×',
}) => {
  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Botón cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{closeButtonText}</Text>
          </TouchableOpacity>

          {/* Título */}
          {title && <Text style={styles.title}>{title}</Text>}

          {/* Contenido */}
          <View style={styles.body}>
            {typeof children === 'string' ? (
              <Text style={styles.bodyText}>{children}</Text>
            ) : (
              children
            )}
          </View>

          {/* Botones de acción */}
          {buttons.length > 0 && (
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <View key={index} style={styles.button}>
                  <Button
                    title={button.label}
                    onPress={button.onPress}
                    variant={button.variant || 'secondary'}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
    </RNModal>
  );
};
