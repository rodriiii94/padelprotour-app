import { Slot } from 'expo-router';

/**
 * On web, navigation between Inicio/Competiciones/Perfil is handled by
 * `WebSidebar` at the root layout — no bottom tab bar here, just pass
 * the active tab screen through. Native keeps its own `_layout.tsx`
 * (the `Tabs` navigator + `CustomTabBar`) untouched.
 */
export default function TabsLayoutWeb() {
  return <Slot />;
}
