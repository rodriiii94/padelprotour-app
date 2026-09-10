import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getInvite, listCategories } from '@/api/competitions';
import type { Category, Competition } from '@/api/types';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing, Typography } from '@/theme/tokens';

const TYPE_META = {
  tournament: { icon: 'emoji-events', label: 'Torneo', color: Colors.secondaryContainer },
  league: { icon: 'sports-tennis', label: 'Liga', color: Colors.primaryContainer },
} as const;

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [categoriesBlocked, setCategoriesBlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const invited = await getInvite(token);
        setCompetition(invited);
        // El token de invitación no da acceso a las categorías todavía
        // (hueco de backend documentado) — best-effort, sin romper la
        // pantalla si esto falla con 403. Distinguimos "sin categorías"
        // de "bloqueado" para no mostrar el mensaje equivocado.
        try {
          setCategories(await listCategories(invited.id));
        } catch {
          setCategoriesBlocked(true);
        }
      } catch {
        setError('Este enlace de invitación no es válido.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [token]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {competition && (
        <>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{competition.name}</Text>
              <MaterialIcons
                name={TYPE_META[competition.type].icon}
                size={26}
                color={TYPE_META[competition.type].color}
              />
            </View>
            <Text style={[styles.typeLabel, { color: TYPE_META[competition.type].color }]}>
              Te han invitado a esta {TYPE_META[competition.type].label.toLowerCase()}
            </Text>
          </View>

          <GlassPanel style={styles.card}>
            {competition.venue && (
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.meta}>{competition.venue}</Text>
              </View>
            )}
            <View style={styles.row}>
              <MaterialIcons name="calendar-today" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.meta}>{dateFormatter.format(new Date(competition.start_date))}</Text>
            </View>
          </GlassPanel>

          <View>
            <Text style={styles.sectionTitle}>Categorías</Text>
            {categoriesBlocked ? (
              <GlassPanel style={styles.card}>
                <Text style={styles.body}>
                  Todavía no puedes ver las categorías de esta competición privada. Pídele al
                  organizador que te confirme a cuál unirte.
                </Text>
              </GlassPanel>
            ) : categories && categories.length === 0 ? (
              <GlassPanel style={styles.card}>
                <Text style={styles.body}>El organizador todavía no ha creado categorías.</Text>
              </GlassPanel>
            ) : categories ? (
              <View style={styles.list}>
                {categories.map((category) => (
                  <Pressable key={category.id} onPress={() => router.push(`/categoria/${category.id}`)}>
                    <GlassPanel style={styles.card}>
                      <Text style={styles.cardTitle}>{category.name}</Text>
                    </GlassPanel>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </>
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
    flex: 1,
  },
  typeLabel: {
    ...Typography.bodySm,
    marginTop: Spacing.base,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  meta: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  list: {
    gap: Spacing.sm,
  },
});
