import { StyleSheet, Text, View } from 'react-native';

import type { AvatarColor } from '@/api/types';
import { AVATAR_COLORS } from '@/lib/profile';
import { FontFamilies } from '@/theme/tokens';

type Props = {
  name: string;
  color?: AvatarColor | null;
  emoji?: string | null;
  size?: number;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

/** Emoji si lo ha elegido, y si no sus iniciales, siempre sobre el color del jugador. */
export function Avatar({ name, color, emoji, size = 48 }: Props) {
  const palette = AVATAR_COLORS[color ?? 'lime'];

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: palette.background },
      ]}>
      <Text
        style={{
          fontFamily: FontFamilies.headline,
          fontSize: size * (emoji ? 0.5 : 0.38),
          color: palette.foreground,
        }}>
        {emoji ?? initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
