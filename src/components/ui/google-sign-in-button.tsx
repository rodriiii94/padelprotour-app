import { useState } from 'react';
import { Platform } from 'react-native';

import { isGoogleSignInConfigured, signInWithGoogle } from '@/lib/google-signin';
import { Button } from './button';

type Props = {
  onIdToken: (idToken: string) => void | Promise<void>;
  onError: (message: string) => void;
};

/** Oculto en web (la librería nativa no tiene soporte web) y si no hay `webClientId` configurado. */
export function GoogleSignInButton({ onIdToken, onError }: Props) {
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (Platform.OS === 'web' || !isGoogleSignInConfigured) {
    return null;
  }

  async function handlePress() {
    setIsSigningIn(true);
    try {
      const idToken = await signInWithGoogle();
      if (idToken) {
        await onIdToken(idToken);
      }
    } catch {
      onError('No se pudo iniciar sesión con Google.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <Button
      title={isSigningIn ? 'Conectando…' : 'Continuar con Google'}
      variant="secondary"
      disabled={isSigningIn}
      onPress={handlePress}
    />
  );
}
