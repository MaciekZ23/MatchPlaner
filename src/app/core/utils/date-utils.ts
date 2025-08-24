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
