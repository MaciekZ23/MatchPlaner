import { interval, Observable } from 'rxjs';
import { map, startWith } from 'rxjs';

export function formatCountdown(msLeft: number): string {
  if (!isFinite(msLeft) || msLeft <= 0) return '00:00:00';

  const secTotal = Math.floor(msLeft / 1000);
  const days = Math.floor(secTotal / 86400);
  const hours = Math.floor((secTotal % 86400) / 3600);
  const minutes = Math.floor((secTotal % 3600) / 60);
  const seconds = secTotal % 60;

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  return days > 0 ? `${days}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

export function countdownTo(iso: string): Observable<string> {
  const target = new Date(iso).getTime();
  return interval(1000).pipe(
    startWith(0),
    map(() => Math.max(0, target - Date.now())),
    map(formatCountdown)
  );
}
