/**
 * ProfileScreen.tsx
 * BrainSort — Pantalla de perfil del usuario
 *
 * task_breakdown.md T-FE-102
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path } from 'react-native-svg';
import { useAuthContext } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { useProgress } from '../../hooks/useProgress';
import { apiClient } from '../../services/api';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { StreakCounter } from '../../components/gamification/StreakCounter';
import { BadgeCard } from '../../components/gamification/BadgeCard';
import { XpProgressBar } from '../../components/gamification/XpProgressBar';
import { TierBadge } from '../../components/gamification/TierBadge';
import { ProfileStatsCard } from '../../components/gamification/ProfileStatsCard';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing, SpacingAlias } from '../../styles/spacing';
import { calcularProgresoNivel, obtenerTier } from '../../utils/xp.utils';
import type { ProfileStackParamList } from '../../navigation/ProfileStackNavigator';

type ProfileNavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

function GearIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={3.2} stroke={color} strokeWidth={1.75} />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.08a1.65 1.65 0 0 0 .92-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.08a1.65 1.65 0 0 0 1.51.92H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PencilIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m9 6 6 6-6 6"
        stroke={color}
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileNavProp>();
  const { width } = useWindowDimensions();
  const isDesktopHeader = width >= 980;
  const isTwoColumn = width >= 900;

  const { theme } = useThemeContext();
  const colors = theme.colors;
  const { usuario, isLoading: isLoadingAuth } = useAuthContext();
  const { logout } = useAuth();
  const { progreso, isLoadingProgreso, catalogoInsignias } = useProgress();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(usuario?.nombre || '');
  const [isSaving, setIsSaving] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);

  const datosProgreso = progreso;
  const nombreMostrado = localName ?? usuario?.nombre ?? '';

  const webPointer =
    Platform.OS === 'web'
      ? ({ cursor: 'pointer', transitionDuration: '150ms' } as any)
      : undefined;

  const handleSave = async () => {
    if (!editedName.trim()) return;
    setIsSaving(true);
    try {
      await apiClient.patch('/users/me', { nombre: editedName });
      setLocalName(editedName);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedName(nombreMostrado);
    setIsEditing(false);
  };

  const handleEditPress = () => {
    setEditedName(nombreMostrado);
    setIsEditing(true);
  };

  if (isLoadingAuth) {
    return (
      <SafeAreaWrapper>
        {!isDesktopHeader && <Header title="Mi Perfil" showBackButton />}
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.brandAccent} size="large" />
        </View>
      </SafeAreaWrapper>
    );
  }

  if (!usuario) {
    return (
      <SafeAreaWrapper>
        {!isDesktopHeader && <Header title="Perfil" showBackButton />}
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>
            Error cargando perfil
          </Text>
        </View>
      </SafeAreaWrapper>
    );
  }

  const progresoNivel = datosProgreso
    ? calcularProgresoNivel(datosProgreso.puntosTotales, datosProgreso.nivelActual)
    : null;
  const tier = datosProgreso ? obtenerTier(datosProgreso.nivelActual) : null;

  const vitrina =
    catalogoInsignias && catalogoInsignias.length > 0
      ? catalogoInsignias
      : (datosProgreso?.insignias ?? []).map((ins) => ({
          ...ins,
          desbloqueada: true,
        }));
  const desbloqueadasCount = vitrina.filter(
    (b) => b.desbloqueada !== false,
  ).length;

  const identityCard = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.heroSection}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: colors.brandAccent,
              borderColor: colors.brandPrimary,
            },
          ]}
        >
          <Text style={[styles.avatarText, { color: colors.textOnAccent }]}>
            {nombreMostrado ? nombreMostrado.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>

        {isEditing ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.inputBorderFocused,
                  color: colors.inputText,
                },
              ]}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
              maxLength={50}
              placeholder="Tu nombre"
              placeholderTextColor={colors.inputPlaceholder}
            />
            <View style={styles.editNameButtons}>
              <Button
                title="Cancelar"
                onPress={handleCancel}
                variant="ghost"
                style={styles.editBtnSm}
              />
              <Button
                title="Guardar"
                onPress={handleSave}
                disabled={!editedName.trim() || isSaving}
                loading={isSaving}
                style={styles.editBtnSm}
              />
            </View>
          </View>
        ) : (
          <Pressable
            onPress={handleEditPress}
            accessibilityRole="button"
            accessibilityLabel="Editar nombre de perfil"
            style={(state: any) => [
              styles.nameRow,
              webPointer,
              state.hovered && { opacity: 0.85 },
              state.pressed && { opacity: 0.7 },
            ]}
          >
            <Text style={[styles.displayName, { color: colors.textPrimary }]}>
              {nombreMostrado}
            </Text>
            <PencilIcon color={colors.textMuted} size={16} />
          </Pressable>
        )}

        <Text style={[styles.correo, { color: colors.textMuted }]}>
          {usuario.correo}
        </Text>

        <View style={styles.badgesRow}>
          <View
            style={[
              styles.rolBadge,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.rolText, { color: colors.textSecondary }]}>
              {usuario.rol}
            </Text>
          </View>
          {tier && <TierBadge tier={tier} size="sm" />}
        </View>
      </View>

      <View style={[styles.fieldRow, { borderTopColor: colors.border }]}>
        <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>
          ID de usuario
        </Text>
        <Text
          style={[styles.fieldValueMono, { color: colors.textSecondary }]}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {usuario.id}
        </Text>
      </View>

      <Pressable
        onPress={() => navigation.navigate('Settings')}
        accessibilityRole="button"
        accessibilityLabel="Ir a configuración"
        style={(state: any) => [
          styles.settingsRow,
          webPointer,
          { borderTopColor: colors.border, borderBottomColor: colors.border },
          state.hovered && { backgroundColor: colors.surfaceHighlight },
          state.pressed && { opacity: 0.8 },
        ]}
      >
        <GearIcon color={colors.textSecondary} size={18} />
        <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>
          Configuración
        </Text>
        <ChevronRightIcon color={colors.textMuted} size={18} />
      </Pressable>

      <Button
        title="Cerrar Sesión"
        onPress={logout}
        style={{ backgroundColor: colors.error, borderRadius: BorderRadius.md }}
      />
    </View>
  );

  return (
    <SafeAreaWrapper>
      {!isDesktopHeader && <Header title="Mi Perfil" showBackButton />}
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.innerContainer}>
          {isDesktopHeader && (
            <View style={styles.pageHero}>
              <View style={styles.pageHeroText}>
                <Text
                  accessibilityRole="header"
                  style={[styles.pageTitle, { color: colors.textPrimary }]}
                >
                  Mi perfil
                </Text>
                <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
                  Gestiona tu cuenta, revisa tu rango y personaliza tu experiencia
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('Settings')}
                accessibilityRole="button"
                accessibilityLabel="Abrir configuración"
                style={(state: any) => [
                  styles.heroActionBtn,
                  webPointer,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                  state.hovered && { borderColor: colors.brandAccent },
                  state.pressed && { opacity: 0.82 },
                ]}
              >
                <GearIcon color={colors.textPrimary} size={17} />
                <Text
                  style={[
                    styles.heroActionText,
                    { color: colors.textPrimary },
                  ]}
                >
                  Configuración
                </Text>
              </Pressable>
            </View>
          )}

          <View style={isTwoColumn ? styles.twoColGrid : styles.singleCol}>
            {/* ── Left Column ── */}
            <View style={isTwoColumn ? styles.leftCol : undefined}>
              {identityCard}
              {datosProgreso && (
                <StreakCounter racha={datosProgreso.rachaDias} />
              )}
            </View>

            {/* ── Right Column ── */}
            <View style={isTwoColumn ? styles.rightCol : undefined}>
              {datosProgreso && progresoNivel && tier ? (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.levelRow}>
                    <View style={styles.levelInfo}>
                      <Text
                        style={[styles.levelNumber, { color: colors.textPrimary }]}
                      >
                        Nivel {datosProgreso.nivelActual}
                      </Text>
                      <Text
                        style={[
                          styles.levelXP,
                          styles.tabular,
                          { color: colors.textMuted },
                        ]}
                      >
                        {datosProgreso.puntosTotales.toLocaleString('es-MX')} XP totales
                      </Text>
                    </View>
                    <TierBadge tier={tier} size="sm" />
                  </View>

                  <XpProgressBar
                    progresoNivel={progresoNivel}
                    nivelActual={datosProgreso.nivelActual}
                  />
                </View>
              ) : isLoadingProgreso ? (
                <View
                  style={[
                    styles.card,
                    styles.center,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      paddingVertical: Spacing[6],
                    },
                  ]}
                >
                  <ActivityIndicator color={colors.brandAccent} size="small" />
                  <Text
                    style={[
                      styles.errorText,
                      { color: colors.textMuted, marginTop: Spacing[2] },
                    ]}
                  >
                    Cargando progreso…
                  </Text>
                </View>
              ) : null}

              {datosProgreso && (
                <ProfileStatsCard
                  simulacionesCompletadas={datosProgreso.simulacionesCompletadas}
                  ejerciciosCorrectos={datosProgreso.ejerciciosCorrectos}
                  ejerciciosTotales={datosProgreso.ejerciciosTotales}
                  posicionRanking={datosProgreso.posicionRanking}
                  puntosTotales={datosProgreso.puntosTotales}
                />
              )}

              {vitrina.length > 0 && (
                <View
                  style={[
                    styles.card,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>
                    Vitrina de Insignias ({desbloqueadasCount}/{vitrina.length})
                  </Text>
                  <View
                    style={
                      isTwoColumn ? styles.badgesGrid : styles.badgesList
                    }
                  >
                    {vitrina.map((insignia, idx) => (
                      <View
                        key={`${insignia.nombre}-${idx}`}
                        style={isTwoColumn ? styles.badgeGridItem : undefined}
                      >
                        <BadgeCard
                          nombre={insignia.nombre}
                          imagen={insignia.imagen}
                          descripcion={(insignia as any).descripcion}
                          criterioDesbloqueo={
                            (insignia as any).criterioDesbloqueo
                          }
                          categoria={(insignia as any).categoria}
                          desbloqueada={insignia.desbloqueada ?? true}
                          fechaObtencion={insignia.fechaObtencion}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SpacingAlias.screenPaddingX,
    paddingTop: Spacing[5],
    paddingBottom: Spacing[10],
  },
  innerContainer: {
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  pageHero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing[4],
    marginBottom: Spacing[6],
  },
  pageHeroText: {
    flex: 1,
    gap: Spacing[1],
  },
  pageTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 30,
  },
  pageSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  heroActionBtn: {
    minHeight: 42,
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
  },
  heroActionText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
  twoColGrid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[5],
  },
  singleCol: {
    flexDirection: 'column',
  },
  leftCol: {
    width: 340,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...TextVariants.bodyMd,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  avatarText: {
    fontSize: FontSizes['3xl'],
    fontWeight: FontWeights.bold,
    fontFamily: FontFamilies.bold,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[1],
  },
  displayName: {
    ...TextVariants.h3,
    fontWeight: FontWeights.bold,
  },
  editNameContainer: {
    width: '100%',
    marginBottom: Spacing[2],
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.lg,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  editNameButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  editBtnSm: {
    flex: 1,
  },
  correo: {
    ...TextVariants.bodySm,
    marginBottom: Spacing[3],
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
  },
  rolBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderWidth: 1,
  },
  rolText: {
    ...TextVariants.labelSm,
    fontWeight: FontWeights.medium,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardTitle: {
    ...TextVariants.h4,
    marginBottom: Spacing[4],
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  levelInfo: {
    flex: 1,
  },
  levelNumber: {
    ...TextVariants.h3,
    fontWeight: FontWeights.bold,
  },
  levelXP: {
    ...TextVariants.bodySm,
    marginTop: Spacing[1],
  },
  tabular: {
    ...(Platform.OS === 'web' ? { fontVariant: ['tabular-nums'] } : {}),
  },
  fieldRow: {
    paddingTop: Spacing[3],
    marginBottom: Spacing[3],
    borderTopWidth: 1,
  },
  fieldLabel: {
    ...TextVariants.labelSm,
    marginBottom: 2,
  },
  fieldValueMono: {
    fontFamily: FontFamilies.mono,
    fontSize: FontSizes.xs,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing[4],
    gap: Spacing[3],
  },
  settingsLabel: {
    ...TextVariants.bodyMd,
    flex: 1,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  badgesList: {
    flexDirection: 'column',
  },
  badgeGridItem: {
    width: '48.5%',
    minWidth: 260,
  },
});

export default ProfileScreen;
