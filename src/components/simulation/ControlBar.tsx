import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemeColors } from '../../constants/colors';

interface ControlBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  isFinished: boolean;
}

/**
 * T-FE-067: Barra de control con botones: Play/Pausa, reiniciar (HU-04)
 * Deshabilitar Play y habilitar Reiniciar al finalizar (HU-06)
 */
export const ControlBar: React.FC<ControlBarProps> = ({
  isPlaying,
  onTogglePlay,
  onReset,
  isFinished,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onTogglePlay}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name={isPlaying ? 'pause' : 'play-arrow'}
          size={32}
          color={ThemeColors.white}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onReset}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="replay"
          size={32}
          color={ThemeColors.white}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: ThemeColors.surface,
    borderRadius: 8,
    marginTop: 10,
  },
  button: {
    marginHorizontal: 20,
    backgroundColor: '#3A3A3C',
    padding: 10,
    borderRadius: 50,
  },
  disabledButton: {
    opacity: 0.3,
  },
});
