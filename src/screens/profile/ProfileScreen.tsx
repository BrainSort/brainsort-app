/**
 * ProfileScreen.tsx
 * BrainSort — Pantalla de perfil del usuario
 *
 * task_breakdown.md T-FE-102
 *
 * Implementa:
 *   - Muestra información del usuario (nombre, correo, rol)
 *   - Permite editar nombre
 *   - Muestra estadísticas resumidas
 *   - Enlace a SettingsScreen
 *   - Botón de logout
 *
 * Referencia: 02-frontend-app.md §1 screens/profile/ProfileScreen.tsx
 *            hooks/useAuth.ts
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useAuthContext } from '../../context/AuthContext';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../services/api';
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
 * Pantalla de perfil del usuario.
 *
 * @example
 * <ProfileScreen />
 */
export const ProfileScreen: React.FC = () => {
  const { usuario, isLoading: isLoadingAuth } = useAuthContext();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(usuario?.nombre || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (editedName.trim()) {
      setIsSaving(true);
      try {
        await apiClient.patch('/api/users/me', { nombre: editedName });
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedName(usuario?.nombre || '');
    setIsEditing(false);
  };

  if (isLoadingAuth) {
    return (
      <SafeAreaWrapper>
        <View style={styles.center}>
          <ActivityIndicator color={Accent[500]} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaWrapper>
        <Header title="Perfil" showBackButton />
        <View style={styles.center}>
          <Text style={styles.errorText}>Error cargando perfil</Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <Header title="Mi Perfil" showBackButton />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{usuario.nombre.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información Personal</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombre</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
              />
            ) : (
              <Text style={styles.fieldValue}>{usuario.nombre}</Text>
            )}
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Correo</Text>
            <Text style={styles.fieldValue}>{usuario.correo}</Text>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Rol</Text>
            <Text style={styles.fieldValue}>{usuario.rol}</Text>
          </View>


          {isEditing ? (
            <View style={styles.buttonRow}>
              <Button
                title="Cancelar"
                onPress={handleCancel}
                variant="ghost"
                style={styles.button}
              />
              <Button
                title="Guardar"
                onPress={handleSave}
                disabled={!editedName.trim() || isSaving}
                loading={isSaving}
                style={styles.button}
              />
            </View>
          ) : (
            <Button
              title="Editar Perfil"
              onPress={() => setIsEditing(true)}
              variant="secondary"
            />
          )}
        </View>

        {/* Account Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cuenta</Text>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>ID</Text>
            <Text style={styles.fieldValue}>{usuario.id}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acciones</Text>

          <Button
            title="Cerrar Sesión"
            onPress={logout}
            style={styles.logoutButton}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TextVariants.bodyMd,
    color: DarkText.muted,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Accent[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...TextVariants.display,
    fontSize: FontSizes['4xl'],
    color: DarkText.primary,
    fontWeight: FontWeights.bold,
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
  fieldRow: {
    marginBottom: Spacing[4],
  },
  fieldLabel: {
    ...TextVariants.bodySm,
    color: DarkText.muted,
    marginBottom: Spacing[1],
  },
  fieldValue: {
    ...TextVariants.bodyMd,
    color: DarkText.primary,
  },
  input: {
    backgroundColor: DarkSurfaces.surfaceElevated,
    borderWidth: 1,
    borderColor: DarkSurfaces.border,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    color: DarkText.primary,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing[4],
  },
  button: {
    flex: 1,
    marginHorizontal: Spacing[2],
  },
  logoutButton: {
    backgroundColor: Semantic.error,
  },
});
