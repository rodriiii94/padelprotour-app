import * as Sentry from '@sentry/react-native';

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

// Sin DSN (o en desarrollo) Sentry queda desactivado y no hace nada.
Sentry.init({
  dsn,
  enabled: Boolean(dsn) && !__DEV__,
  environment: 'production',
  sendDefaultPii: false,
  tracesSampleRate: 0,
});

export { Sentry };
