/**
 * App.tsx
 * BrainSort — Punto de entrada de la aplicación
 *
 * Providers (de afuera hacia adentro):
 *   QueryClientProvider  → TanStack Query (cache de API)
 *   AuthProvider         → Estado global de autenticación
 *   AppNavigator         → Navegación + restoreSession
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// ─── TanStack Query config ────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min cache por defecto
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}