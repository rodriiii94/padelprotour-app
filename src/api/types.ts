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
