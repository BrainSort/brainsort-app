/**
 * AppNavigator.tsx
 * BrainSort — Navigator raíz con manejo de sesión
 *
 * task_breakdown.md T-FE-088
 *
 * Responsabilidades:
 *   1. Llama restoreSession() al montar — intenta recuperar sesión guardada
 *   2. Escucha isAuthenticated del AuthContext
 *   3. Muestra AuthNavigator cuando no hay sesión
 *   4. Muestra MainTabNavigator cuando hay sesión activa
 *   5. Muestra SplashLoader mientras carga la sesión
 *
 * Referencia: architecture-auth.spec.md §3.1 «Restore session»
 *             02-frontend-app.md §6 Navegación
 */

import React, { useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import DiagnosticTestScreen from '../screens/onboarding/DiagnosticTestScreen';
import { BrainSortLogo } from '../components/layout/BrainSortLogo';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { useApiTokenSync } from '../services/api';
import { FontFamilies, FontSizes } from '../styles/typography';

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  splashText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.lg,
  },
});

// ─── Splash loader ────────────────────────────────────────────────────────────

function SplashLoader() {
  const { theme } = useThemeContext();
  return (
    <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
      <BrainSortLogo size={64} />
      <ActivityIndicator color={theme.colors.brandAccent} size="large" />
      <Text style={[styles.splashText, { color: theme.colors.textMuted }]}>
        Cargando BrainSort…
      </Text>
    </View>
  );
}

// ─── Authenticated Navigator ──────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator();

function AuthenticatedNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="MainTabs" component={MainTabNavigator} />
      <AuthStack.Screen name="DiagnosticTest" component={DiagnosticTestScreen} options={{ presentation: 'fullScreenModal' }} />
    </AuthStack.Navigator>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

function RootNavigator() {
  const { restoreSession } = useAuth();
  const { isAuthenticated, isLoading } = useAuthContext();

  // Sincroniza token del contexto con el cliente HTTP
  useApiTokenSync();

  // Al montar, intentar restaurar sesión desde almacenamiento persistente
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mientras se restaura la sesión, mostrar splash
  if (isLoading) {
    return <SplashLoader />;
  }

  return (
    <>
      {isAuthenticated ? <AuthenticatedNavigator /> : <AuthNavigator />}
    </>
  );
}

// ─── AppNavigator ─────────────────────────────────────────────────────────────

/**
 * Punto de entrada de navegación. Envuelve todo en NavigationContainer.
 * Los providers (AuthProvider, QueryClientProvider) deben estar en App.tsx
 * por encima de este componente.
 */
export default function AppNavigator() {
  const { mode, theme } = useThemeContext();
  const baseNavTheme = mode === 'dark' ? DarkTheme : DefaultTheme;

  const navigationTheme = useMemo(
    () => ({
      ...baseNavTheme,
      dark: mode === 'dark',
      colors: {
        ...baseNavTheme.colors,
        primary: theme.colors.brandAccent,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.textPrimary,
        border: theme.colors.border,
        notification: theme.colors.brandAccent,
      },
    }),
    [baseNavTheme, mode, theme],
  );

  return (
    <NavigationContainer
      theme={navigationTheme}
      documentTitle={{
        formatter: (options, route) => {
          const title = options?.title ?? route?.name;
          return title ? `${title} | BrainSort` : 'BrainSort';
        },
      }}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}