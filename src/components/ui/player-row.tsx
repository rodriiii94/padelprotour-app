import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PublicUserSummary } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { GlassPanel } from '@/components/ui/glass-panel';
import { useColors } from '@/hooks/use-theme';
import { subtitleFor } from '@/lib/profile';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** Fila de un jugador (avatar, nombre y datos) que abre su perfil. */
export function PlayerRow({ player }: { player: PublicUserSummary }) {
  const router = useRouter();
  const subtitle = subtitleFor(player);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable onPress={() => router.push(`/jugador/${player.id}`)}>
      <GlassPanel style={styles.card}>
        <Avatar name={player.name} imageUrl={player.avatar_url} color={player.avatar_color} emoji={player.avatar_emoji} size={44} />
        <View style={styles.text}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          {subtitle ? (
            <Text style={styles.meta} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.sm,
    },
    text: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
