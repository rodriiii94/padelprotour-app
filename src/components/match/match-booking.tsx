import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { listMyClubs, updateMatchBooking } from '@/api/categories';
import { ApiError, type Match, type MatchBooking as Booking } from '@/api/types';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { LabeledField } from '@/components/ui/labeled-field';
import { SectionLabel } from '@/components/ui/section-label';
import { TextField } from '@/components/ui/text-field';
import { useColors } from '@/hooks/use-theme';
import {
  bookingPlace,
  formatBookingWhen,
  isPlaytomicUrl,
  parseBookingInputs,
  toBookingInputs,
} from '@/lib/booking';
import { Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/**
 * Reserva de pista del partido: cuándo, dónde y el enlace al partido de Playtomic. Playtomic
 * no tiene API pública, así que los datos se apuntan a mano y el enlace solo se abre.
 */
export function MatchBooking({
  match,
  canEdit,
  onSaved,
}: {
  match: Match;
  /** Los cuatro jugadores y el organizador. */
  canEdit: boolean;
  onSaved: (booking: Booking) => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [isEditing, setIsEditing] = useState(false);

  const place = bookingPlace(match);
  const hasBooking = !!(match.scheduled_at || place || match.playtomic_url);

  if (!hasBooking && !canEdit) return null;

  if (isEditing) {
    return (
      <BookingForm
        match={match}
        onCancel={() => setIsEditing(false)}
        onSaved={(booking) => {
          setIsEditing(false);
          onSaved(booking);
        }}
      />
    );
  }

  return (
    <GlassPanel style={styles.card}>
      <SectionLabel icon="event" label="Reserva de pista" />
      {hasBooking ? (
        <>
          {match.scheduled_at && (
            <InfoRow icon="schedule" text={formatBookingWhen(match.scheduled_at)} styles={styles} />
          )}
          {place && <InfoRow icon="location-on" text={place} styles={styles} />}
          {match.playtomic_url && (
            <ActionChip
              icon="open-in-new"
              label="Abrir en Playtomic"
              tone="accent"
              onPress={() => Linking.openURL(match.playtomic_url!)}
            />
          )}
        </>
      ) : (
        <Text style={styles.meta}>
          ¿Ya habéis reservado? Vincula el partido de Playtomic y apunta el día, la hora y el club
          para que lo vean todos.
        </Text>
      )}
      {canEdit && (
        <ActionChip
          icon={hasBooking ? 'edit' : 'link'}
          label={hasBooking ? 'Editar reserva' : 'Vincular partido de Playtomic'}
          tone={hasBooking ? 'default' : 'accent'}
          onPress={() => setIsEditing(true)}
        />
      )}
    </GlassPanel>
  );
}

function InfoRow({
  icon,
  text,
  styles,
}: {
  icon: 'schedule' | 'location-on';
  text: string;
  styles: ReturnType<typeof makeStyles>;
}) {
  const colors = useColors();
  return (
    <View style={styles.infoRow}>
      <MaterialIcons name={icon} size={18} color={colors.primaryContainer} />
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function BookingForm({
  match,
  onCancel,
  onSaved,
}: {
  match: Match;
  onCancel: () => void;
  onSaved: (booking: Booking) => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const initial = toBookingInputs(match.scheduled_at);

  const [url, setUrl] = useState(match.playtomic_url ?? '');
  const [day, setDay] = useState(initial.day);
  const [time, setTime] = useState(initial.time);
  const [club, setClub] = useState(match.club ?? '');
  const [court, setCourt] = useState(match.court ?? '');
  const [myClubs, setMyClubs] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listMyClubs().then(setMyClubs, () => {});
  }, []);

  const urlInvalid = url.trim() !== '' && !isPlaytomicUrl(url);
  const hasDateInput = day.trim() !== '' || time.trim() !== '';
  const scheduledAt = hasDateInput ? parseBookingInputs(day, time) : null;
  const dateInvalid = hasDateInput && !scheduledAt;
  const clubSuggestions = myClubs.filter(
    (name) => name !== club.trim() && name.toLowerCase().includes(club.trim().toLowerCase())
  );

  async function save(input: Parameters<typeof updateMatchBooking>[1]) {
    setIsSaving(true);
    setError(null);
    try {
      onSaved(await updateMatchBooking(match.id, input));
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
      setError(first ?? (e instanceof ApiError ? e.message : 'No se pudo guardar la reserva.'));
    } finally {
      setIsSaving(false);
    }
  }

  const hadBooking = !!(match.scheduled_at || match.club || match.court || match.playtomic_url);

  return (
    <GlassPanel style={styles.card}>
      <SectionLabel icon="link" label="Vincular partido de Playtomic" />
      <Text style={styles.meta}>
        En Playtomic, abre el partido y pulsa Compartir para copiar el enlace. Playtomic no deja
        leer sus datos, así que apunta aquí el día, la hora y el club.
      </Text>

      <LabeledField label="Enlace de Playtomic">
        <TextField
          placeholder="Pega aquí el enlace"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          value={url}
          onChangeText={setUrl}
        />
      </LabeledField>
      {urlInvalid && <Text style={styles.errorText}>Pega el enlace que da Playtomic al compartir.</Text>}

      <View style={styles.row}>
        <View style={styles.flex}>
          <LabeledField label="Día">
            <TextField placeholder="dd/mm" value={day} onChangeText={setDay} keyboardType="numbers-and-punctuation" />
          </LabeledField>
        </View>
        <View style={styles.flex}>
          <LabeledField label="Hora">
            <TextField placeholder="hh:mm" value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" />
          </LabeledField>
        </View>
      </View>
      {dateInvalid && <Text style={styles.errorText}>Día como 04/10/2026 y hora como 19:30.</Text>}

      <LabeledField label="Club">
        <TextField placeholder="Nombre del club" value={club} onChangeText={setClub} maxLength={120} />
      </LabeledField>
      {clubSuggestions.length > 0 && (
        <View style={styles.suggestions}>
          {clubSuggestions.map((name) => (
            <Pressable
              key={name}
              onPress={() => setClub(name)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
              <Text style={styles.suggestionText}>{name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <LabeledField label="Pista (opcional)">
        <TextField placeholder="Número o nombre" value={court} onChangeText={setCourt} maxLength={255} />
      </LabeledField>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.row}>
        <ActionChip label="Cancelar" disabled={isSaving} onPress={onCancel} />
        <ActionChip
          icon="check"
          label={isSaving ? 'Guardando…' : 'Guardar'}
          tone="accent"
          disabled={isSaving || urlInvalid || dateInvalid}
          onPress={() =>
            save({
              playtomic_url: url.trim() || null,
              scheduled_at: scheduledAt ? scheduledAt.toISOString() : null,
              club: club.trim() || null,
              court: court.trim() || null,
            })
          }
        />
      </View>
      {hadBooking && (
        <ActionChip
          icon="link-off"
          label="Quitar reserva"
          tone="danger"
          disabled={isSaving}
          onPress={() => save({ playtomic_url: null, scheduled_at: null, club: null, court: null })}
        />
      )}
    </GlassPanel>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    body: {
      ...Typography.bodyMd,
      color: colors.onSurface,
      flexShrink: 1,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    row: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    flex: {
      flex: 1,
    },
    suggestions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    suggestion: {
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glassFill,
      borderRadius: Radii.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 6,
    },
    suggestionText: {
      ...Typography.bodySm,
      color: colors.onSurface,
    },
    pressed: {
      opacity: 0.7,
    },
    errorText: {
      ...Typography.bodySm,
      color: colors.error,
    },
  });
