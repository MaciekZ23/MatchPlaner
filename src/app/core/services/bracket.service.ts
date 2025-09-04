import { Injectable } from '@angular/core';
import { RoundRobinRound } from '../models';

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
}
