import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';

import { useTheme } from '@/theme/theme';

/**
 * The Swaad wordmark, extracted from the Stitch project's brand asset
 * (assets/swaad-logo.svg). Recoloured per-scheme rather than a static PNG,
 * since Design.md specifies dark mode fully.
 */
export function Logo({ height = 28 }: { height?: number }) {
  const { colors } = useTheme();
  const width = (height / 48) * 160;

  return (
    <Svg width={width} height={height} viewBox="0 0 160 48" fill="none">
      <Circle cx={20} cy={24} r={15} fill={colors.primary} />
      <Path d="M20 14C15 18 13 24 15 29C16 31 19 33 22 32C26 30 27 25 25 20C23 17 20 14 20 14Z" fill={colors.canvas} />
      <Path d="M18 26C19 23 21 21 24 20" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
      <Circle cx={27} cy={17} r={2.5} fill={colors.gold} />
      <SvgText x={44} y={32} fontFamily="Epilogue_700Bold" fontSize={24} fill={colors.textPrimary}>
        Swaad
      </SvgText>
    </Svg>
  );
}
