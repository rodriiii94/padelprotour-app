import { useRouter } from 'expo-router';
import { Fragment } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { FontFamilies } from '@/theme/tokens';

type Player = { id?: number | null; name: string };

type Props = {
  players: Player[];
  style?: StyleProp<TextStyle>;
  separator?: string;
  /** Ids a resaltar en negrita (p.ej. el usuario que ha iniciado sesión), para identificar sus partidos de un vistazo. */
  boldIds?: number[];
};

/** Los nombres de una pareja o partido, cada uno pulsable para abrir la ficha de ese jugador. */
export function PlayerNames({ players, style, separator = ' · ', boldIds }: Props) {
  const router = useRouter();

  return (
    <Text style={style}>
      {players.map(({ id, name }, index) => {
        const isMine = id != null && boldIds?.includes(id);
        const textStyle = isMine ? boldStyle : undefined;

        return (
          <Fragment key={`${id ?? name}-${index}`}>
            {index > 0 ? separator : null}
            {id ? (
              <Text onPress={() => router.push(`/jugador/${id}`)} accessibilityRole="link" style={textStyle}>
                {name}
              </Text>
            ) : (
              <Text style={textStyle}>{name}</Text>
            )}
          </Fragment>
        );
      })}
    </Text>
  );
}

const boldStyle: TextStyle = {
  fontFamily: FontFamilies.bodyBold,
};
