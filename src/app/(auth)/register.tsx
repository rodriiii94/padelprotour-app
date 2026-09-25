import { Link } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GoogleSignInButton } from '@/components/ui/google-sign-in-button';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function RegisterScreen() {
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredMessage, setRegisteredMessage] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const { message } = await register({ name, email, password });
      setRegisteredMessage(message);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredMessage) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Revisa tu email</Text>
          <Text style={styles.subtitle}>{registeredMessage}</Text>

          <Link href="/(auth)/login" style={styles.link}>
            <Text style={styles.linkText}>Ir a iniciar sesión</Text>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextField placeholder="Nombre" value={name} onChangeText={setName} />
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

        <Button
          title={isSubmitting ? 'Creando…' : 'Crear cuenta'}
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submit}
        />

        <GoogleSignInButton onIdToken={loginWithGoogle} onError={setError} />

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Link>
        <Link href="/privacidad" style={styles.link}>
          <Text style={styles.linkText}>Política de privacidad</Text>
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
  content:
    Platform.OS === 'web'
      ? {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.safeMargin,
          gap: Spacing.sm,
          maxWidth: 420,
          width: '100%',
          alignSelf: 'center',
        }
      : {
          flex: 1,
          justifyContent: 'center',
          paddingHorizontal: Spacing.safeMargin,
          gap: Spacing.sm,
        },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
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
