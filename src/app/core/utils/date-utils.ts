/**
 * Konwertowanie daty ISO na czas unix (milisekundy od 1970-01-01)
 */
export function toEpoch(iso: string): number {
  return new Date(iso).getTime();
}

/**
 * Sprawdzanie, czy data ISO zawiera offset strefy czasowej
 */
export function hasTzOffset(iso: string): boolean {
  return /([+-]\d{2}:\d{2}|Z)$/.test(iso);
}

/**
 * Formatowanie pełnej daty (dzień tygodnia + dzień + miesiąc + rok) dla podanej strefy czasowej
 */
export function formatFullDate(
  iso: string,
  timeZone: string,
  locale: string = 'pl-PL'
): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Formatowanie czasu (HH:mm) z uwzględnieniem strefy czasowej i formatu godzin
 */
export function formatTime(
  iso: string,
  timeZone: string,
  locale: string = 'pl-PL',
  hourCycle: 'h23' | 'h24' | 'h12' = 'h23'
): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle,
  }).format(d);
}

/**
 * Sprawdzanie czy zdarzenie trwa (na żywo)
 */
export function isWithinLive(
  kickoffISO: string,
  durationMs = 50 * 60 * 1000,
  preMs = 0,
  nowMs = Date.now()
): boolean {
  const start = toEpoch(kickoffISO);
  return nowMs >= start - preMs && nowMs < start + durationMs;
}

/**
 * Konwertowanie daty JS na lokalny ISO string bez offsetu
 */
export function toIsoLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  const SS = pad(d.getSeconds());
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}:${SS}`;
}

/**
 * Usuwanie offsetu strefy czasowej z ISO
 */
export function toLocalWallClockISO(iso: string): string {
  return iso.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
}

/**
 * Konwersja ISO (UTC), format akceptowany przez <input type="datetime-local">.
 */
export function isoToLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/**
 * Konwersja <input type="datetime-local"> (czas lokalny) na ISO UTC do backendu
 */
export function localInputToIso(local: string): string {
  if (!local) return new Date().toISOString();
  const d = new Date(local);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

/**
 * Parsowanie stringa daty z backendu, obsługuje kilka wariantów:
 * - pełne ISO z offsetem (UTC)
 * - samą datę "YYYY-MM-DD" (ustawiana jest północ lokalna)
 * - ISO bez strefy (interpretowane jako lokalny czas)
 */
export function parseApiDate(input?: string | null): Date | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  if (hasTzOffset(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
