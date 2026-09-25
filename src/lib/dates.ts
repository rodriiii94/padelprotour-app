const withYear = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
const withoutYear = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

/**
 * "2 sept – 4 sept", "Desde el 2 sept", "Hasta el 4 sept" o "Fecha por confirmar":
 * la fecha de inicio (y la de fin) de una competición son opcionales.
 */
export function formatDateRange(
  start: string | null,
  end: string | null,
  { year = false }: { year?: boolean } = {}
): string {
  const format = (date: string) => (year ? withYear : withoutYear).format(new Date(date));

  if (start && end) {
    const [from, to] = [format(start), format(end)];
    return from === to ? from : `${from} – ${to}`;
  }
  if (start) return format(start);
  if (end) return `Hasta el ${format(end)}`;
  return 'Fecha por confirmar';
}
