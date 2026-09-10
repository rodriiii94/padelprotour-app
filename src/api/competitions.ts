import { apiFetch } from './client';
import type { Category, Competition, CompetitionInput, Paginated } from './types';

export function listCompetitions(page = 1): Promise<Paginated<Competition>> {
  return apiFetch<Paginated<Competition>>(`/competitions?page=${page}&upcoming=1`);
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

export function getCompetition(id: number): Promise<Competition> {
  return apiFetch<Competition>(`/competitions/${id}`);
}

export function updateCompetition(
  id: number,
  input: Partial<CompetitionInput>
): Promise<Competition> {
  return apiFetch<Competition>(`/competitions/${id}`, { method: 'PUT', body: input });
}

export function listCategories(competitionId: number): Promise<Category[]> {
  return apiFetch<Category[]>(`/competitions/${competitionId}/categories`);
}
