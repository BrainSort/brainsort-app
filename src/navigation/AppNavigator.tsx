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

import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../context/AuthContext';
import { useApiTokenSync } from '../services/api';
import { DarkSurfaces, DarkText, Accent } from '../styles/colors';
import { FontFamilies, FontSizes } from '../styles/typography';

// ─── Estilos ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  splashLogo: { fontSize: 56 },
  splashText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: FontSizes.lg,
    color: DarkText.muted,
  },
  // DEV BYPASS — visible solo en __DEV__ (se elimina en builds de producción)
  devBypass: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
  },
  devLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.xs,
    color: DarkText.disabled,
    letterSpacing: 1,
  },
  devButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F5A623',
    backgroundColor: 'rgba(245,166,35,0.1)',
  },
  devButtonText: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.sm,
    color: '#F5A623',
  },
});

// ─── Splash loader ────────────────────────────────────────────────────────────

function SplashLoader() {
  return (
    <View style={styles.splash}>
      <Text style={styles.splashLogo}>⇅</Text>
      <ActivityIndicator color={Accent[500]} size="large" />
      <Text style={styles.splashText}>Cargando BrainSort…</Text>
    </View>
  );
}

// ─── Root navigator ───────────────────────────────────────────────────────────

function RootNavigator() {
  const { restoreSession } = useAuth();
  const { isAuthenticated, isLoading, setAuth } = useAuthContext();

  // Sincroniza token del contexto con el cliente HTTP
  useApiTokenSync();

  // Al montar, intentar restaurar sesión desde almacenamiento persistente
  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── DEV: Inyectar sesión falsa sin tocar el backend ──────────────────────
  // __DEV__ = true en Expo dev server, false en producción (Metro lo elimina).
  const handleDevLogin = () => {
    setAuth(
      {
        id: 'dev-001',
        nombre: 'Dev User',
        correo: 'dev@brainsort.app',
        rol: 'Estudiante',
      },
      { accessToken: 'dev-token', refreshToken: 'dev-refresh' },
      'usuario',
    );
  };

  // Mientras se restaura la sesión, mostrar splash
  if (isLoading) {
    return <SplashLoader />;
  }

  return (
    <>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}

      {/* Botón flotante DEV — solo aparece en modo desarrollo y sin sesión */}
      {__DEV__ && !isAuthenticated && (
        <View style={styles.devBypass} pointerEvents="box-none">
          <Text style={styles.devLabel}>── DEV BYPASS ──</Text>
          <TouchableOpacity
            style={styles.devButton}
            onPress={handleDevLogin}
            accessibilityLabel="Saltar autenticación (solo desarrollo)"
            testID="btn-dev-login"
          >
            <Text style={styles.devButtonText}>⚡ Saltar auth (DEV)</Text>
          </TouchableOpacity>
        </View>
      )}
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
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}