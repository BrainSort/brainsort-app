/**
 * App.tsx
 * BrainSort — Punto de entrada de la aplicación
 *
 * Providers (de afuera hacia adentro):
 *   QueryClientProvider  → TanStack Query (cache de API)
 *   AuthProvider         → Estado global de autenticación
 *   AppNavigator         → Navegación + restoreSession
 */

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { SimulationProvider } from './src/context/SimulationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const linkId = 'brainsort-google-fonts';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = GOOGLE_FONTS_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SimulationProvider>
            <AppNavigator />
          </SimulationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}