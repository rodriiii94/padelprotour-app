import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@padelprotour.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsUnverified(false);
    setResendMessage(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        setIsUnverified(true);
        setError(e.message);
      } else {
        setError(e instanceof ApiError ? e.message : 'No se pudo iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setIsSubmitting(true);
    try {
      const { message } = await resendVerification({ email });
      setResendMessage(message);
    } catch {
      setResendMessage('No se pudo reenviar el email, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>PadelProTour</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>

        <TextField
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {resendMessage && <Text style={styles.subtitle}>{resendMessage}</Text>}

        <Button
          title={isSubmitting ? 'Entrando…' : 'Entrar'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submit}
        />

        {isUnverified && (
          <Button
            title="Reenviar email de verificación"
            variant="secondary"
            onPress={handleResend}
            disabled={isSubmitting}
          />
        )}

        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.safeMargin,
    gap: Spacing.sm,
  },
  title: {
    ...Typography.display,
    fontSize: 32,
    color: Colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
  submit: {
    marginTop: Spacing.xs,
  },
  link: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  linkText: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
  },
});
