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
