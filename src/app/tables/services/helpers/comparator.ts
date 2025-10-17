import { Match, Team } from '../../../core/models';
import { TeamStats } from '../../models';
import {
  matchesBetween,
  headToHeadPoints,
  headToHeadGoalDiff,
  headToHeadAwayGoals,
} from './h2h';

// Złożony komparator tabeli (łańcuch tie-breakerów)
export function makeStandingsComparator(
  groupMatches: Match[],
  awayWinsIndex: Map<string, number>
) {
  return (aId: string, bId: string, a: TeamStats, b: TeamStats): number => {
    if (a.pkt !== b.pkt) {
      return b.pkt - a.pkt;
    }

    const h2h = matchesBetween(groupMatches, new Set([aId, bId]));
    // Punkty H2H
    const [aH2Hp, bH2Hp] = headToHeadPoints(h2h, aId, bId);
    if (aH2Hp !== bH2Hp) {
      return bH2Hp - aH2Hp;
    }

    // Różnica bramek H2H
    const [aH2Hgd, bH2Hgd] = headToHeadGoalDiff(h2h, aId, bId);
    if (aH2Hgd !== bH2Hgd) {
      return bH2Hgd - aH2Hgd;
    }

    // Reguła wyjazdowa H2H
    // const awayA = headToHeadAwayGoals(h2h, aId);
    // const awayB = headToHeadAwayGoals(h2h, bId);
    // if (awayA !== awayB) {
    //   return awayB - awayA;
    // }

    // Różnica bramek ogółem
    if (a.diff !== b.diff) {
      return b.diff - a.diff;
    }

    // Gole ogółem
    if (a.bz !== b.bz) {
      return b.bz - a.bz;
    }

    // Zwycięstwa ogółem
    if (a.w !== b.w) {
      return b.w - a.w;
    }

    // Zwycięstwa na wyjeździe
    const aAwayW = awayWinsIndex.get(aId) ?? 0;
    const bAwayW = awayWinsIndex.get(bId) ?? 0;
    if (aAwayW !== bAwayW) {
      return bAwayW - aAwayW;
    }

    // Dyscyplina fair-play (mniej = lepiej)
    // const aDisc = cardsPointsByTeam.get(aId) ?? 0;
    // const bDisc = cardsPointsByTeam.get(bId) ?? 0;
    // if (aDisc !== bDisc) {
    //   return aDisc - bDisc;
    // }

    return a.name.localeCompare(b.name, 'pl');
  };
}
