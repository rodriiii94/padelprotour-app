import type { Ranking } from '@/api/types';
import { PODIUM_COLORS, RESULT_COLORS, signedDiff, standingLines } from '@/lib/standings';
import { DarkColors, FontFamilies } from '@/theme/tokens';

import type { StandingsShareInput } from './share-standings';

export type { StandingsShareInput };

// La imagen usa siempre el tema oscuro de la marca, sea cual sea el tema del usuario.
const colors = DarkColors;
const WIDTH = 1080;
const MARGIN = 64;
const HEADER_HEIGHT = 300;
const COLUMN_HEADER_HEIGHT = 56;
const ROW_HEIGHT = 108;
const FOOTER_HEIGHT = 110;
const FORM_SLOTS = 5;

/** Columnas numéricas, de derecha a izquierda desde el borde: [etiqueta, ancho, valor]. */
const COLUMNS: [string, number, (ranking: Ranking) => string][] = [
  ['Pts', 90, (r) => String(r.points)],
  ['DS', 90, (r) => signedDiff(r.sets_won, r.sets_lost)],
  ['P', 64, (r) => String(r.lost)],
  ['G', 64, (r) => String(r.won)],
  ['PJ', 64, (r) => String(r.played)],
];
const FORM_WIDTH = 150;

const CANVAS_FONTS = [FontFamilies.display, FontFamilies.headline, FontFamilies.bodyBold, FontFamilies.bodyMedium, FontFamilies.body];

const font = (family: string, size: number) => `${size}px ${family}, system-ui, sans-serif`;

/** Recorta con puntos suspensivos lo que no quepa en `maxWidth`. */
function fit(context: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (context.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && context.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut.trimEnd()}…`;
}

function circle(context: CanvasRenderingContext2D, x: number, y: number, radius: number): void {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
}

function drawStandings(canvas: HTMLCanvasElement, { title, subtitle, rankings }: StandingsShareInput): void {
  const height = HEADER_HEIGHT + COLUMN_HEADER_HEIGHT + rankings.length * ROW_HEIGHT + FOOTER_HEIGHT;
  canvas.width = WIDTH;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D no disponible');

  context.fillStyle = colors.background;
  context.fillRect(0, 0, WIDTH, height);
  context.globalAlpha = 0.13;
  context.fillStyle = colors.primaryContainer;
  circle(context, 60, 40, 380);
  context.fill();
  context.globalAlpha = 0.09;
  context.fillStyle = colors.secondaryContainer;
  circle(context, WIDTH + 40, height * 0.6, 300);
  context.fill();
  context.globalAlpha = 1;

  context.textBaseline = 'alphabetic';
  context.fillStyle = colors.primaryContainer;
  context.font = font(FontFamilies.headline, 30);
  context.fillText('PadelProTour', MARGIN, 92);

  context.fillStyle = colors.primary;
  context.font = font(FontFamilies.display, 72);
  context.fillText('Clasificación', MARGIN, 190);
  context.fillStyle = colors.onSurfaceVariant;
  context.font = font(FontFamilies.bodyMedium, 32);
  context.fillText(fit(context, [title, subtitle].filter(Boolean).join(' · '), WIDTH - MARGIN * 2), MARGIN, 244);

  const right = WIDTH - MARGIN;
  const nameLeft = MARGIN + 76;
  const numericWidth = COLUMNS.reduce((total, [, width]) => total + width, 0);
  const formLeft = right - numericWidth - FORM_WIDTH;
  const nameWidth = formLeft - nameLeft - 24;

  let y = HEADER_HEIGHT;
  context.font = font(FontFamilies.bodyBold, 22);
  context.fillStyle = colors.onSurfaceVariant;
  context.textAlign = 'left';
  context.fillText('#', MARGIN + 12, y + 34);
  context.fillText(rankings[0]?.pair ? 'PAREJA' : 'JUGADOR', nameLeft, y + 34);
  context.textAlign = 'center';
  context.fillText('RACHA', formLeft + FORM_WIDTH / 2, y + 34);
  let x = right;
  for (const [label, width] of COLUMNS) {
    context.fillText(label.toUpperCase(), x - width / 2, y + 34);
    x -= width;
  }
  y += COLUMN_HEADER_HEIGHT;

  for (const ranking of rankings) {
    context.strokeStyle = colors.glassBorder;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(MARGIN, y);
    context.lineTo(right, y);
    context.stroke();

    const middle = y + ROW_HEIGHT / 2;
    const podium = PODIUM_COLORS[ranking.position];
    context.strokeStyle = podium ?? colors.outlineVariant;
    circle(context, MARGIN + 24, middle, 24);
    context.stroke();
    context.fillStyle = podium ?? colors.onSurfaceVariant;
    context.font = font(FontFamilies.headline, 26);
    context.textAlign = 'center';
    context.fillText(String(ranking.position), MARGIN + 24, middle + 9);

    context.textAlign = 'left';
    const lines = standingLines(ranking);
    lines.forEach((line, index) => {
      context.font = font(line.secondary ? FontFamilies.body : FontFamilies.bodyMedium, line.secondary ? 24 : 30);
      context.fillStyle = line.secondary ? colors.onSurfaceVariant : colors.onSurface;
      const baseline = lines.length === 1 ? middle + 10 : middle - 8 + index * 36;
      context.fillText(fit(context, line.text, nameWidth), nameLeft, baseline);
    });

    const form = ranking.form ?? [];
    const dotsStart = formLeft + (FORM_WIDTH - (FORM_SLOTS * 16 + (FORM_SLOTS - 1) * 10)) / 2 + 8;
    for (let slot = 0; slot < FORM_SLOTS; slot++) {
      const result = form[slot - (FORM_SLOTS - form.length)];
      circle(context, dotsStart + slot * 26, middle, 8);
      if (result) {
        context.fillStyle = result === 'W' ? RESULT_COLORS.won : RESULT_COLORS.lost;
        context.fill();
      } else {
        context.strokeStyle = colors.outlineVariant;
        context.stroke();
      }
    }

    context.textAlign = 'center';
    x = right;
    COLUMNS.forEach(([, width, value], index) => {
      const isPoints = index === 0;
      context.font = font(isPoints ? FontFamilies.headline : FontFamilies.bodyMedium, isPoints ? 36 : 28);
      context.fillStyle = isPoints ? colors.primaryContainer : colors.onSurface;
      context.fillText(value(ranking), x - width / 2, middle + (isPoints ? 13 : 10));
      x -= width;
    });

    y += ROW_HEIGHT;
  }

  context.textAlign = 'left';
  context.fillStyle = colors.onSurfaceVariant;
  context.font = font(FontFamilies.bodyMedium, 26);
  context.fillText('PJ jugados · G ganados · P perdidos · DS diferencia de sets', MARGIN, y + 52);
  context.textAlign = 'right';
  context.fillStyle = colors.primaryContainer;
  context.font = font(FontFamilies.headline, 26);
  context.fillText('padelprotour.net', right, y + 52);
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))), 'image/png')
  );

/**
 * Genera una imagen de la clasificación. En móvil abre el menú de compartir del sistema
 * (WhatsApp, etc.); donde no se pueden compartir ficheros, la descarga.
 */
export async function shareStandings(input: StandingsShareInput): Promise<void> {
  // `fonts.ready` no basta: una fuente que la página aún no ha pintado no está cargada.
  await Promise.all(CANVAS_FONTS.map((family) => document.fonts.load(font(family, 32))));
  const canvas = document.createElement('canvas');
  drawStandings(canvas, input);
  const file = new File([await toBlob(canvas)], 'clasificacion.png', { type: 'image/png' });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `Clasificación · ${input.title}` });
    } catch (error) {
      // El usuario cerró el menú de compartir: no es un fallo.
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
    }
    return;
  }

  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
