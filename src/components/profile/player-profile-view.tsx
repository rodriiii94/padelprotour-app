import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { PlayerProfile } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { GlassPanel } from '@/components/ui/glass-panel';
import { useColors } from '@/hooks/use-theme';
import {
  ACHIEVEMENT_ORDER,
  ACHIEVEMENTS,
  AVAILABILITY_DAYS,
  AVAILABILITY_PARTS,
  DOMINANT_HAND_LABEL,
  PREFERRED_SIDE_LABEL,
  SOCIAL_NETWORKS,
  availabilitySlot,
  filledSocialLinks,
  formatMonthYear,
  subtitleFor,
} from '@/lib/profile';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** La ficha de un jugador. La misma vista sirve para tu perfil y para el de cualquier otro. */
export function PlayerProfileView({
  profile,
  action,
}: {
  profile: PlayerProfile;
  /** Botón bajo la cabecera, p. ej. Seguir en el perfil de otro jugador. */
  action?: ReactNode;
}) {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { stats, usual_partner: partner } = profile;
  const subtitle = subtitleFor(profile);
  const socials = filledSocialLinks(profile.social_links);
  const availability = new Set(profile.availability ?? []);
  const unlocked = ACHIEVEMENT_ORDER.filter((key) => profile.achievements.includes(key));
  const chips = [
    profile.preferred_side ? PREFERRED_SIDE_LABEL[profile.preferred_side] : null,
    profile.dominant_hand ? DOMINANT_HAND_LABEL[profile.dominant_hand] : null,
    profile.racket,
  ].filter((chip): chip is string => Boolean(chip));

  return (
    <>
      <View style={styles.header}>
        <Avatar name={profile.name} imageUrl={profile.avatar_url} color={profile.avatar_color} emoji={profile.avatar_emoji} size={72} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.name}</Text>
          {subtitle ? <Text style={styles.meta}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.followRow}>
        <Pressable onPress={() => router.push(`/conexiones/${profile.id}?tipo=seguidores`)}>
          <Text style={styles.followCount}>
            <Text style={styles.followNumber}>{profile.followers_count}</Text>{' '}
            {profile.followers_count === 1 ? 'seguidor' : 'seguidores'}
          </Text>
        </Pressable>
        <Pressable onPress={() => router.push(`/conexiones/${profile.id}?tipo=siguiendo`)}>
          <Text style={styles.followCount}>
            <Text style={styles.followNumber}>{profile.following_count}</Text> siguiendo
          </Text>
        </Pressable>
      </View>

      {action}

      {profile.motto ? <Text style={styles.motto}>“{profile.motto}”</Text> : null}

      {chips.length > 0 ? (
        <View style={styles.chips}>
          {chips.map((chip) => (
            <Text key={chip} style={styles.chip}>
              {chip}
            </Text>
          ))}
        </View>
      ) : null}

      {profile.bio ? (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{profile.bio}</Text>
        </GlassPanel>
      ) : null}

      <Section title="Estadísticas">
        <GlassPanel style={styles.card}>
          <View style={styles.statsRow}>
            <Stat value={String(stats.matches_played)} label="Partidos" />
            <Stat value={String(stats.wins)} label="Victorias" />
            <Stat value={stats.win_rate === null ? '–' : `${stats.win_rate}%`} label="% victorias" />
            <Stat value={String(stats.current_streak)} label="Racha" />
          </View>
          <Text style={styles.meta}>
            {stats.sets_won}-{stats.sets_lost} sets · {stats.games_won}-{stats.games_lost} juegos ·{' '}
            {stats.competitions_played} {stats.competitions_played === 1 ? 'competición' : 'competiciones'}
          </Text>
        </GlassPanel>
      </Section>

      <Section title="Logros">
        {unlocked.length === 0 ? (
          <GlassPanel style={styles.card}>
            <Text style={styles.meta}>Todavía sin logros.</Text>
          </GlassPanel>
        ) : (
          <View style={styles.chips}>
            {unlocked.map((key) => (
              <View key={key} style={styles.achievement} accessibilityLabel={ACHIEVEMENTS[key].description}>
                <MaterialIcons name={ACHIEVEMENTS[key].icon} size={18} color={colors.primaryContainer} />
                <Text style={styles.achievementLabel}>{ACHIEVEMENTS[key].label}</Text>
              </View>
            ))}
          </View>
        )}
      </Section>

      {partner ? (
        <Section title="Compañero habitual">
          <Pressable onPress={() => router.push(`/jugador/${partner.id}`)}>
            <GlassPanel style={[styles.card, styles.partnerRow]}>
              <View style={styles.flex}>
                <Text style={styles.partnerName}>{partner.name}</Text>
                <Text style={styles.meta}>{partner.matches} partidos juntos</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.onSurfaceVariant} />
            </GlassPanel>
          </Pressable>
        </Section>
      ) : null}

      {availability.size > 0 ? (
        <Section title="Disponibilidad">
          <GlassPanel style={styles.card}>
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
                <Text style={[styles.gridLabel, styles.meta]}>{part.label}</Text>
                {AVAILABILITY_DAYS.map((day) => (
                  <View
                    key={day.key}
                    style={[
                      styles.gridCell,
                      availability.has(availabilitySlot(day.key, part.key)) && styles.gridCellOn,
                    ]}
                  />
                ))}
              </View>
            ))}
          </GlassPanel>
        </Section>
      ) : null}

      {socials.length > 0 ? (
        <Section title="Redes sociales">
          <GlassPanel style={styles.card}>
            {socials.map(({ network, handle }) => (
              <Pressable
                key={network}
                onPress={() => Linking.openURL(SOCIAL_NETWORKS[network].urlFor(handle))}
                style={styles.socialRow}>
                <Text style={styles.socialNetwork}>{SOCIAL_NETWORKS[network].label}</Text>
                <Text style={styles.socialHandle}>@{handle}</Text>
                <MaterialIcons name="open-in-new" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            ))}
          </GlassPanel>
        </Section>
      ) : null}

      <Text style={[styles.meta, styles.since]}>Miembro desde {formatMonthYear(profile.created_at)}</Text>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    headerText: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...Typography.headlineMd,
      color: colors.primary,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    followRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    followCount: {
      ...Typography.bodyMd,
      color: colors.onSurfaceVariant,
    },
    followNumber: {
      fontFamily: FontFamilies.bodyBold,
      color: colors.onSurface,
    },
    motto: {
      ...Typography.bodyMd,
      fontStyle: 'italic',
      color: colors.secondary,
    },
    body: {
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    chip: {
      ...Typography.bodySm,
      color: colors.onSurface,
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: Radii.full,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.base,
      overflow: 'hidden',
    },
    card: {
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    section: {
      gap: Spacing.xs,
    },
    sectionTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stat: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statValue: {
      fontFamily: FontFamilies.display,
      fontSize: 26,
      color: colors.primaryContainer,
    },
    statLabel: {
      ...Typography.bodySm,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    achievement: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.primaryContainer,
      borderRadius: Radii.full,
      paddingHorizontal: Spacing.xs,
      paddingVertical: Spacing.base,
    },
    achievementLabel: {
      ...Typography.bodySm,
      color: colors.onSurface,
    },
    partnerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    partnerName: {
      ...Typography.headlineSm,
      color: colors.primary,
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
      height: 24,
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
      paddingVertical: Spacing.base,
    },
    socialNetwork: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      width: 84,
    },
    socialHandle: {
      ...Typography.bodyMd,
      color: colors.primary,
      flex: 1,
    },
    since: {
      textAlign: 'center',
    },
  });
