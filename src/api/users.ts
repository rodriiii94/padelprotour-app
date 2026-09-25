import { apiFetch } from './client';
import type { Paginated, PlayerProfile, PublicUserSummary } from './types';

export function getPlayerProfile(id: number): Promise<PlayerProfile> {
  return apiFetch<PlayerProfile>(`/users/${id}`);
}

export function followUser(id: number): Promise<void> {
  return apiFetch<void>(`/users/${id}/follow`, { method: 'POST' });
}

export function unfollowUser(id: number): Promise<void> {
  return apiFetch<void>(`/users/${id}/follow`, { method: 'DELETE' });
}

export function listFollowers(id: number, page = 1): Promise<Paginated<PublicUserSummary>> {
  return apiFetch<Paginated<PublicUserSummary>>(`/users/${id}/followers?page=${page}`);
}

export function listFollowing(id: number, page = 1): Promise<Paginated<PublicUserSummary>> {
  return apiFetch<Paginated<PublicUserSummary>>(`/users/${id}/following?page=${page}`);
}
