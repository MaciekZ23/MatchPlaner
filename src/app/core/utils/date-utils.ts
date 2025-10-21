export function toEpoch(iso: string): number {
  return new Date(iso).getTime();
}

export function hasTzOffset(iso: string): boolean {
  return /([+-]\d{2}:\d{2}|Z)$/.test(iso);
}

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

export function isWithinLive(
  kickoffISO: string,
  durationMs = 50 * 60 * 1000,
  preMs = 0,
  nowMs = Date.now()
): boolean {
  const start = toEpoch(kickoffISO);
  return nowMs >= start - preMs && nowMs < start + durationMs;
}

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

export function toLocalWallClockISO(iso: string): string {
  return iso.replace(/([+-]\d{2}:\d{2}|Z)$/, '');
}

// ISO z backendu (UTC, np. "2025-10-15T08:45:00.000Z")
// -> string do <input type="datetime-local"> w lokalnej strefie
export function isoToLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

// string z <input type="datetime-local"> (lokalny, np. "2025-10-15T18:00")
// -> ISO UTC do backendu (np. "...T16:00:00.000Z" przy UTC+2)
export function localInputToIso(local: string): string {
  if (!local) return new Date().toISOString();
  const d = new Date(local); // traktowane jako LOKALNY
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString(); // natywnie na UTC (bez ręcznych offsetów)
}

export function parseApiDate(input?: string | null): Date | null {
  if (!input) return null;
  const s = String(input).trim();
  if (!s) return null;

  if (hasTzOffset(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // YYYY-MM-DD → lokalny północ
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }

  // YYYY-MM-DDTHH:mm (bez strefy) → lokalny czas
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
