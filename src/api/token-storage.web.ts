const TOKEN_KEY = 'padelontour_token';

export async function getToken(): Promise<string | null> {
  return globalThis.localStorage?.getItem(TOKEN_KEY) ?? null;
}

export async function setToken(token: string | null): Promise<void> {
  if (token) {
    globalThis.localStorage?.setItem(TOKEN_KEY, token);
  } else {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
  }
}
