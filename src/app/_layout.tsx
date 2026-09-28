import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_700Bold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold } from '@expo-google-fonts/sora';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { ThemeProvider, useColors, useTheme } from '@/hooks/use-theme';
import { usePendingInviteRedirect } from '@/lib/invite';
import { Sentry } from '@/lib/sentry';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutBody />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default Sentry.wrap(RootLayout);

function RootLayoutBody() {
  const { scheme } = useTheme();
  const colors = useColors();

  return (
    <>
      <StatusBar barStyle={scheme === 'light' ? 'dark-content' : 'light-content'} />
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <AuthGate />
      </View>
    </>
  );
}

function AuthGate() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      {user && <PendingInviteRedirect />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="privacidad" />
      <Stack.Protected guard={!user}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="verify-email" />
        </Stack.Protected>
        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="crear-competicion" options={{ presentation: 'modal' }} />
          <Stack.Screen name="crear-categoria" options={{ presentation: 'modal' }} />
          <Stack.Screen name="editar-perfil" options={{ presentation: 'modal' }} />
          <Stack.Screen name="eliminar-cuenta" />
          <Stack.Screen name="jugador/[id]" />
          <Stack.Screen name="conexiones/[id]" />
          <Stack.Screen name="competicion/[id]" />
          <Stack.Screen name="categoria/[id]" />
          <Stack.Screen name="invite/[token]" />
          <Stack.Screen name="partido/[id]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

function PendingInviteRedirect() {
  usePendingInviteRedirect();
  return null;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
