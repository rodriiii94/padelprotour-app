import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { createCompetition } from '@/api/competitions';
import { ApiError, type CompetitionType } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

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
  const [isPrivate, setIsPrivate] = useState(false);
  const [isDoubleRound, setIsDoubleRound] = useState(false);
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
      await createCompetition({
        type,
        name,
        venue: venue || null,
        start_date: startDate || null,
        end_date: endDate || null,
        is_private: isPrivate,
        double_round: type === 'league' ? isDoubleRound : undefined,
      });
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo crear la competición.');
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
        <Text style={styles.title}>Nueva competición</Text>
      </View>

      <SegmentedControl<CompetitionType>
        options={TYPE_OPTIONS}
        value={type}
        onChange={(value) => value && setType(value)}
      />

      <TextField placeholder="Nombre" value={name} onChangeText={setName} />
      <TextField placeholder="Sede (opcional)" value={venue} onChangeText={setVenue} />
      <TextField
        placeholder="Inicio (opcional) AAAA-MM-DD"
        value={startDate}
        onChangeText={setStartDate}
        autoCapitalize="none"
      />
      <TextField
        placeholder="Fin (opcional) AAAA-MM-DD"
        value={endDate}
        onChangeText={setEndDate}
        autoCapitalize="none"
      />

      {type === 'league' && (
        <GlassPanel style={styles.privacyRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Ida y vuelta</Text>
            <Text style={styles.hint}>
              {isDoubleRound
                ? 'Cada pareja se enfrenta dos veces: ida y vuelta.'
                : 'Cada pareja se enfrenta una sola vez.'}
            </Text>
          </View>
          <Switch
            value={isDoubleRound}
            onValueChange={setIsDoubleRound}
            trackColor={{ false: colors.glassFill, true: colors.primaryContainer }}
            thumbColor={colors.primary}
          />
        </GlassPanel>
      )}

      <GlassPanel style={styles.privacyRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Privada</Text>
          <Text style={styles.hint}>
            {isPrivate
              ? 'Solo visible por invitación.'
              : 'Visible para cualquiera en Competiciones.'}
          </Text>
        </View>
        <Switch
          value={isPrivate}
          onValueChange={setIsPrivate}
          trackColor={{ false: colors.glassFill, true: colors.primaryContainer }}
          thumbColor={colors.primary}
        />
      </GlassPanel>

      {error && <Text style={styles.error}>{error}</Text>}

      <Button
        title={isSubmitting ? 'Creando…' : 'Crear competición'}
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
    privacyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.sm,
    },
    cardTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    hint: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    error: {
      ...Typography.bodySm,
      color: colors.error,
    },
  });
