import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  ApiError,
  type AvatarColor,
  type DominantHand,
  type PreferredSide,
  type ProfileInput,
  type SocialLinks,
  type SocialNetwork,
  type User,
} from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { LabeledField } from '@/components/ui/labeled-field';
import { Screen } from '@/components/ui/screen';
import { SectionLabel, type IconName } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useColors } from '@/hooks/use-theme';
import { pickAvatarPhoto } from '@/lib/avatar-photo';
import {
  AVAILABILITY_DAYS,
  AVAILABILITY_PARTS,
  AVATAR_COLOR_KEYS,
  AVATAR_COLORS,
  AVATAR_EMOJIS,
  DOMINANT_HAND_LABEL,
  PREFERRED_SIDE_LABEL,
  SOCIAL_NETWORK_KEYS,
  SOCIAL_NETWORKS,
  availabilitySlot,
  formatLongDate,
} from '@/lib/profile';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

type FormState = {
  name: string;
  level: string;
  club: string;
  city: string;
  bio: string;
  motto: string;
  racket: string;
  preferred_side: PreferredSide | null;
  dominant_hand: DominantHand | null;
  avatar_color: AvatarColor | null;
  avatar_emoji: string | null;
  availability: string[];
  social: Record<SocialNetwork, string>;
};

const SIDE_OPTIONS = (Object.keys(PREFERRED_SIDE_LABEL) as PreferredSide[]).map((value) => ({
  value,
  label: PREFERRED_SIDE_LABEL[value],
}));

const HAND_OPTIONS = (Object.keys(DOMINANT_HAND_LABEL) as DominantHand[]).map((value) => ({
  value,
  label: DOMINANT_HAND_LABEL[value],
}));

function initialForm(user: User | null): FormState {
  const social = Object.fromEntries(
    SOCIAL_NETWORK_KEYS.map((network) => [network, user?.social_links?.[network] ?? ''])
  ) as Record<SocialNetwork, string>;

  return {
    name: user?.name ?? '',
    level: user?.level ?? '',
    club: user?.club ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
    motto: user?.motto ?? '',
    racket: user?.racket ?? '',
    preferred_side: user?.preferred_side ?? null,
    dominant_hand: user?.dominant_hand ?? null,
    avatar_color: user?.avatar_color ?? null,
    avatar_emoji: user?.avatar_emoji ?? null,
    availability: user?.availability ?? [],
    social,
  };
}

const emptyToNull = (value: string): string | null => value.trim() || null;

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { user, updateProfile, uploadAvatar, removeAvatar } = useAuth();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => initialForm(user));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const nameLockedUntil = user?.name_change_available_at ?? null;

  // Abierta por URL directa no hay historial al que volver.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/perfil'));

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function changePhoto() {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      const uri = await pickAvatarPhoto();
      if (uri) await uploadAvatar(uri);
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
      setPhotoError(first ?? 'No se pudo subir la foto. Inténtalo de nuevo.');
    } finally {
      setPhotoBusy(false);
    }
  }

  async function deletePhoto() {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      await removeAvatar();
    } catch {
      setPhotoError('No se pudo quitar la foto.');
    } finally {
      setPhotoBusy(false);
    }
  }

  function toggleSlot(slot: string) {
    set(
      'availability',
      form.availability.includes(slot)
        ? form.availability.filter((existing) => existing !== slot)
        : [...form.availability, slot]
    );
  }

  async function handleSubmit() {
    if (!user) return;
    setError(null);
    setIsSubmitting(true);

    // Solo se mandan las redes con usuario: así vaciar una la borra.
    const socialLinks: SocialLinks = {};
    for (const network of SOCIAL_NETWORK_KEYS) {
      const handle = form.social[network].trim().replace(/^@/, '');
      if (handle) socialLinks[network] = handle;
    }

    const input: ProfileInput = {
      level: emptyToNull(form.level),
      club: emptyToNull(form.club),
      city: emptyToNull(form.city),
      bio: emptyToNull(form.bio),
      motto: emptyToNull(form.motto),
      racket: emptyToNull(form.racket),
      preferred_side: form.preferred_side,
      dominant_hand: form.dominant_hand,
      avatar_color: form.avatar_color,
      avatar_emoji: form.avatar_emoji,
      availability: form.availability,
      social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
    };
    // El nombre solo se manda si cambia: cambiarlo bloquea el campo 30 días.
    if (form.name.trim() !== user.name) {
      input.name = form.name.trim();
    }

    try {
      await updateProfile(input);
      close();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el perfil.');
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
        <Text style={styles.title}>Editar perfil</Text>
      </View>

      <View style={styles.hero}>
        <Avatar
          name={form.name || 'Jugador'}
          imageUrl={user?.avatar_url}
          color={form.avatar_color}
          emoji={form.avatar_emoji}
          size={88}
        />
        <Text style={styles.heroName} numberOfLines={1}>
          {form.name.trim() || 'Tu nombre'}
        </Text>
      </View>

      <Group icon="badge" title="Nombre">
        <TextField
          placeholder="Nombre"
          value={form.name}
          onChangeText={(value) => set('name', value)}
          maxLength={40}
          editable={!nameLockedUntil}
          style={nameLockedUntil ? styles.disabledField : undefined}
        />
        <View style={styles.hintRow}>
          {nameLockedUntil ? (
            <MaterialIcons name="lock-clock" size={14} color={colors.secondary} />
          ) : null}
          <Text style={[styles.hint, nameLockedUntil ? styles.hintLocked : null]}>
            {nameLockedUntil
              ? `Podrás volver a cambiarlo el ${formatLongDate(nameLockedUntil)}.`
              : 'Puedes ponerte el nombre que quieras, pero solo se puede cambiar una vez cada 30 días.'}
          </Text>
        </View>
      </Group>

      <Group icon="face" title="Avatar">
        <LabeledField label="Foto">
          <View style={styles.photoActions}>
            <ActionChip
              icon="add-a-photo"
              label={user?.avatar_url ? 'Cambiar foto' : 'Subir foto'}
              disabled={photoBusy}
              onPress={changePhoto}
            />
            {user?.avatar_url ? (
              <ActionChip
                icon="delete-outline"
                label="Quitar"
                tone="danger"
                disabled={photoBusy}
                onPress={deletePhoto}
              />
            ) : null}
          </View>
          {photoBusy ? <Text style={styles.hint}>Subiendo…</Text> : null}
          {photoError ? <Text style={styles.error}>{photoError}</Text> : null}
          <Text style={styles.hint}>
            Se guarda al momento y la verá cualquier jugador. Sin foto se usa el color y el icono.
          </Text>
        </LabeledField>
        <LabeledField label="Color">
          <View style={styles.swatches}>
            {AVATAR_COLOR_KEYS.map((color) => (
              <Pressable
                key={color}
                onPress={() => set('avatar_color', form.avatar_color === color ? null : color)}
                accessibilityLabel={`Color ${color}`}
                style={[
                  styles.swatch,
                  { backgroundColor: AVATAR_COLORS[color].background },
                  form.avatar_color === color && styles.swatchActive,
                ]}
              />
            ))}
          </View>
        </LabeledField>
        <LabeledField label="Icono" right='"Aa" usa tus iniciales'>
          <View style={styles.swatches}>
            <Pressable
              onPress={() => set('avatar_emoji', null)}
              style={[styles.emojiButton, form.avatar_emoji === null && styles.emojiButtonActive]}>
              <Text style={styles.emojiInitials}>Aa</Text>
            </Pressable>
            {AVATAR_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                onPress={() => set('avatar_emoji', emoji)}
                style={[styles.emojiButton, form.avatar_emoji === emoji && styles.emojiButtonActive]}>
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
        </LabeledField>
      </Group>

      <Group icon="person-outline" title="Sobre ti">
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <LabeledField label="Ciudad">
              <TextField
                placeholder="Sevilla"
                value={form.city}
                onChangeText={(value) => set('city', value)}
                maxLength={80}
              />
            </LabeledField>
          </View>
          <View style={styles.col}>
            <LabeledField label="Nivel">
              <TextField
                placeholder="3ª"
                value={form.level}
                onChangeText={(value) => set('level', value)}
                maxLength={255}
              />
            </LabeledField>
          </View>
        </View>
        <LabeledField label="Club">
          <TextField
            placeholder="Club Pádel Sur"
            value={form.club}
            onChangeText={(value) => set('club', value)}
            maxLength={255}
          />
        </LabeledField>
        <LabeledField label="Presentación" right={`${form.bio.length}/200`}>
          <TextField
            placeholder="Cuéntanos algo de ti"
            value={form.bio}
            onChangeText={(value) => set('bio', value)}
            maxLength={200}
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />
        </LabeledField>
        <LabeledField label="Lema">
          <TextField
            placeholder="Tu frase de guerra"
            value={form.motto}
            onChangeText={(value) => set('motto', value)}
            maxLength={80}
          />
        </LabeledField>
      </Group>

      <Group icon="sports-tennis" title="Cómo juegas">
        <LabeledField label="Lado preferido">
          <SegmentedControl
            options={SIDE_OPTIONS}
            value={form.preferred_side}
            onChange={(value) => set('preferred_side', value)}
            allowClear
          />
        </LabeledField>
        <LabeledField label="Mano">
          <SegmentedControl
            options={HAND_OPTIONS}
            value={form.dominant_hand}
            onChange={(value) => set('dominant_hand', value)}
            allowClear
          />
        </LabeledField>
        <LabeledField label="Pala favorita">
          <TextField
            placeholder="Bullpadel Vertex"
            value={form.racket}
            onChangeText={(value) => set('racket', value)}
            maxLength={80}
          />
        </LabeledField>
      </Group>

      <Group icon="schedule" title="Disponibilidad">
        <Text style={styles.hint}>Marca cuándo sueles poder jugar.</Text>
        <View style={styles.gridRow}>
          <View style={styles.gridLabel} />
          {AVAILABILITY_DAYS.map((day) => (
            <Text key={day.key} style={styles.gridDay}>
              {day.label}
            </Text>
          ))}
        </View>
        {AVAILABILITY_PARTS.map((part) => (
          <View key={part.key} style={styles.gridRow}>
            <Text style={[styles.gridLabel, styles.hint]}>{part.label}</Text>
            {AVAILABILITY_DAYS.map((day) => {
              const slot = availabilitySlot(day.key, part.key);
              return (
                <Pressable
                  key={day.key}
                  onPress={() => toggleSlot(slot)}
                  accessibilityLabel={`${day.label} ${part.label}`}
                  style={[styles.gridCell, form.availability.includes(slot) && styles.gridCellOn]}
                />
              );
            })}
          </View>
        ))}
      </Group>

      <Group icon="share" title="Redes sociales">
        <Text style={styles.hint}>Solo tu nombre de usuario, sin @ ni enlace.</Text>
        {SOCIAL_NETWORK_KEYS.map((network) => (
          <View key={network} style={styles.socialRow}>
            <Text style={styles.socialLabel}>{SOCIAL_NETWORKS[network].label}</Text>
            <TextField
              style={styles.flex}
              placeholder="usuario"
              autoCapitalize="none"
              autoCorrect={false}
              value={form.social[network]}
              onChangeText={(value) => set('social', { ...form.social, [network]: value })}
              maxLength={50}
            />
          </View>
        ))}
      </Group>

      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.actions}>
        <ActionChip label="Cancelar" onPress={close} disabled={isSubmitting} />
        <ActionChip
          icon="check"
          label={isSubmitting ? 'Guardando…' : 'Guardar'}
          tone="accent"
          disabled={isSubmitting || form.name.trim().length < 2}
          onPress={handleSubmit}
        />
      </View>
    </Screen>
  );
}

function Group({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <GlassPanel style={styles.card}>
      <SectionLabel icon={icon} label={title} />
      {children}
    </GlassPanel>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    title: {
      ...Typography.headlineMd,
      color: colors.primary,
    },
    card: {
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    photoActions: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    hero: {
      alignItems: 'center',
      gap: Spacing.xs,
    },
    heroName: {
      ...Typography.headlineMd,
      color: colors.primary,
    },
    hintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    hintLocked: {
      color: colors.secondary,
      flex: 1,
    },
    twoCols: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    col: {
      flex: 1,
      minWidth: 0,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    hint: {
      ...Typography.bodySm,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    error: {
      ...Typography.bodySm,
      color: colors.error,
    },
    disabledField: {
      opacity: 0.5,
    },
    multiline: {
      minHeight: 88,
      textAlignVertical: 'top',
    },
    swatches: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: Spacing.xs,
    },
    swatch: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchActive: {
      borderColor: colors.primary,
    },
    emojiButton: {
      width: 44,
      height: 44,
      borderRadius: Radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    emojiButtonActive: {
      borderColor: colors.primaryContainer,
      // primaryContainer no cambia entre temas, así que este tinte vale igual en los dos.
      backgroundColor: colors.primaryContainer + '26',
    },
    emoji: {
      fontSize: 22,
    },
    emojiInitials: {
      fontFamily: FontFamilies.headline,
      fontSize: 16,
      color: colors.onSurface,
    },
    gridRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
    },
    gridLabel: {
      width: 64,
    },
    gridDay: {
      flex: 1,
      textAlign: 'center',
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    gridCell: {
      flex: 1,
      height: 32,
      borderRadius: Radii.DEFAULT,
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.glassBorder,
    },
    gridCellOn: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    socialRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    socialLabel: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      width: 84,
    },
  });
