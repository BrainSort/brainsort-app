/**
 * LoginScreen.tsx
 * BrainSort — Pantalla de inicio de sesión
 *
 * task_breakdown.md T-FE-093
 *
 * Implementa:
 *   - Layout responsivo split en desktop (width >= 960) y tarjeta centrada en móvil/tablet
 *   - Soporte completo de tema Dark/Light vía ThemeContext
 *   - Campos: correo + contraseña con toggle de visibilidad
 *   - Validación básica en cliente antes de llamar API
 *   - Llama useAuth().login() — conecta con POST /api/auth/login
 *   - Estado de carga visual durante el request
 *   - Mensaje de error tipado desde AuthError
 *   - Link hacia RegisterScreen
 *
 * Referencia: architecture-auth.spec.md §2.1, §3.1
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
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { AuthSimulationPreview } from '../../components/auth/AuthSimulationPreview';
import { BrainSortLogo } from '../../components/layout/BrainSortLogo';
import { useThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { BorderRadius, BorderWidths, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const DESKTOP_BREAKPOINT = 960;

// ─── Iconos SVG ───────────────────────────────────────────────────────────────

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={1.75} />
      <Path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function AlertIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={1.75} />
      <Line
        x1="12"
        y1="8"
        x2="12"
        y2="13"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
      <Circle cx="12" cy="16.5" r="1" fill={color} />
    </Svg>
  );
}

function EyeIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.75} />
    </Svg>
  );
}

function EyeOffIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 19c-6.5 0-10-7-10-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c6.5 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="2"
        y1="2"
        x2="22"
        y2="22"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function PlayStepIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 4l13 8-13 8V4z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CodeSyncIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 6l-2 12"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProgressCheckIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17l-5-5"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────

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
  themeToggleBtn: {
    minWidth: 44,
    minHeight: 44,
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        outlineStyle: 'none',
        outlineWidth: 0,
        transitionProperty: 'opacity',
        transitionDuration: '160ms',
      } as any,
    }),
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[12],
  },
  desktopSplitContainer: {
    width: '100%',
    maxWidth: 980,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[10],
  },
  mobileContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  mobileBrandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[6],
  },
  brandShowcase: {
    flex: 1,
    gap: Spacing[5],
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  brandTitle: {
    fontFamily: FontFamilies.extraBold,
    fontWeight: FontWeights.extraBold,
    fontSize: 26,
    letterSpacing: -0.3,
  },
  showcaseHeadline: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  featureList: {
    gap: Spacing[3],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  featureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidths.thin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.md,
    lineHeight: 20,
  },

  // Card
  formCardDesktop: {
    width: 440,
    borderRadius: BorderRadius.xl,
    borderWidth: BorderWidths.thin,
    padding: Spacing[8],
  },
  formCardMobile: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: BorderWidths.thin,
    padding: Spacing[6],
  },

  // Header
  headerContainer: {
    marginBottom: Spacing[6],
  },
  title: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes['2xl'],
    lineHeight: 28,
    marginBottom: Spacing[1.5],
  },
  subtitle: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
    lineHeight: 20,
  },

  // Form
  fieldContainer: {
    marginBottom: Spacing[4],
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.sm,
    marginBottom: Spacing[2],
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.md,
    fontFamily: FontFamilies.regular,
    minHeight: 48,
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 2,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },

  // Error banner
  errorBanner: {
    borderWidth: BorderWidths.thin,
    borderRadius: BorderRadius.md,
    padding: Spacing[3],
    marginBottom: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2.5],
  },
  errorText: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    lineHeight: 18,
    flex: 1,
  },

  // Submit button
  submitButton: {
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidths.thin,
    paddingVertical: Spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[2],
    minHeight: 50,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'opacity, transform, background-color',
        transitionDuration: '150ms',
      } as any,
    }),
  },
  submitButtonDisabled: {
    opacity: 0.55,
  },
  submitButtonText: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.lg,
    color: '#FFFFFF',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing[6],
    gap: Spacing[1.5],
  },
  footerText: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.md,
  },
  footerLinkBtn: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing[1],
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  footerLink: {
    fontFamily: FontFamilies.semiBold,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.md,
  },
});

// ─── Componente ───────────────────────────────────────────────────────────────

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { theme, mode, toggleTheme } = useThemeContext();
  const { colors } = theme;
  const isDark = mode === 'dark';
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  // Estado local del formulario
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const errorTextColor = isDark ? '#FF6B7A' : '#A80016';
  const errorBgColor = isDark
    ? 'rgba(255, 107, 122, 0.12)'
    : 'rgba(208, 2, 27, 0.08)';
  const errorBorderColor = isDark
    ? 'rgba(255, 107, 122, 0.45)'
    : 'rgba(168, 0, 22, 0.35)';
  const submitBgColor =
    isDark || colors.ctaPrimary === '#237FFF' ? '#1864D9' : colors.ctaPrimary;

  // ─── Validación básica en cliente ────────────────────────────────────────

  const validate = useCallback((): string | null => {
    if (!correo.trim()) return 'El correo es requerido.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      return 'Correo no válido.';
    if (!contrasena) return 'La contraseña es requerida.';
    if (contrasena.length < 8)
      return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  }, [correo, contrasena]);

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleLogin = useCallback(async () => {
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsLoading(true);
    try {
      await login(correo.trim().toLowerCase(), contrasena);
    } catch (err: any) {
      const rawMessage = String(err?.message ?? '');
      const lower = rawMessage.toLowerCase();
      if (
        err?.status === 401 ||
        err?.statusCode === 401 ||
        lower.includes('unauthorized') ||
        lower.includes('401') ||
        lower.includes('credentials')
      ) {
        setErrorMessage('Correo o contraseña incorrectos.');
      } else {
        setErrorMessage(
          rawMessage || 'Error al iniciar sesión. Intenta nuevamente.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [correo, contrasena, login, validate]);

  const hasFieldError = (field: 'correo' | 'contrasena') => {
    if (!errorMessage) return false;
    if (field === 'correo') return errorMessage.toLowerCase().includes('correo');
    if (field === 'contrasena')
      return errorMessage.toLowerCase().includes('contraseña');
    return false;
  };

  const formCard = (
    <View
      style={[
        isDesktop ? styles.formCardDesktop : styles.formCardMobile,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        Platform.OS === 'web' &&
          ({
            boxShadow: isDark
              ? '0 20px 44px rgba(0, 0, 0, 0.36)'
              : '0 12px 32px rgba(15, 23, 42, 0.08)',
          } as any),
      ]}
    >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          accessibilityRole="header"
        >
          Bienvenido de vuelta
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Ingresa tu correo y contraseña para continuar.
        </Text>
      </View>

      {/* Error banner */}
      {errorMessage && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: errorBgColor,
              borderColor: errorBorderColor,
            },
          ]}
          accessibilityRole="alert"
        >
          <AlertIcon color={errorTextColor} />
          <Text style={[styles.errorText, { color: errorTextColor }]}>
            {errorMessage}
          </Text>
        </View>
      )}

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
              borderColor: hasFieldError('correo')
                ? errorTextColor
                : focusedField === 'correo'
                  ? colors.inputBorderFocused
                  : colors.inputBorder,
              color: colors.inputText,
            },
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
        <View style={styles.passwordWrapper}>
          <TextInput
            style={[
              styles.input,
              styles.passwordInput,
              {
                backgroundColor: colors.inputBackground,
                borderColor: hasFieldError('contrasena')
                  ? errorTextColor
                  : focusedField === 'contrasena'
                    ? colors.inputBorderFocused
                    : colors.inputBorder,
                color: colors.inputText,
              },
            ]}
            value={contrasena}
            onChangeText={setContrasena}
            onFocus={() => setFocusedField('contrasena')}
            onBlur={() => setFocusedField(null)}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={colors.inputPlaceholder}
            secureTextEntry={!showPassword}
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            editable={!isLoading}
            accessibilityLabel="Contraseña"
            testID="input-contrasena"
          />
          <Pressable
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeButton}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            testID="btn-toggle-password"
          >
            {showPassword ? (
              <EyeOffIcon color={colors.textMuted} />
            ) : (
              <EyeIcon color={colors.textMuted} />
            )}
          </Pressable>
        </View>
      </View>

      {/* Botón submit */}
      <Pressable
        style={({ pressed, hovered }: any) => [
          styles.submitButton,
          {
            backgroundColor: submitBgColor,
            borderColor: colors.ctaPrimaryBorder,
            opacity: isLoading ? 0.55 : pressed ? 0.88 : hovered ? 0.94 : 1,
          },
        ]}
        onPress={handleLogin}
        disabled={isLoading}
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión"
        testID="btn-login"
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitButtonText}>Iniciar Sesión</Text>
        )}
      </Pressable>

      {/* Link a Register */}
      <View style={styles.footerRow}>
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          ¿No tienes cuenta?
        </Text>
        <Pressable
          style={styles.footerLinkBtn}
          onPress={() => navigation.navigate('Register')}
          accessibilityRole="link"
          accessibilityLabel="Crear cuenta"
          testID="link-register"
        >
          <Text style={[styles.footerLink, { color: colors.brandAccent }]}>
            Regístrate
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <KeyboardAvoidingView
      style={[styles.outer, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top-right Dark/Light theme toggle */}
      <View style={styles.topBar}>
        <Pressable
          onPress={toggleTheme}
          style={({ pressed, hovered }: any) => [
            styles.themeToggleBtn,
            {
              opacity: pressed ? 0.65 : hovered ? 0.8 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'
          }
          testID="btn-toggle-theme"
        >
          {isDark ? (
            <SunIcon color={colors.textPrimary} />
          ) : (
            <MoonIcon color={colors.textPrimary} />
          )}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isDesktop ? (
          <View style={styles.desktopSplitContainer}>
            {/* Left brand showcase */}
            <View style={styles.brandShowcase}>
              <View style={styles.brandLockup}>
                <BrainSortLogo size={44} />
                <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                  BrainSort
                </Text>
              </View>

              <Text
                style={[styles.showcaseHeadline, { color: colors.textPrimary }]}
              >
                Aprende algoritmos visualizando cada paso
              </Text>

              <View style={styles.featureList}>
                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIconWrap,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <PlayStepIcon color={colors.brandAccent} />
                  </View>
                  <Text
                    style={[styles.featureText, { color: colors.textSecondary }]}
                  >
                    Simulación interactiva paso a paso con control de velocidad
                  </Text>
                </View>

                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIconWrap,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <CodeSyncIcon color={colors.brandAccent} />
                  </View>
                  <Text
                    style={[styles.featureText, { color: colors.textSecondary }]}
                  >
                    Pseudocódigo sincronizado en tiempo real con cada estado
                  </Text>
                </View>

                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIconWrap,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.borderSubtle,
                      },
                    ]}
                  >
                    <ProgressCheckIcon color={colors.brandAccent} />
                  </View>
                  <Text
                    style={[styles.featureText, { color: colors.textSecondary }]}
                  >
                    Ejercicios prácticos y progreso medible por tema
                  </Text>
                </View>
              </View>

              <AuthSimulationPreview />
            </View>

            {/* Right form card */}
            {formCard}
          </View>
        ) : (
          <View style={styles.mobileContainer}>
            <View style={styles.mobileBrandHeader}>
              <BrainSortLogo size={40} />
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                BrainSort
              </Text>
            </View>
            {formCard}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
