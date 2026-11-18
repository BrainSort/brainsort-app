import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';

export interface BadgeIconProps {
  imagen: string;
  desbloqueada?: boolean;
  size?: number;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
  imagen,
  desbloqueada = true,
  size = 48,
}) => {
  const key = (imagen || '').toLowerCase();

  const getPalette = () => {
    if (!desbloqueada) {
      return {
        bg: '#161B22',
        innerBg: '#1F242D',
        stroke: '#4B5563',
        accent: '#6B7280',
        secondary: '#9CA3AF',
      };
    }

    if (key.includes('first-step')) {
      return {
        bg: '#0F172A',
        innerBg: '#1E293B',
        stroke: '#00D4FF',
        accent: '#00D4FF',
        secondary: '#38BDF8',
      };
    }

    if (key.includes('explorer') || key.includes('graph')) {
      return {
        bg: '#0F172A',
        innerBg: '#1E293B',
        stroke: '#A855F7',
        accent: '#A855F7',
        secondary: '#E9D5FF',
      };
    }

    if (key.includes('streak')) {
      return {
        bg: '#0F172A',
        innerBg: '#1E293B',
        stroke: '#F59E0B',
        accent: '#F59E0B',
        secondary: '#FEF08A',
      };
    }

    return {
      bg: '#0F172A',
      innerBg: '#1E293B',
      stroke: '#10B981',
      accent: '#10B981',
      secondary: '#6EE7B7',
    };
  };

  const palette = getPalette();

  return (
    <View
      style={[styles.container, { width: size, height: size }]}
      testID={desbloqueada ? 'badge-icon-unlocked' : 'badge-icon-locked'}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Circle
          cx="32"
          cy="32"
          r="28"
          fill={palette.bg}
          stroke={palette.stroke}
          strokeWidth="3"
        />
        <Circle
          cx="32"
          cy="32"
          r="22"
          fill={palette.innerBg}
          stroke={palette.secondary}
          strokeWidth="1.5"
        />

        {key.includes('first-step') ? (
          <Path d="M26 20L42 32L26 44V20Z" fill={palette.accent} />
        ) : key.includes('explorer') || key.includes('graph') ? (
          <>
            <Polygon
              points="32,16 38,28 48,32 36,38 32,48 26,36 16,32 28,26"
              fill={palette.accent}
            />
            <Circle cx="32" cy="32" r="4" fill={palette.secondary} />
          </>
        ) : key.includes('streak') ? (
          <>
            <Path
              d="M33 15C33 15 43 23 43 34C43 41.732 37.627 47 31 47C24.373 47 19 41.732 19 34C19 28 23 23 26 20C26 24 29 26 29 26C29 21 33 15 33 15Z"
              fill={palette.accent}
            />
            <Path
              d="M31 28C31 28 36 32 36 37C36 40.314 33.761 43 31 43C28.239 43 26 40.314 26 37C26 34 28 31 31 28Z"
              fill={palette.secondary}
            />
          </>
        ) : (
          <>
            <Rect
              x="20"
              y="34"
              width="5"
              height="10"
              rx="1.5"
              fill={palette.accent}
            />
            <Rect
              x="27"
              y="28"
              width="5"
              height="16"
              rx="1.5"
              fill={palette.secondary}
            />
            <Rect
              x="34"
              y="22"
              width="5"
              height="22"
              rx="1.5"
              fill={palette.accent}
            />
            <Rect
              x="41"
              y="16"
              width="5"
              height="28"
              rx="1.5"
              fill={palette.secondary}
            />
          </>
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
