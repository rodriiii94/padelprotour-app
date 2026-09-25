import type { PropsWithChildren } from 'react';

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
`;
