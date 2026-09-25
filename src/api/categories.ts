import { apiFetch, withInvite } from './client';
import type {
  Category,
  CategoryInput,
  Match,
  MatchSet,
  MatchStatus,
  Pair,
  Paginated,
  Phase,
  PublicUserSummary,
  Ranking,
  Registration,
  RegistrationStatus,
} from './types';

export function createCategory(competitionId: number, input: CategoryInput): Promise<Category> {
  return apiFetch<Category>(`/competitions/${competitionId}/categories`, {
    method: 'POST',
    body: input,
  });
}

export function getCategory(id: number, invite?: string): Promise<Category> {
  return apiFetch<Category>(withInvite(`/categories/${id}`, invite));
}

export function listRegistrations(categoryId: number): Promise<Paginated<Registration>> {
  return apiFetch<Paginated<Registration>>(`/categories/${categoryId}/registrations`);
}

export function createRegistration(
  categoryId: number,
  input: { pair_id: number } | { player_id: number }
): Promise<Registration> {
  return apiFetch<Registration>(`/categories/${categoryId}/registrations`, {
    method: 'POST',
    body: input,
  });
}

export function updateRegistrationStatus(
  registrationId: number,
  status: RegistrationStatus
): Promise<Registration> {
  return apiFetch<Registration>(`/registrations/${registrationId}`, {
    method: 'PUT',
    body: { status },
  });
}

export function listMyPairs(): Promise<Pair[]> {
  return apiFetch<Pair[]>('/pairs');
}

export function createPair(partnerId: number, name?: string): Promise<Pair> {
  return apiFetch<Pair>('/pairs', {
    method: 'POST',
    body: name ? { partner_id: partnerId, name } : { partner_id: partnerId },
  });
}

export function searchUsers(query: string): Promise<PublicUserSummary[]> {
  return apiFetch<PublicUserSummary[]>(`/users?search=${encodeURIComponent(query)}`);
}

export function listPhases(categoryId: number, invite?: string): Promise<Phase[]> {
  return apiFetch<Phase[]>(withInvite(`/categories/${categoryId}/phases`, invite));
}

export function listMatches(phaseId: number, invite?: string): Promise<Paginated<Match>> {
  return apiFetch<Paginated<Match>>(withInvite(`/phases/${phaseId}/matches`, invite));
}

export function generateRoundRobin(categoryId: number): Promise<Phase[]> {
  return apiFetch<Phase[]>(`/categories/${categoryId}/round-robin`, { method: 'POST' });
}

export function getMatch(id: number): Promise<Match> {
  return apiFetch<Match>(`/matches/${id}`);
}

export function createMatchSet(
  matchId: number,
  input: { set_number: number; side1_games: number; side2_games: number }
): Promise<MatchSet> {
  return apiFetch<MatchSet>(`/matches/${matchId}/sets`, { method: 'POST', body: input });
}

export function updateMatchStatus(
  matchId: number,
  input: { status: MatchStatus; winner_side?: 1 | 2 }
): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}`, { method: 'PUT', body: input });
}

export function listRankings(categoryId: number, invite?: string): Promise<Ranking[]> {
  return apiFetch<Ranking[]>(withInvite(`/categories/${categoryId}/rankings`, invite));
}

/** Un jugador del partido propone los sets; el partido queda pendiente de validar por un rival. */
export function proposeMatchResult(
  matchId: number,
  sets: { side1_games: number; side2_games: number }[]
): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}/result-proposal`, { method: 'POST', body: { sets } });
}

/** Un rival (o el organizador) confirma el resultado propuesto: el partido pasa a completado. */
export function confirmMatchResult(matchId: number): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}/result-proposal/confirm`, { method: 'POST' });
}

/** Rechaza (un rival) o retira (quien propuso) el resultado: el partido vuelve a programado. */
export function rejectMatchResult(matchId: number): Promise<Match> {
  return apiFetch<Match>(`/matches/${matchId}/result-proposal/reject`, { method: 'POST' });
}
