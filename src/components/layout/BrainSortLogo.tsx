/**
 * BrainSortLogo.tsx
 * BrainSort — Geometric SVG "B" monogram inside cyan/teal brand badge
 */

import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

export interface BrainSortLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const BrainSortLogo: React.FC<BrainSortLogoProps> = ({
  size = 40,
  style,
}) => {
  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessibilityLabel="BrainSort logo"
    >
      <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        {/* Cyan/teal rounded brand badge */}
        <Rect
          x={1}
          y={1}
          width={38}
          height={38}
          rx={10}
          fill="#12B8C8"
          stroke="#4CE3F0"
          strokeOpacity={0.55}
          strokeWidth={1.25}
        />

        {/* Geometric vector "B" monogram */}
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13 10H21.5C24.6 10 26.8 11.9 26.8 14.8C26.8 16.9 25.5 18.6 23.6 19.3C26 20 27.5 21.9 27.5 24.6C27.5 27.9 25 30 21.3 30H13V10ZM17.2 13.4V18.1H20.9C22.3 18.1 23.1 17.2 23.1 15.8C23.1 14.3 22.3 13.4 20.9 13.4H17.2ZM17.2 21.2V26.6H21.2C22.8 26.6 23.7 25.6 23.7 23.9C23.7 22.2 22.8 21.2 21.2 21.2H17.2Z"
          fill="#FFFFFF"
        />
      </Svg>
    </View>
  );
};

export default BrainSortLogo;
