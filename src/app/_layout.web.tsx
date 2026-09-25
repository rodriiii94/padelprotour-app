import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { Slot, Stack, useRouter, useSegments } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { WebBottomBar, WebSidebar } from '@/components/ui/web-sidebar';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Sentry } from '@/lib/sentry';
import { takePendingInvite } from '@/lib/invite';
import { useIsNarrowWeb } from '@/hooks/use-is-narrow-web';
import { Colors } from '@/theme/tokens';

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
  const pageHead = (
    <Head>
      <title>PadelProTour</title>
      <meta name="description" content="Tus ligas y torneos de pádel" />
    </Head>
  );

  if (!fontsLoaded) {
    return pageHead;
  }

  return (
    <AuthProvider>
      {pageHead}
      <View style={styles.root}>
        <AuthGateWeb />
      </View>
    </AuthProvider>
  );
}

export default Sentry.wrap(RootLayoutWeb);

function AuthGateWeb() {
  const { user, isLoading } = useAuth();
  const isNarrow = useIsNarrowWeb();
  const isOnAuthRoute = ['(auth)', 'verify-email'].includes((useSegments() as string[])[0]);

  // Con sesión ya activa, un enlace de invitación se abre tal cual: no queda pendiente.
  useEffect(() => {
    if (user && !isOnAuthRoute) {
      takePendingInvite();
    }
  }, [user, isOnAuthRoute]);

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
    backgroundColor: Colors.background,
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
