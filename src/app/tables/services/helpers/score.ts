import { Match } from '../../../core/models';

// Liczenie wyniku meczu
export function getScore(m: Match): { home: number; away: number } {
  if (m.score) {
    return { home: m.score.home, away: m.score.away };
  }

  let h = 0;
  let a = 0;
  for (const ev of m.events ?? []) {
    if (ev.type === 'GOAL') {
      h++;
    } else if (ev.type === 'OWN_GOAL') {
      if (ev.teamId === m.homeTeamId) {
        a++;
      } else if (ev.teamId === m.awayTeamId) {
        h++;
      }
    }
  }
  return { home: h, away: a };
}
