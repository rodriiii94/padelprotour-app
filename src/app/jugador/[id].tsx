import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PlayerProfileView } from '@/components/profile/player-profile-view';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerProfile } from '@/hooks/use-player-profile';
import { useColors } from '@/hooks/use-theme';
import { followUser, unfollowUser } from '@/api/users';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, error, refetch } = usePlayerProfile(Number(id));
  const [isToggling, setIsToggling] = useState(false);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function toggleFollow() {
    if (!profile) return;
    setIsToggling(true);
    try {
      await (profile.is_following ? unfollowUser(profile.id) : followUser(profile.id));
      await refetch();
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {profile && (
        <PlayerProfileView
          profile={profile}
          action={
            user && user.id !== profile.id ? (
              <Button
                title={profile.is_following ? 'Siguiendo' : 'Seguir'}
                variant={profile.is_following ? 'secondary' : 'primary'}
                disabled={isToggling}
                onPress={toggleFollow}
              />
            ) : undefined
          }
        />
      )}
    </Screen>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
    },
    spinner: {
      marginTop: Spacing.lg,
    },
    card: {
      padding: Spacing.sm,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
