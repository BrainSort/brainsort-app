import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import { View, ActivityIndicator } from 'react-native';

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // T-FE-008: Simulación de carga persistente de sesión (e.g. validación de token local)
    const checkAuthStatus = async () => {
      // TODO: Usar el servicio de storage definido en especificaciones
      setTimeout(() => {
        setIsAuthenticated(false);
        setIsLoading(false);
      }, 500);
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}