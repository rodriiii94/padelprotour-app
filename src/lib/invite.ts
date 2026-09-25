import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

const WEB_URL = 'https://padelprotour.net';
const PENDING_KEY = 'padelontour_pending_invite';
const INVITE_PATH = /\/invite\/([A-Za-z0-9_-]+)/;

/** Enlace que se comparte: abre la web en cualquier dispositivo, sin necesitar la app. */
export function inviteUrl(token: string): string {
  return `${WEB_URL}/invite/${token}`;
}

// En nativo no hay localStorage: la invitación pendiente vive en memoria.
let pendingToken: string | null = null;

function remember(token: string): void {
  pendingToken = token;
  globalThis.localStorage?.setItem(PENDING_KEY, token);
}

// En web el router redirige al login antes de que ningún componente pueda leer la URL
// de entrada, así que se captura al cargar el módulo.
if (Platform.OS === 'web') {
  const match = globalThis.location?.pathname.match(INVITE_PATH);
  if (match) {
    remember(match[1]);
  }
} else {
  Linking.getInitialURL().then((url) => {
    const match = url?.match(INVITE_PATH);
    if (match) {
      remember(match[1]);
    }
  });
  Linking.addEventListener('url', ({ url }) => {
    const match = url.match(INVITE_PATH);
    if (match) {
      remember(match[1]);
    }
  });
}

/** Devuelve la invitación con la que entró la persona (y la olvida), si la hay. */
export function takePendingInvite(): string | null {
  const token = pendingToken ?? globalThis.localStorage?.getItem(PENDING_KEY) ?? null;
  pendingToken = null;
  globalThis.localStorage?.removeItem(PENDING_KEY);
  return token;
}

/**
 * Tras iniciar sesión (o registrarse y verificar el email) lleva a la invitación con la
 * que entró la persona. Se monta solo con sesión iniciada.
 */
export function usePendingInviteRedirect(): void {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = takePendingInvite();
      if (token) {
        router.replace({ pathname: '/invite/[token]', params: { token } });
      }
    })();
  }, [router]);
}
