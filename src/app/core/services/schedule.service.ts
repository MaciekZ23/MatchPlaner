import { Injectable } from '@angular/core';
import { Match } from '../models';
import { RoundRobinRound, ScheduleOptions } from '../models';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  /**
   * Układa daty meczów dla rund round-robin
   * Wejściem są pary drużyn na kolejki (RoundRobinRound), a nie „surowe” drużyny
   * Zwraca gotowe Match[] ze statusem SCHEDULED i wstawionymi datami/godzinami
   */
  planGroupRounds(
    stageId: string,
    groupId: string,
    rounds: RoundRobinRound[],
    opts: ScheduleOptions
  ): Match[] {
    const {
      startDateISO,
      intervalDays = 6,
      kickoffTimes = ['17:00', '17:50', '18:40', '19:30'],
      idPrefix = groupId,
    } = opts;

    const base = new Date(startDateISO);

    const minutesFromHm = (hm: string): number => {
      const [hh, mm] = (hm ?? '17:00').split(':').map(Number);
      return (isNaN(hh) ? 17 : hh) * 60 + (isNaN(mm) ? 0 : mm);
    };

    /** Oblicza minuty od północy dla i-tego meczu rundy */
    const slotMinutesForIndex = (i: number): number => {
      const GAP = 50; // Co 50 min
      if (i < kickoffTimes.length) return minutesFromHm(kickoffTimes[i]);
      // Kontynuacja od ostatniego zdefiniowanego slotu
      const lastIdx = kickoffTimes.length - 1;
      return minutesFromHm(kickoffTimes[lastIdx]) + GAP * (i - lastIdx);
    };

    const setToMinutesFromMidnight = (d: Date, minutes: number): Date => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      copy.setMinutes(minutes);
      return copy;
    };

    const addDays = (d: Date, days: number) => {
      const nd = new Date(d);
      nd.setDate(nd.getDate() + days);
      return nd;
    };

    const matches: Match[] = [];
    rounds.forEach((r, rIdx) => {
      const roundBase = addDays(base, rIdx * intervalDays);
      r.pairs.forEach(([home, away], i) => {
        const dt = setToMinutesFromMidnight(roundBase, slotMinutesForIndex(i));
        matches.push({
          id: `${idPrefix}-R${r.round}-M${i + 1}`,
          stageId,
          groupId,
          round: r.round,
          date: dt.toISOString(), // UTC; DatePipe pokaże lokalnie
          status: 'SCHEDULED',
          homeTeamId: home,
          awayTeamId: away,
          events: [],
        });
      });
    });

    return matches;
  }

  /**
   * Układa daty dla pierwszej rundy play-off na podstawie gotowych par (null = BYE)
   * Pary, w których jedna strona to null (BYE), są pomijane – zakładasz auto-awans
   */
  planKnockoutFirstRound(
    stageId: string,
    roundNumber: number,
    pairs: ReadonlyArray<[string | null, string | null]>,
    dateISO: string,
    kickoffTimes: string[] = ['17:00', '17:50', '18:40', '19:30']
  ): Match[] {
    const base = new Date(dateISO);

    const minutesFromHm = (hm: string): number => {
      const [hh, mm] = (hm ?? '17:00').split(':').map(Number);
      return (isNaN(hh) ? 17 : hh) * 60 + (isNaN(mm) ? 0 : mm);
    };

    const slotMinutesForIndex = (i: number): number => {
      const GAP = 50;
      if (i < kickoffTimes.length) return minutesFromHm(kickoffTimes[i]);
      const lastIdx = kickoffTimes.length - 1;
      return minutesFromHm(kickoffTimes[lastIdx]) + GAP * (i - lastIdx);
    };

    const setToMinutesFromMidnight = (d: Date, minutes: number): Date => {
      const copy = new Date(d);
      copy.setHours(0, 0, 0, 0);
      copy.setMinutes(minutes);
      return copy;
    };

    const matches: Match[] = [];
    pairs.forEach(([home, away], i) => {
      if (!home || !away) return; // BYE -> auto-awans
      const dt = setToMinutesFromMidnight(base, slotMinutesForIndex(i));
      matches.push({
        id: `KO-R${roundNumber}-M${i + 1}`,
        stageId,
        round: roundNumber,
        date: dt.toISOString(),
        status: 'SCHEDULED',
        homeTeamId: home,
        awayTeamId: away,
        events: [],
      });
    });

    return matches;
  }
}
