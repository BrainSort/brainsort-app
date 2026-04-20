/**
 * MainTabNavigator.tsx
 * BrainSort — Bottom Tab Navigator principal
 *
 * Tabs:
 *   Biblioteca  → LibraryStackNavigator  (T-FE-090)
 *   Progreso    → placeholder
 *   Offline     → placeholder
 *   Perfil      → placeholder
 *
 * Referencia: task_breakdown.md T-FE-090
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import LibraryStackNavigator from './LibraryStackNavigator';
import { SimulationPlayground } from '../screens/SimulationPlayground';
import { DarkSurfaces, DarkText, Accent } from '../styles/colors';
import { FontFamilies, FontSizes, FontWeights } from '../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Biblioteca: undefined;
  Simulacion: undefined;
  Progreso: undefined;
  Offline: undefined;
  Perfil: undefined;
};

// ─── Placeholder genérico ─────────────────────────────────────────────────────

const PlaceholderScreen = ({ label }: { label: string }) => (
  <View style={placeholderSt.container}>
    <Text style={placeholderSt.text}>{label} — Próximamente</Text>
  </View>
);

const placeholderSt = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DarkSurfaces.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.md,
    color: DarkText.muted,
  },
});

// ─── Tab icons ────────────────────────────────────────────────────────────────

const tabIcon = (emoji: string, color: string) => (
  <Text style={{ fontSize: 20, color }}>{emoji}</Text>
);

// ─── Navegador ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: DarkSurfaces.surface,
          borderTopColor: DarkSurfaces.border,
          borderTopWidth: 1,
          height: 60,
        },
        tabBarActiveTintColor: Accent[500],
        tabBarInactiveTintColor: DarkText.muted,
        tabBarLabelStyle: {
          fontFamily: FontFamilies.medium,
          fontWeight: FontWeights.medium,
          fontSize: FontSizes.xs,
          marginBottom: 4,
        },
      }}
    >
      <Tab.Screen
        name="Biblioteca"
        component={LibraryStackNavigator}
        options={{
          tabBarIcon: ({ color }) => tabIcon('📚', color),
          tabBarAccessibilityLabel: 'Biblioteca de algoritmos',
        }}
      />
      <Tab.Screen
        name="Simulacion"
        component={SimulationPlayground}
        options={{
          tabBarIcon: ({ color }) => tabIcon('🧠', color),
          tabBarAccessibilityLabel: 'Simulación de algoritmos',
        }}
      />
      <Tab.Screen
        name="Progreso"
        children={() => <PlaceholderScreen label="Progreso" />}
        options={{
          tabBarIcon: ({ color }) => tabIcon('📈', color),
          tabBarAccessibilityLabel: 'Mi progreso',
        }}
      />
      <Tab.Screen
        name="Offline"
        children={() => <PlaceholderScreen label="Offline" />}
        options={{
          tabBarIcon: ({ color }) => tabIcon('⬇️', color),
          tabBarAccessibilityLabel: 'Módulos sin conexión',
        }}
      />
      <Tab.Screen
        name="Perfil"
        children={() => <PlaceholderScreen label="Perfil" />}
        options={{
          tabBarIcon: ({ color }) => tabIcon('👤', color),
          tabBarAccessibilityLabel: 'Mi perfil',
        }}
      />
    </Tab.Navigator>
  );
}

