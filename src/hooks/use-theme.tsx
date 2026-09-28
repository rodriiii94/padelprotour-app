import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { getThemePreference, setThemePreference } from '@/hooks/theme-storage';
import { DarkColors, LightColors, type ColorPalette } from '@/theme/tokens';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Scheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: Scheme;
  colors: ColorPalette;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isPreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    getThemePreference().then((stored) => {
      if (isPreference(stored)) {
        setPreferenceState(stored);
      }
    });
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setThemePreference(next);
  };

  const scheme: Scheme = preference === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : preference;
  const colors = scheme === 'light' ? LightColors : DarkColors;

  const value = useMemo(
    () => ({ scheme, colors, preference, setPreference }),
    [scheme, colors, preference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/** Atajo para el caso más común: solo hacen falta los colores del tema actual. */
export function useColors(): ColorPalette {
  return useTheme().colors;
}
