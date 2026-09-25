import { MaterialIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { deleteMatchMessage, listMatchMessages, sendMatchMessage } from '@/api/categories';
import { ApiError, type MatchMessage } from '@/api/types';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { SectionLabel } from '@/components/ui/section-label';
import { TextField } from '@/components/ui/text-field';
import { confirmAction } from '@/lib/confirm';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const POLL_MS = 6000;

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

/** Une mensajes nuevos a los que ya hay, sin duplicados y en orden cronológico. */
function merge(current: MatchMessage[], incoming: MatchMessage[]): MatchMessage[] {
  const byId = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) byId.set(message.id, message);
  return [...byId.values()].sort((a, b) => a.id - b.id);
}

/**
 * Chat del partido para concretar día, hora y pista. Lo ven los cuatro jugadores y el
 * organizador. No hay tiempo real: se consulta cada pocos segundos mientras esté a la vista.
 */
export function MatchChat({
  matchId,
  currentUserId,
  isOrganizer,
}: {
  matchId: number;
  currentUserId: number;
  isOrganizer: boolean;
}) {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [olderPage, setOlderPage] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newestFirstLoaded = useRef(false);

  const fetchLatest = useCallback(async () => {
    try {
      const page = await listMatchMessages(matchId, 1);
      setMessages((current) => merge(current, page.data));
      if (!newestFirstLoaded.current) {
        // La primera vez recordamos si hay páginas más antiguas que cargar bajo demanda.
        newestFirstLoaded.current = true;
        setOlderPage(page.last_page > 1 ? 2 : null);
      }
      setError(null);
    } catch {
      setError('No se pudo cargar el chat.');
    } finally {
      setLoaded(true);
    }
  }, [matchId]);

  useEffect(() => {
    // Carga inicial en una IIFE propia: así no se llama a setState de forma síncrona en el efecto.
    (async () => {
      await fetchLatest();
    })();

    const tick = () => {
      // No gastar datos ni batería con la pestaña oculta o la app en segundo plano.
      const hidden = Platform.OS === 'web' ? document.hidden : AppState.currentState !== 'active';
      if (!hidden) fetchLatest();
    };
    const timer = setInterval(tick, POLL_MS);

    // Al volver a la pestaña o a la app, se actualiza al instante en vez de esperar al siguiente turno.
    const onVisible = () => {
      if (!document.hidden) fetchLatest();
    };
    const appStateSub =
      Platform.OS === 'web'
        ? null
        : AppState.addEventListener('change', (state) => state === 'active' && fetchLatest());
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timer);
      appStateSub?.remove();
      if (Platform.OS === 'web') document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchLatest]);

  async function loadOlder() {
    if (olderPage === null) return;
    try {
      const page = await listMatchMessages(matchId, olderPage);
      setMessages((current) => merge(current, page.data));
      setOlderPage(page.current_page < page.last_page ? page.current_page + 1 : null);
    } catch {
      setError('No se pudieron cargar los mensajes anteriores.');
    }
  }

  async function send() {
    const body = draft.trim();
    if (!body || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const message = await sendMatchMessage(matchId, body);
      setMessages((current) => merge(current, [message]));
      setDraft('');
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
      setError(first ?? 'No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  }

  function remove(message: MatchMessage) {
    confirmAction({
      title: 'Borrar mensaje',
      message: 'Se borrará para todos los del partido.',
      confirmLabel: 'Borrar',
      onConfirm: async () => {
        try {
          await deleteMatchMessage(message.id);
          setMessages((current) => current.filter((existing) => existing.id !== message.id));
        } catch {
          setError('No se pudo borrar el mensaje.');
        }
      },
    });
  }

  return (
    <GlassPanel style={styles.panel}>
      <SectionLabel icon="chat-bubble-outline" label="Chat del partido" />
      <Text style={styles.hint}>Concretad el día, la hora y la pista. Solo lo ve quien juega el partido.</Text>

      {olderPage !== null && (
        <ActionChip label="Ver mensajes anteriores" icon="history" onPress={loadOlder} fill={false} />
      )}

      {loaded && messages.length === 0 && !error ? (
        <Text style={styles.empty}>Todavía no hay mensajes. Rompe el hielo: ¿qué día os viene bien?</Text>
      ) : null}

      <View style={styles.list}>
        {messages.map((message) => {
          const mine = message.author.id === currentUserId;
          const canDelete = mine || isOrganizer;
          return (
            <View key={message.id} style={[styles.row, mine && styles.rowMine]}>
              <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
                {!mine && <Text style={styles.author}>{message.author.name}</Text>}
                <Text style={styles.body}>{message.body}</Text>
                <View style={styles.meta}>
                  <Text style={styles.time}>{timeFormatter.format(new Date(message.created_at))}</Text>
                  {canDelete && (
                    <Pressable
                      onPress={() => remove(message)}
                      hitSlop={8}
                      accessibilityLabel="Borrar mensaje">
                      <MaterialIcons name="delete-outline" size={14} color={Colors.onSurfaceVariant} />
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.composer}>
        <TextField
          style={styles.input}
          placeholder="Mensaje…"
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          maxLength={1000}
          returnKeyType="send"
        />
        <ActionChip
          icon="send"
          label="Enviar"
          tone="accent"
          fill={false}
          disabled={isSending || draft.trim().length === 0}
          onPress={send}
        />
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  hint: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  empty: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    fontStyle: 'italic',
  },
  list: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '86%',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.lg,
    gap: 2,
  },
  bubbleMine: {
    backgroundColor: 'rgba(182, 247, 0, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(182, 247, 0, 0.35)',
    borderBottomRightRadius: Radii.sm,
  },
  bubbleOther: {
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderBottomLeftRadius: Radii.sm,
  },
  author: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 12,
    color: Colors.secondary,
  },
  body: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  meta: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  input: {
    flex: 1,
  },
});
