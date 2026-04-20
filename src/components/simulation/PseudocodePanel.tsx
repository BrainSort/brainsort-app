import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/colors';
import { PseudocodeLine } from '../../types/simulation';

interface PseudocodePanelProps {
  lines: PseudocodeLine[];
  activeLine: number;
}

/**
 * T-FE-070: Panel de pseudocódigo sincronizado con el paso actual
 * Resaltando la línea correspondiente a lineaPseudocodigo
 */
export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({ lines, activeLine }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pseudocódigo</Text>
      <ScrollView style={styles.scroll}>
        {lines.map((item) => (
          <View
            key={item.line}
            style={[
              styles.lineWrapper,
              item.line === activeLine && styles.activeLineWrapper,
            ]}
          >
            <Text
              style={[
                styles.lineText,
                { marginLeft: item.indent * 20 },
                item.line === activeLine && styles.activeLineText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginTop: 15,
    maxHeight: 250,
  },
  title: {
    color: ThemeColors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  scroll: {
    flexGrow: 0,
  },
  lineWrapper: {
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  activeLineWrapper: {
    backgroundColor: 'rgba(245, 166, 35, 0.2)', // Matching yellow comparison color with transparency
  },
  lineText: {
    color: ThemeColors.textSecondary,
    fontSize: 14,
    fontFamily: 'monospace', // Standard cross-platform mono
  },
  activeLineText: {
    color: '#F5A623', // Yellow
    fontWeight: 'bold',
  },
});
