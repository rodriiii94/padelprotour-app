import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { confirmAction } from '@/lib/confirm';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function EliminarCuentaScreen() {
  const router = useRouter();
  const { user, deleteAccount } = useAuth();
  const [secret, setSecret] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Las cuentas que solo entran con Google/Apple no tienen contraseña: confirman con su email.
  const needsPassword = user?.has_password !== false;

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/perfil');
    }
  }

  function submit() {
    confirmAction({
      title: 'Eliminar cuenta',
      message: 'Se borrarán tus datos personales y tu acceso. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        setIsSubmitting(true);
        setError(null);
        try {
          await deleteAccount(needsPassword ? { password: secret } : { email: secret });
        } catch (e) {
          const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
          setError(first ?? 'No se pudo eliminar la cuenta.');
          setIsSubmitting(false);
        }
      },
    });
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      <Text style={styles.title}>Eliminar cuenta</Text>

      <GlassPanel style={styles.card}>
        <Text style={styles.body}>
          Se borran tu email, tu contraseña, tu perfil y tus redes, y ya no podrás entrar. Tus
          partidos y resultados se conservan para el resto de jugadores, pero aparecerás como
          “Jugador eliminado”. Las inscripciones aún sin confirmar se cancelan.
        </Text>
        <Text style={styles.body}>
          Si organizas una competición en curso, primero tendrás que cancelarla o eliminarla.
        </Text>
      </GlassPanel>

      <Text style={styles.label}>
        {needsPassword ? 'Escribe tu contraseña para confirmar' : 'Escribe tu email para confirmar'}
      </Text>
      <TextField
        value={secret}
        onChangeText={setSecret}
        secureTextEntry={needsPassword}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={needsPassword ? 'default' : 'email-address'}
        placeholder={needsPassword ? 'Contraseña' : user?.email}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        title={isSubmitting ? 'Eliminando…' : 'Eliminar mi cuenta'}
        variant="danger"
        disabled={isSubmitting || secret.length === 0}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  body: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  label: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
