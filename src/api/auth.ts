import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { apiFetch } from './client';
import type { AuthToken, ProfileInput, RegisterResult, User } from './types';

function deviceName(): string {
  return Device.deviceName ?? `${Platform.OS}-app`;
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
