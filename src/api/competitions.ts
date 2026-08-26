import { apiFetch } from './client';
import type { Competition, CompetitionInput, Paginated } from './types';

export function listCompetitions(page = 1): Promise<Paginated<Competition>> {
  return apiFetch<Paginated<Competition>>(`/competitions?page=${page}`);
}

/** No competition-level "finished" flag exists yet — approximated from end_date. */
export function isCompetitionActive(competition: Competition): boolean {
  return !competition.end_date || new Date(competition.end_date) >= new Date();
}

export function listMyCompetitions(): Promise<Competition[]> {
  return apiFetch<Competition[]>('/me/competitions');
}

export function createCompetition(input: CompetitionInput): Promise<Competition> {
  return apiFetch<Competition>('/competitions', { method: 'POST', body: input });
}
