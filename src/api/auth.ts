import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { apiFetch } from './client';
import type { AuthToken, User } from './types';

function deviceName(): string {
  return Device.deviceName ?? `${Platform.OS}-app`;
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthToken> {
  return apiFetch<AuthToken>('/register', {
    method: 'POST',
    auth: false,
    body: { ...input, device_name: deviceName() },
  });
}

export function login(input: { email: string; password: string }): Promise<AuthToken> {
  return apiFetch<AuthToken>('/login', {
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
