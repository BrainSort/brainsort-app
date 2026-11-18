/**
 * BottomTabBar.tsx
 * BrainSort — Barra de tabs inferior
 *
 * task_breakdown.md T-FE-082
 */

import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NavTabIcon, type NavTabName } from './DesktopSidebar';
import { useThemeContext } from '../../context/ThemeContext';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

interface TabMeta {
  tab: NavTabName;
  label: string;
}

const ROUTE_TO_TAB: Record<string, TabMeta> = {
  Biblioteca: { tab: 'Biblioteca', label: 'Biblioteca' },
  Library: { tab: 'Biblioteca', label: 'Biblioteca' },
  Ruta: { tab: 'Ruta', label: 'Ruta' },
  Progreso: { tab: 'Progreso', label: 'Progreso' },
  Progress: { tab: 'Progreso', label: 'Progreso' },
  Offline: { tab: 'Offline', label: 'Offline' },
  Perfil: { tab: 'Perfil', label: 'Perfil' },
  Profile: { tab: 'Perfil', label: 'Perfil' },
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useThemeContext();
  const colors = theme.colors;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const meta = ROUTE_TO_TAB[route.name] ?? {
          tab: 'Biblioteca' as NavTabName,
          label: route.name,
        };
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : meta.label;

        const isFocused = state.index === index;
        const iconColor = isFocused ? colors.tabBarActive : colors.tabBarInactive;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={(pressState: any) => [
              styles.tab,
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              pressState.hovered &&
                !isFocused && { backgroundColor: colors.surfaceHighlight },
              pressState.pressed && { opacity: 0.75 },
              pressState.focused &&
                Platform.OS === 'web' && {
                  outlineWidth: 2,
                  outlineStyle: 'solid',
                  outlineColor: colors.brandAccent,
                },
            ]}
          >
            <View style={styles.tabContent}>
              <NavTabIcon
                tab={meta.tab}
                color={iconColor}
                size={22}
                strokeWidth={1.75}
              />
              <Text
                style={[
                  styles.label,
                  { color: iconColor },
                  isFocused && styles.labelFocused,
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 4,
    paddingTop: 4,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    minWidth: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: FontSizes.xs,
  },
  labelFocused: {
    fontWeight: FontWeights.semiBold,
  },
});

export default BottomTabBar;
