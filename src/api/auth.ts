import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { apiFetch } from './client';
import type { AuthToken, ProfileInput, RegisterResult, User } from './types';

const WEB_DEVICE_KEY = 'padelontour_device_id';

// El servidor revoca los tokens con el mismo nombre de dispositivo al iniciar sesión.
// En web todos los navegadores se llamarían igual, así que cada uno lleva su propio id.
function deviceName(): string {
  if (Platform.OS !== 'web') {
    return Device.deviceName ?? `${Platform.OS}-app`;
  }
  let id = globalThis.localStorage?.getItem(WEB_DEVICE_KEY);
  if (!id) {
    id = Math.random().toString(36).slice(2, 10);
    globalThis.localStorage?.setItem(WEB_DEVICE_KEY, id);
  }
  return `web-${id}`;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResult> {
  return apiFetch<RegisterResult>('/register', {
    method: 'POST',
    auth: false,
    body: input,
  });
}

export function login(input: { email: string; password: string }): Promise<AuthToken> {
  return apiFetch<AuthToken>('/login', {
    method: 'POST',
    auth: false,
    body: { ...input, device_name: deviceName() },
  });
}

export function verifyEmail(input: { token: string }): Promise<AuthToken> {
  return apiFetch<AuthToken>('/email/verify', {
    method: 'POST',
    auth: false,
    body: { ...input, device_name: deviceName() },
  });
}

export function resendVerification(input: { email: string }): Promise<{ message: string }> {
  return apiFetch<{ message: string }>('/email/resend', {
    method: 'POST',
    auth: false,
    body: input,
  });
}

export function loginWithGoogle(input: { id_token: string }): Promise<AuthToken> {
  return apiFetch<AuthToken>('/auth/google', {
    method: 'POST',
    auth: false,
    body: { ...input, device_name: deviceName() },
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/logout', { method: 'POST' });
}

export function me(): Promise<User> {
  return apiFetch<User>('/me');
}

export function updateProfile(input: ProfileInput): Promise<User> {
  return apiFetch<User>('/me', { method: 'PUT', body: input });
}

/** Elimina la cuenta (se anonimiza). Pide la contraseña, o el email si la cuenta solo usa Google/Apple. */
export function deleteAccount(input: { password?: string; email?: string }): Promise<void> {
  return apiFetch<void>('/me', { method: 'DELETE', body: input });
}
