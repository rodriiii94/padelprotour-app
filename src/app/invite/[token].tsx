import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { getInvite, listInviteCategories } from '@/api/competitions';
import type { Category, Competition } from '@/api/types';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { formatDateRange } from '@/lib/dates';
import { useGoBack } from '@/hooks/use-go-back';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const goBack = useGoBack();
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const typeMeta = useMemo(
    () => ({
      tournament: { icon: 'emoji-events', label: 'Torneo', color: colors.secondaryContainer },
      league: { icon: 'sports-tennis', label: 'Liga', color: colors.primaryContainer },
    } as const),
    [colors]
  );

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const [invited, categoryList] = await Promise.all([
          getInvite(token),
          listInviteCategories(token),
        ]);
        setCompetition(invited);
        setCategories(categoryList);
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
        <Pressable onPress={goBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

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
                name={typeMeta[competition.type].icon}
                size={26}
                color={typeMeta[competition.type].color}
              />
            </View>
            <Text style={[styles.typeLabel, { color: typeMeta[competition.type].color }]}>
              Te han invitado a {competition.type === 'league' ? 'esta liga' : 'este torneo'}
            </Text>
          </View>

          <GlassPanel style={styles.card}>
            {competition.venue && (
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.meta}>{competition.venue}</Text>
              </View>
            )}
            <View style={styles.row}>
              <MaterialIcons name="calendar-today" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.meta}>{formatDateRange(competition.start_date, competition.end_date, { year: true })}</Text>
            </View>
          </GlassPanel>

          <View>
            <Text style={styles.sectionTitle}>Categorías</Text>
            {categories && categories.length === 0 ? (
              <GlassPanel style={styles.card}>
                <Text style={styles.body}>El organizador todavía no ha creado categorías.</Text>
              </GlassPanel>
            ) : categories ? (
              <View style={styles.list}>
                {categories.map((category) => (
                  <Pressable key={category.id} onPress={() => router.push(`/categoria/${category.id}?invite=${token}`)}>
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

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      color: colors.primary,
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
      color: colors.primary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    sectionTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
      marginBottom: Spacing.sm,
    },
    list: {
      gap: Spacing.sm,
    },
  });
