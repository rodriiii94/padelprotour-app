import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

type Player = { id?: number | null; name: string };

type Props = {
  players: Player[];
  style?: StyleProp<TextStyle>;
  separator?: string;
};

/** Los nombres de una pareja o partido, cada uno pulsable para abrir la ficha de ese jugador. */
export function PlayerNames({ players, style, separator = ' / ' }: Props) {
  const router = useRouter();

  return (
    <Text style={style}>
      {players.map(({ id, name }, index) => (
        <Fragment key={`${id ?? name}-${index}`}>
          {index > 0 ? separator : null}
          {id ? (
            <Text
              onPress={() => router.push(`/jugador/${id}`)}
              accessibilityRole="link"
              style={styles.link}>
              {name}
            </Text>
          ) : (
            name
          )}
        </Fragment>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
});
