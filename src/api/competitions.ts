import { apiFetch, withInvite } from './client';
import type { Category, Competition, CompetitionInput, Paginated } from './types';

export function listCompetitions(page = 1): Promise<Paginated<Competition>> {
  return apiFetch<Paginated<Competition>>(`/competitions?page=${page}&upcoming=1`);
}

/** Busca por nombre o sede entre las competiciones públicas y no canceladas. */
export function searchCompetitions(query: string): Promise<Paginated<Competition>> {
  return apiFetch<Paginated<Competition>>(`/competitions?search=${encodeURIComponent(query)}`);
}

export function isCompetitionActive(competition: Competition): boolean {
  if (competition.cancelled_at) return false;
  return !competition.end_date || new Date(competition.end_date) >= new Date();
}

export function listMyCompetitions(): Promise<Competition[]> {
  return apiFetch<Competition[]>('/me/competitions');
}

export function createCompetition(input: CompetitionInput): Promise<Competition> {
  return apiFetch<Competition>('/competitions', { method: 'POST', body: input });
}

export function getCompetition(id: number, invite?: string): Promise<Competition> {
  return apiFetch<Competition>(withInvite(`/competitions/${id}`, invite));
}

export function updateCompetition(
  id: number,
  input: Partial<CompetitionInput>
): Promise<Competition> {
  return apiFetch<Competition>(`/competitions/${id}`, { method: 'PUT', body: input });
}

/** Marks the competition as cancelled — reversible in the data, but stops new registrations. */
export function cancelCompetition(id: number): Promise<Competition> {
  return apiFetch<Competition>(`/competitions/${id}/cancel`, { method: 'POST' });
}

/** Invalidates the current invite link and returns the competition with a new `invite_token`. */
export function regenerateInvite(id: number): Promise<Competition> {
  return apiFetch<Competition>(`/competitions/${id}/regenerate-invite`, { method: 'POST' });
}

/** Irreversible — cascades to categories, phases, matches, registrations, rankings and chat. */
export function deleteCompetition(id: number): Promise<void> {
  return apiFetch<void>(`/competitions/${id}`, { method: 'DELETE' });
}

export function listCategories(competitionId: number): Promise<Category[]> {
  return apiFetch<Category[]>(`/competitions/${competitionId}/categories`);
}

/** Resolves an invite link. Doesn't register the caller for anything. */
export function getInvite(token: string): Promise<Competition> {
  return apiFetch<Competition>(`/invites/${encodeURIComponent(token)}`);
}

/** Categories for the competition behind an invite token — token is the authorization, no membership needed. */
export function listInviteCategories(token: string): Promise<Category[]> {
  return apiFetch<Category[]>(`/invites/${encodeURIComponent(token)}/categories`);
}
