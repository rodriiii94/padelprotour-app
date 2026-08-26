import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Crear cuenta</Text>

        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor={Colors.onSurfaceVariant}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.onSurfaceVariant}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={Colors.onSurfaceVariant}
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

        <Link href="/(auth)/login" style={styles.link}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
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
    ...Typography.headlineLg,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    color: Colors.onSurface,
    fontFamily: FontFamilies.body,
    fontSize: 16,
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
