import type { MaterialIcons } from '@expo/vector-icons';

import type {
  AchievementKey,
  AvatarColor,
  DominantHand,
  PreferredSide,
  SocialLinks,
  SocialNetwork,
} from '@/api/types';

/** La API guarda solo la clave; el color real lo decide la app. */
export const AVATAR_COLORS: Record<AvatarColor, { background: string; foreground: string }> = {
  lime: { background: '#b6f700', foreground: '#253600' },
  orange: { background: '#fe9800', foreground: '#3a1f00' },
  sky: { background: '#38bdf8', foreground: '#04283a' },
  violet: { background: '#a78bfa', foreground: '#1e1245' },
  rose: { background: '#fb7185', foreground: '#4a0716' },
  teal: { background: '#2dd4bf', foreground: '#042f2a' },
};

export const AVATAR_COLOR_KEYS = Object.keys(AVATAR_COLORS) as AvatarColor[];

/** Emojis a elegir: evita depender del teclado de emojis, que no existe en web de escritorio. */
export const AVATAR_EMOJIS = ['🎾', '🏆', '🔥', '⚡', '🚀', '💪', '😎', '🦁', '🐯', '🐺', '🦅', '🌵'];

export const PREFERRED_SIDE_LABEL: Record<PreferredSide, string> = {
  right: 'Drive',
  left: 'Revés',
  both: 'Ambos lados',
};

export const DOMINANT_HAND_LABEL: Record<DominantHand, string> = {
  right: 'Diestro',
  left: 'Zurdo',
};

export const ACHIEVEMENTS: Record<
  AchievementKey,
  { label: string; description: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  first_win: { label: 'Primera victoria', description: 'Ganó su primer partido', icon: 'military-tech' },
  matches_10: { label: '10 partidos', description: 'Ha jugado 10 partidos', icon: 'sports-tennis' },
  matches_50: { label: '50 partidos', description: 'Ha jugado 50 partidos', icon: 'workspace-premium' },
  win_streak_5: { label: 'Racha de 5', description: '5 victorias seguidas', icon: 'local-fire-department' },
  champion: { label: 'Campeón', description: 'Primero en una competición terminada', icon: 'emoji-events' },
};

/** Orden en el que se muestran, de menos a más difícil. */
export const ACHIEVEMENT_ORDER: AchievementKey[] = [
  'first_win',
  'matches_10',
  'win_streak_5',
  'matches_50',
  'champion',
];

export const SOCIAL_NETWORKS: Record<SocialNetwork, { label: string; urlFor: (handle: string) => string }> = {
  instagram: { label: 'Instagram', urlFor: (h) => `https://instagram.com/${encodeURIComponent(h)}` },
  tiktok: { label: 'TikTok', urlFor: (h) => `https://www.tiktok.com/@${encodeURIComponent(h)}` },
  x: { label: 'X', urlFor: (h) => `https://x.com/${encodeURIComponent(h)}` },
  youtube: { label: 'YouTube', urlFor: (h) => `https://www.youtube.com/@${encodeURIComponent(h)}` },
  facebook: { label: 'Facebook', urlFor: (h) => `https://facebook.com/${encodeURIComponent(h)}` },
};

export const SOCIAL_NETWORK_KEYS = Object.keys(SOCIAL_NETWORKS) as SocialNetwork[];

/** Redes con usuario rellenado, en el orden fijo de `SOCIAL_NETWORKS`. */
export function filledSocialLinks(links: SocialLinks | null): { network: SocialNetwork; handle: string }[] {
  return SOCIAL_NETWORK_KEYS.flatMap((network) => {
    const handle = links?.[network];
    return handle ? [{ network, handle }] : [];
  });
}

export const AVAILABILITY_DAYS = [
  { key: 'mon', label: 'L' },
  { key: 'tue', label: 'M' },
  { key: 'wed', label: 'X' },
  { key: 'thu', label: 'J' },
  { key: 'fri', label: 'V' },
  { key: 'sat', label: 'S' },
  { key: 'sun', label: 'D' },
] as const;

export const AVAILABILITY_PARTS = [
  { key: 'morning', label: 'Mañana' },
  { key: 'afternoon', label: 'Tarde' },
  { key: 'evening', label: 'Noche' },
] as const;

export function availabilitySlot(day: string, part: string): string {
  return `${day}-${part}`;
}

/** "Sevilla · 3ª · Club Pádel Sur", sin huecos si falta alguno. */
export function subtitleFor(profile: { city: string | null; level: string | null; club: string | null }): string {
  return [profile.city, profile.level, profile.club].filter(Boolean).join(' · ');
}

const longDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
const monthYear = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

export const formatLongDate = (iso: string): string => longDate.format(new Date(iso));
export const formatMonthYear = (iso: string): string => monthYear.format(new Date(iso));
