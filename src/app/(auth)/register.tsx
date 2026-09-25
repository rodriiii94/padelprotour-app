import { Link } from 'expo-router';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/types';
import { AuthShell, LabeledField, OrDivider, PasswordField } from '@/components/auth/auth-shell';
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
      <AuthShell
        title="Revisa tu email"
        subtitle={registeredMessage}
        footer={
          <Link href="/(auth)/login" style={styles.link}>
            <Text style={styles.linkText}>Ir a iniciar sesión</Text>
          </Link>
        }>
        <View style={styles.sentRow}>
          <MaterialIcons name="mark-email-read" size={22} color={Colors.primaryContainer} />
          <Text style={styles.info}>
            Pulsa el botón del correo para activar tu cuenta. Si no lo ves, mira en spam.
          </Text>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Es gratis y solo te llevará un minuto."
      footer={
        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </Link>
      }>
      <LabeledField label="Nombre">
        <TextField placeholder="Cómo te verán los demás" autoComplete="name" value={name} onChangeText={setName} />
      </LabeledField>
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
          autoComplete="new-password"
          onSubmitEditing={handleSubmit}
        />
        <Text style={styles.hint}>Mínimo 8 caracteres.</Text>
      </LabeledField>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isSubmitting ? 'Creando…' : 'Crear cuenta'}
        onPress={handleSubmit}
        disabled={isSubmitting}
        style={styles.submit}
      />

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
    flex: 1,
  },
  hint: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  sentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
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
