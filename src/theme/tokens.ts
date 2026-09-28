/**
 * Design tokens translated 1:1 from the PadelProTour Elite design system
 * (~/dev/stitch_padelprotour_liga_de_parejas/padelprotour_elite/DESIGN.md),
 * plus a LightColors counterpart added on top of it (the original had a
 * single dark theme only). The brand fills (primaryContainer,
 * secondaryContainer, errorContainer and their `on*` pairs) stay the same
 * in both themes — they're solid accent chips, not neutral surface tones.
 * Only the neutral surface/text tones and the two plain-tint-on-background
 * colors (primary, secondary, error) actually change with the theme.
 *
 * Don't import `DarkColors`/`LightColors` directly in components — use the
 * `useColors()` hook from `@/theme/theme` so the UI reacts when the theme
 * changes.
 */

export interface ColorPalette {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  background: string;
  onBackground: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  glassFill: string;
  glassBorder: string;
}

export const DarkColors: ColorPalette = {
  surface: '#111508',
  surfaceDim: '#111508',
  surfaceBright: '#363b2c',
  surfaceContainerLowest: '#0c1005',
  surfaceContainerLow: '#191d10',
  surfaceContainer: '#1d2114',
  surfaceContainerHigh: '#272c1d',
  surfaceContainerHighest: '#323728',
  onSurface: '#e1e5cf',
  onSurfaceVariant: '#c2caad',
  outline: '#8c9479',
  outlineVariant: '#424933',

  background: '#111508',
  onBackground: '#e1e5cf',

  primary: '#ffffff',
  onPrimary: '#253600',
  primaryContainer: '#b6f700',
  onPrimaryContainer: '#4f6e00',

  secondary: '#ffc080',
  onSecondary: '#4a2800',
  secondaryContainer: '#fe9800',
  onSecondaryContainer: '#643900',

  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  glassFill: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const LightColors: ColorPalette = {
  surface: '#fbfdf0',
  surfaceDim: '#dbe0c9',
  surfaceBright: '#fbfdf0',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f5f8e6',
  surfaceContainer: '#eff2e0',
  surfaceContainerHigh: '#e9edda',
  surfaceContainerHighest: '#e3e7d4',
  onSurface: '#191d10',
  onSurfaceVariant: '#424933',
  outline: '#72795f',
  outlineVariant: '#c2c9ad',

  background: '#fbfdf0',
  onBackground: '#191d10',

  primary: '#191d10',
  // El lima de marca (#b6f700) es casi ilegible como texto suelto sobre blanco: aquí se usa
  // más oscuro tanto para eso como para el fondo de sus botones/chips, con texto blanco
  // encima en vez de oscuro (ver onPrimary/onPrimaryContainer). En oscuro no cambia nada.
  onPrimary: '#ffffff',
  primaryContainer: '#4d7c0f',
  onPrimaryContainer: '#ffffff',

  secondary: '#8a5200',
  onSecondary: '#4a2800',
  secondaryContainer: '#fe9800',
  onSecondaryContainer: '#643900',

  error: '#ba1a1a',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',

  glassFill: 'rgba(0, 0, 0, 0.04)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
};

export const Spacing = {
  base: 4,
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  safeMargin: 20,
} as const;

export const Radii = {
  sm: 4,
  DEFAULT: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontFamilies = {
  display: 'Sora_800ExtraBold',
  headline: 'Sora_700Bold',
  headlineSemibold: 'Sora_600SemiBold',
  labelCaps: 'Sora_700Bold',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodyBold: 'Manrope_700Bold',
} as const;

export const Typography = {
  display: { fontFamily: FontFamilies.display, fontSize: 40, lineHeight: 44 },
  headlineLg: { fontFamily: FontFamilies.headline, fontSize: 32, lineHeight: 38 },
  headlineMd: { fontFamily: FontFamilies.headline, fontSize: 24, lineHeight: 31 },
  headlineSm: { fontFamily: FontFamilies.headlineSemibold, fontSize: 20, lineHeight: 28 },
  bodyLg: { fontFamily: FontFamilies.body, fontSize: 18, lineHeight: 29 },
  bodyMd: { fontFamily: FontFamilies.body, fontSize: 16, lineHeight: 26 },
  bodySm: { fontFamily: FontFamilies.bodyMedium, fontSize: 14, lineHeight: 21 },
  labelCaps: {
    fontFamily: FontFamilies.labelCaps,
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
} as const;
