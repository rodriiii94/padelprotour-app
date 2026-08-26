import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createCompetition } from '@/api/competitions';
import { ApiError, type CompetitionType } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const TYPE_OPTIONS: { value: CompetitionType; label: string }[] = [
  { value: 'tournament', label: 'Torneo' },
  { value: 'league', label: 'Liga' },
];

export default function CrearCompeticionScreen() {
  const router = useRouter();
  const [type, setType] = useState<CompetitionType>('tournament');
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await createCompetition({
        type,
        name,
        venue: venue || null,
        start_date: startDate,
        end_date: endDate || null,
      });
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la competición.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="close" size={24} color={Colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Nueva competición</Text>
      </View>

      <View style={styles.typeSelector}>
        {TYPE_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => setType(option.value)}
            style={[styles.typeButton, type === option.value && styles.typeButtonActive]}>
            <Text
              style={[
                styles.typeButtonLabel,
                type === option.value && styles.typeButtonLabelActive,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextField placeholder="Nombre" value={name} onChangeText={setName} />
      <TextField placeholder="Sede (opcional)" value={venue} onChangeText={setVenue} />
      <TextField
        placeholder="Fecha de inicio (AAAA-MM-DD)"
        value={startDate}
        onChangeText={setStartDate}
        autoCapitalize="none"
      />
      <TextField
        placeholder="Fecha de fin (opcional, AAAA-MM-DD)"
        value={endDate}
        onChangeText={setEndDate}
        autoCapitalize="none"
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isSubmitting ? 'Creando…' : 'Crear competición'}
        onPress={handleSubmit}
        disabled={isSubmitting || !name || !startDate}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.full,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  typeButtonLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  typeButtonLabelActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamilies.bodyBold,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
