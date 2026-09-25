import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { listFollowers, listFollowing } from '@/api/users';
import type { PublicUserSummary } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { PlayerRow } from '@/components/ui/player-row';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Colors, Spacing, Typography } from '@/theme/tokens';

type Tipo = 'seguidores' | 'siguiendo';

/** Quién sigue a un jugador y a quién sigue. */
export default function ConexionesScreen() {
  const { id, tipo } = useLocalSearchParams<{ id: string; tipo?: Tipo }>();
  const router = useRouter();
  const userId = Number(id);
  const [current, setCurrent] = useState<Tipo>(tipo === 'siguiendo' ? 'siguiendo' : 'seguidores');
  const [people, setPeople] = useState<PublicUserSummary[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (kind: Tipo, pageToLoad: number, append: boolean) => {
      setError(null);
      try {
        const result = await (kind === 'seguidores' ? listFollowers : listFollowing)(userId, pageToLoad);
        setPeople((prev) => (append ? [...prev, ...result.data] : result.data));
        setPage(result.current_page);
        setLastPage(result.last_page);
      } catch {
        setError('No se pudo cargar la lista.');
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await load(current, 1, false);
    })();
  }, [current, load]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      <SegmentedControl<Tipo>
        options={[
          { value: 'seguidores', label: 'Seguidores' },
          { value: 'siguiendo', label: 'Siguiendo' },
        ]}
        value={current}
        onChange={(value) => value && setCurrent(value)}
      />

      {isLoading && <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {!isLoading && !error && people.length === 0 && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>
            {current === 'seguidores' ? 'Todavía no tiene seguidores.' : 'Todavía no sigue a nadie.'}
          </Text>
        </GlassPanel>
      )}

      {people.map((person) => (
        <PlayerRow key={person.id} player={person} />
      ))}

      {page < lastPage && (
        <Button title="Cargar más" variant="secondary" onPress={() => load(current, page + 1, true)} />
      )}
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
