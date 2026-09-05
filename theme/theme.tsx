/**
 * Swaad design tokens — the single source of truth for colour, type, spacing,
 * radius, elevation and motion. Sourced from the "Warm Culinary Artisan"
 * design system extracted from the Stitch project (Design.md), which is now
 * canonical in place of the earlier Masala Maroon system. Per Rules.md #7 no
 * component may hardcode a hex, size, or radius; if a value is missing here
 * it needs to be added to Design.md first, not invented at the call site.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

/* ── Colour (Design.md §2) ─────────────────────────────────────────────── */

const palette = {
  panerGreen: '#4C8B2B',
  panerGreenBright: '#6BBE45',
  panerGreenPressed: '#3C6E22',
  greenTintSurface: '#EAF3E3',

  turmericGold: '#F2B705',

  canvasWhite: '#FFFFFF',
  surfaceCreamLight: '#FAF6EC',
  surfaceCreamCard: '#F4EFE1',
  divider: '#E7E0CF',

  darkCanvas: '#14140F',
  darkSurface: '#1E1E18',
  darkSurfaceCard: '#26261E',
  darkDivider: '#33332A',

  textPrimaryLight: '#2A2A1F',
  textSecondaryLight: '#6C6655',
  textTertiaryLight: '#9C9684',
  textPrimaryDark: '#F1EEE0',
  textSecondaryDark: '#B8B3A0',
  textTertiaryDark: '#7C7767',

  breadTan: '#D8B271',
  soupOrange: '#E07A2F',
  berryRed: '#B0324B',

  errorLight: '#BA1A1A',
  errorDark: '#FFB4AB',
} as const;

const lightColors = {
  canvas: palette.canvasWhite,
  surface: palette.surfaceCreamCard,
  surfaceDeep: palette.surfaceCreamLight,
  divider: palette.divider,

  textPrimary: palette.textPrimaryLight,
  textSecondary: palette.textSecondaryLight,
  textTertiary: palette.textTertiaryLight,

  /** Panera Green — the ONLY primary action colour (Design.md §7). */
  primary: palette.panerGreen,
  primaryPressed: palette.panerGreenPressed,
  /** Wash behind selected chips and active filters. */
  primaryTint: palette.greenTintSurface,
  /** Text/icon colour sitting on top of `primary`. */
  onPrimary: palette.canvasWhite,

  /** Turmeric Gold — match indicator and budget-fit confirmation ONLY. */
  gold: palette.turmericGold,
  goldDim: palette.breadTan,
  /** "Fully makeable now" ONLY. */
  curryLeaf: palette.panerGreen,

  success: palette.panerGreen,
  error: palette.errorLight,
  warning: palette.turmericGold,
  infoTint: palette.greenTintSurface,

  accentBread: palette.breadTan,
  accentSoup: palette.soupOrange,
  accentBerry: palette.berryRed,
};

const darkColors: Colors = {
  canvas: palette.darkCanvas,
  surface: palette.darkSurface,
  surfaceDeep: palette.darkSurfaceCard,
  divider: palette.darkDivider,

  textPrimary: palette.textPrimaryDark,
  textSecondary: palette.textSecondaryDark,
  textTertiary: palette.textTertiaryDark,

  primary: palette.panerGreenBright,
  primaryPressed: palette.panerGreenPressed,
  primaryTint: palette.darkSurfaceCard,
  onPrimary: palette.darkCanvas,

  gold: palette.turmericGold,
  goldDim: palette.breadTan,
  curryLeaf: palette.panerGreenBright,

  success: palette.panerGreenBright,
  error: palette.errorDark,
  warning: palette.turmericGold,
  infoTint: palette.darkSurfaceCard,

  accentBread: palette.breadTan,
  accentSoup: palette.soupOrange,
  accentBerry: palette.berryRed,
};

/** Every role carries a plain `string`; the two schemes share the same keys. */
export type Colors = { [K in keyof typeof lightColors]: string };

export const colors: Record<'light' | 'dark', Colors> = {
  light: lightColors,
  dark: darkColors,
};

/* ── Typography (Design.md §3) ─────────────────────────────────────────── */

/**
 * Font family names as registered with expo-font in App.tsx. Epilogue is
 * for headlines and display type; Inter is for everything dense (chips,
 * prices, lists, body copy).
 */
export const fonts = {
  displayMedium: 'Epilogue_600SemiBold',
  displaySemiBold: 'Epilogue_700Bold',
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
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
  screenTitle: type(fonts.displaySemiBold, 32, 1.25),
  /** Landing hero and secondary screen headlines (Design.md headline-lg, 26/34). */
  headlineLg: type(fonts.displaySemiBold, 26, 1.3),
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
  screenInset: 20,
  /** Section top margin. */
  sectionTop: 24,
} as const;

export const radii = {
  /** Chips and inputs — read as "tokens", not "actions". */
  chip: 9999,
  /** Buttons and meal-type tiles. */
  button: 9999,
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
    shadowColor: '#3C2A10',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sheet: {
    shadowColor: '#1E1405',
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
} as const;

/** Dim behind sheets. */
export const modalOverlay = 'rgba(20,18,5,0.4)';

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
 * Light/dark/system override, added at the user's explicit request (on top
 * of the original "follow the system, no in-app toggle" design). Persisted
 * so the choice survives a restart; `ThemeModeProvider` wraps the app in
 * App.tsx and every `useTheme()` call below reads through it.
 */
export type ThemeModePreference = 'system' | 'light' | 'dark';
const THEME_MODE_KEY = 'swaad.themeMode';

type ThemeModeContextValue = {
  preference: ThemeModePreference;
  setPreference: (next: ThemeModePreference) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemeModePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') setPreferenceState(stored);
    });
  }, []);

  function setPreference(next: ThemeModePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(THEME_MODE_KEY, next);
  }

  return <ThemeModeContext.Provider value={{ preference, setPreference }}>{children}</ThemeModeContext.Provider>;
}

/** Reads/sets the persisted override — the segmented control in ProfileScreen calls this directly. */
export function useThemeModePreference(): ThemeModeContextValue {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeModePreference must be used within ThemeModeProvider');
  return ctx;
}

/**
 * Resolves to the system colour scheme unless the user has explicitly
 * overridden it via the Profile screen toggle. Design.md specifies dark mode
 * fully, so the tokens always carry both.
 */
export function useTheme(): Theme {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const override = useContext(ThemeModeContext)?.preference ?? 'system';
  const scheme = override === 'system' ? systemScheme : override;

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
