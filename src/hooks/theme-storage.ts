import * as SecureStore from 'expo-secure-store';

const STORAGE_KEY = 'padelontour_theme';

export async function getThemePreference(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEY);
}

export async function setThemePreference(preference: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, preference);
}
