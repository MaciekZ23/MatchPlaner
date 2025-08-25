import { Match } from '../../../core/models';

// Indeks punktów karnych (zółte, czerwone, druga żółta)
export function buildDisciplineIndex(matches: Match[]): Map<string, number> {
  const pts = new Map<string, number>();
  const add = (teamId: string, v: number) =>
    pts.set(teamId, (pts.get(teamId) ?? 0) + v);

  for (const m of matches) {
    const hadYellow = new Set<string>();
    for (const ev of m.events ?? []) {
      if (ev.type !== 'CARD' || !ev.teamId) {
        continue;
      }
      const key = `${ev.teamId}:${ev.playerId}`;
      switch (ev.card) {
        case 'YELLOW':
          add(ev.teamId, 1);
          hadYellow.add(key);
          break;
        case 'SECOND_YELLOW':
          add(ev.teamId, hadYellow.has(key) ? 2 : 3);
          break;
        case 'RED':
          add(ev.teamId, 3);
          break;
        default:
          break;
      }
    }
  }
  return pts;
}
