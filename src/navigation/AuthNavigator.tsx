import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AuthNavigator() {
  return (
    <View style={styles.container}>
      <Text>AuthNavigator Placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
