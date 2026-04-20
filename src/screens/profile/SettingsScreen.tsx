/**
 * SettingsScreen.tsx
 * BrainSort — Pantalla de configuración de la aplicación
 *
 * task_breakdown.md T-FE-103
 *
 * Implementa:
 *   - Configuración de tema (claro/oscuro)
 *   - Configuración de idioma
 *   - Configuración de notificaciones
 *   - Información de la aplicación
 *   - Enlace a términos y condiciones
 *
 * Referencia: 02-frontend-app.md §1 screens/profile/SettingsScreen.tsx
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import {
  DarkSurfaces,
  DarkText,
  Accent,
  Semantic,
} from '../../styles/colors';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { Spacing, SpacingAlias, BorderRadius } from '../../styles/spacing';

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Pantalla de configuración de la aplicación.
 *
 * @example
 * <SettingsScreen />
 */
export const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaWrapper>
      <Header title="Configuración" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Appearance */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Apariencia</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Modo Oscuro</Text>
            <View style={[styles.toggle, styles.toggleOn]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Idioma</Text>
            <Text style={styles.settingValue}>Español</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notificaciones</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Notificaciones Push</Text>
            <View style={[styles.toggle, styles.toggleOn]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Recordatorios de Racha</Text>
            <View style={[styles.toggle, styles.toggleOn]} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Actualizaciones de Ranking</Text>
            <View style={[styles.toggle, styles.toggleOff]} />
          </TouchableOpacity>
        </View>

        {/* Data */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Datos</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Caché</Text>
            <Text style={styles.settingValue}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Datos Offline</Text>
            <Text style={styles.settingValue}>Gestionar</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acerca de</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Versión</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Términos y Condiciones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Política de Privacidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>Licencia</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.card}>
          <Text style={[styles.cardTitle, styles.dangerTitle]}>Zona de Peligro</Text>

          <Button
            title="Borrar Todos los Datos"
            onPress={() => console.log('Borrar datos')}
            variant="ghost"
            style={styles.dangerButton}
          />
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: SpacingAlias.screenPaddingX,
    paddingBottom: Spacing[8],
  },
  card: {
    backgroundColor: DarkSurfaces.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    color: DarkText.secondary,
    marginBottom: Spacing[4],
  },
  dangerTitle: {
    color: Semantic.error,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: DarkSurfaces.border,
  },
  settingLabel: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
  },
  settingValue: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: DarkSurfaces.border,
  },
  toggleOn: {
    backgroundColor: Accent[500],
  },
  toggleOff: {
    backgroundColor: DarkSurfaces.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    marginBottom: Spacing[3],
  },
  infoLabel: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  infoValue: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
    fontWeight: FontWeights.medium,
  },
  dangerButton: {
    backgroundColor: Semantic.error,
  },
});
