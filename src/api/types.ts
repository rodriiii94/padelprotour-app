/** Types derived from openapi.yaml's `AuthToken` and `User` schemas. */

export type PreferredSide = 'right' | 'left' | 'both';
export type DominantHand = 'right' | 'left';
export type AvatarColor = 'lime' | 'orange' | 'sky' | 'violet' | 'rose' | 'teal';
export type SocialNetwork = 'instagram' | 'tiktok' | 'x' | 'youtube' | 'facebook';
/** Network => user handle (no URL, no leading @). */
export type SocialLinks = Partial<Record<SocialNetwork, string>>;
export type AchievementKey = 'first_win' | 'matches_10' | 'matches_50' | 'win_streak_5' | 'champion';

/** Profile data shared by the own account and the public profile. */
export interface ProfileFields {
  level: string | null;
  club: string | null;
  city: string | null;
  bio: string | null;
  preferred_side: PreferredSide | null;
  dominant_hand: DominantHand | null;
  avatar_color: AvatarColor | null;
  avatar_emoji: string | null;
  /** Foto de perfil (512x512); si existe, sustituye al avatar de color/emoji. */
  avatar_url: string | null;
  racket: string | null;
  motto: string | null;
  /** Slots like "mon-evening" (day x morning/afternoon/evening). */
  availability: string[] | null;
  social_links: SocialLinks | null;
}

/** The authenticated user's own account — the only place the email is ever returned. */
export interface User extends ProfileFields {
  /** false: la cuenta solo entra con Google/Apple. */
  has_password?: boolean;
  id: number;
  name: string;
  email: string;
  /** When the name can be changed again; null/absent = can change it now. */
  name_change_available_at?: string | null;
  created_at: string;
  updated_at: string;
}

/** Body of `PUT /me` — send only what changes. */
export type ProfileInput = Partial<ProfileFields> & { name?: string };

/** What a player search returns about someone else. Never includes the email. */
export interface PublicUserSummary {
  id: number;
  name: string;
  level: string | null;
  club: string | null;
  city: string | null;
  avatar_color: AvatarColor | null;
  avatar_emoji: string | null;
  avatar_url: string | null;
}

export interface MatchMessage {
  id: number;
  body: string;
  created_at: string;
  author: PublicUserSummary;
}

export interface PlayerStats {
  matches_played: number;
  wins: number;
  losses: number;
  win_rate: number | null;
  current_streak: number;
  best_streak: number;
  sets_won: number;
  sets_lost: number;
  games_won: number;
  games_lost: number;
  competitions_played: number;
}

/** `GET /users/{id}` — public to any authenticated user, never includes the email. */
export interface PlayerProfile extends ProfileFields {
  id: number;
  name: string;
  created_at: string;
  stats: PlayerStats;
  achievements: AchievementKey[];
  usual_partner: { id: number; name: string; matches: number } | null;
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
}

/** `POST /register` no longer logs the user in — the account still needs email verification. */
export interface RegisterResult {
  message: string;
  user: User;
}

export type CompetitionType = 'tournament' | 'league';

export interface Competition {
  id: number;
  type: CompetitionType;
  name: string;
  venue: string | null;
  start_date: string | null;
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
  /** Set by POST /competitions/{id}/cancel. Null means active. */
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitionInput {
  type: CompetitionType;
  name: string;
  venue?: string | null;
  start_date?: string | null;
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

/** Minimal player data embedded in Pair/Registration/Match — GET only, absent on POST/PUT responses. */
export interface UserSummary {
  id: number;
  name: string;
}

export interface Pair {
  id: number;
  player1_id: number;
  player2_id: number;
  player1?: UserSummary;
  player2?: UserSummary;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: number;
  category_id: number;
  pair_id: number | null;
  player_id: number | null;
  status: RegistrationStatus;
  /** Present (with player1/player2 embedded) only when pair_id is set, GET only. */
  pair?: Pair;
  /** Present only when player_id is set, GET only. */
  player?: UserSummary;
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
  /** Embedded on GET (index/show and round-robin generation) only. */
  side1_player1?: UserSummary;
  side1_player2?: UserSummary;
  side2_player1?: UserSummary;
  side2_player2?: UserSummary;
  scheduled_at: string | null;
  court: string | null;
  status: MatchStatus;
  winner_side: 1 | 2 | null;
  /** Quién propuso el resultado mientras el partido está en `pending_validation`. */
  result_proposed_by?: number | null;
  /** Cuándo se propuso; 48 h después, sin respuesta, se confirma solo. */
  result_proposed_at?: string | null;
  match_sets?: MatchSet[];
}

export interface Ranking {
  id: number;
  category_id: number;
  pair_id: number | null;
  player_id: number | null;
  points: number;
  position: number;
  calculated_at: string;
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
