import * as SecureStore from 'expo-secure-store';

export const TOKEN_KEY = 'padelontour_token';

export function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function setToken(token: string | null): Promise<void> {
  return token ? SecureStore.setItemAsync(TOKEN_KEY, token) : SecureStore.deleteItemAsync(TOKEN_KEY);
}
