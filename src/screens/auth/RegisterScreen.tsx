/**
 * RegisterScreen.tsx
 * BrainSort — Pantalla de registro de usuario
 *
 * task_breakdown.md T-FE-094
 *
 * Implementa:
 *   - Layout responsivo split en desktop (>= 960px) y card centrada en móvil/tablet
 *   - Campos: nombre, correo, contraseña (mín 8 chars) con toggle de visibilidad
 *   - Selector de rol con iconos SVG: Estudiante | Profesor | Autodidacta
 *   - Soporte completo de tema Dark / Light vía useThemeContext()
 *   - Validación en cliente + useAuth().register() → POST /api/auth/register
 *   - Preserva testIDs y accessibilityLabels
 */

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/ThemeContext';
import { BrainSortLogo } from '../../components/layout/BrainSortLogo';
import { AuthSimulationPreview } from '../../components/auth/AuthSimulationPreview';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;
type Rol = 'Estudiante' | 'Profesor' | 'Autodidacta';

// ─── Constantes ───────────────────────────────────────────────────────────────

const ROLES: { value: Rol; label: string; description: string }[] = [
  {
    value: 'Estudiante',
    label: 'Estudiante',
    description: 'Aprendo en clases o por mi cuenta',
  },
  {
    value: 'Profesor',
    label: 'Profesor',
    description: 'Enseño o facilito el aprendizaje',
  },
  {
    value: 'Autodidacta',
    label: 'Autodidacta',
    description: 'Aprendo a mi ritmo sin estructura',
  },
];

const SHOWCASE_BENEFITS = [
  {
    key: 'steps',
    text: 'Simulaciones paso a paso con pseudocódigo sincronizado',
  },
  {
    key: 'practice',
    text: 'Ejercicios prácticos y retroalimentación inmediata',
  },
  {
    key: 'streak',
    text: 'Racha diaria, insignias y acceso sin conexión',
  },
] as const;

// ─── Componente ───────────────────────────────────────────────────────────────

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const { theme, mode, toggleTheme } = useThemeContext();
  const { colors } = theme;
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState<Rol>('Estudiante');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // ─── Validación ───────────────────────────────────────────────────────────

  const validate = useCallback((): string | null => {
    if (!nombre.trim()) return 'El nombre es requerido.';
    if (nombre.trim().length < 2) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }
    if (!correo.trim()) return 'El correo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return 'Correo no válido.';
    if (!contrasena) return 'La contraseña es requerida.';
    if (contrasena.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    return null;
  }, [nombre, correo, contrasena]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleRegister = useCallback(async () => {
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await register(
        nombre.trim(),
        correo.trim().toLowerCase(),
        rol,
        contrasena,
      );
      // Si exitoso → AuthContext.isAuthenticated = true → AppNavigator navega a Main
    } catch (err: any) {
      const rawMsg = String(err?.message ?? '');
      const lowerMsg = rawMsg.toLowerCase();
      const isDuplicate =
        err?.status === 409 ||
        lowerMsg.includes('409') ||
        lowerMsg.includes('conflict') ||
        lowerMsg.includes('registrado') ||
        lowerMsg.includes('duplicado') ||
        lowerMsg.includes('already exists');

      setErrorMessage(
        isDuplicate
          ? 'Usuario duplicado: este correo ya está registrado.'
          : rawMsg || 'Error al crear la cuenta. Intenta nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [validate, nombre, correo, contrasena, rol, register]);

  const inputFocusWebStyle = Platform.select({
    web: {
      boxShadow: `0 0 0 3px ${colors.brandAccent}24`,
    } as any,
  });

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top Bar con toggle de tema */}
      <View style={styles.topBar}>
        <Pressable
          onPress={toggleTheme}
          style={({ pressed, hovered }: any) => [
            styles.themeToggleButton,
            {
              opacity: pressed ? 0.65 : hovered ? 0.8 : 1,
            },
            webInteractiveStyle,
            Platform.OS === 'web' && ({ outlineStyle: 'none', outlineWidth: 0 } as any),
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          }
        >
          {mode === 'dark' ? (
            <SunIcon color={colors.textPrimary} size={18} />
          ) : (
            <MoonIcon color={colors.textPrimary} size={18} />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktop ? styles.scrollContentDesktop : styles.scrollContentMobile,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.shellContainer,
            isDesktop ? styles.shellDesktop : styles.shellMobile,
          ]}
        >
          {/* Brand showcase (Desktop izquierda) o Lockup compacto (Móvil) */}
          {isDesktop ? (
            <View style={styles.showcasePanel}>
              <View style={styles.brandLockup}>
                <BrainSortLogo size={44} />
                <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                  BrainSort
                </Text>
              </View>

              <Text
                style={[styles.showcaseHeadline, { color: colors.textPrimary }]}
              >
                Tu ruta personalizada en algoritmos
              </Text>
              <Text
                style={[styles.showcaseSubtitle, { color: colors.textMuted }]}
              >
                Construye intuición real viendo cómo se ordenan y transforman
                los datos en tiempo real.
              </Text>

              <View style={styles.benefitsList}>
                {SHOWCASE_BENEFITS.map((item) => (
                  <View key={item.key} style={styles.benefitRow}>
                    <View
                      style={[
                        styles.benefitIconBox,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.borderSubtle,
                        },
                      ]}
                    >
                      <BenefitIcon
                        name={item.key}
                        color={colors.brandAccent}
                        size={16}
                      />
                    </View>
                    <Text
                      style={[
                        styles.benefitText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Preview animado de simulación */}
              <AuthSimulationPreview />
            </View>
          ) : (
            <View style={styles.mobileLockup}>
              <BrainSortLogo size={36} />
              <Text
                style={[styles.mobileBrandTitle, { color: colors.textPrimary }]}
              >
                BrainSort
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View
            style={[
              styles.formCard,
              isDesktop ? styles.formCardDesktop : styles.formCardMobile,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text
                style={[styles.title, { color: colors.textPrimary }]}
                accessibilityRole="header"
              >
                Crea tu cuenta
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                Es gratis. Empieza a aprender algoritmos hoy.
              </Text>
            </View>

            {/* Error banner */}
            {errorMessage && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: `${colors.error}1A`,
                    borderColor: colors.error,
                  },
                ]}
                accessibilityRole="alert"
              >
                <View style={styles.errorIconWrap}>
                  <AlertIcon color={colors.error} size={17} />
                </View>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {errorMessage}
                </Text>
              </View>
            )}

            {/* Campo nombre */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Nombre completo
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor:
                      focusedField === 'nombre'
                        ? colors.inputBorderFocused
                        : colors.inputBorder,
                    color: colors.inputText,
                  },
                  focusedField === 'nombre' && inputFocusWebStyle,
                  Platform.select({ web: { outlineStyle: 'none' } as any }),
                ]}
                value={nombre}
                onChangeText={setNombre}
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
                placeholder="Tu nombre"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
                editable={!isLoading}
                accessibilityLabel="Nombre completo"
                testID="input-nombre"
              />
            </View>

            {/* Campo correo */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Correo electrónico
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor:
                      focusedField === 'correo'
                        ? colors.inputBorderFocused
                        : colors.inputBorder,
                    color: colors.inputText,
                  },
                  focusedField === 'correo' && inputFocusWebStyle,
                  Platform.select({ web: { outlineStyle: 'none' } as any }),
                ]}
                value={correo}
                onChangeText={setCorreo}
                onFocus={() => setFocusedField('correo')}
                onBlur={() => setFocusedField(null)}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                returnKeyType="next"
                editable={!isLoading}
                accessibilityLabel="Correo electrónico"
                testID="input-correo"
              />
            </View>

            {/* Campo contraseña */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Contraseña
              </Text>
              <View
                style={[
                  styles.passwordWrap,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor:
                      focusedField === 'contrasena'
                        ? colors.inputBorderFocused
                        : colors.inputBorder,
                  },
                  focusedField === 'contrasena' && inputFocusWebStyle,
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: colors.inputText },
                    Platform.select({ web: { outlineStyle: 'none' } as any }),
                  ]}
                  value={contrasena}
                  onChangeText={setContrasena}
                  onFocus={() => setFocusedField('contrasena')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Mínimo 8 caracteres"
                  placeholderTextColor={colors.inputPlaceholder}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  returnKeyType="done"
                  editable={!isLoading}
                  accessibilityLabel="Contraseña"
                  testID="input-contrasena"
                />
                <Pressable
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={({ pressed }) => [
                    styles.eyeButton,
                    { opacity: pressed ? 0.65 : 1 },
                    webInteractiveStyle,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? 'Ocultar contraseña'
                      : 'Mostrar contraseña'
                  }
                >
                  {showPassword ? (
                    <EyeOffIcon color={colors.textMuted} size={18} />
                  ) : (
                    <EyeIcon color={colors.textMuted} size={18} />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Selector de rol */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.rolLabel, { color: colors.textSecondary }]}>
                ¿Cómo describes tu perfil?
              </Text>
              <View style={styles.rolGrid}>
                {ROLES.map((r) => {
                  const isActive = rol === r.value;
                  return (
                    <Pressable
                      key={r.value}
                      style={({ pressed, hovered }: any) => [
                        styles.rolCard,
                        {
                          backgroundColor: isActive
                            ? colors.chipActiveBg
                            : hovered
                              ? colors.surfaceHighlight
                              : colors.surfaceElevated,
                          borderColor: isActive
                            ? colors.chipActiveBorder
                            : colors.border,
                          opacity: pressed ? 0.88 : 1,
                        },
                        webInteractiveStyle,
                      ]}
                      onPress={() => setRol(r.value)}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: isActive }}
                      accessibilityLabel={`Rol: ${r.label}`}
                      testID={`rol-${r.value}`}
                      disabled={isLoading}
                    >
                      <View
                        style={[
                          styles.rolIconBox,
                          {
                            backgroundColor: isActive
                              ? `${colors.brandAccent}1F`
                              : colors.surface,
                            borderColor: isActive
                              ? colors.chipActiveBorder
                              : colors.borderSubtle,
                          },
                        ]}
                      >
                        <RoleIcon
                          rol={r.value}
                          color={
                            isActive ? colors.brandAccent : colors.textSecondary
                          }
                          size={18}
                        />
                      </View>
                      <View style={styles.rolInfo}>
                        <Text
                          style={[
                            styles.rolName,
                            {
                              color: isActive
                                ? colors.brandAccent
                                : colors.textPrimary,
                            },
                          ]}
                        >
                          {r.label}
                        </Text>
                        <Text
                          style={[
                            styles.rolDescription,
                            { color: colors.textMuted },
                          ]}
                        >
                          {r.description}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.rolCheck,
                          {
                            borderColor: isActive
                              ? colors.brandAccent
                              : colors.border,
                            backgroundColor: isActive
                              ? colors.brandAccent
                              : 'transparent',
                          },
                        ]}
                      >
                        {isActive && (
                          <View
                            style={[
                              styles.rolCheckDot,
                              { backgroundColor: colors.primaryButtonText },
                            ]}
                          />
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Botón submit */}
            <Pressable
              style={({ pressed, hovered }: any) => [
                styles.submitButton,
                {
                  backgroundColor:
                    colors.ctaPrimary === '#237FFF'
                      ? '#1864D9'
                      : colors.ctaPrimary,
                  borderColor: colors.ctaPrimaryBorder,
                  opacity: isLoading
                    ? 0.55
                    : pressed
                      ? 0.88
                      : hovered
                        ? 0.94
                        : 1,
                },
                webInteractiveStyle,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Crear cuenta"
              testID="btn-register"
            >
              {isLoading ? (
                <ActivityIndicator
                  color={colors.primaryButtonText}
                  size="small"
                />
              ) : (
                <Text
                  style={[
                    styles.submitButtonText,
                    { color: colors.primaryButtonText },
                  ]}
                >
                  Crear Cuenta
                </Text>
              )}
            </Pressable>

            {/* Link a Login */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textMuted }]}>
                ¿Ya tienes cuenta?
              </Text>
              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.7 : 1 },
                  webInteractiveStyle,
                ]}
                accessibilityRole="link"
                accessibilityLabel="Iniciar sesión"
                testID="link-login"
              >
                <Text
                  style={[styles.footerLink, { color: colors.brandAccent }]}
                >
                  Inicia sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function RoleIcon({
  rol,
  color,
  size,
}: {
  rol: Rol;
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {rol === 'Estudiante' && (
        <>
          <Path
            d="M4.5 5.5C4.5 4.7 5.2 4 6 4h4.5c1 0 1.5.7 1.5 1.8V19c0-.9-.7-1.5-1.6-1.5H6c-.8 0-1.5-.7-1.5-1.5v-10.5Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19.5 5.5c0-.8-.7-1.5-1.5-1.5h-4.5c-1 0-1.5.7-1.5 1.8V19c0-.9.7-1.5 1.6-1.5H18c.8 0 1.5-.7 1.5-1.5v-10.5Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {rol === 'Profesor' && (
        <>
          <Path
            d="M12 4 2.5 9 12 14l9.5-5L12 4Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 11.2v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5M20.5 9.5V15"
            stroke={color}
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {rol === 'Autodidacta' && (
        <Path
          d="M13 2.5 5.5 13h6l-1 8.5L18.5 11h-6l.5-8.5Z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

function BenefitIcon({
  name,
  color,
  size,
}: {
  name: (typeof SHOWCASE_BENEFITS)[number]['key'];
  color: string;
  size: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'steps' && (
        <>
          <Rect
            x={3.5}
            y={4.5}
            width={17}
            height={15}
            rx={2.5}
            stroke={color}
            strokeWidth={1.75}
          />
          <Path
            d="m10 9.5 4.5 2.5-4.5 2.5v-5Z"
            stroke={color}
            strokeWidth={1.75}
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'practice' && (
        <>
          <Circle cx={12} cy={12} r={8.5} stroke={color} strokeWidth={1.75} />
          <Path
            d="m8.2 12.2 2.6 2.6 5-5.4"
            stroke={color}
            strokeWidth={1.85}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {name === 'streak' && (
        <Path
          d="M13 2.5 5.5 13h6l-1 8.5L18.5 11h-6l.5-8.5Z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </Svg>
  );
}

function AlertIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={1.75} />
      <Path
        d="M12 8v5"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={16.2} r={1} fill={color} />
    </Svg>
  );
}

function EyeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={2.8} stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}

function EyeOffIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 3l18 18M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M6.8 6.9C4.3 8.6 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.8 0 3.4-.5 4.8-1.3M9.9 5.7c.7-.1 1.4-.2 2.1-.2 6 0 9.5 6.5 9.5 6.5a15.3 15.3 0 0 1-2.5 3.4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SunIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.75} />
      <Path
        d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MoonIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7.5 7.5 0 1 0 20 14.5Z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

const webInteractiveStyle = Platform.select({
  web: {
    cursor: 'pointer',
    transitionDuration: '150ms',
  } as any,
});

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: Spacing[4],
    right: Spacing[5],
    zIndex: 10,
  },
  themeToggleButton: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  scrollContentDesktop: {
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[10],
  },
  scrollContentMobile: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[14],
    paddingBottom: Spacing[8],
  },
  shellContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  shellDesktop: {
    maxWidth: 1020,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[10],
  },
  shellMobile: {
    maxWidth: 480,
    flexDirection: 'column',
    gap: Spacing[5],
  },
  showcasePanel: {
    flex: 1,
    gap: Spacing[5],
    paddingVertical: Spacing[4],
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  brandTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 22,
  },
  showcaseHeadline: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 30,
    lineHeight: 36,
  },
  showcaseSubtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 22,
    maxWidth: 440,
  },
  benefitsList: {
    gap: Spacing[3],
    marginTop: Spacing[1],
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  benefitIconBox: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  benefitText: {
    flex: 1,
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  mobileLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  mobileBrandTitle: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 22,
  },
  formCard: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.xl,
  },
  formCardDesktop: {
    width: 480,
    padding: 28,
  },
  formCardMobile: {
    width: '100%',
    padding: Spacing[5],
  },
  headerContainer: {
    marginBottom: Spacing[5],
  },
  title: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: Spacing[1],
  },
  subtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 20,
  },
  fieldContainer: {
    marginBottom: Spacing[4],
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.regular,
    minHeight: 46,
  },
  passwordWrap: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing[3],
    paddingRight: Spacing[1],
    minHeight: 46,
  },
  passwordInput: {
    flex: 1,
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.regular,
    minHeight: 44,
  },
  eyeButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolLabel: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    marginBottom: Spacing[2],
  },
  rolGrid: {
    gap: Spacing[2],
  },
  rolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    padding: Spacing[3],
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
  },
  rolIconBox: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rolInfo: {
    flex: 1,
  },
  rolName: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
  rolDescription: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    lineHeight: 16,
    marginTop: 2,
  },
  rolCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolCheckDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  errorBanner: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    marginBottom: Spacing[4],
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  errorIconWrap: {
    marginTop: 1,
  },
  errorText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
    lineHeight: 18,
    flex: 1,
  },
  submitButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    minHeight: 48,
  },
  submitButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[5],
    gap: Spacing[1],
  },
  footerText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
  },
  footerLink: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.sm,
  },
});
