import { apiFetch } from './client';
import type { PlayerProfile } from './types';

export function getPlayerProfile(id: number): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>(`/users/${id}`);
}
