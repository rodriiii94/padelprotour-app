const STORAGE_KEY = 'padelontour_theme';

export async function getThemePreference(): Promise<string | null> {
  return globalThis.localStorage?.getItem(STORAGE_KEY) ?? null;
}

export async function setThemePreference(preference: string): Promise<void> {
  globalThis.localStorage?.setItem(STORAGE_KEY, preference);
}
