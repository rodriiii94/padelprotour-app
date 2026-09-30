import type { Match } from '@/api/types';

/** Mismo criterio que la API: solo enlaces https de playtomic.com / playtomic.io. */
const PLAYTOMIC_URL_PATTERN = /^https:\/\/([a-z0-9-]+\.)*playtomic\.(com|io)(\/\S*)?$/i;

export function isPlaytomicUrl(url: string): boolean {
  return PLAYTOMIC_URL_PATTERN.test(url.trim());
}

const whenFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** "sáb, 4 oct, 19:30" en la hora local del dispositivo. */
export function formatBookingWhen(scheduledAt: string): string {
  return whenFormatter.format(new Date(scheduledAt));
}

/** "Club Pádel Norte · Pista 3", o solo lo que haya. */
export function bookingPlace(match: Pick<Match, 'club' | 'court'>): string | null {
  const parts = [match.club, match.court].filter((part): part is string => !!part);
  return parts.length ? parts.join(' · ') : null;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Fecha guardada → campos del formulario ("04/10/2026", "19:30"). */
export function toBookingInputs(scheduledAt: string | null): { day: string; time: string } {
  if (!scheduledAt) return { day: '', time: '' };
  const date = new Date(scheduledAt);
  return {
    day: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

/**
 * Campos del formulario → fecha local. Acepta "4/10", "4/10/26" o "04/10/2026" y "19:30"
 * (o "19.30"); sin año, el de hoy. null si algo no es una fecha real.
 */
export function parseBookingInputs(day: string, time: string): Date | null {
  const dayMatch = day.trim().match(/^(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2}|\d{4}))?$/);
  const timeMatch = time.trim().match(/^(\d{1,2})[:.](\d{2})$/);
  if (!dayMatch || !timeMatch) return null;

  const [, d, m, y] = dayMatch;
  const year = y ? (y.length === 2 ? 2000 + Number(y) : Number(y)) : new Date().getFullYear();
  const [hours, minutes] = [Number(timeMatch[1]), Number(timeMatch[2])];
  if (hours > 23 || minutes > 59) return null;

  const date = new Date(year, Number(m) - 1, Number(d), hours, minutes);
  // new Date(2026, 1, 31) salta a marzo: si no coincide, el día no existe.
  return date.getDate() === Number(d) && date.getMonth() === Number(m) - 1 ? date : null;
}
