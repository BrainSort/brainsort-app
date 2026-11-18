/**
 * LibraryStackNavigator.tsx
 * BrainSort — Stack Navigator de la sección Biblioteca
 *
 * task_breakdown.md T-FE-091
 *
 * Rutas:
 *   Library            → LibraryScreen
 *   AlgorithmDetail    → AlgorithmDetailScreen
 *
 * Referencia: 02-frontend-app.md §6 Navegación
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LibraryScreen from '../screens/library/LibraryScreen';
import AlgorithmDetailScreen from '../screens/library/AlgorithmDetailScreen';
import SimulationScreen from '../screens/simulation/SimulationScreen';
import { ExerciseScreen } from '../screens/gamification/ExerciseScreen';
import { useThemeContext } from '../context/ThemeContext';
import { FontFamilies, FontWeights, FontSizes } from '../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type LibraryStackParamList = {
  Library: undefined;
  AlgorithmDetail: { algoritmoId: string };
  Simulation: { algoritmoId: string };
  Exercise: { algoritmoId: string };
};

// ─── Navegador ────────────────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<LibraryStackParamList>();

export default function LibraryStackNavigator() {
  const { theme } = useThemeContext();
  const { colors } = theme;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          fontFamily: FontFamilies.semiBold,
          fontWeight: FontWeights.semiBold,
          fontSize: FontSizes.lg,
        },
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Library"
        component={LibraryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AlgorithmDetail"
        component={AlgorithmDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="Simulation"
        component={SimulationScreen}
        options={{ title: 'Simulación' }}
      />
      <Stack.Screen
        name="Exercise"
        component={ExerciseScreen}
        options={{ title: 'Practicar' }}
      />
    </Stack.Navigator>
  );
}
