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
