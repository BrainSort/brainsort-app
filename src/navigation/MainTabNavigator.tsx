/**
 * MainTabNavigator.tsx
 * BrainSort — Bottom Tab Navigator principal + Desktop Sidebar shell
 *
 * Tabs:
 *   Biblioteca  → LibraryStackNavigator  (T-FE-090)
 *   Ruta        → LearningPathScreen
 *   Progreso    → ProgressScreen (T-FE-099)
 *   Offline     → placeholder
 *   Perfil      → ProfileStackNavigator
 *
 * Referencia: task_breakdown.md T-FE-090
 */

import React, { useCallback, useRef, useState } from 'react';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaWrapper } from '../components/layout/SafeAreaWrapper';
import { Header } from '../components/layout/Header';
import { DesktopSidebar, NavTabIcon } from '../components/layout/DesktopSidebar';
import { BottomTabBar } from '../components/layout/BottomTabBar';
import LibraryStackNavigator, { LibraryStackParamList } from './LibraryStackNavigator';
import ProfileStackNavigator, { ProfileStackParamList } from './ProfileStackNavigator';
import LearningPathScreen from '../screens/learning-path/LearningPathScreen';
import { ProgressScreen } from '../screens/gamification/ProgressScreen';
import { useThemeContext } from '../context/ThemeContext';
import { FontFamilies, FontSizes, FontWeights } from '../styles/typography';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MainTabParamList = {
  Biblioteca: NavigatorScreenParams<LibraryStackParamList> | undefined;
  Ruta: undefined;
  Progreso: undefined;
  Offline: undefined;
  Perfil: NavigatorScreenParams<ProfileStackParamList> | undefined;
};

// ─── Placeholder genérico ─────────────────────────────────────────────────────

const PlaceholderScreen = ({ label }: { label: string }) => {
  const { theme } = useThemeContext();
  return (
    <SafeAreaWrapper>
      <Header title={label} showBackButton />
      <View
        style={[
          placeholderSt.container,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[placeholderSt.text, { color: theme.colors.textMuted }]}>
          {label} — Próximamente
        </Text>
      </View>
    </SafeAreaWrapper>
  );
};

const placeholderSt = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  text: {
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.md,
  },
});

// ─── Navegador ────────────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const { theme } = useThemeContext();
  const colors = theme.colors;

  const [activeTab, setActiveTab] = useState<keyof MainTabParamList>('Biblioteca');
  const tabNavRef = useRef<any>(null);

  const handleNavigateTab = useCallback((tab: keyof MainTabParamList) => {
    setActiveTab(tab);
    tabNavRef.current?.navigate(tab);
  }, []);

  return (
    <View
      style={[
        styles.shell,
        { backgroundColor: colors.background },
        isDesktop && styles.shellDesktop,
      ]}
    >
      {isDesktop && (
        <DesktopSidebar
          activeTab={activeTab}
          onNavigate={handleNavigateTab}
        />
      )}

      <View style={styles.content}>
        <Tab.Navigator
          tabBar={(props) => {
            tabNavRef.current = props.navigation;
            return isDesktop ? null : <BottomTabBar {...props} />;
          }}
          screenListeners={{
            state: (e) => {
              const navState = (e.data as { state?: { index: number; routes: { name: string }[] } })?.state;
              const currentRoute = navState?.routes?.[navState.index]?.name;
              if (currentRoute) {
                setActiveTab(currentRoute as keyof MainTabParamList);
              }
            },
          }}
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.tabBarActive,
            tabBarInactiveTintColor: colors.tabBarInactive,
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
              tabBarIcon: ({ color }) => (
                <NavTabIcon tab="Biblioteca" color={color} size={22} />
              ),
              tabBarAccessibilityLabel: 'Biblioteca de algoritmos',
            }}
          />
          <Tab.Screen
            name="Ruta"
            component={LearningPathScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <NavTabIcon tab="Ruta" color={color} size={22} />
              ),
              tabBarAccessibilityLabel: 'Mi ruta de aprendizaje',
            }}
          />
          <Tab.Screen
            name="Progreso"
            component={ProgressScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <NavTabIcon tab="Progreso" color={color} size={22} />
              ),
              tabBarAccessibilityLabel: 'Mi progreso',
            }}
          />
          <Tab.Screen
            name="Offline"
            children={() => <PlaceholderScreen label="Offline" />}
            options={{
              tabBarIcon: ({ color }) => (
                <NavTabIcon tab="Offline" color={color} size={22} />
              ),
              tabBarAccessibilityLabel: 'Módulos sin conexión',
            }}
          />
          <Tab.Screen
            name="Perfil"
            component={ProfileStackNavigator}
            options={{
              tabBarIcon: ({ color }) => (
                <NavTabIcon tab="Perfil" color={color} size={22} />
              ),
              tabBarAccessibilityLabel: 'Mi perfil',
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    flexDirection: 'column',
  },
  shellDesktop: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});
