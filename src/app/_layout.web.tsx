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
import { StyleSheet, View } from 'react-native';

import { WebBottomBar, WebSidebar, useIsNarrowWeb } from '@/components/ui/web-sidebar';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { Colors } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayoutWeb() {
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
    <AuthProvider>
      <View style={styles.root}>
        <AuthGateWeb />
      </View>
    </AuthProvider>
  );
}

function AuthGateWeb() {
  const { user, isLoading } = useAuth();
  const isNarrow = useIsNarrowWeb();

  if (isLoading) {
    return null;
  }

  // Sin Stack.Protected, expo-router deja abrir por URL cualquier ruta no
  // declarada en el Stack (p.ej. "/" sin sesión), igual que hace el layout nativo.
  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="verify-email" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="crear-competicion" options={{ presentation: 'modal' }} />
        <Stack.Screen name="crear-categoria" options={{ presentation: 'modal' }} />
        <Stack.Screen name="competicion/[id]" />
        <Stack.Screen name="categoria/[id]" />
        <Stack.Screen name="invite/[token]" />
        <Stack.Screen name="partido/[id]" />
      </Stack.Protected>
    </Stack>
  );

  if (!user) {
    return stack;
  }

  return (
    <View style={isNarrow ? styles.authedRootNarrow : styles.authedRoot}>
      {!isNarrow && <WebSidebar />}
      <View style={styles.authedContent}>{stack}</View>
      {isNarrow && <WebBottomBar />}
    </View>
  );
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
