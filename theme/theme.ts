/**
 * Swaad design tokens — the single source of truth for colour, type, spacing,
 * radius, elevation and motion. Transcribed directly from Design.md sections
 * 2-6. Per Rules.md #7 no component may hardcode a hex, size, or radius; if a
 * value is missing here it needs to be added to Design.md first, not invented
 * at the call site.
 */
import { useColorScheme } from 'react-native';

/* ── Colour (Design.md §2) ─────────────────────────────────────────────── */

const palette = {
  masalaMaroon: '#A63D2A',
  masalaMaroonBright: '#C9573F',
  masalaMaroonPressed: '#7E2E20',
  maroonTintSurface: '#F3E1DB',

  turmericGold: '#D6A419',
  turmericGoldDim: '#8C6D14',
  curryLeafGreen: '#4B7340',
  curryLeafGreenDark: '#6C9A5C',

  canvasIvory: '#F6F1E1',
  thaliSurface: '#EFE7D2',
  deeperSurface: '#E6DBBE',
  divider: '#DDD0AE',

  darkCanvas: '#1C1512',
  darkSurface1: '#26201B',
  darkSurface2: '#312923',
  darkDivider: '#3E342B',

  textPrimaryLight: '#2B2118',
  textSecondaryLight: '#74695A',
  textTertiaryLight: '#A79C89',
  textPrimaryDark: '#F1E9D8',
  textSecondaryDark: '#B3A891',
  textTertiaryDark: '#7C7160',

  errorLight: '#B23A2E',
  errorDark: '#D2604F',
  warningLight: '#B8860B',
  warningDark: '#D6A419',
  infoTintLight: '#F3E1DB',
  infoTintDark: '#332019',
} as const;

const lightColors = {
  canvas: palette.canvasIvory,
  surface: palette.thaliSurface,
  surfaceDeep: palette.deeperSurface,
  divider: palette.divider,

  textPrimary: palette.textPrimaryLight,
  textSecondary: palette.textSecondaryLight,
  textTertiary: palette.textTertiaryLight,

  /** Masala Maroon — the ONLY primary action colour (Design.md §7). */
  primary: palette.masalaMaroon,
  primaryPressed: palette.masalaMaroonPressed,
  /** Wash behind selected chips and active filters. */
  primaryTint: palette.maroonTintSurface,
  /** Text/icon colour sitting on top of `primary`. */
  onPrimary: palette.canvasIvory,

  /** Turmeric Gold — match indicator and budget-fit confirmation ONLY. */
  gold: palette.turmericGold,
  /** Unfilled portion of the match ring track. */
  goldDim: palette.turmericGoldDim,
  /** Curry Leaf Green — "fully makeable now" ONLY. */
  curryLeaf: palette.curryLeafGreen,

  success: palette.curryLeafGreen,
  error: palette.errorLight,
  warning: palette.warningLight,
  infoTint: palette.infoTintLight,
};

const darkColors: Colors = {
  canvas: palette.darkCanvas,
  surface: palette.darkSurface1,
  surfaceDeep: palette.darkSurface2,
  divider: palette.darkDivider,

  textPrimary: palette.textPrimaryDark,
  textSecondary: palette.textSecondaryDark,
  textTertiary: palette.textTertiaryDark,

  primary: palette.masalaMaroonBright,
  primaryPressed: palette.masalaMaroonPressed,
  primaryTint: palette.infoTintDark,
  onPrimary: palette.darkCanvas,

  gold: palette.turmericGold,
  goldDim: palette.turmericGoldDim,
  curryLeaf: palette.curryLeafGreenDark,

  success: palette.curryLeafGreenDark,
  error: palette.errorDark,
  warning: palette.warningDark,
  infoTint: palette.infoTintDark,
};

/** Every role carries a plain `string`; the two schemes share the same keys. */
export type Colors = { [K in keyof typeof lightColors]: string };

export const colors: Record<'light' | 'dark', Colors> = {
  light: lightColors,
  dark: darkColors,
};

/* ── Typography (Design.md §3) ─────────────────────────────────────────── */

/**
 * Font family names as registered with expo-font in App.tsx. Fraunces is for
 * recipe names and headlines only; everything dense (chips, prices, lists) is
 * Work Sans (Design.md §7).
 */
export const fonts = {
  displayMedium: 'Fraunces_500Medium',
  displaySemiBold: 'Fraunces_600SemiBold',
  bodyRegular: 'WorkSans_400Regular',
  bodyMedium: 'WorkSans_500Medium',
  bodySemiBold: 'WorkSans_600SemiBold',
  bodyBold: 'WorkSans_700Bold',
} as const;

type TypeStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
};

/** `lineHeight` is stored resolved (size x ratio) — RN takes absolute values. */
const type = (fontFamily: string, fontSize: number, ratio: number): TypeStyle => ({
  fontFamily,
  fontSize,
  lineHeight: Math.round(fontSize * ratio),
});

export const typography = {
  /** "What's in your kitchen?" */
  screenTitle: type(fonts.displaySemiBold, 30, 1.2),
  /** Recipe result card, detail header. */
  recipeNameCard: type(fonts.displaySemiBold, 19, 1.25),
  /** Saved/favourites list. */
  recipeNameList: type(fonts.displayMedium, 16, 1.3),
  /** Top nav title. */
  navTitle: type(fonts.displaySemiBold, 18, 1.3),
  /** "Missing ingredients", "Dietary filters". */
  sectionHeader: type(fonts.bodyBold, 15, 1.3),
  /** Descriptions, method steps. */
  body: type(fonts.bodyRegular, 15, 1.5),
  /** Ingredient chips, appliance chips. */
  chipLabel: type(fonts.bodyMedium, 14, 1.2),
  /** "25 min · Serves 2". */
  meta: type(fonts.bodyRegular, 13, 1.4),
  /** "₹35–50". */
  price: type(fonts.bodyBold, 14, 1.3),
  /** "4 of 5 you have". */
  matchLabel: type(fonts.displaySemiBold, 13, 1.0),
  button: type(fonts.bodySemiBold, 15, 1.0),
  tabLabel: type(fonts.bodySemiBold, 10, 1.0),
  /** Estimates/disclaimers on prices. */
  caption: type(fonts.bodyRegular, 12, 1.4),
} as const;

/* ── Layout (Design.md §5) ─────────────────────────────────────────────── */

/** Base unit 4sp. Named steps keep call sites readable. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  /** Screen content inset, horizontal. */
  screenInset: 16,
  /** Section top margin. */
  sectionTop: 24,
} as const;

export const radii = {
  /** Chips and inputs — read as "tokens", not "actions". */
  chip: 10,
  /** Buttons and meal-type tiles. */
  button: 14,
  /** Cards. */
  card: 16,
  /** Match ring, checkboxes, budget handle. */
  full: 9999,
} as const;

/** Device buckets (Design.md §8) — width in dp. */
export const breakpoints = {
  small: 360,
  large: 600,
} as const;

/** Fixed sizes and minimum hit areas (Design.md §4, §8). */
export const touchTarget = {
  chipHeight: 36,
  hitArea: 44,
  checkboxGlyph: 24,
  mealTile: 88,
  primaryButtonHeight: 48,
  matchRing: 56,
  tabBarHeight: 56,
  topNavHeight: 48,
  searchFieldHeight: 44,
  textFieldHeight: 48,
} as const;

/* ── Depth (Design.md §6) ──────────────────────────────────────────────── */

/**
 * Warm brown-tinted shadows, never neutral grey. `raised` is for recipe match
 * cards only — everything else in the input flow stays flat.
 */
export const elevation = {
  flat: {
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  raised: {
    shadowColor: '#3C1E0A',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sheet: {
    shadowColor: '#1E0F05',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
} as const;

/** Dim behind sheets. */
export const modalOverlay = 'rgba(20,12,5,0.4)';

/** Bottom tab bar sits at 96% opacity over the canvas (Design.md §4). */
export const tabBarOpacity = 0.96;

/** Hairline weights (Design.md §4). */
export const hairline = {
  divider: 0.5,
  chipBorder: 1,
  focusBorder: 1.5,
} as const;

/* ── Motion (Design.md §6) ─────────────────────────────────────────────── */

export const motion = {
  /** The one orchestrated moment: match ring fills 0 → fraction, ease-out. */
  matchRingFill: 400,
  chipSelect: 120,
  checkboxFill: 150,
} as const;

/* ── Access ────────────────────────────────────────────────────────────── */

export type Theme = {
  scheme: 'light' | 'dark';
  colors: Colors;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  elevation: typeof elevation;
  motion: typeof motion;
  touchTarget: typeof touchTarget;
  hairline: typeof hairline;
};

/**
 * Follows the system colour scheme. Design.md specifies dark mode fully, so the
 * tokens carry both; there is deliberately no in-app toggle (not in the PRD).
 */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colors: colors[scheme],
    typography,
    spacing,
    radii,
    elevation,
    motion,
    touchTarget,
    hairline,
  };
}
