import { apiFetch } from './client';
import type { Competition, CompetitionInput, Paginated } from './types';

export function listCompetitions(): Promise<Paginated<Competition>> {
  return apiFetch<Paginated<Competition>>('/competitions');
}

export function listMyCompetitions(): Promise<Competition[]> {
  return apiFetch<Competition[]>('/me/competitions');
}

export function createCompetition(input: CompetitionInput): Promise<Competition> {
  return apiFetch<Competition>('/competitions', { method: 'POST', body: input });
}
