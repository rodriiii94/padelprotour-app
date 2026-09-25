import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { PlayerProfileView } from '@/components/profile/player-profile-view';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { usePlayerProfile } from '@/hooks/use-player-profile';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function PlayerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { profile, isLoading, error } = usePlayerProfile(Number(id));

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {profile && <PlayerProfileView profile={profile} />}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.onSurfaceVariant,
  },
});
