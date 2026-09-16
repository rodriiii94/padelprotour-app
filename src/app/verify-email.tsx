import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/types';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'done' | 'error'>('verifying');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) {
        setStatus('error');
        setMessage('Enlace de verificación inválido.');
        return;
      }
      try {
        await verifyEmail({ token });
        setStatus('done');
      } catch (e) {
        setStatus('error');
        setMessage(e instanceof ApiError ? e.message : 'No se pudo verificar el email.');
      }
    })();
  }, [token, verifyEmail]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {status === 'verifying' && (
          <>
            <ActivityIndicator color={Colors.primaryContainer} />
            <Text style={styles.subtitle}>Verificando tu email…</Text>
          </>
        )}

        {status === 'done' && <Text style={styles.title}>¡Cuenta verificada!</Text>}

        {status === 'error' && (
          <>
            <Text style={styles.title}>No se pudo verificar</Text>
            <Text style={styles.subtitle}>{message}</Text>
            <Link href="/(auth)/login" style={styles.link}>
              <Text style={styles.linkText}>Ir a iniciar sesión</Text>
            </Link>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content:
    Platform.OS === 'web'
      ? {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Spacing.safeMargin,
          gap: Spacing.sm,
          maxWidth: 420,
          width: '100%',
          alignSelf: 'center',
        }
      : {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: Spacing.safeMargin,
          gap: Spacing.sm,
        },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  link: {
    marginTop: Spacing.sm,
  },
  linkText: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
  },
});
