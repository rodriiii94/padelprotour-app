import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
// El `useFonts` de @expo-google-fonts siempre empieza en "no cargadas", también al generar
// el HTML estático, y deja la página vacía. El de expo-font las da por cargadas en el
// servidor y las declara en el propio HTML.
import { useFonts } from 'expo-font';
import { Slot, Stack, usePathname, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HIDE_LANDING_CLASS, LANDING_ID, LandingPage } from '@/components/landing/landing-page';
import { WebBottomBar, WebSidebar } from '@/components/ui/web-sidebar';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeProvider, useColors } from '@/hooks/use-theme';
import { Sentry } from '@/lib/sentry';
import { takePendingInvite } from '@/lib/invite';
import { useIsNarrowWeb } from '@/hooks/use-is-narrow-web';

SplashScreen.preventAutoHideAsync();

function RootLayoutWeb() {
  const [fontsLoaded] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Va antes del return anticipado para que también salga en el HTML estático.
  const pageHead = <PageHead pathname={usePathname()} />;

  if (!fontsLoaded) {
    return pageHead;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        {pageHead}
        <RootLayoutWebBody />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayoutWeb);

const SITE_URL = 'https://padelprotour.net';
const SITE_DESCRIPTION =
  'Organiza ligas y torneos de pádel con tus amigos: inscripciones, calendario, resultados y clasificación en un solo sitio.';
const HOME_TITLE = 'PadelProTour · Organiza ligas y torneos de pádel con tus amigos';
/** Lo único que tiene sentido que indexe un buscador; el resto pide sesión. */
const PUBLIC_PATHS = ['/', '/login', '/register', '/privacidad'];

const STRUCTURED_DATA = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PadelProTour',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  applicationCategory: 'SportsApplication',
  operatingSystem: 'Web',
  inLanguage: 'es',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
});

/** Metadatos de cada página para buscadores y para la vista previa al compartir el enlace. */
function PageHead({ pathname }: { pathname: string }) {
  const isHome = pathname === '/';
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const title = isHome ? HOME_TITLE : 'PadelProTour';
  const url = `${SITE_URL}${isHome ? '/' : pathname}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={SITE_DESCRIPTION} />
      <meta name="robots" content={isPublic ? 'index, follow' : 'noindex'} />
      {isPublic && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="PadelProTour" />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={SITE_DESCRIPTION} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${SITE_URL}/og-image.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={SITE_DESCRIPTION} />
      <meta name="twitter:image" content={`${SITE_URL}/og-image.png`} />
      {isHome && <script type="application/ld+json">{STRUCTURED_DATA}</script>}
    </Head>
  );
}

function RootLayoutWebBody() {
  const colors = useColors();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AuthGateWeb />
    </View>
  );
}

function AuthGateWeb() {
  const { user, isLoading } = useAuth();
  const isNarrow = useIsNarrowWeb();
  const pathname = usePathname();
  // Recuerda que en esta carga hubo sesión, para distinguir "acaba de cerrarla" de
  // "llegó sin sesión".
  const [wasSignedIn, setWasSignedIn] = useState(false);
  if (user && !wasSignedIn) {
    setWasSignedIn(true);
  }
  const isOnAuthRoute = ['(auth)', 'verify-email'].includes((useSegments() as string[])[0]);

  // Con sesión ya activa, un enlace de invitación se abre tal cual: no queda pendiente.
  useEffect(() => {
    if (user && !isOnAuthRoute) {
      takePendingInvite();
    }
  }, [user, isOnAuthRoute]);

  // Ya se sabe si hay sesión: deja de ocultar la presentación (ver +html.tsx), que solo
  // se pinta si toca (sin sesión y en "/").
  useEffect(() => {
    if (!isLoading) {
      document.documentElement.classList.remove(HIDE_LANDING_CLASS);
    }
  }, [isLoading]);

  if (!user && wasSignedIn) {
    return <ReloadToRoot />;
  }

  // Sin sesión, la raíz es la página de presentación en vez de saltar al login. También
  // mientras se comprueba la sesión: así va escrita en el HTML estático de "/" y los
  // buscadores la leen. A quien ya tiene sesión se la oculta +html.tsx hasta que carga.
  if (!user && pathname === '/') {
    return (
      <View nativeID={LANDING_ID} style={styles.root}>
        <LandingPage />
      </View>
    );
  }

  if (isLoading) {
    return null;
  }

  // Sin sesión: Stack con Stack.Protected. Sin él, expo-router deja abrir por URL
  // cualquier ruta no declarada (p.ej. "/" sin sesión), igual que el layout nativo.
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="verify-email" />
          <Stack.Screen name="privacidad" />
        </Stack.Protected>
        <Stack.Protected guard={false}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crear-competicion" />
          <Stack.Screen name="crear-categoria" />
          <Stack.Screen name="editar-perfil" />
          <Stack.Screen name="eliminar-cuenta" />
          <Stack.Screen name="jugador/[id]" />
          <Stack.Screen name="conexiones/[id]" />
          <Stack.Screen name="competicion/[id]" />
          <Stack.Screen name="categoria/[id]" />
          <Stack.Screen name="invite/[token]" />
          <Stack.Screen name="partido/[id]" />
        </Stack.Protected>
      </Stack>
    );
  }

  // Con sesión, Slot en vez de Stack: las pantallas de un Stack se colocan en
  // absoluto dentro de un contenedor de altura fija, y así el documento no puede
  // crecer ni hacer scroll (que es lo que hace que el móvil esconda la barra de URL).
  if (isOnAuthRoute) {
    return (
      <>
        <Slot />
        <PostLoginRedirect />
      </>
    );
  }

  return (
    <View style={isNarrow ? styles.authedRootNarrow : styles.authedRoot}>
      {!isNarrow && <WebSidebar />}
      <View style={styles.authedContent}>
        <Slot />
      </View>
      {isNarrow && <WebBottomBar />}
    </View>
  );
}

// Al cerrar sesión (o borrar la cuenta) se recarga la web en "/", que sin sesión es la
// página de presentación. Con una navegación normal no vale: al quedarse sin sesión el
// navegador (Slot) se desmonta y expo-router deja en la barra de direcciones una ruta que
// no es la que se ve.
function ReloadToRoot() {
  useEffect(() => {
    window.location.replace('/');
  }, []);

  return null;
}

// Tras iniciar sesión, a la invitación con la que se entró; si no, al inicio. Se hace
// con router.replace sobre un navegador montado (Slot): un <Redirect> que sustituye a
// todo el árbol no llega a cambiar la ruta y se queda repitiéndose sin fin.
function PostLoginRedirect() {
  const router = useRouter();
  useEffect(() => {
    const token = takePendingInvite();
    if (token) {
      router.replace({ pathname: '/invite/[token]', params: { token } });
    } else {
      router.replace('/');
    }
  }, [router]);
  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  authedRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  authedRootNarrow: {
    flex: 1,
  },
  authedContent: {
    flex: 1,
  },
});
