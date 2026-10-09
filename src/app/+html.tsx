import type { PropsWithChildren } from 'react';

import { TOKEN_KEY } from '@/api/token-storage';
import { HIDE_LANDING_CLASS, LANDING_ID } from '@/components/landing/landing-page';

/**
 * Raíz HTML de la web. No usa `ScrollViewStyleReset` de expo-router porque fija
 * `body { overflow: hidden }` con altura 100%: el documento nunca hace scroll y los
 * navegadores móviles (Safari, Chrome) solo esconden la barra de URL cuando lo hace
 * el propio documento.
 *
 * - Móvil (< 768px): el documento crece con el contenido y hace scroll.
 * - Escritorio: altura fija y scroll dentro de cada pantalla, como antes.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#111508" />
        <meta name="apple-mobile-web-app-title" content="PadelProTour" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <style id="app-reset" dangerouslySetInnerHTML={{ __html: css }} />
        <script dangerouslySetInnerHTML={{ __html: hideLandingScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// `overflow-x: clip` (no `hidden`) recorta lo que se salga a los lados sin convertir
// #root en contenedor de scroll, así `position: sticky` sigue funcionando.
// El fondo va en html y body (no solo en el contenido): es lo que se ve en el rebote
// al pasar del final del scroll y bajo la isla dinámica / barra de estado.
const css = `
html, body { background-color: #111508; }
#root { display: flex; min-height: 100vh; min-height: 100dvh; overflow-x: clip; }
@media (min-width: 768px) {
  #root, body, html { height: 100%; }
  body { overflow: hidden; }
}
html.${HIDE_LANDING_CLASS} #${LANDING_ID} { display: none; }
`;

// El HTML estático de "/" trae la página de presentación, y Nginx sirve ese mismo fichero
// para las rutas sin HTML propio (p. ej. /competicion/5). Se oculta antes del primer pintado
// a quien no le toca verla: quien tiene un token guardado (mientras carga su sesión) y
// quien no está en "/". El layout quita la clase en cuanto sabe si hay sesión.
const hideLandingScript = `try{if(location.pathname!=='/'||localStorage.getItem(${JSON.stringify(TOKEN_KEY)}))document.documentElement.classList.add(${JSON.stringify(HIDE_LANDING_CLASS)})}catch(e){}`;
