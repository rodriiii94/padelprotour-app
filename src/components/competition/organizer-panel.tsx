import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import type { Competition } from '@/api/types';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { inviteUrl } from '@/lib/invite';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';

type Props = {
  competition: Competition;
  disabled: boolean;
  onTogglePrivacy: () => void;
  onRegenerateInvite: () => void;
  onCancel: () => void;
  onDelete: () => void;
};

/** "padelprotour.net/invite/6CNk…": legible sin mostrar los 32 caracteres del código. */
function shortLink(token: string): string {
  const host = inviteUrl(token).replace(/^https?:\/\//, '').replace(token, '');
  return `${host}${token.slice(0, 4)}…`;
}

/** Gestión de la competición para su organizador: visibilidad, enlace de invitación y zona de peligro. */
export function OrganizerPanel({
  competition,
  disabled,
  onTogglePrivacy,
  onRegenerateInvite,
  onCancel,
  onDelete,
}: Props) {
  const [copied, setCopied] = useState(false);
  const token = competition.invite_token;
  const link = token ? inviteUrl(token) : null;

  async function copyLink() {
    if (!link) return;
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <GlassPanel style={styles.panel}>
      <View style={styles.section}>
        <SectionLabel icon="tune" label="Visibilidad" />
        <SegmentedControl<'public' | 'private'>
          options={[
            { value: 'public', label: 'Pública' },
            { value: 'private', label: 'Privada' },
          ]}
          value={competition.is_private ? 'private' : 'public'}
          onChange={(value) => {
            if (!disabled && value && (value === 'private') !== competition.is_private) {
              onTogglePrivacy();
            }
          }}
        />
        <Text style={styles.hint}>
          {competition.is_private
            ? 'Solo pueden verla y unirse quienes tengan tu enlace de invitación.'
            : 'Aparece en Competiciones y en el buscador para cualquier jugador.'}
        </Text>
      </View>

      {competition.is_private && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <SectionLabel icon="link" label="Enlace de invitación" />
            {link ? (
              <>
                <Pressable onPress={copyLink} style={styles.linkBox} accessibilityLabel="Copiar enlace">
                  <Text style={styles.linkText} numberOfLines={1}>
                    {copied ? '¡Enlace copiado!' : shortLink(token!)}
                  </Text>
                  <MaterialIcons
                    name={copied ? 'check' : 'content-copy'}
                    size={18}
                    color={copied ? Colors.primaryContainer : Colors.onSurfaceVariant}
                  />
                </Pressable>
                <View style={styles.actions}>
                  <ActionChip
                    icon="ios-share"
                    label="Compartir"
                    onPress={() =>
                      Share.share({
                        message: `Únete a "${competition.name}" en PadelProTour: ${link}`,
                      })
                    }
                  />
                  <ActionChip
                    icon="refresh"
                    label="Regenerar"
                    disabled={disabled}
                    onPress={onRegenerateInvite}
                  />
                </View>
              </>
            ) : (
              <Text style={styles.hint}>Esta competición no tiene código de invitación todavía.</Text>
            )}
          </View>
        </>
      )}

      <View style={styles.divider} />
      <View style={styles.section}>
        <SectionLabel icon="warning-amber" label="Zona de peligro" tone="danger" />
        <View style={styles.actions}>
          {!competition.cancelled_at && (
            <ActionChip icon="event-busy" label="Cancelar" tone="danger" disabled={disabled} onPress={onCancel} />
          )}
          <ActionChip icon="delete-outline" label="Eliminar" tone="danger" disabled={disabled} onPress={onDelete} />
        </View>
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  section: {
    gap: Spacing.xs,
  },
  hint: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.glassBorder,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
  },
  linkText: {
    flex: 1,
    minWidth: 0,
    ...Typography.bodySm,
    color: Colors.primaryContainer,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
});
