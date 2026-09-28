import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createCategory } from '@/api/categories';
import { ApiError } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

export default function CrearCategoriaScreen() {
  const router = useRouter();
  const { competitionId } = useLocalSearchParams<{ competitionId: string }>();
  const [name, setName] = useState('');
  const [matchFormat, setMatchFormat] = useState('');
  const [slots, setSlots] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  function close() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/competiciones');
    }
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await createCategory(Number(competitionId), {
        name,
        match_format: matchFormat || null,
        slots: slots ? Number(slots) : null,
      });
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la categoría.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12}>
          <MaterialIcons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Nueva categoría</Text>
      </View>

      <View style={styles.infoRow}>
        <MaterialIcons name="info-outline" size={16} color={colors.onSurfaceVariant} />
        <Text style={styles.hint}>De pareja fija — así se puede generar el calendario luego.</Text>
      </View>

      <TextField placeholder="Nombre (p. ej. 4ª Masculina)" value={name} onChangeText={setName} />
      <TextField
        placeholder="Formato de partido (opcional)"
        value={matchFormat}
        onChangeText={setMatchFormat}
      />
      <TextField
        placeholder="Plazas (opcional)"
        value={slots}
        onChangeText={setSlots}
        keyboardType="number-pad"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isSubmitting ? 'Creando…' : 'Crear categoría'}
        onPress={handleSubmit}
        disabled={isSubmitting || !name}
      />
    </Screen>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    title: {
      ...Typography.headlineMd,
      color: colors.primary,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    hint: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      flex: 1,
    },
    error: {
      ...Typography.bodySm,
      color: colors.error,
    },
  });
