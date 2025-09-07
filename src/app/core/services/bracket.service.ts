import { Injectable } from '@angular/core';
import { RoundRobinRound } from '../models';
import { BracketMatch, QualifiedTeam } from '../models/bracket.models';

@Injectable({ providedIn: 'root' })
export class BracketService {
  /**
   * Generator terminarza round-robin metodą "kołową"
   * Działa dla parzystej i nieparzystej liczby drużyn (BYE = pauza)
   * Opcjonalnie tworzy rewanże (doubleRound = true) z odwróconymi gospodarzami
   */
  generateRoundRobin(
    teamIds: string[],
    options?: { doubleRound?: boolean }
  ): RoundRobinRound[] {
    if (!teamIds || teamIds.length < 2) return [];

    const teams = [...teamIds];
    const hasGhost = teams.length % 2 === 1;
    if (hasGhost) teams.push('__BYE__');

    const n = teams.length;
    const firstLeg: RoundRobinRound[] = [];

    for (let r = 0; r < n - 1; r++) {
      const pairs: [string, string][] = [];
      for (let i = 0; i < n / 2; i++) {
        const a = teams[i];
        const b = teams[n - 1 - i];
        if (a !== '__BYE__' && b !== '__BYE__') pairs.push([a, b]); // Pomiń pauzy
      }
      firstLeg.push({ round: r + 1, pairs });

      // Rotacja: pierwszy zostaje, reszta się obraca
      const fixed = teams[0];
      const rotated = [fixed, ...teams.slice(2), teams[1]];
      teams.splice(0, teams.length, ...rotated);
    }

    if (options?.doubleRound) {
      const secondLeg: RoundRobinRound[] = firstLeg.map((r, idx) => ({
        round: firstLeg.length + idx + 1,
        pairs: r.pairs.map(([h, a]) => [a, h]), // Zamiana gospodarzy
      }));
      return [...firstLeg, ...secondLeg];
    }

    return firstLeg;
  }

  /** Najbliższa potęga dwójki (użyteczne przy drabince) */
  private nextPow2(n: number) {
    return 1 << Math.ceil(Math.log2(n));
  }

  /** Rozstawienia dla M=2^k, np. 8 -> [1,8,5,4,3,6,7,2] */
  private seededPositions(M: number): number[] {
    let arr = [1, 2];
    while (arr.length < M) {
      const n = arr.length * 2;
      const left = arr.map((x) => x);
      const right = arr.map((x) => n + 1 - x).reverse();
      arr = left.concat(right);
    }
    return arr;
  }

  /**
   * Generator par 1. rundy play-off z rozstawieniem i BYE
   * Zwraca sloty pierwszej rundy (null = wolny los)
   */
  generateKnockout(teamIds: string[]) {
    const N = teamIds.length;
    const M = this.nextPow2(N);
    const seeds = this.seededPositions(M);

    const slots: (string | null)[] = new Array(M).fill(null);
    teamIds.forEach((id, idx) => {
      const pos = seeds[idx] - 1;
      slots[pos] = id;
    });

    const firstRound: [string | null, string | null][] = [];
    for (let i = 0; i < M; i += 2) {
      firstRound.push([slots[i], slots[i + 1]]);
    }
    return { M, seeds, slots, firstRound };
  }

  roundTitle(r: number): string {
    if (r === 1) {
      return 'Finał';
    }
    if (r === 2) {
      return 'Półfinał';
    }
    if (r === 3) {
      return 'Ćwierćfinał';
    }
    return `1/${Math.pow(2, r - 1)}`;
  }

  private interleaveForCrossSemis<T>(pairs: T[]): T[] {
    const firsts: T[] = [];
    const seconds: T[] = [];
    for (let i = 0; i < pairs.length; i += 2) {
      firsts.push(pairs[i]);
      if (i + 1 < pairs.length) {
        seconds.push(pairs[i + 1]);
      }
    }
    return [...firsts, ...seconds];
  }

  generatePlayoffBracketFromGroups(
    stageId: string,
    groups: string[],
    qualified: QualifiedTeam[],
    startDateISO: string,
    withThirdPlace = true
  ): BracketMatch[] {
    const rawPairs = this.buildFirstRoundPairs(groups, qualified);
    const firstPairs = this.interleaveForCrossSemis(rawPairs);
    const teamsCount = firstPairs.length * 2;
    if (teamsCount < 2) return [];

    const totalRounds = Math.ceil(Math.log2(teamsCount)); // 16→4, 8→3, 4→2
    const firstRoundNo = totalRounds;
    const matches: BracketMatch[] = [];

    const firstRoundMatches: BracketMatch[] = firstPairs.map((p, idx) => ({
      id: this.makeId(stageId, firstRoundNo, idx + 1),
      stageId,
      round: firstRoundNo,
      index: idx + 1,
      home: { type: 'TEAM', ref: p.home.teamId },
      away: { type: 'TEAM', ref: p.away.teamId },
      status: 'SCHEDULED',
      date: this.addDaysISO(startDateISO, 0),
    }));
    matches.push(...firstRoundMatches);

    let prevRound = firstRoundMatches;
    for (let r = firstRoundNo - 1; r >= 1; r--) {
      const nextRound: BracketMatch[] = [];

      for (let i = 0; i < prevRound.length; i += 2) {
        const left = prevRound[i];
        const right = prevRound[i + 1];

        const m: BracketMatch = {
          id: this.makeId(stageId, r, i / 2 + 1),
          stageId,
          round: r,
          index: i / 2 + 1,
          home: { type: 'WINNER', ref: left.id },
          away: { type: 'WINNER', ref: right.id },
          status: 'SCHEDULED',
          date: this.addDaysISO(startDateISO, firstRoundNo - r), // każda runda +1d
        };

        (left as any).parentMatchId = m.id;
        if (right) (right as any).parentMatchId = m.id;

        nextRound.push(m);
      }

      matches.push(...nextRound);
      prevRound = nextRound;
    }

    if (withThirdPlace) {
      const sfRoundNo = 2;
      const sfs = matches
        .filter((m) => m.round === sfRoundNo)
        .sort((a, b) => a.index - b.index);

      if (sfs.length === 2) {
        const third: BracketMatch = {
          id: this.makeId(stageId, 1, 2),
          stageId,
          round: 1,
          index: 2,
          home: { type: 'LOSER', ref: sfs[0].id },
          away: { type: 'LOSER', ref: sfs[1].id },
          status: 'SCHEDULED',
          date: this.addDaysISO(startDateISO, firstRoundNo - 1), // razem z finałem
        };
        matches.push(third);
      }
    }
    matches.sort((a, b) => b.round - a.round || a.index - b.index);
    return matches;
  }

  private buildFirstRoundPairs(
    groups: string[],
    q: QualifiedTeam[]
  ): { home: QualifiedTeam; away: QualifiedTeam }[] {
    const pairs: { home: QualifiedTeam; away: QualifiedTeam }[] = [];
    if (groups.length === 0) return pairs;

    const looped = groups.length % 2 === 1 ? [...groups, groups[0]] : groups;

    for (let i = 0; i < looped.length; i += 2) {
      const g1 = looped[i];
      const g2 = looped[i + 1];

      const g1_1 = q.find((t) => t.group === g1 && t.place === 1);
      const g1_2 = q.find((t) => t.group === g1 && t.place === 2);
      const g2_1 = q.find((t) => t.group === g2 && t.place === 1);
      const g2_2 = q.find((t) => t.group === g2 && t.place === 2);

      if (g1_1 && g2_2) pairs.push({ home: g1_1, away: g2_2 });
      if (g2_1 && g1_2) pairs.push({ home: g2_1, away: g1_2 });
    }

    return pairs;
  }

  private makeId(prefix: string, round: number, index: number) {
    return `${prefix}_R${round}_${index}`;
  }

  private addDaysISO(baseISO: string, plusDays: number): string {
    const d = new Date(baseISO);
    d.setDate(d.getDate() + plusDays);
    return d.toISOString();
  }
}
