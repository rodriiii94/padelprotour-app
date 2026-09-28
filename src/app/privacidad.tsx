import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

const CONTACT_EMAIL = process.env.EXPO_PUBLIC_CONTACT_EMAIL;

/** Pública: se puede leer sin iniciar sesión (Apple y Google la exigen enlazada). */
export default function PrivacidadScreen() {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <Text style={styles.title}>Política de privacidad</Text>
      <Text style={styles.meta}>Última actualización: 25 de septiembre de 2026</Text>

      <Section title="Qué datos guardamos">
        <P>
          Al crear tu cuenta: tu nombre, tu email y tu contraseña (guardada cifrada, nunca en
          claro). Si entras con Google o Apple, guardamos el identificador que nos devuelven.
        </P>
        <P>
          Lo que tú añadas a tu perfil, todo opcional: nivel, club, ciudad, presentación, lado y
          mano preferidos, pala, lema, avatar, disponibilidad y tus usuarios de redes sociales.
        </P>
        <P>
          Lo que generas al jugar: tus parejas, inscripciones, partidos, resultados y mensajes en
          el chat de una competición.
        </P>
      </Section>

      <Section title="Qué es público">
        <P>
          Tu perfil es visible para el resto de usuarios con sesión iniciada: nombre, datos de
          jugador, estadísticas, logros, compañero habitual, disponibilidad y redes sociales. Tu
          email nunca se muestra a otros usuarios. Los nombres de los jugadores aparecen en las
          competiciones en las que participan.
        </P>
      </Section>

      <Section title="Para qué los usamos">
        <P>
          Para que puedas crear y jugar competiciones de pádel, calcular clasificaciones y
          estadísticas, enviarte los correos necesarios (verificar tu cuenta) y mantener el
          servicio seguro y funcionando. No vendemos tus datos ni los usamos para publicidad.
        </P>
      </Section>

      <Section title="Con quién los compartimos">
        <P>
          Solo con los proveedores necesarios para prestar el servicio: el alojamiento del
          servidor (Hostinger), el envío de correos (Resend), el inicio de sesión con Google y
          Apple si lo eliges, y Sentry para detectar errores técnicos. Sentry recibe información
          técnica del error, no tu email ni tus datos de perfil.
        </P>
      </Section>

      <Section title="Cuánto tiempo los conservamos">
        <P>
          Mientras tengas la cuenta. Si la eliminas, borramos tus datos personales y tu acceso.
          Tus partidos y resultados se conservan de forma anónima porque forman parte del
          historial de otros jugadores, y aparecerás como “Jugador eliminado”. Las copias de
          seguridad se sustituyen a los 14 días.
        </P>
      </Section>

      <Section title="Tus derechos">
        <P>
          Puedes acceder a tus datos y corregirlos desde “Editar perfil”, y eliminar tu cuenta
          desde tu perfil en “Eliminar cuenta”. También puedes pedirnos la portabilidad de tus
          datos, oponerte a su tratamiento o limitarlo, y reclamar ante la Agencia Española de
          Protección de Datos (aepd.es).
        </P>
      </Section>

      <Section title="Menores">
        <P>El servicio no está dirigido a menores de 14 años.</P>
      </Section>

      <Section title="Contacto">
        <P>
          {CONTACT_EMAIL
            ? `Para cualquier duda o para ejercer tus derechos, escribe a ${CONTACT_EMAIL}.`
            : 'Para cualquier duda o para ejercer tus derechos, escríbenos desde la web padelprotour.net.'}
        </P>
      </Section>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <GlassPanel style={styles.card}>{children}</GlassPanel>
    </View>
  );
}

function P({ children }: { children: ReactNode }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return <Text style={styles.body}>{children}</Text>;
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
    },
    title: {
      ...Typography.headlineLg,
      color: colors.primary,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    section: {
      gap: Spacing.xs,
    },
    sectionTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    card: {
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    body: {
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
  });
