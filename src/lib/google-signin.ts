import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

/** Sin `webClientId` la librería no puede devolver un `idToken`, solo funciona en Android/offline. */
export const isGoogleSignInConfigured = Boolean(WEB_CLIENT_ID);

let configured = false;

function ensureConfigured() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });
  configured = true;
}

/** Devuelve el `idToken` de Google, o `null` si el usuario cancela el diálogo. */
export async function signInWithGoogle(): Promise<string | null> {
  ensureConfigured();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response) || !response.data.idToken) {
    return null;
  }
  return response.data.idToken;
}
