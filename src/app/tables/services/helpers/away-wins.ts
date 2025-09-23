import { Match } from '../../../core/models';
import { getScore } from './score';

// Liczba zwycięstw na wyjeździe
export function buildAwayWinsIndex(matches: Match[]): Map<string, number> {
  const wins = new Map<string, number>();
  const bump = (teamId: string) =>
    wins.set(teamId, (wins.get(teamId) ?? 0) + 1);

  for (const m of matches) {
    if (m.status !== 'FINISHED') {
      continue;
    }
    const { home, away } = getScore(m);
    if (away > home) {
      const awayId = m.awayTeamId ?? undefined; // gdyby jednak przyszło null
      if (awayId) {
        bump(awayId);
      }
    }
  }
  return wins;
}
