/** Types derived from openapi.yaml's `AuthToken` and `User` schemas. */

export interface User {
  id: number;
  name: string;
  email: string;
  level: string | null;
  club: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthToken {
  token: string;
  user: User;
}

export type CompetitionType = 'tournament' | 'league';

export interface Competition {
  id: number;
  type: CompetitionType;
  name: string;
  venue: string | null;
  start_date: string;
  end_date: string | null;
  registration_closes_at: string | null;
  organizer_id: number;
  is_private: boolean;
  /**
   * Only present when the caller is the organizer (key absent entirely
   * for anyone else); can still be `null` for competitions created
   * before this field existed.
   */
  invite_token?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitionInput {
  type: CompetitionType;
  name: string;
  venue?: string | null;
  start_date: string;
  end_date?: string | null;
  registration_closes_at?: string | null;
  is_private?: boolean;
}

export type RegistrationMode = 'fixed_pair' | 'individual_rotating' | null;

export interface Category {
  id: number;
  competition_id: number;
  name: string;
  match_format: string | null;
  slots: number | null;
  registration_mode: RegistrationMode;
  created_at: string;
  updated_at: string;
}

export interface CategoryInput {
  name: string;
  match_format?: string | null;
  slots?: number | null;
  registration_mode?: RegistrationMode;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'waitlisted' | 'rejected';

export interface Registration {
  id: number;
  category_id: number;
  pair_id: number | null;
  player_id: number | null;
  status: RegistrationStatus;
  created_at: string;
  updated_at: string;
}

export interface Pair {
  id: number;
  player1_id: number;
  player2_id: number;
  created_at: string;
  updated_at: string;
}

export type PhaseType = 'group' | 'elimination_round' | 'matchday';

export interface Phase {
  id: number;
  category_id: number;
  type: PhaseType;
  name: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export type MatchStatus = 'scheduled' | 'in_progress' | 'pending_validation' | 'completed';

export interface MatchSet {
  id: number;
  match_id: number;
  set_number: number;
  side1_games: number;
  side2_games: number;
}

export interface Match {
  id: number;
  phase_id: number;
  side1_player1_id: number;
  side1_player2_id: number;
  side2_player1_id: number;
  side2_player2_id: number;
  scheduled_at: string | null;
  court: string | null;
  status: MatchStatus;
  winner_side: 1 | 2 | null;
  match_sets?: MatchSet[];
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.status = status;
    this.errors = body.errors;
  }
}
