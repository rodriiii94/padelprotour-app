import { Alert, Platform } from 'react-native';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/** Diálogo de confirmación. `Alert.alert` no hace nada en web, así que ahí se usa `window.confirm`. */
export function confirmAction({ title, message, confirmLabel, onConfirm }: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    if (globalThis.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: 'Volver', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: onConfirm },
  ]);
}
