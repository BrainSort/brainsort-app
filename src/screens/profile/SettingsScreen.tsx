/**
 * SettingsScreen.tsx
 * BrainSort — Pantalla de configuración de la aplicación
 *
 * task_breakdown.md T-FE-103
 */

import React from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Circle, Path } from 'react-native-svg';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { FontFamilies, FontSizes, FontWeights, TextVariants } from '../../styles/typography';
import { BorderRadius, Spacing, SpacingAlias } from '../../styles/spacing';
import { useThemeContext } from '../../context/ThemeContext';

type SectionIconKind = 'theme' | 'bell' | 'data' | 'info' | 'alert';

function SectionIcon({
  kind,
  mode,
  color,
}: {
  kind: SectionIconKind;
  mode?: 'dark' | 'light';
  color: string;
}) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {kind === 'theme' &&
        (mode === 'dark' ? (
          <Path
            d="M20.2 14.5A8.2 8.2 0 0 1 9.5 3.8a8.5 8.5 0 1 0 10.7 10.7Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.75} />
            <Path
              d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              stroke={color}
              strokeWidth={1.75}
              strokeLinecap="round"
            />
          </>
        ))}
      {kind === 'bell' && (
        <>
          <Path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.73 21a2 2 0 0 1-3.46 0"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'data' && (
        <>
          <Path
            d="M4 6c0 1.66 3.58 3 8 3s8-1.34 8-3-3.58-3-8-3-8 1.34-8 3Z"
            stroke={color}
            strokeWidth={1.75}
          />
          <Path
            d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"
            stroke={color}
            strokeWidth={1.75}
          />
        </>
      )}
      {kind === 'info' && (
        <>
          <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
          <Path
            d="M12 16v-4M12 8h.01"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </>
      )}
      {kind === 'alert' && (
        <>
          <Path
            d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinejoin="round"
          />
          <Path
            d="M12 9v4M12 17h.01"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

function ArrowLeftIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth={1.85}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const { mode, theme, toggleTheme } = useThemeContext();
  const colors = theme.colors;

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.surface, borderColor: colors.border },
  ];
  const rowStyle = [styles.settingRow, { borderBottomColor: colors.border }];
  const labelStyle = [styles.settingLabel, { color: colors.textPrimary }];
  const valueStyle = [styles.settingValue, { color: colors.textMuted }];
  const titleStyle = [styles.cardTitle, { color: colors.textSecondary }];

  return (
    <SafeAreaWrapper>
      {!isDesktop && (
        <Header
          title="Configuración"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
      )}
      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.innerContainer}>
          {isDesktop && (
            <View style={styles.heroHeader}>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Volver a Mi perfil"
                style={(state: any) => [
                  styles.backLink,
                  Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
                  state.hovered && { opacity: 0.78 },
                  state.pressed && { opacity: 0.6 },
                ]}
              >
                <ArrowLeftIcon color={colors.brandAccent} size={17} />
                <Text
                  style={[styles.backLinkText, { color: colors.brandAccent }]}
                >
                  Volver a Mi perfil
                </Text>
              </Pressable>
              <Text
                accessibilityRole="header"
                style={[styles.pageTitle, { color: colors.textPrimary }]}
              >
                Configuración
              </Text>
              <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
                Personaliza apariencia, notificaciones y datos de la aplicación
              </Text>
            </View>
          )}

          {/* Appearance */}
          <View style={cardStyle}>
            <View style={styles.cardHeaderRow}>
              <SectionIcon kind="theme" mode={mode} color={colors.brandAccent} />
              <Text style={titleStyle}>Apariencia</Text>
            </View>

            <TouchableOpacity
              style={rowStyle}
              onPress={toggleTheme}
              accessibilityRole="switch"
              accessibilityState={{ checked: mode === 'dark' }}
            >
              <Text style={labelStyle}>Modo Oscuro</Text>
              <View
                style={[
                  styles.toggle,
                  mode === 'dark'
                    ? [styles.toggleOn, { backgroundColor: colors.brandAccent }]
                    : [styles.toggleOff, { backgroundColor: colors.border }],
                ]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRowLast]}>
              <Text style={labelStyle}>Idioma</Text>
              <Text style={valueStyle}>Español</Text>
            </TouchableOpacity>
          </View>

          {/* Notifications */}
          <View style={cardStyle}>
            <View style={styles.cardHeaderRow}>
              <SectionIcon kind="bell" color={colors.brandAccent} />
              <Text style={titleStyle}>Notificaciones</Text>
            </View>

            <TouchableOpacity style={rowStyle}>
              <Text style={labelStyle}>Notificaciones Push</Text>
              <View
                style={[
                  styles.toggle,
                  styles.toggleOn,
                  { backgroundColor: colors.brandAccent },
                ]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={rowStyle}>
              <Text style={labelStyle}>Recordatorios de Racha</Text>
              <View
                style={[
                  styles.toggle,
                  styles.toggleOn,
                  { backgroundColor: colors.brandAccent },
                ]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRowLast}>
              <Text style={labelStyle}>Actualizaciones de Ranking</Text>
              <View
                style={[
                  styles.toggle,
                  styles.toggleOff,
                  { backgroundColor: colors.border },
                ]}
              >
                <View style={styles.toggleKnob} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Data */}
          <View style={cardStyle}>
            <View style={styles.cardHeaderRow}>
              <SectionIcon kind="data" color={colors.brandAccent} />
              <Text style={titleStyle}>Datos</Text>
            </View>

            <TouchableOpacity style={rowStyle}>
              <Text style={labelStyle}>Caché</Text>
              <Text style={valueStyle}>Limpiar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRowLast}>
              <Text style={labelStyle}>Datos Offline</Text>
              <Text style={valueStyle}>Gestionar</Text>
            </TouchableOpacity>
          </View>

          {/* About */}
          <View style={cardStyle}>
            <View style={styles.cardHeaderRow}>
              <SectionIcon kind="info" color={colors.brandAccent} />
              <Text style={titleStyle}>Acerca de</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                Versión
              </Text>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>
                1.0.0
              </Text>
            </View>

            <TouchableOpacity style={rowStyle}>
              <Text style={labelStyle}>Términos y Condiciones</Text>
            </TouchableOpacity>

            <TouchableOpacity style={rowStyle}>
              <Text style={labelStyle}>Política de Privacidad</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRowLast}>
              <Text style={labelStyle}>Licencia</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={cardStyle}>
            <View style={styles.cardHeaderRow}>
              <SectionIcon kind="alert" color={colors.error} />
              <Text style={[styles.cardTitle, { color: colors.error }]}>
                Zona de Peligro
              </Text>
            </View>

            <Button
              title="Borrar Todos los Datos"
              onPress={() => console.log('Borrar datos')}
              variant="ghost"
              style={{
                backgroundColor: colors.error,
                borderRadius: BorderRadius.md,
              }}
            />
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
    paddingBottom: Spacing[8],
  },
  innerContainer: {
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  heroHeader: {
    marginBottom: Spacing[6],
    gap: Spacing[1],
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    alignSelf: 'flex-start',
    marginBottom: Spacing[2],
    minHeight: 32,
  },
  backLinkText: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
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
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing[5],
    marginBottom: Spacing[4],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    marginBottom: Spacing[3],
  },
  cardTitle: {
    ...TextVariants.h4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  settingRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
  },
  settingLabel: {
    ...TextVariants.bodyMd,
  },
  settingValue: {
    ...TextVariants.bodyMd,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    alignItems: 'flex-end',
  },
  toggleOff: {
    alignItems: 'flex-start',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
  },
  infoLabel: {
    ...TextVariants.bodyMd,
  },
  infoValue: {
    ...TextVariants.bodyMd,
    fontWeight: FontWeights.medium,
  },
});

export default SettingsScreen;
