import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { ApiError } from '@/api/types';

type Props = {
  onIdToken: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
};

type GoogleIdentity = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';
// Google no renderiza su botón a más de 400px de ancho.
const MAX_BUTTON_WIDTH = 400;

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('No se pudo cargar el script de Google.'));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/**
 * Botón oficial de Google Identity Services. Devuelve el mismo `id_token` (JWT)
 * que el login nativo, así que el backend lo valida igual con POST /auth/google.
 */
export function GoogleSignInButton({ onIdToken, onError }: Props) {
  const containerRef = useRef<View>(null);
  const [width, setWidth] = useState(0);
  // El callback de Google se registra una vez; así siempre llama a las props actuales.
  const handlers = useRef({ onIdToken, onError });
  useEffect(() => {
    handlers.current = { onIdToken, onError };
  });

  useEffect(() => {
    if (!WEB_CLIENT_ID || width === 0) return;

    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        // En react-native-web el ref de un View es el elemento del DOM.
        const node = containerRef.current as unknown as HTMLElement | null;
        if (cancelled || !node || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: WEB_CLIENT_ID,
          callback: async ({ credential }) => {
            if (!credential) return;
            try {
              await handlers.current.onIdToken(credential);
            } catch (e) {
              handlers.current.onError(
                e instanceof ApiError ? e.message : 'No se pudo iniciar sesión con Google.'
              );
            }
          },
        });
        node.innerHTML = '';
        window.google.accounts.id.renderButton(node, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          locale: 'es',
          width: Math.min(Math.round(width), MAX_BUTTON_WIDTH),
        });
      })
      .catch(() => {
        if (!cancelled) handlers.current.onError('No se pudo cargar el inicio de sesión con Google.');
      });

    return () => {
      cancelled = true;
    };
  }, [width]);

  if (!WEB_CLIENT_ID) {
    return null;
  }

  return (
    <View
      ref={containerRef}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', minHeight: 44, alignItems: 'center' }}
    />
  );
}
