import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { resendVerification } from '@/api/auth';
import { ApiError } from '@/api/types';
import { AuthShell, LabeledField, OrDivider, PasswordField } from '@/components/auth/auth-shell';
import { ActionChip } from '@/components/ui/action-chip';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function LoginScreen() {
  const { login, loginWithGoogle } = useAuth();
  // Cuenta demo del seeder, solo en desarrollo: en producción el formulario va vacío.
  const [email, setEmail] = useState(__DEV__ ? 'demo@padelprotour.test' : '');
  const [password, setPassword] = useState(__DEV__ ? 'password' : '');
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
    <AuthShell
      title="Inicia sesión"
      subtitle="Entra para gestionar tus ligas y torneos."
      footer={
        <Link href="/(auth)/register" style={styles.link}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </Link>
      }>
      <LabeledField label="Email">
        <TextField
          placeholder="tu@email.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
      </LabeledField>
      <LabeledField label="Contraseña">
        <PasswordField
          value={password}
          onChangeText={setPassword}
          autoComplete="current-password"
          onSubmitEditing={handleSubmit}
        />
      </LabeledField>

      {error && <Text style={styles.error}>{error}</Text>}
      {resendMessage && <Text style={styles.info}>{resendMessage}</Text>}

      <Button
        title={isSubmitting ? 'Entrando…' : 'Entrar'}
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submit}
      />

      {isUnverified && (
        <ActionChip
          icon="mail-outline"
          label="Reenviar email de verificación"
          onPress={handleResend}
          disabled={isSubmitting}
        />
      )}

      <OrDivider />
      <GoogleSignInButton onIdToken={loginWithGoogle} onError={setError} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
  info: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  submit: {
    marginTop: Spacing.base,
  },
  link: {
    alignSelf: 'center',
  },
  linkText: {
    ...Typography.bodyMd,
    color: Colors.primaryContainer,
  },
});
