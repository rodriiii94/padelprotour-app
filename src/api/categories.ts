import { apiFetch } from './client';
import type {
  Category,
  CategoryInput,
  Match,
  MatchSet,
  MatchStatus,
  Pair,
  Paginated,
  Phase,
  Ranking,
  Registration,
  RegistrationStatus,
  User,
} from './types';

export function createCategory(competitionId: number, input: CategoryInput): Promise<Category> {
  return apiFetch<Category>(`/competitions/${competitionId}/categories`, {
    method: 'POST',
    body: input,
  });
}

export function getCategory(id: number): Promise<Category> {
  return apiFetch<Category>(`/categories/${id}`);
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

export function createPair(partnerId: number): Promise<Pair> {
  return apiFetch<Pair>('/pairs', { method: 'POST', body: { partner_id: partnerId } });
}

export function searchUsers(query: string): Promise<User[]> {
  return apiFetch<User[]>(`/users?search=${encodeURIComponent(query)}`);
}

export function listPhases(categoryId: number): Promise<Phase[]> {
  return apiFetch<Phase[]>(`/categories/${categoryId}/phases`);
}

export function listMatches(phaseId: number): Promise<Paginated<Match>> {
  return apiFetch<Paginated<Match>>(`/phases/${phaseId}/matches`);
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

export function listRankings(categoryId: number): Promise<Ranking[]> {
  return apiFetch<Ranking[]>(`/categories/${categoryId}/rankings`);
}
