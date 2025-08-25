import { Match } from '../../../core/models';
import { getScore } from './score';

// Punkty i staty head-to-head
export function matchesBetween(groupMatches: Match[], teams: Set<string>) {
  return groupMatches.filter(
    (m) => teams.has(m.homeTeamId) && teams.has(m.awayTeamId)
  );
}

export function headToHeadPoints(
  h2h: Match[],
  aId: string,
  bId: string
): [number, number] {
  let aP = 0;
  let bP = 0;
  for (const m of h2h) {
    const { home, away } = getScore(m);
    if (m.homeTeamId === aId && m.awayTeamId === bId) {
      if (home > away) {
        aP += 3;
      } else if (home < away) {
        bP += 3;
      } else {
        aP++;
        bP++;
      }
    } else if (m.homeTeamId === bId && m.awayTeamId === aId) {
      if (home > away) {
        bP += 3;
      } else if (home < away) {
        aP += 3;
      } else {
        aP++;
        bP++;
      }
    }
  }
  return [aP, bP];
}

export function headToHeadGoalDiff(
  h2h: Match[],
  aId: string,
  bId: string
): [number, number] {
  let aGF = 0;
  let aGA = 0;
  let bGF = 0;
  let bGA = 0;
  for (const m of h2h) {
    const { home, away } = getScore(m);
    if (m.homeTeamId === aId && m.awayTeamId === bId) {
      aGF += home;
      aGA += away;
      bGF += away;
      bGA += home;
    }
    if (m.homeTeamId === bId && m.awayTeamId === aId) {
      bGF += home;
      bGA += away;
      aGF += away;
      aGA += home;
    }
  }
  return [aGF - aGA, bGF - bGA];
}

export function headToHeadAwayGoals(h2h: Match[], teamId: string): number {
  let awayGoals = 0;
  for (const m of h2h) {
    const { away } = getScore(m);
    if (m.awayTeamId === teamId) {
      awayGoals += away;
    }
  }
  return awayGoals;
}
